# Moodie Movie Site

A mood-based movie and TV show recommendation website using The Movie Database (TMDB) API.

## Features

- Browse popular movies and TV shows
- Search by mood/feeling
- Actor information
- Watchlist functionality
- Dark/Light theme toggle
- Responsive design

## Setup

### 1. Get Your TMDB API Key

1. Sign up for a free account at [The Movie Database](https://www.themoviedb.org/)
2. Go to [API Settings](https://www.themoviedb.org/settings/api)
3. Copy your API Key (v3 auth)

### 2. Configure API Key

1. Copy `scripts/config.example.js` to `scripts/config.js`

   ```bash
   cp scripts/config.example.js scripts/config.js
   ```

2. Open `scripts/config.js` and replace `YOUR_TMDB_API_KEY_HERE` with your actual API key:
   ```javascript
   window.CONFIG = {
     TMDB_API_KEY: 'your_actual_api_key_here',
   };
   ```

### 3. Run the Application

#### Option 1: Using the Backend Server (Recommended for Development)

This option keeps your API key secure on the server side.

```bash
# Install dependencies
npm install

# Run the server
npm start
```

Visit `http://localhost:5000` in your browser.

#### Option 2: Direct File Access

Simply open `index.html` in your browser. Make sure you've configured `scripts/config.js` with your API key.

### 4. Deploy to Vercel

1. Make sure `scripts/config.js` is in your `.gitignore` (it already is)
2. Push your code to GitHub (without `scripts/config.js`)
3. In Vercel dashboard:
   - Go to your project settings
   - Add the file `scripts/config.js` manually through Vercel's file upload, OR
   - Use Vercel CLI to deploy with the config file included locally

**Important**: The `scripts/config.js` file is git-ignored to protect your API key. When deploying, you'll need to manually add this file to your deployment or use environment variables.

## Project Structure

```
moodie-movie-site/
├── index.html          # Home page
├── search.html         # Search results page
├── mood.html           # Mood-based search page
├── moviedetail.html    # Movie/TV show details
├── actordetail.html    # Actor details
├── list.html           # Watchlist page
├── css/
│   └── style.css       # Styles
├── scripts/
│   ├── config.example.js  # Example config file
│   └── script.js       # Main JavaScript
└── server.js           # Optional backend server
```

## Important Notes

- **Never commit `scripts/config.js`** to your repository as it contains your API key
- The example file `scripts/config.example.js` is safe to commit
- For production deployments, consider using environment variables or a backend proxy
- The backend server option (`server.js`) provides better security by keeping the API key server-side

## License

See LICENSE file for details.
