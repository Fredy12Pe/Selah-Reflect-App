#!/bin/bash

# Script to generate devotions for a date range
# Usage: ./scripts/generate-devotions.sh [start_date] [end_date]
# Example: ./scripts/generate-devotions.sh 2023-01-01 2024-12-31

# Change to the project root directory
cd "$(dirname "$0")/.."

# Print banner
echo ""
echo "====================================="
echo "   Selah Reflect Devotion Generator"
echo "====================================="
echo ""

# Make sure dependencies are installed
echo "Checking dependencies..."

# Check for date-fns
if ! npm list date-fns > /dev/null 2>&1; then
  echo "Installing date-fns..."
  npm install --save date-fns
fi

# Check for firebase-admin
if ! npm list firebase-admin > /dev/null 2>&1; then
  echo "Installing firebase-admin..."
  npm install --save firebase-admin
fi

echo "✓ Dependencies confirmed"
echo ""

# Check authentication method
echo "Checking authentication method..."

if [ -f "./serviceAccountKey.json" ]; then
  echo "✓ Found serviceAccountKey.json - will use for authentication"
else
  echo "serviceAccountKey.json not found, checking environment variables..."
  
  if [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_CLIENT_EMAIL" ] || [ -z "$FIREBASE_PRIVATE_KEY" ]; then
    echo "❌ Error: Environment variables not set."
    echo ""
    echo "You need to either:"
    echo "1. Place a serviceAccountKey.json file in the project root, or"
    echo "2. Set the following environment variables:"
    echo "   - FIREBASE_PROJECT_ID"
    echo "   - FIREBASE_CLIENT_EMAIL"
    echo "   - FIREBASE_PRIVATE_KEY"
    echo ""
    echo "See DEVOTION-GENERATOR.md for instructions."
    exit 1
  else
    echo "✓ Environment variables found - will use for authentication"
  fi
fi

echo ""

# Run the script with arguments if provided
echo "Running devotion generator..."
if [ $# -eq 2 ]; then
  echo "Generating devotions from $1 to $2"
  node ./scripts/generate-devotions-direct.js "$1" "$2"
else
  # Default to 1 year before and after current date
  echo "Generating devotions for default range (1 year before and after today)"
  node ./scripts/generate-devotions-direct.js
fi

# Check if script execution was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Devotion generation completed successfully!"
  echo ""
  echo "Your past, present, and future dates are now populated with devotion content."
  echo "Users will now be able to access devotions for all dates in the range."
else
  echo ""
  echo "❌ Devotion generation failed. Check the logs above for errors."
  exit 1
fi 