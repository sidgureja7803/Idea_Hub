import { z } from 'zod';

export const MarketInsightsSchema = z.object({
  marketSize: z.object({
    currentSize: z.string().describe('Market size with source'),
    growthRate: z.string().describe('CAGR with source'),
    projectedSize: z.string().describe('5-year projection')
  }),
  trends: z.array(z.object({
    name: z.string(),
    description: z.string(),
    impact: z.string(),
    source: z.string().optional()
  })).min(3),
  customerNeeds: z.array(z.object({
    need: z.string(),
    painPoint: z.string(),
    currentSolutions: z.string()
  })).min(2),
  targetAudience: z.object({
    primarySegment: z.string(),
    demographics: z.string(),
    psychographics: z.string(),
    size: z.string()
  }),
  barriers: z.array(z.object({
    barrier: z.string(),
    severity: z.enum(['High', 'Medium', 'Low']),
    mitigation: z.string()
  })).min(1),
  citations: z.array(z.string()).describe('List of sources cited'),
  confidence: z.number().min(0).max(100).describe('Confidence level 0-100'),
  summary: z.string().min(200)
});

export const TAMSAMSOMSchema = z.object({
  tam: z.object({
    value: z.string().describe('Dollar value'),
    calculation: z.string().describe('Top-down or bottom-up methodology'),
    sources: z.array(z.string()),
    assumptions: z.array(z.string()).min(1)
  }),
  sam: z.object({
    value: z.string(),
    calculation: z.string(),
    percentage: z.string().describe('% of TAM'),
    sources: z.array(z.string()),
    assumptions: z.array(z.string()).min(1)
  }),
  som: z.object({
    value: z.string(),
    calculation: z.string(),
    percentage: z.string().describe('% of SAM'),
    timeline: z.string(),
    sources: z.array(z.string()),
    assumptions: z.array(z.string()).min(1)
  }),
  marketGrowth: z.object({
    cagr: z.string(),
    factors: z.array(z.string()).min(2)
  }),
  confidence: z.number().min(0).max(100).describe('Overall confidence 0-100'),
  methodology: z.enum(['top-down', 'bottom-up', 'hybrid']),
  analysis: z.string().min(200)
});

export const CompetitorsSchema = z.object({
  marketLeaders: z.array(z.object({
    name: z.string(),
    description: z.string(),
    marketShare: z.string().optional(),
    strengths: z.array(z.string()).min(2),
    weaknesses: z.array(z.string()).min(2),
    threat: z.enum(['High', 'Medium', 'Low']),
    source: z.string().optional()
  })).min(2),
  emergingPlayers: z.array(z.object({
    name: z.string(),
    description: z.string(),
    uniqueValue: z.string(),
    fundingStatus: z.string().optional(),
    threat: z.enum(['High', 'Medium', 'Low'])
  })).min(1),
  differentiationOpportunities: z.array(z.object({
    area: z.string(),
    strategy: z.string(),
    impact: z.string()
  })).min(3),
  competitiveAdvantages: z.array(z.object({
    advantage: z.string(),
    sustainability: z.string(),
    developmentNeeds: z.string()
  })).min(2),
  citations: z.array(z.string()),
  confidence: z.number().min(0).max(100),
  summary: z.string().min(200)
});

export const FeasibilitySchema = z.object({
  technical: z.object({
    complexity: z.enum(['High', 'Medium', 'Low']),
    explanation: z.string(),
    requiredTechnologies: z.array(z.string()).min(1),
    developmentTimeline: z.string(),
    technicalRisks: z.array(z.string()).min(1),
    score: z.number().min(1).max(10)
  }),
  operational: z.object({
    complexity: z.enum(['High', 'Medium', 'Low']),
    explanation: z.string(),
    keyRequirements: z.array(z.string()).min(1),
    operationalRisks: z.array(z.string()).min(1),
    score: z.number().min(1).max(10)
  }),
  financial: z.object({
    startupCosts: z.string(),
    monthlyBurnRate: z.string(),
    breakEvenTimeframe: z.string(),
    keyAssumptions: z.array(z.string()).min(2),
    score: z.number().min(1).max(10)
  }),
  regulatory: z.object({
    keyRegulations: z.array(z.string()),
    complianceComplexity: z.enum(['High', 'Medium', 'Low']),
    regulatoryRisks: z.array(z.string()),
    score: z.number().min(1).max(10)
  }),
  market: z.object({
    productMarketFit: z.string(),
    adoptionBarriers: z.array(z.string()).min(1),
    marketReadiness: z.string(),
    score: z.number().min(1).max(10)
  }),
  overallFeasibilityScore: z.number().min(1).max(10),
  confidence: z.number().min(0).max(100),
  summary: z.string().min(200)
});

export const StrategySchema = z.object({
  goToMarket: z.object({
    initialTargetSegment: z.string(),
    valueProposition: z.string(),
    channels: z.array(z.string()).min(3),
    messaging: z.string(),
    timeline: z.string()
  }),
  competitivePositioning: z.object({
    positioningStatement: z.string(),
    keyDifferentiators: z.array(z.string()).min(3),
    messagingAngles: z.array(z.string()).min(2)
  }),
  monetization: z.object({
    recommendedModel: z.string(),
    pricingStrategy: z.string(),
    revenueStreams: z.array(z.string()).min(2),
    unitEconomics: z.string()
  }),
  growthStrategy: z.object({
    customerAcquisition: z.array(z.string()).min(3),
    retention: z.array(z.string()).min(2),
    expansion: z.array(z.string()).min(2),
    keyMetrics: z.array(z.string()).min(3)
  }),
  partnerships: z.array(z.object({
    partnerType: z.string(),
    potentialPartners: z.array(z.string()).min(2),
    collaborationModel: z.string(),
    strategicValue: z.string()
  })).min(2),
  confidence: z.number().min(0).max(100),
  summary: z.string().min(300)
});
