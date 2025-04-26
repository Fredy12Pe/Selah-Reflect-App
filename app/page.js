"use client";

import { useEffect } from 'react';
import MinimalPage from './minimal-page';

export default function Home() {
  useEffect(() => {
    console.log('[Home] Page loaded');
    
    // Check for Firebase availability
    if (typeof window !== 'undefined') {
      console.log('[Home] Window available, checking Firebase');
      if (window.firebase) {
        console.log('[Home] Firebase available on window');
      } else {
        console.warn('[Home] Firebase not found on window');
      }
    }
  }, []);

  // Render our minimal test page
  return <MinimalPage />;
}