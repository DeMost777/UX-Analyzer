# Troubleshooting Vercel Deployment

## Error: DNS_HOSTNAME_NOT_FOUND (502 Bad Gateway)

This error typically occurs when:
1. The build process fails
2. There's a configuration issue
3. A service is trying to connect to a non-existent hostname

### Step 1: Check Vercel Build Logs

1. Go to your Vercel Dashboard
2. Click on your project
3. Go to the **"Deployments"** tab
4. Click on the failed deployment
5. Check the **"Build Logs"** and **"Function Logs"** tabs

Look for:
- Build errors
- TypeScript errors
- Missing dependencies
- Runtime errors

### Step 2: Verify Build Locally

```bash
# Clean install
rm -rf node_modules .next
npm install

# Test build
npm run build

# If build succeeds, test production server
npm start
```

### Step 3: Common Fixes

#### Fix 1: Remove vercel.json (Let Vercel Auto-Detect)

Vercel auto-detects Next.js projects. The `vercel.json` might be causing conflicts:

```bash
# Optionally remove vercel.json
rm vercel.json
```

Then redeploy.

#### Fix 2: Check Node.js Version

Vercel uses Node.js 18+ by default. If you need a specific version:

1. Create `.nvmrc` file:
   ```bash
   echo "18" > .nvmrc
   ```

2. Or set in `package.json`:
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

#### Fix 3: Verify Environment Variables

If you added any environment variables:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Ensure they're set for **Production**, **Preview**, and **Development**
3. Redeploy

#### Fix 4: Check for Hardcoded URLs

Search for any hardcoded localhost or development URLs:

```bash
grep -r "localhost\|127.0.0.1\|http://" --exclude-dir=node_modules .
```

#### Fix 5: Disable Analytics Temporarily

If Vercel Analytics is causing issues, temporarily comment it out:

```tsx
// app/layout.tsx
// import { Analytics } from "@vercel/analytics/next"

// In the component:
// <Analytics />
```

Then redeploy to test.

### Step 4: Redeploy

After making changes:

1. **Via Git** (Recommended):
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push
   ```
   Vercel will automatically redeploy.

2. **Via Vercel Dashboard**:
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

### Step 5: Check Runtime Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Check for runtime errors
3. Look for any DNS-related errors

## Still Having Issues?

1. **Check Vercel Status**: [status.vercel.com](https://status.vercel.com)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **Next.js Deployment Docs**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

## Quick Diagnostic Commands

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint

# Verify all dependencies are installed
npm install --legacy-peer-deps

# Test production build
npm run build && npm start
```

