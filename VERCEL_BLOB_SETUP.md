# Vercel Blob Storage Setup Guide

## Overview

This guide will help you set up Vercel Blob Storage for the UX Analyzer application. Vercel Blob Storage is a simple, serverless storage solution that's perfect for Next.js applications hosted on Vercel.

## Why Vercel Blob Storage?

- ✅ **Zero configuration** - Works out of the box with Vercel
- ✅ **Built-in CDN** - Fast global delivery
- ✅ **Simple API** - Easy to use
- ✅ **Generous free tier** - 1GB storage, 100GB bandwidth/month
- ✅ **Automatic scaling** - No infrastructure management

## Prerequisites

- ✅ Vercel account (free tier works)
- ✅ Next.js application deployed on Vercel (or planning to deploy)
- ✅ Node.js 18+ installed locally

## Step 1: Install the Package

The package has been added to `package.json`. Run:

```bash
npm install
```

This will install `@vercel/blob` package.

## Step 2: Get Your Blob Storage Token

### Option A: From Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create one if you haven't)
3. Go to **Settings** → **Storage** → **Blob**
4. Click **Create Database** (if you haven't created one yet)
5. Once created, you'll see your **Blob Store**
6. Go to **Settings** → **Environment Variables**
7. You'll need to create a token (see below)

### Option B: Create Token via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Create a blob store (if needed)
vercel blob create
```

## Step 3: Set Up Environment Variables

### For Local Development

Create or update `.env.local` file in your project root:

```env
# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- The token starts with `vercel_blob_rw_`

### For Vercel Deployment

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** Your blob token (from Step 2)
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**

### Getting the Token

The token is automatically available in Vercel deployments, but for local development:

1. Go to **Settings** → **Storage** → **Blob** in Vercel Dashboard
2. Click on your blob store
3. Go to **Settings** tab
4. Copy the **Read/Write Token**

Or use Vercel CLI:

```bash
vercel env pull .env.local
```

This will download all environment variables from Vercel to your local `.env.local` file.

## Step 4: Verify the Setup

### Test Upload Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try uploading an image through your application
3. Check the console for any errors
4. Verify the file appears in Vercel Dashboard → Storage → Blob

### Test in Production

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Test the upload functionality on your deployed site
3. Check Vercel Dashboard → Storage → Blob to see uploaded files

## Step 5: File Organization

Files are organized in Vercel Blob Storage using the same structure as before:

```
analyses/{userId}/{analysisId}/{filename}
```

Example:
```
analyses/user123/analysis456/screenshot.png
```

This structure is maintained for consistency with your existing codebase.

## Step 6: Access Control

Vercel Blob Storage files are set to `public` access by default, which means:
- ✅ Files are accessible via direct URL
- ✅ No authentication required to view (if you have the URL)
- ✅ Fast CDN delivery

**Security Note:** 
- URLs are not easily guessable (they include unique identifiers)
- Users can only access files if they have the URL
- Consider implementing additional access control in your application if needed

## Pricing

### Free Tier
- **Storage:** 1GB
- **Bandwidth:** 100GB/month
- **Perfect for:** Development and small projects

### Pro Plan ($20/month)
- **Storage:** Unlimited (pay per GB)
- **Bandwidth:** 1TB/month included
- **Additional:** $0.15/GB storage, $0.40/GB bandwidth

### Enterprise
- Custom pricing
- Dedicated support
- SLA guarantees

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not set"

**Solution:**
- Check that `.env.local` exists and contains `BLOB_READ_WRITE_TOKEN`
- Restart your dev server after adding the variable
- Verify the token is correct (starts with `vercel_blob_rw_`)

### Error: "Upload unauthorized"

**Solution:**
- Verify your token is valid
- Check token hasn't expired
- Ensure token has read/write permissions

### Files not appearing in Vercel Dashboard

**Solution:**
- Wait a few seconds (propagation delay)
- Check you're looking at the correct blob store
- Verify upload completed successfully (check console logs)

### Upload fails in production

**Solution:**
- Verify environment variable is set in Vercel Dashboard
- Check it's set for all environments (Production, Preview, Development)
- Redeploy after adding the variable

## Migration from Firebase Storage

If you were previously using Firebase Storage:

1. ✅ **Code is already updated** - The storage interface remains the same
2. ✅ **File structure maintained** - Same path structure (`analyses/{userId}/{analysisId}/`)
3. ⚠️ **Existing files** - Files in Firebase Storage won't automatically migrate
4. ⚠️ **URLs will change** - New uploads will use Vercel Blob URLs

### Migrating Existing Files (Optional)

If you need to migrate existing files from Firebase Storage:

1. Download files from Firebase Storage
2. Re-upload them through your application
3. Or create a migration script to bulk upload

## API Reference

The storage functions remain the same:

```typescript
// Upload a single file
const url = await uploadScreenshot(file, userId, analysisId, onProgress)

// Upload multiple files
const urls = await uploadScreenshots(files, userId, analysisId)

// Delete a file
await deleteScreenshot(url)

// Get file size
const sizeMB = getFileSizeMB(file)
```

## Next Steps

1. ✅ Install package: `npm install`
2. ✅ Set up environment variable: `BLOB_READ_WRITE_TOKEN`
3. ✅ Test upload locally
4. ✅ Deploy to Vercel
5. ✅ Test in production

## Support

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Discord](https://vercel.com/discord)
- [Vercel Support](https://vercel.com/support)

## Security Best Practices

1. ✅ Never commit `BLOB_READ_WRITE_TOKEN` to Git
2. ✅ Use different tokens for development and production
3. ✅ Rotate tokens periodically
4. ✅ Monitor usage in Vercel Dashboard
5. ✅ Set up alerts for quota limits

---

**Last Updated:** Check that all steps are relevant to your current setup.
