# How to Get Your Firebase Service Account Key

This guide walks you through the process of obtaining a Firebase service account key for your project. This key is needed to run the devotion generator script.

## Step 1: Access the Firebase Console

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your project from the list

## Step 2: Navigate to Project Settings

1. Click on the gear icon ⚙️ next to "Project Overview" in the left sidebar
2. Select "Project settings" from the menu

## Step 3: Go to Service Accounts Tab

1. Click on the "Service accounts" tab at the top of the page
2. You should see "Firebase Admin SDK" section

## Step 4: Generate a New Private Key

1. Scroll down to the "Firebase Admin SDK" section
2. Click on the "Generate new private key" button
3. A popup will appear warning you to keep this key secure
4. Click "Generate key" to confirm

![Generate private key screenshot](https://firebasestorage.googleapis.com/v0/b/firebase-docs.appspot.com/o/images%2Fservice-accounts%2Fgenerate-new-private-key-button.png?alt=media&token=e321a63f-79c0-4e5a-a557-a49fbce3c4c4)

## Step 5: Save the Key File

1. A JSON file containing your private key will be downloaded automatically
2. Rename this file to `serviceAccountKey.json`
3. Move this file to the root directory of your Selah Reflect App project

## Important Security Notes

- **Never commit this file to version control**
- Make sure `.gitignore` includes `serviceAccountKey.json`
- This key grants admin access to your Firebase project
- Keep this key secure and don't share it
- For production environments, consider using environment variables instead

## Alternative: Using Environment Variables

For production environments or if you prefer not to store the key as a file, you can convert the key to environment variables:

1. Open the downloaded JSON file
2. Extract the following values:
   - `project_id` → Set as `FIREBASE_PROJECT_ID`
   - `client_email` → Set as `FIREBASE_CLIENT_EMAIL`
   - `private_key` → Set as `FIREBASE_PRIVATE_KEY`

Example:

```
FIREBASE_PROJECT_ID=selah-reflect-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@selah-reflect-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB ... -----END PRIVATE KEY-----\n"
```

Make sure to include the full private key including the begin and end markers, and wrap it in quotes.

## Next Steps

Once you have your service account key in place, you can run the devotion generator script:

```
./scripts/generate-devotions.sh
```

See the `DEVOTION-GENERATOR.md` file for more details on generating devotions.
