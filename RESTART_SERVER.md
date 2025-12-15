# Restart Dev Server - Required!

## Important: You Must Restart Your Dev Server

The upload functionality has been updated to use a server-side API route. **You need to restart your dev server** for the changes to take effect.

## How to Restart

1. **Stop the current server:**
   - Find the terminal where `npm run dev` is running
   - Press `Ctrl+C` (or `Cmd+C` on Mac) to stop it

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Wait for it to start:**
   - You should see "Ready" in the terminal
   - The server should be running on `http://localhost:3000`

4. **Try uploading again:**
   - The error should be gone
   - Uploads will now work through the API route

## Why This Is Needed

- The new `/api/upload` route needs to be compiled
- Next.js needs to register the new API endpoint
- Environment variables are loaded when the server starts

## If It Still Doesn't Work

1. **Hard refresh your browser:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

2. **Check the browser console:**
   - Open DevTools (F12)
   - Look for any errors in the Console tab

3. **Check the terminal:**
   - Look for any error messages when starting the server
   - Verify the API route is being registered

4. **Verify .env.local exists:**
   ```bash
   cat .env.local
   ```
   Should show: `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...`
