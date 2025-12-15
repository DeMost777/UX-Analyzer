# Quick Setup: BLOB_READ_WRITE_TOKEN

## The Error You're Seeing

```
Upload failed: Vercel Blob Storage is not configured. 
Please set BLOB_READ_WRITE_TOKEN environment variable.
```

## Quick Fix (3 Steps)

### Step 1: Get Your Token from Vercel

**Option A: Vercel Dashboard (Easiest)**
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project (or create one)
3. Go to **Settings** → **Storage** → **Blob**
4. If you don't have a blob store yet:
   - Click **Create Database**
   - Select **Blob** as the type
   - Give it a name (e.g., "ux-analyzer-storage")
   - Click **Create**
5. Once created, click on your blob store
6. Go to the **Settings** tab
7. Copy the **Read/Write Token** (it starts with `vercel_blob_rw_`)

**Option B: Vercel CLI (If you have it installed)**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Pull environment variables (this will create .env.local)
vercel env pull .env.local
```

### Step 2: Create .env.local File

In your project root directory, create a file named `.env.local`:

```bash
# On Mac/Linux
touch .env.local

# Or just create it in your editor
```

Add this line (replace with your actual token):

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_actual_token_here
```

**Important:** 
- The file is `.env.local` (with the dot at the beginning)
- Don't commit this file to Git (it's already in .gitignore)
- The token should start with `vercel_blob_rw_`

### Step 3: Restart Your Dev Server

After creating/updating `.env.local`:

1. **Stop** your current dev server (Ctrl+C or Cmd+C)
2. **Restart** it:
   ```bash
   npm run dev
   ```
3. Try uploading an image again

## Verify It's Working

1. Upload an image through the app
2. Check the browser console - you should see:
   ```
   Uploading file to Vercel Blob: analyses/...
   Upload completed, URL: https://...
   ```
3. Check Vercel Dashboard → Storage → Blob to see your uploaded file

## Still Not Working?

### Check 1: File Location
Make sure `.env.local` is in the **root** of your project (same level as `package.json`)

### Check 2: Token Format
Your token should look like:
```
vercel_blob_rw_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Check 3: Server Restart
**Always restart your dev server** after changing `.env.local`

### Check 4: Token Validity
- Make sure you copied the entire token
- Verify it's the "Read/Write Token" (not read-only)
- Check it hasn't expired (tokens don't expire, but verify it's correct)

## For Production (Vercel Deployment)

1. Go to Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Click **Add New**
4. Name: `BLOB_READ_WRITE_TOKEN`
5. Value: Your token
6. Select all environments: ✅ Production, ✅ Preview, ✅ Development
7. Click **Save**
8. Redeploy your project

## Need More Help?

- Full setup guide: `VERCEL_BLOB_SETUP.md`
- Quick reference: `VERCEL_BLOB_QUICK_START.md`
- Migration guide: `VERCEL_BLOB_MIGRATION.md`
