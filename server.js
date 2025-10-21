import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors"; // Add CORS middleware
import rateLimit from "express-rate-limit";
import path from "path"; // For serving static files
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const TMDB_KEY = process.env.TMDB_KEY;

// Validate TMDB_KEY
if (!TMDB_KEY) {
  console.error("Error: TMDB_KEY is missing in .env file");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000", "https://moodie-neon.vercel.app"],
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
); // Restrict CORS
app.use(express.json()); // For parsing JSON bodies (if needed)
app.use(express.static(__dirname)); // Serve static files from current directory

// Basic rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Proxy endpoint for TMDB API
app.get("/api/*", apiLimiter, async (req, res) => {
  try {
    const tmdbPath = req.params[0];
    // Validate TMDB path (basic check for allowed endpoints)
    const allowedEndpoints = [
      "movie/",
      "search/",
      "person/",
      "genre/",
      "discover/",
      "trending/",
    ];
    if (!allowedEndpoints.some((endpoint) => tmdbPath.startsWith(endpoint))) {
      return res.status(400).json({ error: "Invalid TMDB endpoint" });
    }

    // Build URL with query parameters
    const url = new URL(`https://api.themoviedb.org/3/${tmdbPath}`);
    // Always use server-side TMDB key; ignore any client-sent api_key
    url.searchParams.append("api_key", TMDB_KEY);
    url.searchParams.append("language", req.query.language || "en-US"); // Allow language override
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "language" && key !== "api_key") url.searchParams.append(key, value); // Forward other query params except api_key
    }

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Failed to fetch from TMDB", details: err.message });
  }
});

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const isMain = process.argv[1] === __filename;
if (isMain) {
  app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
  });
}

export default app;