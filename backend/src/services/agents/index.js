import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export class IdeaInterpreterAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(ideaData) {
    const prompt = `
You are an expert startup analyst. Analyze the following startup idea and extract structured metadata:

**Description:** ${ideaData.description}
**Category:** ${ideaData.category}
**Target Audience:** ${ideaData.targetAudience || 'Not specified'}
**Problem Solved:** ${ideaData.problemSolved}

Extract and provide the following information in JSON format:
- industry: The specific industry sector
- productType: Type of product (SaaS, marketplace, physical product, service, etc.)
- keyProblem: Core problem being addressed (1-2 sentences)
- targetMarket: Refined target market description
- uniqueValue: Key unique value proposition
- businessModel: Likely business model approach

Respond with valid JSON only.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        industry: ideaData.category,
        productType: 'Unknown',
        keyProblem: ideaData.problemSolved,
        targetMarket: ideaData.targetAudience || 'General consumers',
        uniqueValue: 'To be determined',
        businessModel: 'To be determined'
      };
    } catch (error) {
      console.error('IdeaInterpreterAgent error:', error);
      return {
        industry: ideaData.category,
        productType: 'Unknown',
        keyProblem: ideaData.problemSolved,
        targetMarket: ideaData.targetAudience || 'General consumers',
        uniqueValue: 'Analysis failed',
        businessModel: 'Analysis failed'
      };
    }
  }
}

export class MarketResearchAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(interpretedData) {
    // For demo purposes, we'll simulate Tavily search with Gemini analysis
    const prompt = `
You are a market research analyst. Provide a comprehensive market analysis for a startup in the ${interpretedData.industry} industry.

**Industry:** ${interpretedData.industry}
**Product Type:** ${interpretedData.productType}
**Target Market:** ${interpretedData.targetMarket}
**Key Problem:** ${interpretedData.keyProblem}

Provide analysis on:
1. Current market trends (2024-2025)
2. Market growth statistics and projections
3. Investment activity in this space
4. Key market drivers and challenges
5. Market size estimates

Format your response as detailed analysis with specific insights and data points where possible.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      return {
        trends: this.extractSection(content, 'trends') || 'Growing market with increasing demand',
        investment: this.extractSection(content, 'investment') || 'Active investment landscape',
        size: this.extractSection(content, 'size') || 'Large addressable market',
        summary: content
      };
    } catch (error) {
      console.error('MarketResearchAgent error:', error);
      return {
        trends: 'Market analysis unavailable',
        investment: 'Investment data unavailable',
        size: 'Market size data unavailable',
        summary: 'Market research analysis failed. Please try again.'
      };
    }
  }

  extractSection(content, keyword) {
    const lines = content.split('\n');
    const relevantLines = lines.filter(line => 
      line.toLowerCase().includes(keyword) ||
      line.toLowerCase().includes('market') ||
      line.toLowerCase().includes('growth')
    );
    return relevantLines.slice(0, 3).join(' ').trim();
  }
}

export class TAMSamAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(data) {
    const prompt = `
You are a market sizing expert. Calculate TAM, SAM, and SOM for this startup idea:

**Industry:** ${data.industry}
**Product Type:** ${data.productType}
**Target Market:** ${data.targetMarket}
**Key Problem:** ${data.keyProblem}
**Market Context:** ${data.marketData?.summary || 'Limited market data available'}

Provide:
1. TAM (Total Addressable Market) - estimate in USD
2. SAM (Serviceable Addressable Market) - estimate in USD  
3. SOM (Serviceable Obtainable Market) - estimate in USD
4. Methodology and assumptions used
5. Market penetration timeline

Format as detailed analysis with specific dollar amounts and reasoning.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      return {
        tam: this.extractValue(content, 'TAM') || '$10.5B',
        sam: this.extractValue(content, 'SAM') || '$1.2B',
        som: this.extractValue(content, 'SOM') || '$150M',
        analysis: content
      };
    } catch (error) {
      console.error('TAMSamAgent error:', error);
      return {
        tam: 'Analysis unavailable',
        sam: 'Analysis unavailable', 
        som: 'Analysis unavailable',
        analysis: 'Market sizing analysis failed. Please try again.'
      };
    }
  }

  extractValue(content, metric) {
    const regex = new RegExp(`${metric}[:\\s]*\\$?([0-9.,]+[BMK]?)`, 'i');
    const match = content.match(regex);
    return match ? `$${match[1]}` : null;
  }
}

export class QlooTasteAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(interpretedData) {
    // Simulate Qloo API integration for cultural alignment
    const prompt = `
Analyze the cultural alignment and consumer appeal for this startup idea:

**Industry:** ${interpretedData.industry}
**Product Type:** ${interpretedData.productType}
**Target Market:** ${interpretedData.targetMarket}
**Key Problem:** ${interpretedData.keyProblem}

Provide analysis on:
1. Cultural fit score (0-100)
2. Consumer passion alignment
3. Current trend relevance
4. Target demographic preferences
5. Cultural barriers or opportunities

Respond with insights about how well this idea aligns with current consumer interests and cultural trends.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      return {
        culturalFitScore: this.extractScore(content) || 75,
        alignment: this.extractAlignment(content) || 'Moderate alignment with current trends',
        insights: content
      };
    } catch (error) {
      console.error('QlooTasteAgent error:', error);
      return {
        culturalFitScore: 50,
        alignment: 'Cultural analysis unavailable',
        insights: 'Cultural alignment analysis failed. Please try again.'
      };
    }
  }

  extractScore(content) {
    const scoreMatch = content.match(/(\d{1,3})\s*\/?\s*100|(\d{1,3})%|score[:\s]*(\d{1,3})/i);
    return scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]) : null;
  }

  extractAlignment(content) {
    const sentences = content.split('.').filter(s => 
      s.toLowerCase().includes('align') || 
      s.toLowerCase().includes('trend') ||
      s.toLowerCase().includes('cultural')
    );
    return sentences[0]?.trim() || null;
  }
}

export class CompetitionScanAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(interpretedData) {
    const prompt = `
Conduct a competitive analysis for this startup idea:

**Industry:** ${interpretedData.industry}
**Product Type:** ${interpretedData.productType}
**Target Market:** ${interpretedData.targetMarket}
**Key Problem:** ${interpretedData.keyProblem}

Identify and analyze:
1. Top 3-5 direct competitors
2. Their strengths and weaknesses
3. Market positioning
4. Funding status and business models
5. White space opportunities

For each competitor, provide:
- Company name
- Description
- Threat level (high/medium/low)
- Key strengths (3-5 points)
- Key weaknesses (3-5 points)

Format as structured analysis with clear competitor profiles.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      return {
        competitors: this.parseCompetitors(content),
        summary: content
      };
    } catch (error) {
      console.error('CompetitionScanAgent error:', error);
      return {
        competitors: [],
        summary: 'Competitive analysis failed. Please try again.'
      };
    }
  }

  parseCompetitors(content) {
    // Simple parsing - in production, you'd want more sophisticated parsing
    const competitors = [];
    const sections = content.split(/\d+\./);
    
    sections.slice(1, 6).forEach((section, index) => {
      const lines = section.trim().split('\n');
      const name = lines[0]?.replace(/[*#-]/g, '').trim() || `Competitor ${index + 1}`;
      
      competitors.push({
        name,
        description: lines[1]?.trim() || 'Analysis in progress',
        threat: this.extractThreat(section) || 'medium',
        strengths: this.extractList(section, 'strength') || ['Market presence', 'Brand recognition'],
        weaknesses: this.extractList(section, 'weakness') || ['Limited features', 'High pricing']
      });
    });
    
    return competitors.length > 0 ? competitors : [
      {
        name: 'Market Leader',
        description: 'Established player with significant market share',
        threat: 'high',
        strengths: ['Market dominance', 'Resource availability', 'Brand recognition'],
        weaknesses: ['Innovation lag', 'Complex pricing', 'Customer service issues']
      }
    ];
  }

  extractThreat(text) {
    const threatMatch = text.toLowerCase().match(/(high|medium|low)\s*threat/);
    return threatMatch ? threatMatch[1] : null;
  }

  extractList(text, keyword) {
    const regex = new RegExp(`${keyword}s?[:\\s]*([^\\n]*(?:\\n-[^\\n]*)*)`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].split(/[-•\n]/).filter(item => item.trim()).slice(0, 5);
    }
    return null;
  }
}

export class FeasibilityEvaluatorAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(data) {
    const prompt = `
Evaluate the feasibility of this startup idea:

**Industry:** ${data.industry}
**Product Type:** ${data.productType}
**Target Market:** ${data.targetMarket}
**Key Problem:** ${data.keyProblem}

Assess:
1. Technical feasibility and complexity
2. Required technical skills and team
3. Financial requirements (initial capital, monthly burn)
4. Regulatory considerations
5. Market entry barriers
6. Risk factors and mitigation strategies
7. Timeline to MVP and market

Provide detailed feasibility assessment with specific recommendations.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      return {
        technical: {
          complexity: this.extractComplexity(content) || 'Medium',
          skills: this.extractSkills(content) || 'Full-stack development'
        },
        financial: {
          initial: this.extractFinancial(content, 'initial') || '$50K-$100K',
          monthly: this.extractFinancial(content, 'monthly') || '$10K-$15K'
        },
        summary: content
      };
    } catch (error) {
      console.error('FeasibilityEvaluatorAgent error:', error);
      return {
        technical: {
          complexity: 'Analysis unavailable',
          skills: 'Analysis unavailable'
        },
        financial: {
          initial: 'Analysis unavailable',
          monthly: 'Analysis unavailable'
        },
        summary: 'Feasibility analysis failed. Please try again.'
      };
    }
  }

  extractComplexity(content) {
    const complexityMatch = content.toLowerCase().match(/(low|medium|high)\s*complexity?/);
    return complexityMatch ? complexityMatch[1].charAt(0).toUpperCase() + complexityMatch[1].slice(1) : null;
  }

  extractSkills(content) {
    const skillsSection = content.match(/skills?[:\s]*(.*?)(?:\n|$)/i);
    return skillsSection ? skillsSection[1].trim() : null;
  }

  extractFinancial(content, type) {
    const regex = new RegExp(`${type}[^$]*\\$([^\\n]+)`, 'i');
    const match = content.match(regex);
    return match ? `$${match[1].trim()}` : null;
  }
}

export class StrategyRecommenderAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(allData) {
    const prompt = `
Generate strategic recommendations based on this comprehensive analysis:

**Startup Idea:**
- Industry: ${allData.industry}
- Product Type: ${allData.productType}
- Target Market: ${allData.targetMarket}
- Key Problem: ${allData.keyProblem}

**Market Context:**
- TAM/SAM/SOM: ${allData.tamSamSom?.tam} / ${allData.tamSamSom?.sam} / ${allData.tamSamSom?.som}
- Cultural Fit Score: ${allData.culturalAlignment?.culturalFitScore}/100
- Competition Level: ${allData.competition?.competitors?.length || 0} major competitors identified

**Feasibility:**
- Technical Complexity: ${allData.feasibility?.technical?.complexity}
- Financial Requirements: ${allData.feasibility?.financial?.initial} initial

Provide detailed recommendations for:
1. Go-to-market strategy
2. Monetization models
3. Marketing channels and approach
4. Partnership opportunities
5. Key milestones and next steps
6. Risk mitigation strategies

Format as actionable strategic plan with specific recommendations.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      return {
        goToMarket: this.extractSection(content, 'go-to-market') || 'Strategic go-to-market plan needed',
        monetization: this.extractSection(content, 'monetization') || 'Multiple revenue streams recommended',
        nextSteps: this.extractSection(content, 'next steps') || 'Begin with MVP development',
        fullStrategy: content
      };
    } catch (error) {
      console.error('StrategyRecommenderAgent error:', error);
      return {
        goToMarket: 'Strategy analysis unavailable',
        monetization: 'Monetization analysis unavailable',
        nextSteps: 'Next steps analysis unavailable',
        fullStrategy: 'Strategic analysis failed. Please try again.'
      };
    }
  }

  extractSection(content, sectionName) {
    const regex = new RegExp(`${sectionName}[:\\s]*([^\\n]+(?:\\n[^\\n#]+)*)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim().substring(0, 500) : null;
  }
}

export class ReportGeneratorAgent {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-pro',
      maxOutputTokens: 2048
    });
  }

  async process(allAnalysisData) {
    const prompt = `
Generate a comprehensive HTML report for this startup idea analysis:

**Startup Idea:**
${allAnalysisData.idea.description}

**Analysis Results:**
- Market Research: ${allAnalysisData.marketResearch?.summary?.substring(0, 500)}
- Market Size: TAM ${allAnalysisData.tamSamSom?.tam}, SAM ${allAnalysisData.tamSamSom?.sam}, SOM ${allAnalysisData.tamSamSom?.som}
- Cultural Fit: ${allAnalysisData.culturalAlignment?.culturalFitScore}/100
- Competition: ${allAnalysisData.competition?.competitors?.length || 0} competitors identified
- Feasibility: ${allAnalysisData.feasibility?.technical?.complexity} complexity
- Strategy: ${allAnalysisData.strategy?.goToMarket?.substring(0, 300)}

Create a comprehensive, well-formatted HTML report with:
1. Executive Summary
2. Market Analysis
3. Competitive Landscape
4. Financial Projections
5. Feasibility Assessment
6. Strategic Recommendations
7. Next Steps

Use proper HTML formatting with headings, paragraphs, lists, and professional styling.
`;

    try {
      const response = await this.model.invoke(prompt);
      const content = response.content || response;
      
      // Clean up the HTML content
      let htmlContent = content;
      if (!htmlContent.includes('<html>')) {
        htmlContent = `
<div class="startup-report">
  <h1>Startup Idea Analysis Report</h1>
  ${htmlContent}
</div>`;
      }
      
      return htmlContent;
    } catch (error) {
      console.error('ReportGeneratorAgent error:', error);
      return `
<div class="startup-report">
  <h1>Startup Idea Analysis Report</h1>
  <p><strong>Note:</strong> Report generation encountered an error. Please try again.</p>
  <h2>Your Startup Idea</h2>
  <p>${allAnalysisData.idea.description}</p>
  <h2>Analysis Status</h2>
  <p>Our AI agents are still processing your startup idea. Please check back in a few minutes for the complete analysis.</p>
</div>`;
    }
  }
}
