/**
 * This script generates devotion data specifically for today's date
 * and immediately adjacent dates (yesterday, today, tomorrow).
 * 
 * Usage: node scripts/generate-today.js
 */

const admin = require('firebase-admin');
const { format, addDays, subDays } = require('date-fns');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin - support both service account file and environment variables
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
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please either provide a serviceAccountKey.json file in the project root, ' +
        'or set the FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
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
  console.log('Make sure you have either:');
  console.log('1. A serviceAccountKey.json file in the project root directory, or');
  console.log('2. The necessary environment variables set (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
  process.exit(1);
}

// Bible passages with reflection questions for each day
const bibleReadings = [
  {
    bibleText: "Genesis 1:1-31",
    reflectionSections: [
      {
        passage: "Genesis 1:1-2",
        questions: [
          "How does the creation account shape your understanding of God's creative power?",
          "What does it mean to you personally that God created everything 'very good'?"
        ]
      },
      {
        passage: "Genesis 1:26-28",
        questions: [
          "What responsibility do we have as stewards of God's creation?",
          "How does being made in God's image impact how you view yourself and others?"
        ]
      }
    ]
  },
  {
    bibleText: "Psalm 23:1-6",
    reflectionSections: [
      {
        passage: "Psalm 23:1-3",
        questions: [
          "What does it mean to you that 'The Lord is my shepherd'?",
          "How has God restored your soul in difficult times?"
        ]
      },
      {
        passage: "Psalm 23:4-6",
        questions: [
          "How has God's presence comforted you in dark valleys?",
          "What does it mean to dwell in the house of the Lord forever?"
        ]
      }
    ]
  },
  {
    bibleText: "John 3:1-21",
    reflectionSections: [
      {
        passage: "John 3:3-8",
        questions: [
          "What does being 'born again' mean in your own spiritual journey?",
          "How would you explain the concept of spiritual rebirth to someone else?"
        ]
      },
      {
        passage: "John 3:16-17",
        questions: [
          "How does God's sacrificial love impact your daily life?",
          "What does it mean that Jesus came not to condemn but to save?"
        ]
      }
    ]
  },
  {
    bibleText: "Romans 8:18-39",
    reflectionSections: [
      {
        passage: "Romans 8:26-28",
        questions: [
          "How has the Holy Spirit helped you in times of weakness?",
          "How have you seen God work all things for good in difficult circumstances?"
        ]
      },
      {
        passage: "Romans 8:38-39",
        questions: [
          "What challenges have tested your faith in God's unfailing love?",
          "How does the promise that nothing can separate us from God's love bring you comfort?"
        ]
      }
    ]
  },
  {
    bibleText: "Philippians 4:4-13",
    reflectionSections: [
      {
        passage: "Philippians 4:6-7",
        questions: [
          "What anxieties do you need to bring to God in prayer today?",
          "How have you experienced God's peace that surpasses understanding?"
        ]
      },
      {
        passage: "Philippians 4:11-13",
        questions: [
          "What does it mean to be content in all circumstances?",
          "How has Christ's strength helped you through difficult situations?"
        ]
      }
    ]
  },
  {
    bibleText: "Matthew 6:25-34",
    reflectionSections: [
      {
        passage: "Matthew 6:25-27",
        questions: [
          "What are you anxious about today that you need to surrender to God?",
          "How does Jesus's teaching about God's care for birds and flowers speak to your situation?"
        ]
      },
      {
        passage: "Matthew 6:33-34",
        questions: [
          "What does it mean to 'seek first the kingdom of God' in your daily life?",
          "How can you focus on today rather than worrying about tomorrow?"
        ]
      }
    ]
  }
];

// Function to format a date as yyyy-MM-dd
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to generate a devotion for a specific date
function generateDevotion(date) {
  const dateStr = formatDate(date);
  
  // Get a deterministic index based on the date
  const dateSum = dateStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = dateSum % bibleReadings.length;
  
  return {
    date: dateStr,
    ...bibleReadings[index]
  };
}

// Function to save devotions to Firestore with detailed logging
async function saveDevotionToFirestore(devotion) {
  const db = admin.firestore();
  
  try {
    // First check if the document exists
    const docRef = db.collection('devotions').doc(devotion.date);
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log(`Devotion for ${devotion.date} already exists, updating...`);
    } else {
      console.log(`Devotion for ${devotion.date} does not exist, creating...`);
    }
    
    // Set the document with merge option
    await docRef.set(devotion, { merge: true });
    console.log(`Successfully saved devotion for ${devotion.date}`);
    
    // Verify it was saved by reading it back
    const verifyDoc = await docRef.get();
    if (verifyDoc.exists) {
      console.log(`Verification: Devotion for ${devotion.date} exists in database`);
      console.log(`Bible passage: ${verifyDoc.data().bibleText}`);
    } else {
      console.log(`❌ ERROR: Failed to verify devotion for ${devotion.date}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving devotion for ${devotion.date}:`, error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Generate and save devotions for yesterday, today, and tomorrow
    const today = new Date();
    const yesterday = subDays(today, 1);
    const tomorrow = addDays(today, 1);
    
    const dates = [yesterday, today, tomorrow];
    console.log(`\n=========================================`);
    console.log(`GENERATING DEVOTIONS FOR 3 DAYS`);
    console.log(`=========================================`);
    
    // Process one date at a time for better logging
    for (const date of dates) {
      const formattedDate = formatDate(date);
      console.log(`\n--- Processing ${formattedDate} ---`);
      
      const devotion = generateDevotion(date);
      await saveDevotionToFirestore(devotion);
    }
    
    // Pay special attention to today's devotion
    const todayFormatted = formatDate(today);
    console.log(`\n=========================================`);
    console.log(`TODAY'S DEVOTION (${todayFormatted}) HAS BEEN SAVED`);
    console.log(`=========================================\n`);
    
  } catch (error) {
    console.error('Error in script execution:', error);
    process.exit(1);
  } finally {
    // Make sure we exit the Node process
    setTimeout(() => process.exit(0), 1000); // Small delay to ensure logs are flushed
  }
}

// Run the main function
main(); 