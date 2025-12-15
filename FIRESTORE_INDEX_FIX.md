# Fix Firestore Index Error

## The Error

```
Failed to load analyses: FirebaseError: The query requires an index.
```

## The Problem

Your Firestore query uses both `where` and `orderBy` on different fields:
- `where("user_id", "==", userId)`
- `orderBy("created_at", "desc")`

Firestore requires a **composite index** for queries that filter and sort on different fields.

## Quick Fix

### Option 1: Use the Link from the Error (Easiest)

1. **Click the link** in the browser console error message
   - It will look like: `https://console.firebase.google.com/v1/r/project/ux-analiysis/firestore/ind...`
   - This link will take you directly to create the index

2. **Click "Create Index"** in Firebase Console
   - The index will be created automatically with the correct fields

3. **Wait for the index to build** (usually takes 1-2 minutes)
   - You'll see a progress indicator

4. **Refresh your app** - The error should be gone!

### Option 2: Create Index Manually

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ux-analiysis**
3. Go to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Configure the index:
   - **Collection ID:** `analyses`
   - **Fields to index:**
     - Field: `user_id` | Order: **Ascending**
     - Field: `created_at` | Order: **Descending**
6. Click **Create**
7. Wait for the index to build (1-2 minutes)

## Verify It's Working

After the index is created:

1. Refresh your application
2. The "Failed to load analyses" error should be gone
3. Your analyses should load correctly

## Why This Happened

Firestore requires composite indexes when you:
- Filter on one field (`user_id`)
- Sort on a different field (`created_at`)

This is a Firestore limitation for performance reasons.

---

**Note:** The index creation link in the error message is the fastest way to fix this!
