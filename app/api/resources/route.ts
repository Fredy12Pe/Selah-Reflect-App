import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

interface ResourceItem {
  type: 'commentary' | 'video' | 'podcast' | 'book';
  title: string;
  description: string;
  url?: string;
  author?: string;
}

// List of reliable resource domains that are known to work
const RELIABLE_DOMAINS = [
  'biblegateway.com',
  'biblehub.com',
  'blueletterbible.org',
  'bible.org',
  'youtube.com',
  'youtu.be',
  'amazon.com',
  'christianbook.com',
  'goodreads.com',
  'desiringgod.org',
  'thegospelcoalition.org',
  'ligonier.org',
  'logos.com',
  'bibleproject.com',
  'spotify.com',
  'apple.com/apple-podcasts',
  'podcasts.apple.com',
  'crossway.org',
  'ivpress.com',
  'gotquestions.org',
  'openbible.info',
  'archive.org'
];

// Highly reliable specific URLs that are guaranteed to work
const GUARANTEED_RESOURCES = {
  commentary: [
    {
      title: 'Bible Hub Commentaries',
      author: 'Various Biblical Scholars',
      description: 'Comprehensive collection of free Bible commentaries from various scholars and traditions.',
      url: 'https://biblehub.com/commentaries/',
      type: 'commentary'
    },
    {
      title: 'Blue Letter Bible Study Tools',
      author: 'Various Contributors',
      description: 'Interactive tools for in-depth Bible study including commentaries, lexical aids, and cross-references.',
      url: 'https://www.blueletterbible.org/study.cfm',
      type: 'commentary'
    },
    {
      title: 'Bible Gateway Commentaries',
      author: 'Various',
      description: 'Selection of study resources and commentaries on Bible passages.',
      url: 'https://www.biblegateway.com/resources/commentaries/',
      type: 'commentary'
    }
  ],
  video: [
    {
      title: 'BibleProject',
      author: 'Tim Mackie & Jon Collins',
      description: 'High-quality videos exploring biblical themes and passages.',
      url: 'https://bibleproject.com/explore',
      type: 'video'
    },
    {
      title: 'The Bible on YouTube',
      author: 'Various Contributors',
      description: 'Bible study videos and teachings from various sources and perspectives.',
      url: 'https://www.youtube.com/results?search_query=bible+study',
      type: 'video'
    }
  ],
  podcast: [
    {
      title: 'BibleProject Podcast',
      author: 'Tim Mackie & Jon Collins',
      description: 'In-depth conversations about biblical theology and themes.',
      url: 'https://bibleproject.com/podcasts/the-bible-project-podcast/',
      type: 'podcast'
    },
    {
      title: 'Bible Study Podcasts',
      author: 'Various',
      description: 'Collection of Bible study podcasts available on Apple Podcasts.',
      url: 'https://podcasts.apple.com/us/genre/podcasts-religion-spirituality-christianity/id1439',
      type: 'podcast'
    }
  ],
  book: [
    {
      title: 'Bible Commentaries on Amazon',
      author: 'Various',
      description: 'Collection of Bible commentaries and study resources available for purchase.',
      url: 'https://www.amazon.com/s?k=bible+commentary',
      type: 'book'
    },
    {
      title: 'Christian Books',
      author: 'Various',
      description: 'Wide selection of biblical resources, commentaries, and study materials.',
      url: 'https://www.christianbook.com/page/bible-studies/bible-commentaries',
      type: 'book'
    }
  ]
};

/**
 * Check if a URL is likely to be valid based on domain
 */
function isLikelyValidUrl(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  
  try {
    const domain = new URL(url).hostname;
    return RELIABLE_DOMAINS.some(validDomain => domain.includes(validDomain));
  } catch (e) {
    return false;
  }
}

/**
 * Get guaranteed working resources for a specific type and verse
 */
function getGuaranteedResources(type: 'commentary' | 'video' | 'podcast' | 'book', verse: string): ResourceItem[] {
  const baseResources = GUARANTEED_RESOURCES[type] || [];
  
  // For commentaries, try to create a specific URL for the verse if possible
  if (type === 'commentary') {
    // Extract book, chapter, and verse for Bible Hub URL format
    let url = '';
    try {
      // Basic parsing for common formats like "Luke 24:36-44"
      const match = verse.match(/(\w+)\s+(\d+):(\d+)(-\d+)?/);
      if (match) {
        const [_, book, chapter, verseNum] = match;
        url = `https://biblehub.com/commentaries/${book.toLowerCase()}/${chapter}.htm`;
      }
    } catch (e) {
      url = 'https://biblehub.com/commentaries/';
    }
    
    if (url && url !== 'https://biblehub.com/commentaries/') {
      // Add a specific commentary for this verse
      return [
        {
          title: `${verse} Commentary`,
          author: 'Various Biblical Scholars',
          description: `Commentary collection specifically for ${verse} with multiple scholarly perspectives.`,
          url,
          type: 'commentary'
        },
        ...baseResources
      ];
    }
  }
  
  return baseResources;
}

/**
 * Handle POST requests to generate scripture resources
 */
export async function POST(req: Request) {
  try {
    // Parse request body
    const { verse } = await req.json();

    // Validate inputs
    if (!verse) {
      return NextResponse.json(
        { error: 'Missing required field: verse' },
        { status: 400 }
      );
    }

    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful biblical research assistant. Your task is to provide RELIABLE resources related to scripture passages.
          
          Return a structured JSON with these EXACT categories:
          1. commentaries: Array of online commentary resources (WEB-BASED only, NOT books)
          2. videos: Array of video resources 
          3. podcasts: Array of podcast resources
          4. books: Array of book resources
          
          Each resource MUST include: 
          - title: string (required)
          - author: string (if applicable)
          - description: string (1-2 sentences, required)
          - url: string (MUST be a real, working URL)
          
          MOST IMPORTANT RULES:
          - ONLY use URLs that you are 100% CERTAIN exist and work
          - DO NOT make up or guess ANY URLs
          - If unsure about a URL, use ONLY these domains:
             - For commentaries: biblehub.com, blueletterbible.org, biblegateway.com
             - For videos: youtube.com or bibleproject.com
             - For podcasts: spotify.com, apple.com/podcasts, or bibleproject.com
             - For books: amazon.com
          - VERIFY each URL is correctly formatted
          - NEVER invent specific YouTube video IDs
          - NEVER create paths that don't exist
          - For videos, use ONLY general YouTube channel URLs or search URLs
          - For commentaries, use ONLY the main Bible website URLs
          - ALL URLs MUST START with http:// or https://
          - If you cannot provide a working URL, use ONLY these:
             - Commentaries: https://biblehub.com/commentaries/
             - Videos: https://www.youtube.com/results?search_query=bible+study
             - Podcasts: https://podcasts.apple.com/us/genre/podcasts-religion-spirituality-christianity/id1439
             - Books: https://www.amazon.com/s?k=bible+commentary
          
          Format response as valid JSON with exact keys: commentaries, videos, podcasts, books.
          `
        },
        {
          role: "user",
          content: `Please provide reliable, working resources for studying and understanding this Bible passage: ${verse}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    });

    // Extract the generated text and parse as JSON
    const resourcesText = response.choices[0]?.message?.content || '{"commentaries":[],"videos":[],"podcasts":[],"books":[]}';
    let resources;
    
    try {
      resources = JSON.parse(resourcesText);
      
      // For each category, validate URLs and replace with guaranteed working ones if needed
      if (!resources.commentaries || !Array.isArray(resources.commentaries) || resources.commentaries.length === 0) {
        resources.commentaries = getGuaranteedResources('commentary', verse);
      } else {
        // Filter to valid URLs, then add at least one guaranteed resource
        const validCommentaries = resources.commentaries
          .filter(item => item.url && isLikelyValidUrl(item.url))
          .slice(0, 2); // Keep only up to 2 AI-suggested resources
          
        resources.commentaries = [
          ...validCommentaries,
          ...getGuaranteedResources('commentary', verse).slice(0, 2 - validCommentaries.length)
        ];
      }
      
      if (!resources.videos || !Array.isArray(resources.videos) || resources.videos.length === 0) {
        resources.videos = getGuaranteedResources('video', verse);
      } else {
        const validVideos = resources.videos
          .filter(item => item.url && isLikelyValidUrl(item.url))
          .slice(0, 2);
          
        resources.videos = [
          ...validVideos,
          ...getGuaranteedResources('video', verse).slice(0, 2 - validVideos.length)
        ];
      }
      
      if (!resources.podcasts || !Array.isArray(resources.podcasts) || resources.podcasts.length === 0) {
        resources.podcasts = getGuaranteedResources('podcast', verse);
      } else {
        const validPodcasts = resources.podcasts
          .filter(item => item.url && isLikelyValidUrl(item.url))
          .slice(0, 2);
          
        resources.podcasts = [
          ...validPodcasts,
          ...getGuaranteedResources('podcast', verse).slice(0, 2 - validPodcasts.length)
        ];
      }
      
      if (!resources.books || !Array.isArray(resources.books) || resources.books.length === 0) {
        resources.books = getGuaranteedResources('book', verse);
      } else {
        const validBooks = resources.books
          .filter(item => item.url && isLikelyValidUrl(item.url))
          .slice(0, 2);
          
        resources.books = [
          ...validBooks,
          ...getGuaranteedResources('book', verse).slice(0, 2 - validBooks.length)
        ];
      }
      
    } catch (error) {
      console.error('Error parsing JSON from OpenAI:', error);
      console.log('Raw response:', resourcesText);
      
      // Provide fallback with guaranteed working resources
      resources = {
        commentaries: getGuaranteedResources('commentary', verse),
        videos: getGuaranteedResources('video', verse),
        podcasts: getGuaranteedResources('podcast', verse),
        books: getGuaranteedResources('book', verse)
      };
    }

    return NextResponse.json(resources);
  } catch (error: any) {
    console.error('Error in resources API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
      { status: 500 }
    );
  }
} 