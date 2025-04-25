#!/bin/bash

# Script to ensure today's devotion exists
# Usage: ./scripts/ensure-today.sh

# Print banner
echo ""
echo "========================================="
echo "   Selah Reflect - Today's Devotion Check"
echo "========================================="

# Change to project directory
cd "$(dirname "$0")/.."

# Get today's date
TODAY=$(date +%Y-%m-%d)
echo "Today's date: $TODAY"
echo ""

# Run verification script
echo "Verifying if today's devotion exists..."
node scripts/verify-devotion.js

# Check if verification was successful
if [ $? -ne 0 ]; then
  echo ""
  echo "Verification failed or devotion doesn't exist."
  echo "Generating today's devotion now..."
  
  # Run generation script
  node scripts/generate-today.js
  
  # Run verification again to confirm
  echo ""
  echo "Re-verifying devotion..."
  node scripts/verify-devotion.js
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS: Today's devotion is now available."
    echo "You should be able to see it in the app at: http://localhost:3000/devotion/$TODAY"
  else
    echo ""
    echo "❌ ERROR: Failed to generate today's devotion. Please check the logs above."
    exit 1
  fi
else
  echo ""
  echo "✅ SUCCESS: Today's devotion is already available."
  echo "You should be able to see it in the app at: http://localhost:3000/devotion/$TODAY"
fi 