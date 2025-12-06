# Quick Fix for DNS_HOSTNAME_NOT_FOUND Error

## Immediate Steps to Fix

### Option 1: Remove vercel.json (Simplest)

Vercel auto-detects Next.js projects. The `vercel.json` file might be causing conflicts:

```bash
# Delete vercel.json
rm vercel.json

# Commit and push
git add .
git commit -m "Remove vercel.json for auto-detection"
git push
```

Vercel will automatically redeploy.

### Option 2: Check Vercel Build Logs

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Deployments** tab
4. Click on the failed deployment
5. Check **Build Logs** for the actual error

The DNS error might be a symptom of a build failure.

### Option 3: Force Redeploy

1. In Vercel Dashboard → Deployments
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Choose **"Use existing Build Cache"** = OFF
5. Click **"Redeploy"**

### Option 4: Verify Project Settings

1. Go to Vercel Dashboard → Your Project → Settings
2. Check **General**:
   - Framework Preset: Should be "Next.js"
   - Build Command: Should be `npm run build` (or auto-detected)
   - Output Directory: Should be `.next` (or auto-detected)
   - Install Command: Should be `npm install` (or auto-detected)
   - Root Directory: Should be `./` (unless your project is in a subfolder)

### Option 5: Check Node.js Version

Create a `.nvmrc` file in the root:

```bash
echo "18" > .nvmrc
```

Or add to `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Most Likely Cause

The `DNS_HOSTNAME_NOT_FOUND` error on Vercel usually means:
- The build failed, and Vercel is trying to serve a non-existent deployment
- There's a configuration conflict in `vercel.json`
- The project structure isn't being detected correctly

**Try Option 1 first** - removing `vercel.json` and letting Vercel auto-detect usually fixes this.

