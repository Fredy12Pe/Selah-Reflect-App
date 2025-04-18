const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const data = {
  meta: {
    hymns: {
      "April": {
        hymnTitle: "When I Survey the Wondrous Cross",
        author: "Isaac Watts",
        composer: "Lowell Mason",
        lyrics: "When I survey the wondrous cross\nOn which the Prince of glory died..."
      },
      "May": {
        hymnTitle: "O Master, Let Me Walk With Thee",
        author: "Washington Gladden",
        composer: "Henry Percy Smith",
        lyrics: "O Master, let me walk with thee\nIn lowly paths of service free..."
      },
      "June": {
        hymnTitle: "Rock of Ages",
        author: "Augustus Toplady",
        composer: "Thomas Hastings",
        lyrics: "Rock of Ages, cleft for me\nLet me hide myself in thee..."
      }
    }
  },
  devotions: {
    "2025-04-01": {
      type: "devotion",
      bibleText: "Luke 22:1-6",
      reflectionQuestions: [
        {
          reference: "Luke 22:1-6",
          question: "How did Judas become a target for Satan?"
        },
        {
          reference: "Luke 22:1-6",
          question: "What are ways in which I am vulnerable to sin?"
        }
      ]
    },
    "2025-05-21": {
      type: "commentary",
      title: "1 Corinthians 7 \\u2013 Commentary",
      content: "With the beginning of chapter 7, Paul makes a major structural transition in the letter..."
    },
    "2025-06-15": {
      type: "devotion",
      bibleText: "1 Corinthians 13:1-13",
      reflectionQuestions: [
        {
          reference: "1 Corinthians 13:1-13",
          question: "What is the biblical definition of love according to this passage?"
        }
      ]
    }
  }
};

async function importData() {
  try {
    // Import hymns
    console.log('Importing hymns...');
    await db.doc('meta/hymns').set(data.meta.hymns);
    console.log('✅ Hymns imported successfully');

    // Import devotions
    console.log('\nImporting devotions...');
    const devotionsPromises = Object.entries(data.devotions).map(([date, devotion]) => {
      console.log(`Importing devotion for ${date}...`);
      return db.doc(`devotions/${date}`).set(devotion);
    });
    
    await Promise.all(devotionsPromises);
    console.log('✅ Devotions imported successfully');

    console.log('\n✨ All data imported successfully!');
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importData(); 