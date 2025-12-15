# Firebase Storage Security Rules Documentation

## Overview

This document describes the Firebase Storage security rules implemented for the UX Analyzer application. These rules ensure that users can only upload, read, and delete their own files, with proper file type and size validation.

## Rules Structure

### Paths Protected

1. **`analyses/{userId}/{allPaths=**}`** - Analysis screenshots
2. **`avatars/{userId}/{allPaths=**}`** - User avatars (optional, for future use)

## Analyses Screenshots Rules

**Path:** `/analyses/{userId}/{analysisId}/{filename}`

### Read
- ✅ Users can read files in their own directory
- ❌ Users cannot read other users' files

### Write (Upload)
- ✅ Users can upload files to their own directory
- ✅ File must be an image type: `png`, `jpeg`, `jpg`, `webp`, or `gif`
- ✅ File size must be less than 10MB
- ❌ Other file types are rejected
- ❌ Files larger than 10MB are rejected

### Delete
- ✅ Users can delete their own files
- ❌ Users cannot delete other users' files

## User Avatars Rules

**Path:** `/avatars/{userId}/{filename}`

### Read
- ✅ Avatars are public (anyone can read)
- ℹ️ This allows displaying user avatars without authentication

### Write (Upload)
- ✅ Users can upload their own avatar
- ✅ File must be an image type
- ✅ File size must be less than 10MB

### Delete
- ✅ Users can delete their own avatar
- ❌ Users cannot delete other users' avatars

## Helper Functions

The rules use several helper functions:

- `isAuthenticated()` - Checks if user is logged in
- `isOwner(userId)` - Checks if authenticated user owns the path
- `isValidImageType()` - Validates file is an image (png, jpeg, jpg, webp, gif)
- `isValidFileSize()` - Validates file size is less than 10MB

## File Size Limits

- **Maximum file size:** 10MB per file
- **Allowed image types:** PNG, JPEG, JPG, WEBP, GIF
- **Rejected:** All other file types

## Default Deny

All other paths are denied by default for security.

## Deployment

To deploy these rules to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Storage** → **Rules**
4. Copy the contents of `storage.rules`
5. Paste into the rules editor
6. Click **Publish**

## Testing

You can test these rules using the Firebase Console Rules Playground:

1. Go to **Storage** → **Rules** → **Rules Playground**
2. Select a path and operation
3. Set authentication context
4. Test various scenarios:
   - Upload valid image (< 10MB)
   - Upload invalid file type
   - Upload file > 10MB
   - Access other user's files

## Security Best Practices

✅ **Implemented:**
- User isolation (users can only access their own files)
- File type validation (images only)
- File size limits (10MB max)
- Authentication required for uploads/deletes

⚠️ **Consider for Production:**
- Virus scanning (implement via Cloud Functions)
- Image optimization/compression
- CDN integration for faster delivery
- Backup and recovery procedures
- Rate limiting for uploads

## Example File Paths

```
analyses/user123/analysis456/screenshot.png  ✅ Allowed (user123's file)
analyses/user123/analysis456/document.pdf   ❌ Rejected (not an image)
analyses/user789/analysis456/screenshot.png  ❌ Rejected (different user)
avatars/user123/profile.jpg                 ✅ Allowed (public read, user123 can write)
```


