# FoundrIQ 🚀

> **FoundrIQ is an AI-powered startup validation platform that transforms raw business ideas into comprehensive market analyses with real-time insights and strategic recommendations in minutes, not weeks.**

## Overview

FoundrIQ helps aspiring founders validate their startup ideas using AI-powered analysis:
- Real-time market research
- Competitive benchmarking
- Market sizing (TAM/SAM/SOM)
- Feasibility assessment
- Strategic recommendations

![FoundrIQ Architecture](docs/images/architecture.png)

## AI Analysis Agents

Our platform uses specialized AI agents working in sequence to analyze business ideas:

1. **IdeaInterpreterAgent** - Extracts structured metadata from raw ideas
2. **MarketResearchAgent** - Performs real-time market trend analysis
3. **TAMSamAgent** - Calculates market sizing (TAM/SAM/SOM)
4. **CompetitionScanAgent** - Maps competitive landscape and market gaps
5. **FeasibilityEvaluatorAgent** - Assesses technical and financial viability
6. **StrategyRecommenderAgent** - Generates personalized go-to-market strategies
7. **ReportGeneratorAgent** - Compiles comprehensive analysis reports

## AI Models Integration

### Cerebras AI

FoundrIQ leverages Cerebras Inference API for high-performance AI processing:

- Powers specialized analysis agents for market research and strategy generation
- Delivers structured JSON responses with ~1.5-2 second latency
- Handles complex reasoning tasks with high accuracy
- Enables concurrent processing of multiple analysis pipelines

```javascript
async function runAgent(agentName, prompt) {
  return await cerebrasClient.generateText(prompt, {
    temperature: 0.3,
    maxTokens: 2048
  });
}
```

### LLama Models

Our platform also integrates LLama models for specific analysis capabilities:

- Context-aware market trend analysis
- Competitor differentiation mapping
- Financial projection assessments
- Strategic recommendation generation

## Core Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js/Express + LangChain + LangGraph
- **AI/ML**: Cerebras API + LLama models
- **Infrastructure**: Docker containerized microservices

## Key Features

- **Real-time Analysis**: Transform ideas into comprehensive reports in minutes
- **Interactive Dashboard**: 5-tab results display with visualization
- **Report Export**: Download analysis as PDF or Markdown
- **Agent Pipeline**: 7 specialized AI agents working in sequence
- **Containerized Architecture**: Docker-based deployment with scalability

## Quick Start

See our documentation for setup instructions:
- [Docker Setup](DOCKER.md) (recommended)
- [Deployment Guide](DEPLOYMENT.md)
- [Hackathon Demo](HACKATHON.md)
- [Cerebras Integration](CEREBRAS.md)
- [OpenRouter Integration](OPENROUTER.md)

## Performance Metrics

- **Analysis Time**: 2-3 minutes per startup idea
- **Inference Latency**: 1.5-2.0 seconds per agent request
- **Success Rate**: 99.7% completion rate for analysis tasks
- **Concurrent Capacity**: 5-10 simultaneous analysis pipelines

---

**Built with ❤️ using AI-powered technology**