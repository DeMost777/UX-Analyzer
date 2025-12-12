# Firebase Storage Setup Checklist

Use this checklist to verify your Firebase Storage setup is complete and working correctly.

## Initial Setup

- [ ] Firebase Storage enabled in Firebase Console
- [ ] Storage bucket created in Production mode
- [ ] Storage location matches Firestore location
- [ ] Storage security rules deployed from `storage.rules`
- [ ] Environment variable `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set in `.env.local`
- [ ] Environment variable added to Vercel (if deploying)

## Configuration Verification

- [ ] Storage initialized in `lib/firebase/config.ts`
- [ ] Storage functions available in `lib/firebase/storage.ts`
- [ ] Upload function tested and working
- [ ] Delete function tested and working

## Security Rules Testing

Test in Firebase Console → Storage → Rules → Rules Playground:

- [ ] Authenticated user can upload valid image (< 10MB)
- [ ] Authenticated user cannot upload invalid file type
- [ ] Authenticated user cannot upload file > 10MB
- [ ] User can only read their own files
- [ ] User cannot read other users' files
- [ ] User can delete their own files
- [ ] User cannot delete other users' files
- [ ] Unauthenticated user cannot upload files
- [ ] Unauthenticated user cannot read files (except avatars)

## Application Testing

- [ ] File upload works in the application
- [ ] Uploaded files appear in Firebase Console Storage
- [ ] Files are organized correctly: `analyses/{userId}/{analysisId}/{filename}`
- [ ] File URLs are saved to Firestore analysis documents
- [ ] Images display correctly in the application
- [ ] File deletion works (if implemented)
- [ ] Error handling works for invalid files
- [ ] Error handling works for files > 10MB

## File Type Testing

Test with different file types:

- [ ] PNG files upload successfully
- [ ] JPEG/JPG files upload successfully
- [ ] WEBP files upload successfully
- [ ] GIF files upload successfully
- [ ] PDF files are rejected
- [ ] Text files are rejected
- [ ] Other file types are rejected

## File Size Testing

- [ ] Files < 10MB upload successfully
- [ ] Files > 10MB are rejected with appropriate error
- [ ] Error message is user-friendly

## Security Testing

- [ ] User A cannot access User B's files
- [ ] User A cannot upload to User B's directory
- [ ] User A cannot delete User B's files
- [ ] Unauthenticated requests are rejected

## Performance Testing

- [ ] Upload progress is shown to user
- [ ] Large files (close to 10MB) upload in reasonable time
- [ ] Multiple file uploads work correctly
- [ ] Network errors are handled gracefully

## Monitoring

- [ ] Storage usage is tracked in Firebase Console
- [ ] Storage usage is tracked in application (usage_stats)
- [ ] Storage quota alerts configured (if needed)

## Documentation

- [ ] Read `FIREBASE_STORAGE_SETUP.md` for detailed instructions
- [ ] Read `STORAGE_RULES.md` for security rules documentation
- [ ] Team members know where to find setup documentation

## Troubleshooting

If something doesn't work:

1. Check browser console for errors
2. Check Firebase Console → Storage for files
3. Verify security rules are deployed
4. Verify environment variables are set
5. Check network tab for failed requests
6. Review `FIREBASE_STORAGE_SETUP.md` troubleshooting section

## Quick Test Commands

In browser console (after logging in):

```javascript
// Verify storage setup
import { verifyStorageSetup } from '@/scripts/verify-storage-setup'
await verifyStorageSetup()

// Test file upload (replace with actual userId and analysisId)
import { testFileUpload } from '@/scripts/verify-storage-setup'
await testFileUpload('user123', 'analysis456')
```

## Production Readiness

Before going to production:

- [ ] All checklist items completed
- [ ] Security rules tested thoroughly
- [ ] Error handling implemented
- [ ] User feedback for upload progress
- [ ] Storage quota monitoring set up
- [ ] Backup strategy in place (if needed)
- [ ] CDN configured (if needed)
- [ ] Image optimization implemented (if needed)

---

**Last Updated:** Check that all items are relevant to your current setup.

**Need Help?** See:
- `FIREBASE_STORAGE_SETUP.md` - Complete setup guide
- `STORAGE_RULES.md` - Security rules documentation
- `FIREBASE_SETUP.md` - General Firebase setup
