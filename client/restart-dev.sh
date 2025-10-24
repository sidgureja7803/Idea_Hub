#!/bin/bash

echo "🔄 Restarting IdeaHub Client Development Server"
echo "=============================================="

# Kill any existing dev servers
echo "🛑 Stopping any existing development servers..."
pkill -f "vite"
pkill -f "npm run dev"

# Clear node modules cache
echo "🧹 Clearing cache..."
rm -rf node_modules/.vite
rm -rf dist

# Reinstall dependencies if needed
if [ "$1" = "--fresh" ]; then
    echo "🔄 Fresh install requested - removing node_modules..."
    rm -rf node_modules
    rm -f package-lock.json
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if all required files exist
echo "🔍 Checking required files..."
required_files=(
    "src/utils/api.ts"
    "src/components/layout/Header.tsx"
    "src/components/layout/Footer.tsx"
    "src/pages/NewLandingPage.tsx"
    "src/context/ThemeContext.tsx"
    "src/context/WebSocketContext.tsx"
    "src/hooks/useAuth.tsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing!"
    fi
done

# Check TypeScript compilation
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    echo "Please fix the TypeScript errors above before continuing"
    exit 1
fi

# Start the development server
echo "🚀 Starting development server..."
npm run dev