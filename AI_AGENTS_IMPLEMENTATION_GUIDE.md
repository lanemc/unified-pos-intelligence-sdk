# AI Agents Implementation Guide

This document provides a comprehensive guide to implementing the three AI agents: Business Sentiment, Competitor Sentiment, and Reddit Rooter. Each agent follows a similar architecture pattern with frontend components, API routes, and shared utilities.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Business Sentiment Agent](#business-sentiment-agent)
- [Competitor Sentiment Agent](#competitor-sentiment-agent)
- [Reddit Rooter Agent](#reddit-rooter-agent)
- [Shared Utilities](#shared-utilities)
- [Implementation Steps](#implementation-steps)

## Architecture Overview

All three agents follow this pattern:

1. **Frontend Page** (`/app/[agent-name]/page.tsx`) - Server component that renders the client
2. **Client Component** (`/app/[agent-name]/[AgentName]Client.tsx`) - Interactive UI with form inputs and results display
3. **API Route** (`/app/api/[agent-name]/analyze/route.ts`) - Backend logic for processing requests
4. **Shared Services** - Common utilities for AI operations, sentiment analysis, and external API integrations

## Business Sentiment Agent

### Purpose
Analyzes customer reviews and sentiment from Google and Yelp to provide actionable insights for businesses.

### File Structure
```
/app/business-sentiment-analyzer/
├── page.tsx                    # Server component page
├── ClientAnalyzerV2.tsx        # Client component with UI
/app/business-sentiment-2/
├── page.tsx                    # Alternative V2 implementation
/app/api/business-sentiment-analyzer/
└── analyze/
    └── route.ts               # API endpoint (currently mock)
```

### Key Files

#### 1. Page Component
**Location**: `/app/business-sentiment-analyzer/page.tsx`

Simple server component that renders the client:
```typescript
import ClientAnalyzerV2 from "./ClientAnalyzerV2";

export default async function AnalyzerV2Page() {
  // TODO: Implement proper authentication
  const user = {
    email: "demo@example.com",
    userId: "demo-user",
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClientAnalyzerV2
          userProfile={{
            businessName: "",
            location: "",
            email: user.email || "",
            id: user.userId,
          }}
          documents={[]}
        />
      </div>
    </div>
  );
}
```

#### 2. Client Component
**Location**: `/app/business-sentiment-analyzer/ClientAnalyzerV2.tsx`

Features:
- Form inputs for business name and location
- Loading animation with progress tracking
- Results display with tabs for different views:
  - All Reviews
  - Categories (Food, Service, Ambiance, Value)
  - Key Themes
  - Notable Quotes
  - Recommendations
- AI-generated response suggestions for negative reviews
- Copy to clipboard functionality

Key Interfaces:
```typescript
interface SentimentResult {
  businessName: string;
  businessType: string;
  location: { city: string; state: string; };
  platformResults: PlatformResult[];
  allReviews: Review[];
  unverifiedReviews?: Review[];
  sentimentAnalysis: {
    overallSentiment: {
      score: number;
      label: string;
      summary: string;
    };
    categoryAnalysis: CategoryAnalysis[];
    keyThemes: string[];
    notableQuotes: Quote[];
    recommendationScore: number;
    summary: string;
    recommendedActions: RecommendedAction[];
  };
  apiCoverage: {
    google: boolean;
    yelp: boolean;
    tavily: boolean;
  };
  timestamp: string;
}
```

#### 3. API Route
**Location**: `/app/api/business-sentiment-analyzer/analyze/route.ts`

Currently returns mock data, but structured to integrate with:
- Google Business API
- Yelp API
- Tavily for additional web searches

Mock response includes:
- Platform results (Google, Yelp)
- Sample reviews with ratings and content
- Sentiment analysis by category
- AI-generated responses for reviews
- Recommended actions based on feedback

### Alternative V2 Implementation
**Location**: `/app/business-sentiment-2/page.tsx`

A more advanced dashboard version with:
- Multiple visualization components
- Trend analysis
- Action items tracking
- Source statistics
- Performance context

Uses these components:
- `SentimentOverview`
- `AspectBreakdown`
- `TrendAnalysis`
- `ActionItemsList`
- `ReviewExplorer`
- `SourceStatistics`

## Competitor Sentiment Agent

### Purpose
Compares sentiment between two businesses to identify competitive advantages and market opportunities.

### File Structure
```
/app/competitive-sentiment-analyzer/
├── page.tsx                        # Server component page
├── CompetitiveAnalyzerClient.tsx   # Client component
/app/api/competitive-sentiment-analyzer/
└── analyze/
    └── route.ts                   # API endpoint
```

### Key Files

#### 1. API Route
**Location**: `/app/api/competitive-sentiment-analyzer/analyze/route.ts`

This is the most complete implementation. It:
1. Takes two businesses as input
2. Runs sentiment analysis on both using the Business Sentiment agent
3. Uses OpenAI GPT-4 to generate competitive comparison
4. Returns comprehensive analysis

Key Features:
```typescript
interface CompetitiveAnalysisRequest {
  business1: {
    name: string;
    location: string;
  };
  business2: {
    name: string;
    location: string;
  };
}

interface ComparisonResult {
  business1Analysis: any;
  business2Analysis: any;
  competitiveComparison: {
    overallComparison: {
      business1Score: number;
      business2Score: number;
      winner: string;
      gap: number;
      summary: string;
    };
    categoryComparisons: Array<{
      category: string;
      business1Score: number;
      business2Score: number;
      winner: string;
      insights: string[];
    }>;
    competitiveAdvantages: {
      business1Advantages: string[];
      business2Advantages: string[];
    };
    marketOpportunities: string[];
    strategicRecommendations: Array<{
      priority: "high" | "medium" | "low";
      recommendation: string;
      reasoning: string;
      expectedImpact: string;
    }>;
    riskAssessment: {
      threats: string[];
      weaknesses: string[];
      urgentActions: string[];
    };
  };
  timestamp: string;
}
```

Implementation Details:
- Uses the Business Sentiment agent internally via `executeAgent()`
- Extracts ZIP codes from location strings
- Runs parallel analysis on both businesses
- Uses OpenAI GPT-4 with JSON response format for structured comparison
- Includes fallback logic if AI generation fails

#### 2. Client Component
**Location**: `/app/competitive-sentiment-analyzer/CompetitiveAnalyzerClient.tsx`

Features:
- Side-by-side input forms for two businesses
- Visual comparison with winner badges
- Tabbed interface for results:
  - Categories comparison
  - Competitive advantages
  - Market opportunities
  - Strategic recommendations
  - Risk assessment
- Color-coded sentiment scores
- Priority badges for recommendations

## Reddit Rooter Agent

### Purpose
Monitors Reddit for brand mentions, analyzes sentiment, and generates AI-powered responses for engagement.

### File Structure
```
/app/reddit-rooter/
├── page.tsx                    # Server component page
├── RedditRooterClient.tsx      # Client component
/app/api/reddit-rooter/
├── analyze/
│   └── route.ts               # Search and analyze endpoint
└── post-reply/
    └── route.ts               # Post replies to Reddit
```

### Key Files

#### 1. Analyze API Route
**Location**: `/app/api/reddit-rooter/analyze/route.ts`

Features:
- Authentication check with session
- Searches Reddit using Tavily API
- Sentiment analysis on found mentions
- AI response generation for negative mentions
- Feature usage tracking in database

Key Functionality:
```typescript
interface RedditMention {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  url: string;
  createdAt: string;
  sentiment: {
    score: number;
    classification: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  aiResponse?: string;
  fullname?: string; // Reddit's internal ID
}
```

Search Query Building:
- Combines company name with optional location filters
- Supports time range filters (24h, 7d, 30d, custom)
- Uses Tavily to search reddit.com domain

Response Generation:
- Fetches user's company info from database
- Uses uploaded documents for brand voice
- Generates contextual responses for negative mentions
- Limits to 10 responses for performance

#### 2. Post Reply API Route
**Location**: `/app/api/reddit-rooter/post-reply/route.ts`

Features:
- Posts replies to Reddit using Snoowrap library
- Requires Reddit API credentials (OAuth)
- Handles both post and comment replies
- Includes rate limiting and error handling
- Tracks posted replies in database

Reddit Integration:
```typescript
const reddit = new Snoowrap({
  userAgent: credentials.userAgent,
  clientId: credentials.clientId,
  clientSecret: credentials.clientSecret,
  refreshToken: credentials.refreshToken
});

// Configure rate limiting
reddit.config({
  requestDelay: 1000,
  requestTimeout: 30000,
  continueAfterRatelimitError: false,
  retryErrorCodes: [502, 503, 504, 522],
  maxRetryAttempts: 3
});
```

Error Handling:
- Thread locked
- Deleted comments
- Rate limits
- Invalid post IDs

#### 3. Client Component
**Location**: `/app/reddit-rooter/RedditRooterClient.tsx`

Features:
- Search form with company name and location filters
- Time range selection
- Summary cards showing sentiment breakdown
- Filtered views (All, Negative, Positive, Neutral)
- AI response display with copy/post functionality
- Direct links to Reddit posts
- Loading animation with tips

UI Components:
- Sentiment-colored cards
- Copy to clipboard button
- Post to Reddit button (requires credentials)
- External link to view on Reddit
- Recommended actions alert

## Shared Utilities

### 1. Tavily Service
**Location**: `/lib/tavily/index.ts`

Web search and content extraction service:
```typescript
export async function tavilySearch(query: string, options?: any) {
  return await client.search(query, options);
}

export async function tavilyExtract(url: string, options: {
  includeImages?: boolean;
  extractDepth?: "basic" | "advanced";
  timeout?: number;
} = {}) {
  return await client.extract([url], options);
}
```

### 2. Sentiment Analysis Utilities
**Location**: `/app/api/agent-intelligence/[id]/execute/utils/sentiment-utils.ts`

Comprehensive utilities for:
- Sentiment analysis using OpenAI
- Finding nearby ZIP codes
- Extracting demographic metrics
- Finding discounts and promotions
- Product extraction and categorization
- Price analysis
- USP (Unique Selling Points) extraction
- Insight generation

Key Functions:
```typescript
export async function analyzeSentiment(
  businessName: string,
  reviewData: any[]
): Promise<any>

export function extractDiscounts(content: string): Array<any>

export function extractProducts(
  content: string,
  html: string,
  category: string
): any

export function extractPricing(content: string, html: string): any

export function extractUSP(content: string): string[]
```

## Implementation Steps

### 1. Environment Variables
Required environment variables:
```env
# OpenAI
OPENAI_API_KEY=
OPENAI_ORG_ID=
OPENAI_PROJECT_ID=

# Tavily
TAVILY_API_KEY=

# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

### 2. Database Schema
Required Prisma models:
- `users` - User accounts
- `Feature` - Feature definitions
- `FeatureUsage` - Usage tracking
- `Document` - User uploaded documents
- `UserProfile` - User profile with Reddit credentials

### 3. External API Setup

#### Google Business API
- Enable Google My Business API
- Set up OAuth 2.0 credentials
- Implement token refresh logic

#### Yelp Fusion API
- Register for API access
- Store API key securely
- Implement rate limiting

#### Reddit API
- Create Reddit app at reddit.com/prefs/apps
- Implement OAuth flow for user authorization
- Store refresh tokens securely

### 4. Authentication
All agents require authenticated users:
```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

### 5. Error Handling
Implement consistent error responses:
```typescript
try {
  // Agent logic
} catch (error) {
  console.error('Error in agent:', error);
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    },
    { status: 500 }
  );
}
```

### 6. UI Components
All agents use shadcn/ui components:
- Card, CardContent, CardHeader, CardTitle
- Tabs, TabsContent, TabsList, TabsTrigger
- Button, Input, Label
- Alert, AlertDescription
- Badge, Progress
- Various Lucide icons

### 7. Styling
Consistent styling approach:
- Tailwind CSS classes
- Brand colors: `serve-dark` (#123047), `serve-teal` (#2E98A4)
- Gradient buttons and accents
- Responsive grid layouts
- Dark mode support

## Testing Recommendations

1. **Mock Data**: Start with mock data (as in Business Sentiment) before integrating real APIs
2. **Rate Limiting**: Implement rate limiting for all external API calls
3. **Error States**: Test all error scenarios (API failures, auth errors, validation)
4. **Loading States**: Ensure smooth loading animations and progress indicators
5. **Responsive Design**: Test on mobile and desktop viewports
6. **Accessibility**: Ensure keyboard navigation and screen reader support

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **Input Validation**: Validate all user inputs on both client and server
3. **Rate Limiting**: Implement per-user rate limits
4. **Data Privacy**: Don't store sensitive review data without encryption
5. **CORS**: Configure proper CORS headers for API routes
6. **Authentication**: Always verify user sessions before processing requests

## Performance Optimization

1. **Caching**: Cache API responses to reduce external API calls
2. **Pagination**: Implement pagination for large result sets
3. **Debouncing**: Debounce search inputs to reduce API calls
4. **Lazy Loading**: Load heavy components only when needed
5. **Background Jobs**: Consider queue system for heavy processing
6. **Database Indexes**: Add indexes for frequently queried fields

## Deployment Checklist

- [ ] Set all required environment variables
- [ ] Run database migrations
- [ ] Test all API integrations
- [ ] Configure error monitoring (e.g., Sentry)
- [ ] Set up logging for debugging
- [ ] Configure rate limiting
- [ ] Test authentication flow
- [ ] Verify CORS settings
- [ ] Run security audit
- [ ] Load test API endpoints