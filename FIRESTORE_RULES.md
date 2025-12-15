# Firestore Security Rules Documentation

## Overview

This document describes the Firestore security rules implemented for the UX Analyzer application. These rules ensure that users can only access and modify their own data, and that all data conforms to expected formats and constraints.

## Rules Structure

### Collections Protected

1. **`users`** - User profile data
2. **`analyses`** - UX analysis results
3. **`usage_stats`** - User usage statistics

## User Collection Rules

**Path:** `/users/{userId}`

### Read
- ✅ Users can read their own user document
- ❌ Users cannot read other users' documents

### Create
- ✅ Users can create their own user document (during registration)
- ✅ Must include required fields: `email`, `created_at`
- ✅ Email must be valid format
- ✅ Optional fields: `name`, `avatar_url` (must be strings or null)
- ✅ `created_at` must be server timestamp

### Update
- ✅ Users can update their own user document
- ✅ Cannot change `user_id`
- ✅ Email must be valid if provided
- ✅ Cannot modify `created_at`
- ✅ `last_login` can be updated (handled by server timestamp)

### Delete
- ❌ Users cannot delete their own account (handle via admin function)

## Analyses Collection Rules

**Path:** `/analyses/{analysisId}`

### Read
- ✅ Users can read their own analyses
- ❌ Users cannot read other users' analyses

### Create
- ✅ Users can create analyses for themselves
- ✅ Must include required fields: `user_id`, `title`, `status`, `created_at`, `updated_at`
- ✅ `user_id` must match authenticated user
- ✅ `title` must be non-empty string (max 200 characters)
- ✅ `status` must be one of: `processing`, `completed`, `failed`
- ✅ `screenshot_url` (optional) must be valid URL if provided
- ✅ `result_json` (optional) must be a map/object if provided
- ✅ Timestamps must be server timestamps

### Update
- ✅ Users can update their own analyses
- ✅ Cannot change `user_id`
- ✅ `title` must be valid if provided (non-empty, max 200 chars)
- ✅ `status` must be valid if provided
- ✅ `screenshot_url` must be valid URL if provided
- ✅ `result_json` must be a map/object if provided
- ✅ `updated_at` must be updated to current time
- ✅ Cannot modify `created_at`

### Delete
- ✅ Users can delete their own analyses

## Usage Stats Collection Rules

**Path:** `/usage_stats/{userId}`

### Read
- ✅ Users can read their own stats
- ❌ Users cannot read other users' stats

### Create
- ✅ Users can create their own stats document
- ✅ Must include required fields: `user_id`, `analyses_run`, `storage_used_mb`, `ai_requests`, `updated_at`
- ✅ `user_id` must match authenticated user
- ✅ All numeric fields must be non-negative integers/numbers
- ✅ `updated_at` must be server timestamp

### Update
- ✅ Users can update their own stats
- ✅ Cannot change `user_id`
- ✅ All numeric fields must be non-negative if provided
- ✅ `updated_at` must be updated to current time

### Delete
- ❌ Users cannot delete their stats (handle via admin function)

## Helper Functions

The rules use several helper functions for cleaner code:

- `isAuthenticated()` - Checks if user is logged in
- `isOwner(userId)` - Checks if authenticated user owns the resource
- `isValidEmail(email)` - Validates email format
- `isValidUrl(url)` - Validates URL format
- `isValidStatus(status)` - Validates analysis status

## Default Deny

All other collections and paths are denied by default for security.

## Deployment

To deploy these rules to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

## Testing

You can test these rules using the Firebase Console Rules Playground:

1. Go to **Firestore Database** → **Rules** → **Rules Playground**
2. Select a collection and operation
3. Set authentication context
4. Test various scenarios

## Security Best Practices

✅ **Implemented:**
- User isolation (users can only access their own data)
- Field validation (types, formats, constraints)
- Authentication required for all operations
- Immutable fields protection (`user_id`, `created_at`)
- Server timestamp enforcement

⚠️ **Consider for Production:**
- Rate limiting (implement via Cloud Functions)
- Audit logging (Firebase Audit Logs)
- Admin functions for user deletion
- Backup and recovery procedures


