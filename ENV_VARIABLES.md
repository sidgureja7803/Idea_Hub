# Environment Variables for IdeaHub

## Required Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

### 1. Cerebras AI Configuration (REQUIRED)
```env
CEREBRAS_API_KEY=your_cerebras_api_key_here
```
- **Purpose**: AI-powered analysis using Llama 3 models
- **Get it from**: https://cloud.cerebras.ai/
- **Critical**: All AI agent functionality depends on this

### 2. Appwrite Configuration (REQUIRED)
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key
APPWRITE_DATABASE_ID=ideahub-db
```
- **Purpose**: Authentication, database, and storage
- **Setup Steps**:
  1. Create account at https://cloud.appwrite.io/
  2. Create a new project
  3. Go to Settings → copy Project ID
  4. Go to Settings → API Keys → Create new API key with all permissions
  5. Go to Databases → Create database named "ideahub-db" → copy Database ID

### 3. Appwrite Storage (OPTIONAL but RECOMMENDED)
```env
APPWRITE_REPORTS_BUCKET_ID=reports
APPWRITE_DOCUMENTS_BUCKET_ID=documents
```
- **Purpose**: Store generated reports and user documents
- **Setup**: Go to Storage → Create buckets named "reports" and "documents"

### 4. Tavily API (OPTIONAL)
```env
TAVILY_API_KEY=your_tavily_api_key
```
- **Purpose**: Enhanced web search for market research
- **Get it from**: https://tavily.com/
- **Note**: System works without this but with reduced research capabilities

### 5. Server Configuration
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 6. Redis Configuration (OPTIONAL)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```
- **Purpose**: Background job queue for async processing
- **Note**: Falls back to in-memory processing if not configured

## Client Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
```

## Minimum Configuration for Project to Function

**Absolutely Required:**
1. `CEREBRAS_API_KEY` - For AI agents
2. `APPWRITE_ENDPOINT` - For backend services
3. `APPWRITE_PROJECT_ID` - For authentication
4. `APPWRITE_API_KEY` - For server-side Appwrite operations
5. `APPWRITE_DATABASE_ID` - For data storage

**Highly Recommended:**
- `APPWRITE_REPORTS_BUCKET_ID` - For storing analysis reports
- `APPWRITE_DOCUMENTS_BUCKET_ID` - For user uploads

**Optional (Enhanced Features):**
- `TAVILY_API_KEY` - Better market research
- `REDIS_*` - Improved performance for multiple users

## Quick Start

1. Copy this template to `server/.env`
2. Replace all `your_*_here` values with actual credentials
3. Ensure Appwrite database and collections are created
4. Run `npm run dev` in both client and server directories

