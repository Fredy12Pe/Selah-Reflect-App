import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API route to serve static JavaScript files with the correct MIME type
 * This ensures that JavaScript files are always served with the correct
 * Content-Type header, preventing MIME type errors.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileParam = searchParams.get('file');
  
  if (!fileParam) {
    return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
  }
  
  // Sanitize the file path to prevent directory traversal
  const filename = fileParam.replace(/\.\./g, '').replace(/[/\\]/g, '');
  const filePath = path.join(process.cwd(), 'public', filename);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Determine the content type based on file extension
    let contentType = 'application/javascript';
    if (filename.endsWith('.css')) {
      contentType = 'text/css';
    } else if (filename.endsWith('.json')) {
      contentType = 'application/json';
    }
    
    // Return the file content with the proper MIME type
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });
  } catch (error) {
    console.error(`Error serving static file ${filePath}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Make the route run without specific route segment config
export const dynamic = 'force-dynamic'; 