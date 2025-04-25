#!/bin/bash

# Exit on error
set -e

echo "Building for Netlify without Firebase patching..."

# Set environment variables
export NETLIFY=true
export SKIP_FIREBASE_INIT_ON_BUILD=true
export SKIP_API_ROUTES=true
export SKIP_FIREBASE_ADMIN=true
export SKIP_FIREBASE_PATCH=true
export NEXT_PUBLIC_IS_NETLIFY_BUILD=true
export NEXT_STATIC_EXPORT=false

# Create a dummy .env.local file to ensure Firebase initialization is skipped
echo "# Temporary environment file for build" > .env.build
echo "SKIP_FIREBASE_INIT_ON_BUILD=true" >> .env.build
echo "SKIP_API_ROUTES=true" >> .env.build
echo "SKIP_FIREBASE_ADMIN=true" >> .env.build
echo "SKIP_FIREBASE_PATCH=true" >> .env.build
echo "NETLIFY=true" >> .env.build
echo "NEXT_PUBLIC_IS_NETLIFY_BUILD=true" >> .env.build

# Run the build with the environment file
echo "Running Next.js build..."
next build --env-file=.env.build

# Clean up temp files
rm .env.build

echo "Build completed successfully!" 