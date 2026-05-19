export interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  opportunityScore: number;
}

export interface AuditIssue {
  severity: 'low' | 'medium' | 'high';
  message: string;
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo';
}

export interface AuditResult {
  score: number;
  issues: AuditIssue[];
}

export interface ContentSuggestion {
  title: string;
  description: string;
  suggestedKeywords: string[];
}

export interface DomainOverview {
  organicKeywords: number;
  organicTraffic: number;
  trafficValue: number;
  paidKeywords: number;
}

export interface BacklinkData {
  totalBacklinks: number;
  referringDomains: number;
  domainRank: number;
  spamScore: number;
}

export interface RankingResult {
  keyword: string;
  position: number | null;
  url: string | null;
}

export interface LlmPlatformResult {
  platform: string;
  visibility: number;
  sentiment: number;
  topics: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  overallScore: number;
  topKeywords: KeywordData[];
  audit: AuditResult;
  contentPlan: ContentSuggestion[];
  nextSteps: string[];
  // Extended real data
  domainOverview?: DomainOverview;
  competitors?: string[];
  keywordGaps?: KeywordData[];
  liveRankings?: RankingResult[];
  backlinks?: BacklinkData;
  llmVisibility?: LlmPlatformResult[];
}