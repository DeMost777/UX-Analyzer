# Firebase Setup Guide

## Overview

The UX Analyzer application now uses Firebase for:
- **Authentication** (Firebase Auth) - Email/password and Google OAuth
- **Database** (Firestore) - User data, analyses, and usage statistics
- **Storage** (Firebase Storage) - Screenshot uploads

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "ux-analyzer")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider:
   - Add your project's support email
   - Save the OAuth consent screen settings

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (we'll add security rules)
4. Select a location (choose closest to your users)
5. Click "Enable"

## Step 4: Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analyses collection - users can only access their own analyses
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
    
    // Usage stats - users can only access their own stats
    match /usage_stats/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

Click **Publish** to save the rules.

## Step 5: Set Up Firebase Storage

1. Go to **Storage**
2. Click "Get started"
3. Choose **Production mode**
4. Use the same location as Firestore
5. Click "Done"

## Step 6: Set Up Storage Security Rules

Go to **Storage** → **Rules** and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload/access their own files
    match /analyses/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

Click **Publish** to save the rules.

## Step 7: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app with a nickname (e.g., "UX Analyzer Web")
5. Copy the Firebase configuration object

## Step 8: Add Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important**: 
- Replace all values with your actual Firebase config
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- For Vercel deployment, add these as environment variables in project settings

## Step 9: Create Firestore Indexes (Optional)

For better query performance, create a composite index:

1. Go to **Firestore Database** → **Indexes**
2. Click "Create Index"
3. Collection: `analyses`
4. Fields:
   - `user_id` (Ascending)
   - `created_at` (Descending)
5. Click "Create"

## Step 10: Test the Setup

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Try signing up with a new account
4. Create a new analysis
5. Verify data appears in Firestore Console

## Firebase Console Links

- **Authentication**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication
- **Firestore**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore
- **Storage**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/storage
- **Project Settings**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general

## Troubleshooting

### "Firebase is not initialized" error
- Check that all environment variables are set in `.env.local`
- Restart the dev server after adding env vars
- Verify variable names match exactly (case-sensitive)

### Authentication not working
- Ensure Email/Password provider is enabled
- Check that Google OAuth is configured (if using)
- Verify `authDomain` matches your Firebase project

### Storage upload fails
- Check Storage security rules
- Verify Storage is enabled in Firebase Console
- Check file size limits (default is 5GB per file)

### Firestore queries fail
- Verify security rules allow the operation
- Check that indexes are created for complex queries
- Ensure user is authenticated

## Migration from In-Memory Database

The old in-memory database (`lib/db/client.ts`) has been replaced with Firebase. All components now use:
- `lib/firebase/auth.ts` - Authentication
- `lib/firebase/firestore.ts` - Database operations
- `lib/firebase/storage.ts` - File storage

No data migration is needed as the in-memory database was for development only.

## Production Checklist

- [ ] Firebase project created
- [ ] Authentication providers enabled
- [ ] Firestore database created with security rules
- [ ] Storage bucket created with security rules
- [ ] Environment variables set in `.env.local`
- [ ] Environment variables set in Vercel (if deploying)
- [ ] Firestore indexes created (if needed)
- [ ] Test authentication flow
- [ ] Test analysis creation
- [ ] Test file uploads
- [ ] Verify security rules work correctly

