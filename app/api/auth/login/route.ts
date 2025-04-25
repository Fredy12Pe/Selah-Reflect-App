import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Skip Firebase Admin initialization during build time
const isBuildTime = process.env.SKIP_FIREBASE_ADMIN === 'true' || process.env.SKIP_API_ROUTES === 'true';

// Initialize Firebase Admin if not already initialized and not in build time
if (!getApps().length && !isBuildTime) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export async function POST(request: NextRequest) {
  // Return mock response during build time
  if (isBuildTime) {
    console.log('Skipping API route execution during build');
    return NextResponse.json({ success: true, note: 'Build time mock response' });
  }

  try {
    // Get session token from request body
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'No ID token provided' },
        { status: 400 }
      );
    }
    
    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Create a session cookie
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
    
    // Set cookie options
    const cookieOptions = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict' as const,
    };
    
    // Set the cookie in the response
    cookies().set(cookieOptions);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
} 