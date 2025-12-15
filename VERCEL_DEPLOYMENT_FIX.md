# Fix Vercel Deployment Error

## The Error

"Application error: a client-side exception has occurred"

This is likely because `BLOB_READ_WRITE_TOKEN` is not set in your Vercel deployment.

## Quick Fix

### Step 1: Add Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **ux-analyzer**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the variable:
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** `vercel_blob_rw_P6U2HNoyTEk3VgTV_rSSULvZrV3DWXftQySV9t3qwjPAZ59`
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**

### Step 2: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Or push a new commit to trigger a new deployment

## Verify It's Working

1. Wait for the deployment to complete
2. Visit your site: `ux-analyzer-jxh2e88hh-denys-projects-d884d577.vercel.app`
3. Try uploading an image
4. Check that it works without errors

## Alternative: Check Build Logs

If the error persists:

1. Go to **Deployments** → Latest deployment
2. Click on the deployment
3. Check **Build Logs** for any errors
4. Check **Function Logs** for runtime errors

## Common Issues

### Issue: Environment variable not set
**Solution:** Follow Step 1 above

### Issue: Wrong environment selected
**Solution:** Make sure you selected all environments (Production, Preview, Development)

### Issue: Build fails
**Solution:** Check build logs for TypeScript or import errors

### Issue: Package not installed
**Solution:** Make sure `@vercel/blob` is in `package.json` dependencies

## Still Not Working?

1. **Check Vercel Dashboard:**
   - Settings → Environment Variables → Verify `BLOB_READ_WRITE_TOKEN` exists
   - Deployments → Check build logs for errors

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for specific error messages
   - Check Network tab for failed API calls

3. **Verify Package Installation:**
   - The `@vercel/blob` package should be in `package.json`
   - Vercel will install it during build

4. **Check API Route:**
   - The `/api/upload` route should be accessible
   - Test it directly if possible
