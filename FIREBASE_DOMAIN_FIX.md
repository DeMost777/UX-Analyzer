# Fix Firebase Unauthorized Domain Error

## Error: `auth/unauthorized-domain`

This error occurs when you're trying to use Firebase Authentication from a domain that hasn't been authorized in your Firebase project.

## Solution: Add Authorized Domains

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ux-analiysis**

### Step 2: Navigate to Authentication Settings

1. Click on **Authentication** in the left sidebar
2. Click on the **Settings** tab (gear icon at the top)
3. Scroll down to **Authorized domains**

### Step 3: Add Your Domains

Click **Add domain** and add the following:

**For Local Development:**
- `localhost`
- `127.0.0.1` (optional, if you use IP address)

**For Production (when deployed):**
- Your Vercel domain (e.g., `your-app.vercel.app`)
- Your custom domain (if you have one, e.g., `yourapp.com`)

### Step 4: Save

Click **Done** or **Save** after adding each domain.

## Quick Fix for Localhost

The easiest way is to add `localhost`:

1. Firebase Console → Authentication → Settings
2. Under "Authorized domains", click **Add domain**
3. Enter: `localhost`
4. Click **Add**

## Common Domains to Add

- `localhost` - For local development
- `127.0.0.1` - Alternative localhost
- `your-app.vercel.app` - Vercel preview deployments
- `your-app-git-main.vercel.app` - Vercel branch deployments
- `your-custom-domain.com` - Your production domain

## After Adding Domains

1. **Refresh your browser** (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
2. Try logging in again
3. The error should be gone

## Note

Firebase automatically includes some domains:
- `localhost` (sometimes, but not always)
- Your Firebase project domain (e.g., `ux-analiysis.firebaseapp.com`)

But you should manually add `localhost` to be safe for development.

