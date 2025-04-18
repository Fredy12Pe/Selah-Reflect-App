import { getApps, initializeApp, cert } from 'firebase-admin/app';

export function initAdmin() {
  try {
    if (getApps().length === 0) {
      // Check if all required environment variables are present
      const requiredEnvVars = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      };

      // Log the environment variables (excluding sensitive data)
      console.log('Firebase Admin Environment Variables Status:', {
        projectId: !!requiredEnvVars.projectId,
        clientEmail: !!requiredEnvVars.clientEmail,
        privateKey: !!requiredEnvVars.privateKey,
      });

      // Validate all required variables are present
      const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingVars.join(', ')}`
        );
      }

      // Process the private key
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      // Initialize the app
      const app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });

      console.log('Firebase Admin initialized successfully');
      return app;
    } else {
      console.log('Firebase Admin already initialized');
      return getApps()[0];
    }
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
} 