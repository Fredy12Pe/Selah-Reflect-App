/**
 * This script directly uses Firebase Admin SDK to populate devotions for a date range.
 * 
 * Usage: node scripts/generate-devotions-direct.js
 */

const admin = require('firebase-admin');
const { format, addYears, subYears } = require('date-fns');
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
    bibleText: "Matthew 5:1-12",
    reflectionSections: [
      {
        passage: "Matthew 5:3-6",
        questions: [
          "Which of the Beatitudes resonates most with you right now and why?",
          "How do these qualities differ from what our culture typically values?"
        ]
      },
      {
        passage: "Matthew 5:7-12",
        questions: [
          "What does it mean to be a peacemaker in today's divided world?",
          "How can you respond when facing persecution for your faith?"
        ]
      }
    ]
  },
  {
    bibleText: "1 Corinthians 13:1-13",
    reflectionSections: [
      {
        passage: "1 Corinthians 13:4-7",
        questions: [
          "Which aspect of love described here is most challenging for you to live out?",
          "How can you better demonstrate this kind of love in your relationships?"
        ]
      },
      {
        passage: "1 Corinthians 13:11-13",
        questions: [
          "What does it mean that we see dimly now but will see face to face?",
          "How does faith, hope, and love guide your daily decisions?"
        ]
      }
    ]
  },
  {
    bibleText: "Isaiah 40:25-31",
    reflectionSections: [
      {
        passage: "Isaiah 40:28-29",
        questions: [
          "How have you experienced God's unlimited understanding in your life?",
          "When have you felt God giving you strength when you were weary?"
        ]
      },
      {
        passage: "Isaiah 40:30-31",
        questions: [
          "What does it mean to wait upon the Lord in your current season?",
          "How has God renewed your strength when you've felt exhausted?"
        ]
      }
    ]
  },
  {
    bibleText: "James 1:2-18",
    reflectionSections: [
      {
        passage: "James 1:2-4",
        questions: [
          "How can trials produce perseverance and maturity in your faith?",
          "What current trial might God be using to develop your character?"
        ]
      },
      {
        passage: "James 1:12-15",
        questions: [
          "What's the difference between being tested and being tempted?",
          "How can you resist temptation when it feels overwhelming?"
        ]
      }
    ]
  },
  {
    bibleText: "Revelation 21:1-8",
    reflectionSections: [
      {
        passage: "Revelation 21:3-4",
        questions: [
          "How does the promise of God wiping away every tear bring you hope?",
          "What aspect of the new heaven and new earth do you look forward to most?"
        ]
      },
      {
        passage: "Revelation 21:5-7",
        questions: [
          "What does it mean that God is making all things new?",
          "How does your future inheritance as God's child affect your perspective today?"
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

// Function to generate devotions for a range of dates
function generateDevotions(startDateStr, endDateStr) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format. Please use yyyy-MM-dd format.');
  }
  
  const devotions = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    
    // Get a random index based on the date to ensure consistency
    const dateSum = dateStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = dateSum % bibleReadings.length;
    
    devotions.push({
      date: dateStr,
      ...bibleReadings[index]
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return devotions;
}

// Function to save devotions to Firestore
async function saveDevotionsToFirestore(devotions) {
  const db = admin.firestore();
  const batch = db.batch();
  
  devotions.forEach(devotion => {
    const docRef = db.collection('devotions').doc(devotion.date);
    batch.set(docRef, devotion, { merge: true });
  });
  
  try {
    await batch.commit();
    console.log(`Success! Added ${devotions.length} devotions to Firestore.`);
    return { success: true, count: devotions.length };
  } catch (error) {
    console.error('Error saving devotions to Firestore:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Get command line arguments for date range or use defaults
    const args = process.argv.slice(2);
    
    let startDate, endDate;
    
    if (args.length >= 2) {
      // Use provided dates
      startDate = args[0];
      endDate = args[1];
    } else {
      // Default to one year before and after
      const today = new Date();
      const oneYearAgo = subYears(today, 1);
      const oneYearFromNow = addYears(today, 1);
      
      startDate = formatDate(oneYearAgo);
      endDate = formatDate(oneYearFromNow);
    }
    
    // Log the date range
    console.log(`Generating devotions from ${startDate} to ${endDate}`);
    
    // Generate devotions for the date range
    const devotions = generateDevotions(startDate, endDate);
    console.log(`Generated ${devotions.length} devotions. Saving to Firestore...`);
    
    // Save to Firestore
    await saveDevotionsToFirestore(devotions);
  } catch (error) {
    console.error('Error in script execution:', error);
    process.exit(1);
  } finally {
    // Make sure we exit the Node process
    process.exit(0);
  }
}

// Run the main function
main(); 