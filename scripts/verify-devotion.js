/**
 * This script verifies that a devotion exists for the current date.
 * 
 * Usage: node scripts/verify-devotion.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  let credential;
  
  // Check if service account file exists
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    console.log('Using service account file for authentication');
    const serviceAccount = require(serviceAccountPath);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Check environment variables
    console.log('Service account file not found, checking environment variables');
    
    const requiredEnvVars = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    };
    
    // Validate all required variables are present
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
      
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
    
    console.log('Using environment variables for authentication');
    // Process the private key
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    });
  }
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: credential
  });
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// Function to format a date as yyyy-MM-dd
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Main execution
async function main() {
  try {
    const db = admin.firestore();
    const today = new Date();
    const dateStr = formatDate(today);
    
    console.log(`\n=======================================`);
    console.log(`VERIFYING DEVOTION FOR TODAY (${dateStr})`);
    console.log(`=======================================\n`);
    
    // Get the devotion document
    const devotionRef = db.collection('devotions').doc(dateStr);
    const doc = await devotionRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      console.log('✅ DEVOTION EXISTS FOR TODAY!');
      console.log(`\nDetails:`);
      console.log(`- Date: ${data.date}`);
      console.log(`- Bible Text: ${data.bibleText}`);
      
      if (data.reflectionSections && data.reflectionSections.length > 0) {
        console.log(`- Reflection Sections: ${data.reflectionSections.length}`);
        
        // Show the first reflection section details
        const firstSection = data.reflectionSections[0];
        console.log(`  * First section: ${firstSection.passage}`);
        console.log(`  * Questions: ${firstSection.questions.length}`);
        console.log(`    - ${firstSection.questions[0]}`);
      }
      
      console.log(`\n💯 Your devotion data is ready for use in the app!`);
    } else {
      console.log(`❌ ERROR: No devotion found for today (${dateStr})!`);
      console.log('Run the generate-today.js script to create it.');
    }
    
  } catch (error) {
    console.error('Error verifying devotion:', error);
    process.exit(1);
  } finally {
    setTimeout(() => process.exit(0), 1000);
  }
}

// Run the main function
main(); 