#!/bin/bash

set -e

echo "🧹 Step 0: Cleaning build folder..."
# Preserve the google verification file
if [ -f "./build/google571f8db131a7223d.html" ]; then
  cp ./build/google571f8db131a7223d.html /tmp/google571f8db131a7223d.html
fi
rm -rf ./build/*
# Restore the google verification file
if [ -f "/tmp/google571f8db131a7223d.html" ]; then
  mkdir -p ./build
  cp /tmp/google571f8db131a7223d.html ./build/google571f8db131a7223d.html
  rm /tmp/google571f8db131a7223d.html
fi

echo "🔨 Step 1: Building React app..."
npm run build

echo "🧹 Step 2: Cleaning backend public folder..."
# Preserve the google verification file
if [ -f "../backend/public/google571f8db131a7223d.html" ]; then
  cp ../backend/public/google571f8db131a7223d.html /tmp/google571f8db131a7223d.html
fi
rm -rf ../backend/public/*
# Restore the google verification file
if [ -f "/tmp/google571f8db131a7223d.html" ]; then
  mkdir -p ../backend/public
  cp /tmp/google571f8db131a7223d.html ../backend/public/google571f8db131a7223d.html
  rm /tmp/google571f8db131a7223d.html
fi

echo "📦 Step 3: Copying build to backend public folder..."
cp -r ./build/* ../backend/public

echo "🔄 Step 4: Restarting pm2 app (waxxapp)..."
pm2 restart waxxapp

echo "✅ Done! Build deployed to ../backend/public"