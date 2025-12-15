# Getting Your BLOB_READ_WRITE_TOKEN for Local Development

## You've Set It Up in Vercel! ✅

I can see you've successfully added `BLOB_READ_WRITE_TOKEN` to your Vercel project. Now you need to add it locally.

## Option 1: Copy Token from Vercel Dashboard (Recommended)

1. In the Vercel Dashboard, click on the **eye icon** 👁️ next to your `BLOB_READ_WRITE_TOKEN`
2. This will reveal the token value
3. Click the **clipboard icon** 📋 to copy it
4. Create `.env.local` in your project root:
   ```bash
   # In your project root directory
   touch .env.local
   ```
5. Add the token:
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_paste_your_token_here
   ```
6. Save the file
7. **Restart your dev server** (important!)

## Option 2: Use Vercel CLI (Easiest)

If you have Vercel CLI installed, this will automatically create `.env.local` with all your environment variables:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Pull all environment variables to .env.local
vercel env pull .env.local
```

This command will:
- Create `.env.local` automatically
- Download all environment variables from Vercel
- Include your `BLOB_READ_WRITE_TOKEN`

Then restart your dev server:
```bash
npm run dev
```

## Verify It's Working

1. Make sure `.env.local` exists in your project root
2. Check it contains: `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...`
3. Restart your dev server
4. Try uploading an image again

## File Structure

Your project should look like this:
```
UX Analyzer/
├── .env.local          ← Create this file here
├── package.json
├── lib/
├── components/
└── ...
```

## Quick Checklist

- [ ] Token is set in Vercel Dashboard ✅ (You've done this!)
- [ ] `.env.local` file created in project root
- [ ] `BLOB_READ_WRITE_TOKEN` added to `.env.local`
- [ ] Dev server restarted
- [ ] Test upload works

## Still Having Issues?

Make sure:
- The file is named exactly `.env.local` (with the dot)
- It's in the root directory (same level as `package.json`)
- You've restarted the dev server after creating/updating it
- The token starts with `vercel_blob_rw_`
