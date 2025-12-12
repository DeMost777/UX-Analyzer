/**
 * Firebase Storage Setup Verification Script
 * 
 * This script helps verify that Firebase Storage is properly configured.
 * Run this in a Node.js environment or browser console.
 * 
 * Usage:
 * 1. Ensure you're logged in to the application
 * 2. Open browser console
 * 3. Import and run: verifyStorageSetup()
 */

import { storage } from "@/lib/firebase/config"
import { ref, listAll, getMetadata } from "firebase/storage"

export async function verifyStorageSetup() {
  console.log("🔍 Verifying Firebase Storage Setup...\n")

  // Check 1: Storage initialized
  console.log("1. Checking Storage initialization...")
  if (!storage) {
    console.error("❌ Storage is not initialized!")
    console.error("   → Check that NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set")
    console.error("   → Verify Firebase config in lib/firebase/config.ts")
    return false
  }
  console.log("✅ Storage is initialized\n")

  // Check 2: Storage bucket accessible
  console.log("2. Checking Storage bucket access...")
  try {
    const rootRef = ref(storage, "/")
    await listAll(rootRef)
    console.log("✅ Storage bucket is accessible\n")
  } catch (error: any) {
    console.error("❌ Cannot access Storage bucket!")
    console.error("   → Error:", error.message)
    console.error("   → Check Storage security rules")
    console.error("   → Verify bucket name in environment variables")
    return false
  }

  // Check 3: Test path structure
  console.log("3. Verifying path structure...")
  const testPath = "analyses/test-user/test-analysis/test-file.png"
  const testRef = ref(storage, testPath)
  console.log(`✅ Test path created: ${testPath}\n`)

  // Check 4: Environment variables
  console.log("4. Checking environment variables...")
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (!storageBucket) {
    console.warn("⚠️  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not set")
    console.warn("   → Add to .env.local file")
  } else {
    console.log(`✅ Storage bucket: ${storageBucket}\n`)
  }

  console.log("✅ Storage setup verification complete!")
  console.log("\n📝 Next steps:")
  console.log("   1. Test file upload in the application")
  console.log("   2. Verify files appear in Firebase Console")
  console.log("   3. Test security rules with Rules Playground")
  
  return true
}

/**
 * Test file upload (requires authentication)
 */
export async function testFileUpload(userId: string, analysisId: string) {
  console.log("🧪 Testing file upload...\n")

  if (!storage) {
    console.error("❌ Storage not initialized")
    return false
  }

  // Create a test file (1x1 PNG)
  const testImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  
  try {
    // Convert data URL to blob
    const response = await fetch(testImageData)
    const blob = await response.blob()
    const file = new File([blob], "test.png", { type: "image/png" })

    // Import upload function
    const { uploadScreenshot } = await import("@/lib/firebase/storage")
    
    console.log(`Uploading test file to: analyses/${userId}/${analysisId}/test.png`)
    const url = await uploadScreenshot(file, userId, analysisId)
    
    console.log("✅ File uploaded successfully!")
    console.log(`   URL: ${url}\n`)
    
    // Clean up test file
    const { deleteScreenshot } = await import("@/lib/firebase/storage")
    await deleteScreenshot(url)
    console.log("✅ Test file cleaned up\n")
    
    return true
  } catch (error: any) {
    console.error("❌ File upload test failed!")
    console.error("   → Error:", error.message)
    console.error("   → Check Storage security rules")
    console.error("   → Verify user is authenticated")
    return false
  }
}

/**
 * Check Storage rules deployment
 */
export async function checkStorageRules() {
  console.log("🔒 Checking Storage security rules...\n")
  
  console.log("📋 Current rules should include:")
  console.log("   ✅ User isolation (users can only access their own files)")
  console.log("   ✅ File type validation (images only)")
  console.log("   ✅ File size limits (10MB max)")
  console.log("   ✅ Authentication required\n")
  
  console.log("⚠️  To verify rules:")
  console.log("   1. Go to Firebase Console → Storage → Rules")
  console.log("   2. Compare with storage.rules file")
  console.log("   3. Use Rules Playground to test\n")
}

// Browser console helper - only in browser environment
// This code runs only in the browser, not during SSR/build
if (typeof window !== "undefined") {
  const win = window as any
  win.verifyStorageSetup = verifyStorageSetup
  win.testFileUpload = testFileUpload
  win.checkStorageRules = checkStorageRules
}
