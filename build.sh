#!/bin/bash
set -e

# Display environment information
echo "Current working directory: $(pwd)"
echo "Directory contents:"
ls -la

# Run the build process
NODE_OPTIONS="--max-old-space-size=4096" node build-firebase.js

# Check if build succeeded
if [ -d "out" ]; then
  echo "Build successful! Contents of out directory:"
  ls -la out
  
  # Copy the content from out directory to the root (for Firebase deployment)
  echo "Copying files from out to root directory..."
  cp -r out/* .
  
  echo "Resulting root directory:"
  ls -la
else
  echo "Build failed - out directory not found"
  exit 1
fi

echo "Build script completed successfully" 