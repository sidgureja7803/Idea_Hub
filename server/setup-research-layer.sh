#!/bin/bash

# Research Layer Setup Script for IdeaHub
# Run this after implementation to verify everything is configured correctly

echo "🔍 IdeaHub Research Layer Setup & Verification"
echo "=============================================="
echo ""

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the /server directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check for .env file
echo "🔐 Step 2: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys:"
    echo "   - PERPLEXITY_API_KEY"
    echo "   - CEREBRAS_API_KEY"
    echo "   - MONGODB_URI"
    echo "   - Redis connection details"
    echo ""
    echo "After updating .env, run this script again."
    exit 0
fi

# Check required environment variables
source .env

MISSING_VARS=()

if [ -z "$PERPLEXITY_API_KEY" ] || [ "$PERPLEXITY_API_KEY" = "your_perplexity_api_key_here" ]; then
    MISSING_VARS+=("PERPLEXITY_API_KEY")
fi

if [ -z "$CEREBRAS_API_KEY" ] || [ "$CEREBRAS_API_KEY" = "your_cerebras_api_key_here" ]; then
    MISSING_VARS+=("CEREBRAS_API_KEY")
fi

if [ -z "$MONGODB_URI" ]; then
    MISSING_VARS+=("MONGODB_URI")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please add these to your .env file and run this script again."
    exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Check Redis connection
echo "🔄 Step 3: Checking Redis connection..."
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}

if command -v redis-cli &> /dev/null; then
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping > /dev/null 2>&1; then
        echo "✅ Redis is running and accessible"
    else
        echo "⚠️  Redis is not responding. Attempting to start..."
        if command -v brew &> /dev/null; then
            brew services start redis
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start redis
        else
            echo "❌ Could not start Redis automatically. Please start it manually:"
            echo "   brew services start redis  (macOS)"
            echo "   sudo systemctl start redis (Linux)"
            echo "   docker run -d -p 6379:6379 redis:alpine (Docker)"
        fi
    fi
else
    echo "⚠️  redis-cli not found. Please ensure Redis is installed and running."
fi
echo ""

# Check MongoDB connection
echo "🗄️  Step 4: Checking MongoDB connection..."
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo "✅ MongoDB client found"
else
    echo "⚠️  MongoDB client not found. Please ensure MongoDB is installed."
fi
echo ""

# Verify file structure
echo "📁 Step 5: Verifying file structure..."
REQUIRED_FILES=(
    "src/retrieval/SearchTool.js"
    "src/retrieval/perplexity.js"
    "src/retrieval/tavily.js"
    "src/retrieval/fetchAndExtract.js"
    "src/retrieval/dedupeRank.js"
    "src/models/ResearchPack.js"
    "src/services/cacheService.js"
    "src/controllers/researchController.js"
    "src/routes/researchRoutes.js"
    "src/agents/researchOrchestrator.js"
)

ALL_FILES_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        ALL_FILES_PRESENT=false
    fi
done

if [ "$ALL_FILES_PRESENT" = true ]; then
    echo "✅ All required files present"
else
    echo "❌ Some files are missing. Please check the implementation."
    exit 1
fi
echo ""

# Summary
echo "=============================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Ensure Redis is running"
echo "2. Ensure MongoDB is running"
echo "3. Start the server: npm run dev"
echo "4. Test the research layer with:"
echo "   node test-research.js"
echo ""
echo "📚 Documentation:"
echo "   - docs/RESEARCH_LAYER_AUDIT.md"
echo "   - docs/RESEARCH_INTEGRATION.md"
echo "   - docs/IMPLEMENTATION_COMPLETE.md"
echo ""
echo "🔗 API Endpoints:"
echo "   - GET /api/research/stream/:jobId (SSE)"
echo "   - GET /health (Server health check)"
echo ""
echo "✅ Research Layer ready for use!"
