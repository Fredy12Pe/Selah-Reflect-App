import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  console.log('Devotions API: Handling GET request for date:', params.date);
  
  try {
    // Initialize Firebase Admin
    console.log('Devotions API: Initializing Firebase Admin...');
    initAdmin();
    
    // Get the session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    console.log('Devotions API: Session cookie details:', {
      present: !!sessionCookie,
      name: sessionCookie?.name,
      value: sessionCookie?.value ? '[REDACTED]' : undefined,
    });

    if (!sessionCookie?.value) {
      console.log('Devotions API: No session cookie found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the session cookie
    try {
      console.log('Devotions API: Verifying session cookie...');
      const auth = getAuth();
      const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);
      console.log('Devotions API: Session verified for user:', decodedClaims.uid);
    } catch (error) {
      console.error('Devotions API: Session verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get the devotion using Admin SDK
    console.log('Devotions API: Getting Firestore document...');
    const db = getFirestore();
    const devotionDoc = await db.collection('devotions').doc(params.date).get();

    console.log('Devotions API: Document exists:', devotionDoc.exists);
    if (!devotionDoc.exists) {
      console.log('Devotions API: No devotion found for date:', params.date);
      return NextResponse.json(
        { error: 'Devotion not found' },
        { status: 404 }
      );
    }

    const data = devotionDoc.data();
    console.log('Devotions API: Retrieved data:', {
      id: devotionDoc.id,
      type: data?.type,
      hasContent: !!data?.content,
      hasQuestions: Array.isArray(data?.reflectionQuestions),
      questionCount: Array.isArray(data?.reflectionQuestions) ? data?.reflectionQuestions.length : 0,
    });

    return NextResponse.json({
      id: devotionDoc.id,
      ...data
    });

  } catch (error: any) {
    console.error('Devotions API: Error processing request:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 