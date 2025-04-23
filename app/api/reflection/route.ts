import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

/**
 * Handle POST requests to generate AI reflections
 */
export async function POST(req: Request) {
  try {
    // Parse request body
    const { verse, question } = await req.json();

    // Validate inputs
    if (!verse || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: verse and question' },
        { status: 400 }
      );
    }

    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable biblical scholar and spiritual guide. 
          Provide thoughtful, reverent reflections on scripture that are biblically sound, 
          historically informed, and spiritually meaningful. Maintain a respectful, 
          pastoral tone. Your responses should be 2-3 paragraphs at most.`
        },
        {
          role: "user",
          content: `Scripture reference: ${verse}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Extract and return the generated text
    const reflection = response.choices[0]?.message?.content || 
      "I'm sorry, I couldn't generate a reflection at this time.";

    return NextResponse.json({ reflection });
  } catch (error: any) {
    console.error('Error in reflection API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate reflection' },
      { status: 500 }
    );
  }
} 