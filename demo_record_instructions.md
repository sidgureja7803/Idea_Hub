# FoundrIQ Demo Recording Instructions

This document provides a script for recording a 90-120 second demo video of FoundrIQ for the hackathon submission.

## Equipment Setup

- Use screen recording software (OBS, QuickTime, or similar)
- Ensure high resolution (1080p minimum)
- Test microphone audio quality before recording
- Close unnecessary applications/notifications

## Demo Script (Total time: ~120s)

### Introduction (15s)
- "Hello! I'm [Name], and I'm excited to present FoundrIQ, an AI-powered startup validation platform that transforms raw business ideas into comprehensive market analyses with strategic recommendations in minutes, not weeks."
- "Our platform uses Cerebras AI and Docker containerization to deliver insights that would typically require weeks of research and thousands of dollars in consultant fees."

### Problem Statement (15s)
- "Every year, entrepreneurs waste billions on unvalidated startup ideas. Traditional market research is slow, expensive, and often inaccessible to early-stage founders."
- "FoundrIQ solves this by providing instant, data-driven validation for startup concepts before significant resources are invested."

### Technical Overview (20s)
- [SHOW ARCHITECTURE DIAGRAM]
- "FoundrIQ uses a containerized microservices architecture orchestrated with Docker Compose."
- "Our system includes a React frontend, Node.js backend, worker processes, and several databases working together."
- "The core analysis is powered by Cerebras' powerful inference API, which enables fast, reliable processing of complex market data."

### Demo Flow (50s)
- [START DEMO WITH DOCKER COMPOSE]
- "I'll start by launching our application using Docker Compose with our demo profile."
- [SHOW TERMINAL WITH COMMAND: `docker compose --profile demo up`]
- "Our containers are now running - frontend, backend, worker, databases, and the API gateway."

- [OPEN BROWSER TO LOCALHOST:3000]
- "Here's our FoundrIQ homepage with the idea submission form."
- "I'll click the 'Try Sample Idea' button to analyze a pre-configured startup concept."
- [CLICK BUTTON]

- [SHOW PROCESSING SCREEN]
- "The system immediately creates a job in our Redis queue, and our worker processes it using Cerebras inference."
- "Notice how we track progress in real-time through our dashboard."

- [WHEN RESULTS APPEAR]
- "And here are our results! In just seconds, Cerebras has analyzed the market, calculated TAM/SAM/SOM metrics, identified competitors, assessed feasibility, and provided strategic recommendations."
- "Let me quickly show you the different tabs..."
- [CLICK THROUGH TABS]
- "And we can export these results as a PDF or Markdown report."

### Technical Highlights (15s)
- "Behind the scenes, we're using Cerebras for multiple specialized agents, each handling different aspects of the analysis."
- "Our performance metrics show sub-2-second latency for Cerebras inference calls."
- "The Docker containerization makes deployment simple and consistent across environments."

### Closing (5s)
- "That's FoundrIQ - helping entrepreneurs validate ideas faster and more reliably than ever before."
- "Thank you for watching!"

## Demo Tips

1. **Rehearse** the demo several times before recording
2. **Speak clearly** and maintain a steady pace
3. **Highlight sponsor technologies** (Cerebras and Docker)
4. **Keep the demo focused** on core functionality
5. **Show the full user flow** from idea submission to results
6. **Use visual cues** when explaining technical concepts

## Troubleshooting

If any issues occur during recording:

- **Docker startup issues**: Check that all containers are running with `docker ps`
- **Frontend connectivity**: Ensure the backend is accessible at localhost:8000
- **Blank results**: Check Redis connection and worker logs
- **Slow responses**: Ensure Docker has sufficient resources allocated
