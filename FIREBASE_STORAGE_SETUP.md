# Firebase Storage Setup Guide

## Overview

This guide will help you set up Firebase Storage for the UX Analyzer application. Firebase Storage is used to store user-uploaded screenshots for analysis.

## Prerequisites

- ✅ Firebase project created
- ✅ Firebase Authentication enabled
- ✅ Firestore Database created
- ✅ Firebase project configuration obtained

## Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Get started**
5. Choose **Production mode** (we'll add security rules)
6. Select the same location as your Firestore database (for consistency)
7. Click **Done**

⚠️ **Important:** Choose the same region as your Firestore database to minimize latency.

## Step 2: Configure Storage Bucket

1. In the Storage section, click on the **Rules** tab
2. You'll see default rules that allow all authenticated users to read/write
3. We'll replace these with secure rules in the next step

## Step 3: Deploy Storage Security Rules

1. In Firebase Console, go to **Storage** → **Rules**
2. Open the `storage.rules` file from this project
3. Copy the entire contents
4. Paste into the Firebase Console rules editor
5. Click **Publish** to deploy the rules

The rules include:
- ✅ User isolation (users can only access their own files)
- ✅ File type validation (images only: png, jpeg, jpg, webp, gif)
- ✅ File size limits (max 10MB per file)
- ✅ Authentication required for all operations

## Step 4: Verify Environment Variables

Ensure your `.env.local` file includes the storage bucket:

```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
```

Or if using a custom bucket:
```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_custom_bucket_name
```

**Note:** The storage bucket name is typically `{project-id}.appspot.com` or `{project-id}.firebasestorage.app`

## Step 5: Verify Storage Configuration

Check that `lib/firebase/config.ts` includes storage initialization:

```typescript
storage = getStorage(app)
```

This should already be configured in your project.

## Step 6: Test Storage Setup

### Test 1: Verify Storage is Accessible

1. Start your development server: `npm run dev`
2. Sign in to your application
3. Try creating a new analysis with an image upload
4. Check the browser console for any errors

### Test 2: Verify File Upload

1. Upload a valid image file (PNG, JPEG, etc.)
2. File should upload successfully
3. Check Firebase Console → Storage to see the file:
   - Path should be: `analyses/{userId}/{analysisId}/{filename}`

### Test 3: Verify Security Rules

Try uploading:
- ✅ Valid image file (< 10MB) - Should succeed
- ❌ Invalid file type (e.g., PDF) - Should be rejected
- ❌ File > 10MB - Should be rejected
- ❌ Without authentication - Should be rejected

## Step 7: Configure CORS (if needed)

If you need to access Storage from a different domain, configure CORS:

1. Create a `cors.json` file:
```json
[
  {
    "origin": ["https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

2. Deploy using gsutil:
```bash
gsutil cors set cors.json gs://your-bucket-name
```

## Storage Structure

Files are organized as follows:

```
analyses/
  └── {userId}/
      └── {analysisId}/
          └── {filename}
```

Example:
```
analyses/user123/analysis456/screenshot.png
```

## File Size and Type Limits

- **Maximum file size:** 10MB per file
- **Allowed types:** PNG, JPEG, JPG, WEBP, GIF
- **Storage quota:** Depends on your Firebase plan
  - Spark (Free): 5GB total storage
  - Blaze (Pay-as-you-go): Pay for what you use

## Monitoring Storage Usage

1. Go to **Storage** in Firebase Console
2. View total storage used
3. Check individual files and their sizes
4. Monitor usage in **Usage** tab

## Troubleshooting

### Error: "Firebase Storage is not initialized"

**Solution:**
- Check that `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set in `.env.local`
- Restart the dev server after adding env vars
- Verify the bucket name matches your Firebase project

### Error: "Permission denied" on upload

**Solution:**
- Check Storage security rules are deployed
- Verify user is authenticated
- Check file type and size meet requirements
- Review rules in Firebase Console → Storage → Rules

### Error: "File too large"

**Solution:**
- Current limit is 10MB per file
- Compress images before upload
- Or update the limit in `storage.rules` (line 22)

### Files not appearing in Storage

**Solution:**
- Check browser console for errors
- Verify upload function is being called
- Check network tab for failed requests
- Verify user has proper permissions

### CORS errors

**Solution:**
- Configure CORS for your storage bucket (see Step 7)
- Or ensure requests are from the same origin

## Security Best Practices

✅ **Implemented:**
- User isolation (users can only access their own files)
- File type validation (images only)
- File size limits (10MB max)
- Authentication required

⚠️ **Consider for Production:**
- Implement virus scanning (via Cloud Functions)
- Add image optimization/compression
- Set up CDN for faster delivery
- Implement rate limiting
- Add backup procedures
- Monitor for abuse

## Storage Rules Testing

Use Firebase Console Rules Playground:

1. Go to **Storage** → **Rules** → **Rules Playground**
2. Test scenarios:
   - Upload valid image as authenticated user
   - Upload invalid file type
   - Upload file > 10MB
   - Access other user's files
   - Upload without authentication

## Next Steps

After Storage is set up:

1. ✅ Test file uploads in your application
2. ✅ Verify files appear in Firebase Console
3. ✅ Test security rules with different scenarios
4. ✅ Monitor storage usage
5. ✅ Set up alerts for storage quota (if needed)

## Firebase Console Links

- **Storage Dashboard**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/storage
- **Storage Rules**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/storage/rules
- **Storage Usage**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/storage/usage

## Quick Reference

**Storage Path Pattern:**
```
analyses/{userId}/{analysisId}/{filename}
```

**Allowed File Types:**
- PNG
- JPEG/JPG
- WEBP
- GIF

**File Size Limit:**
- 10MB per file

**Security:**
- Authentication required
- Users can only access their own files
- File type and size validation enforced
