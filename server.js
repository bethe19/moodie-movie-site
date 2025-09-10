import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/*", async (req, res) => {
  try {
    const tmdbPath = req.params[0];
    const url = `https://api.themoviedb.org/3/${tmdbPath}?api_key=${process.env.TMDB_KEY}&language=en-US`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
});

app.listen(PORT, () => console.log(`Proxy server running at http://localhost:${PORT}`));
