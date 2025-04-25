/**
 * This script generates devotion data for a specific date range
 * 
 * Usage: node scripts/generate-date-range.js start-date end-date
 * Example: node scripts/generate-date-range.js 2025-04-25 2025-05-10
 */

const admin = require('firebase-admin');
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
  },
  {
    bibleText: "1 Peter 5:6-11",
    reflectionSections: [
      {
        passage: "1 Peter 5:6-7",
        questions: [
          "In what ways do you need to humble yourself under God's mighty hand?",
          "What anxieties do you need to cast on God because He cares for you?"
        ]
      },
      {
        passage: "1 Peter 5:8-11",
        questions: [
          "How can you be alert and of sober mind against the enemy's attacks?",
          "How has God restored, strengthened, and established you after suffering?"
        ]
      }
    ]
  },
  {
    bibleText: "Isaiah 40:28-31",
    reflectionSections: [
      {
        passage: "Isaiah 40:28-29",
        questions: [
          "How does God's eternal power and understanding comfort you today?",
          "When have you experienced God giving you strength when you were weary?"
        ]
      },
      {
        passage: "Isaiah 40:30-31",
        questions: [
          "What does it mean to 'wait upon the Lord' in your current circumstances?",
          "How have you experienced your strength being renewed like eagles?"
        ]
      }
    ]
  },
  {
    bibleText: "Matthew 11:28-30",
    reflectionSections: [
      {
        passage: "Matthew 11:28-29",
        questions: [
          "What burdens do you need to bring to Jesus today?",
          "What does it mean to take Jesus's yoke upon you and learn from Him?"
        ]
      },
      {
        passage: "Matthew 11:29-30",
        questions: [
          "How is Jesus gentle and humble in heart, and how does that affect you?",
          "What makes Jesus's yoke easy and His burden light compared to other burdens?"
        ]
      }
    ]
  },
  {
    bibleText: "Hebrews 12:1-3",
    reflectionSections: [
      {
        passage: "Hebrews 12:1",
        questions: [
          "What 'cloud of witnesses' encourages you in your faith journey?",
          "What sins or hindrances do you need to throw off to run your race better?"
        ]
      },
      {
        passage: "Hebrews 12:2-3",
        questions: [
          "How can you fix your eyes on Jesus when facing daily distractions?",
          "How does Jesus's endurance of the cross help you not grow weary or lose heart?"
        ]
      }
    ]
  },
  {
    bibleText: "John 15:1-17",
    reflectionSections: [
      {
        passage: "John 15:4-5",
        questions: [
          "What does it mean to remain/abide in Christ in practical terms?",
          "In what ways have you tried to bear fruit apart from Christ?"
        ]
      },
      {
        passage: "John 15:9-12",
        questions: [
          "How can you remain in Christ's love today?",
          "How is Christ calling you to love others as He has loved you?"
        ]
      }
    ]
  },
  {
    bibleText: "2 Corinthians 12:7-10",
    reflectionSections: [
      {
        passage: "2 Corinthians 12:7-8",
        questions: [
          "What 'thorns in the flesh' are you dealing with currently?",
          "How have you pleaded with the Lord to remove difficult circumstances?"
        ]
      },
      {
        passage: "2 Corinthians 12:9-10",
        questions: [
          "How is God's grace sufficient in your areas of weakness?",
          "What would it look like to boast in your weaknesses rather than hide them?"
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

// Function to parse date string in YYYY-MM-DD format
function parseDate(dateString) {
  // Validate format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD.`);
  }
  
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  // Validate result
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  
  return date;
}

// Function to generate devotions for a date range
function generateDevotions(startDate, endDate) {
  const devotions = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    
    // Get a deterministic index based on the date
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
  
  for (const devotion of devotions) {
    const docRef = db.collection('devotions').doc(devotion.date);
    
    // Check if document exists first
    const doc = await docRef.get();
    if (doc.exists) {
      console.log(`Devotion for ${devotion.date} already exists, updating...`);
    } else {
      console.log(`Creating devotion for ${devotion.date}...`);
    }
    
    // Add to batch operation
    batch.set(docRef, devotion, { merge: true });
  }
  
  try {
    await batch.commit();
    console.log(`Success! Added/updated ${devotions.length} devotions.`);
    
    // Verify a few dates as a sanity check
    const checkDates = [devotions[0].date, devotions[devotions.length - 1].date];
    
    for (const dateStr of checkDates) {
      const docRef = db.collection('devotions').doc(dateStr);
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log(`Verified devotion for ${dateStr}: ${doc.data().bibleText}`);
      } else {
        console.warn(`Warning: Devotion for ${dateStr} was not saved correctly.`);
      }
    }
    
    return { success: true, count: devotions.length };
  } catch (error) {
    console.error('Error saving devotions to Firestore:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Get command line arguments for date range
    const args = process.argv.slice(2);
    
    let startDate, endDate;
    
    if (args.length >= 2) {
      // Use provided dates
      startDate = parseDate(args[0]);
      endDate = parseDate(args[1]);
    } else {
      console.error('Error: Please provide start and end dates.');
      console.error('Usage: node scripts/generate-date-range.js YYYY-MM-DD YYYY-MM-DD');
      process.exit(1);
    }
    
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    
    console.log(`\n=========================================`);
    console.log(`GENERATING DEVOTIONS FROM ${startDateStr} TO ${endDateStr}`);
    console.log(`=========================================\n`);
    
    // Generate devotions
    const devotions = generateDevotions(startDate, endDate);
    console.log(`Generated ${devotions.length} devotions. Saving to Firestore...`);
    
    // Save to Firestore
    await saveDevotionsToFirestore(devotions);
    
    console.log(`\n=========================================`);
    console.log(`ALL DEVOTIONS HAVE BEEN SAVED SUCCESSFULLY`);
    console.log(`=========================================\n`);
    
  } catch (error) {
    console.error('Error in script execution:', error);
    process.exit(1);
  } finally {
    // Make sure we exit the Node process
    setTimeout(() => process.exit(0), 1000);
  }
}

// Run the main function
main(); 