# Deploying to Vercel

This guide explains how to deploy Moodie to Vercel without the backend server.

## Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. Make sure your `scripts/config.js` file exists locally with your API key

3. Deploy with the include flag:

   ```bash
   vercel --prod
   ```

4. When prompted, confirm you want to upload files

5. **Important**: After deployment, you need to manually add `scripts/config.js` to your deployment:
   - Go to your Vercel project dashboard
   - Navigate to "Storage" or "Files"
   - Upload `scripts/config.js` to the `scripts/` directory

## Method 2: Using Vercel Environment Variables (Advanced)

For better security, you can use Vercel's environment variables:

1. In your Vercel project dashboard, go to Settings → Environment Variables

2. Add a new environment variable:
   - Name: `TMDB_API_KEY`
   - Value: Your TMDB API key
   - Environments: Production, Preview, Development

3. Create a `scripts/config-template.js` that gets built with your API key during deployment

4. Update your build process to replace the template with actual values

## Method 3: Manual File Addition

1. Push your code to GitHub (without `scripts/config.js`)

2. Deploy to Vercel as usual

3. After deployment, use Vercel's file system to manually add `scripts/config.js`:
   - SSH or use Vercel CLI: `vercel deploy --prod`
   - Include the config.js file in the deployment

## Important Security Notes

- ⚠️ **Client-side API keys are visible to users** - Anyone can view your TMDB API key in the browser's network tab
- For production use, it's recommended to:
  1. Use the backend server (`server.js`) instead
  2. Set up the backend as a separate Vercel Serverless Function
  3. Keep API key on server-side only

## Recommended Production Setup

For maximum security:

1. Deploy `server.js` as a Vercel Serverless Function
2. Add your TMDB API key to Vercel environment variables
3. Update your client-side code to always use the proxy
4. This way, your API key never leaves the server

Would you like me to create a serverless function version for Vercel?
