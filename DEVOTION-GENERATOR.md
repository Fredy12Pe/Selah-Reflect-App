# Devotion Generator Guide

This guide explains how to populate your Selah Reflect App with devotion content for past, present, and future dates.

## Prerequisites

- Node.js installed on your machine
- Firebase project with Firestore database
- Firebase service account credentials (either as a file or environment variables)

## Setup

You have two options for setting up Firebase authentication:

### Option 1: Using a Service Account Key File

1. **Get Firebase Service Account Key**

   - Go to your [Firebase Console](https://console.firebase.google.com/)
   - Navigate to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in the root of the project

### Option 2: Using Environment Variables (for production environments)

1. **Set up environment variables**

   Add the following variables to your environment or `.env.local` file:

   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"
   ```

   Note: For the private key, make sure to include the full key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts, and wrap it in quotes.

2. **Update the Script**

   Edit `scripts/generate-devotions-direct.js` to use environment variables instead of the service account file:

   ```javascript
   // Replace the initialization code
   try {
     admin.initializeApp({
       credential: admin.credential.cert({
         projectId: process.env.FIREBASE_PROJECT_ID,
         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
       }),
     });
   } catch (error) {
     console.error("Error initializing Firebase Admin:", error);
     process.exit(1);
   }
   ```

3. **Install Required Dependencies**

   The script will automatically install these, but you can also install them manually:

   ```
   npm install --save firebase-admin date-fns
   ```

## Usage

### Method 1: Using the Shell Script (Recommended)

The shell script simplifies the process by handling dependency checks and providing a simple interface.

1. **Run the script with default date range (1 year before and after today)**

   ```
   ./scripts/generate-devotions.sh
   ```

2. **Run with custom date range**

   ```
   ./scripts/generate-devotions.sh 2023-01-01 2024-12-31
   ```

   Replace the dates with your desired start and end dates in YYYY-MM-DD format.

### Method 2: Using the Node.js Script Directly

1. **Run with default date range**

   ```
   node scripts/generate-devotions-direct.js
   ```

2. **Run with custom date range**

   ```
   node scripts/generate-devotions-direct.js 2023-01-01 2024-12-31
   ```

## Understanding What Happens

When you run the generator:

1. The script creates devotion entries for every day in the specified date range
2. Each devotion includes:
   - Bible text reference
   - Reflection sections with meaningful questions
3. The data is saved directly to your Firestore database
4. Duplicate days are updated, not duplicated (using `merge: true`)

## Troubleshooting

- **Error: "serviceAccountKey.json not found"**  
  If using Option 1, make sure you've downloaded your Firebase service account key and saved it as `serviceAccountKey.json` in the project root.

- **Missing environment variables**  
  If using Option 2, ensure all required environment variables are properly set.

- **Error connecting to Firebase**  
  Verify your Firebase project is properly set up and the service account has the necessary permissions.

- **Script fails to run**  
  Make sure Node.js is installed and you have the necessary permissions to execute the script.

## Notes

- The generated devotions follow a consistent structure that works with the app
- The devotion content is deterministic based on the date, ensuring the same date always gets the same devotion
- This approach eliminates the need to rely on the admin interface, which might have connectivity issues
- The script can be run periodically (e.g., monthly) to ensure future dates are always populated

## Content Variety

The generator includes 10 different Bible passages, each with:

- 2 reflection sections
- 2-3 meaningful questions per section

This provides a good variety of devotional content that will repeat approximately every 10 days.

## Extending the Content

To add more variety to the devotions:

1. Edit `scripts/generate-devotions-direct.js`
2. Add more entries to the `bibleReadings` array with your own Bible texts and questions
3. The more entries you add, the more variety users will experience

---

For any issues or questions, please contact the development team.
