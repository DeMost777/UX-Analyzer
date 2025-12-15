# Vercel Blob Storage - Quick Start

## Installation

```bash
npm install
```

## Environment Variable

Add to `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Getting Your Token

### Method 1: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Your Project → **Settings** → **Storage** → **Blob**
3. Create blob store if needed
4. Copy the **Read/Write Token**

### Method 2: Vercel CLI
```bash
vercel env pull .env.local
```

## Testing

1. Start dev server: `npm run dev`
2. Upload an image through the app
3. Check console for success/errors
4. Verify file in Vercel Dashboard → Storage → Blob

## Deployment

1. Set environment variable in Vercel Dashboard:
   - **Settings** → **Environment Variables**
   - Add `BLOB_READ_WRITE_TOKEN`
   - Select all environments (Production, Preview, Development)

2. Deploy:
   ```bash
   vercel --prod
   ```

## File Structure

Files are stored as:
```
analyses/{userId}/{analysisId}/{filename}
```

## Free Tier Limits

- **Storage:** 1GB
- **Bandwidth:** 100GB/month
- **Perfect for:** Development and small projects

## Troubleshooting

**Token not found?**
- Check `.env.local` exists
- Restart dev server
- Verify token starts with `vercel_blob_rw_`

**Upload fails?**
- Check token is valid
- Verify token has read/write permissions
- Check file size (10MB limit)

## Need Help?

See full documentation: `VERCEL_BLOB_SETUP.md`
