#!/bin/bash

# Exit on error
set -e

echo "Deploying Selah Reflect App..."

# Commit any changes
git add .
git commit -m "Fix Netlify build: Use no-patch build method" || true

# Use the no-patch build approach
echo "Building with no Firebase patch..."
npm run build:client:no-patch

# Push to GitHub (which triggers Netlify build)
git push

echo "Deployment initiated! Check Netlify dashboard for build status."
echo "Changes pushed to GitHub. Netlify build should start automatically." 