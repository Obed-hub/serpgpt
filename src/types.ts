export type SearchIntent = 'Commercial' | 'Transactional' | 'Informational' | 'Local';

export type WeakSpotType = 'Reddit/Forum' | 'Low-DA (<30)' | 'Outdated Content' | 'Thin Page' | 'Strong Authority';

export type AiSurvivalStatus = 'Click-Safe' | 'Moderate Risk' | 'AI-Cannibalized';

export interface GeoMetric {
  cpcHigh: number;
  competitionIndex: number;
  volume: number;
}

export interface KeywordOpportunity {
  id: string;
  keyword: string;
  intent: SearchIntent;
  avgMonthlySearches: number;
  monthlyTrend: number[]; // 12 months
  velocity3m: number; // percentage e.g. +142
  lowTopOfPageBid: number; // USD
  highTopOfPageBid: number; // USD
  competitionIndex: number; // 0 - 100
  organicDifficulty: number; // 1 - 100
  arbitrageScore: number; // 1 - 99 (High CPC + Low Competition Index)
  trafficValueMonthly: number; // est monthly value at #1 rank
  weakSpot: {
    hasWeakSpot: boolean;
    type: WeakSpotType;
    topDomain: string;
    domainPageRank: number; // 0 - 10 scale from OpenPageRank
    opportunityNote: string;
  };
  aiSurvival: {
    status: AiSurvivalStatus;
    ctrEstimate: number; // percentage 10-85%
    reason: string;
  };
  geoArbitrage: {
    US: GeoMetric;
    UK: GeoMetric;
    CA: GeoMetric;
    AU: GeoMetric;
  };
}

export interface KeywordClusterSummary {
  niche: string;
  geo: 'US' | 'UK' | 'CA' | 'AU';
  totalMonthlyVolume: number;
  totalMonthlyTrafficValue: number;
  avgLowBid: number;
  avgHighBid: number;
  avgCompetitionIndex: number;
  weakSpotCount: number;
  clickSafeCount: number;
  dataSourceBadges: string[];
  googleAdsCustomerConnected: string;
}

export interface ExploreResponse {
  summary: KeywordClusterSummary;
  keywords: KeywordOpportunity[];
}

export interface SerpCompetitorRow {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  pageRank: number; // 0 - 10 from OpenPageRank
  estimatedDa: number; // 0 - 100
  isWeakSpot: boolean;
  weakSpotReason: string;
}

export interface SerpXrayResponse {
  keyword: string;
  topResults: SerpCompetitorRow[];
  peopleAlsoAsk: string[];
  pageSpeedAudit?: {
    testedUrl: string;
    performanceScore: number;
    lcp: string;
    cls: string;
    fcp: string;
  };
  winStrategy: {
    recommendedFormat: string;
    targetWordCount: number;
    angleToBeatTop3: string;
  };
}

export interface PseoModifierCombination {
  sampleTitle: string;
  urlSlug: string;
  targetKeyword: string;
  estMonthlyVolume: number;
  estCpc: number;
  competitionIndex: number;
  pageTemplateType: string;
}

export interface PseoMatrixResponse {
  niche: string;
  headTermPattern: string;
  urlStructure: string;
  modifierAxisA: { label: string; values: string[] };
  modifierAxisB: { label: string; values: string[] };
  totalProjectedPages: number;
  totalProjectedMonthlyTraffic: number;
  totalProjectedTrafficValue: number;
  combinations: PseoModifierCombination[];
  wireframeSections: { heading: string; purpose: string; dynamicVariables: string }[];
}

export interface AcademicCitation {
  id: string;
  title: string;
  authors: string;
  publicationYear: number;
  journalOrVenue: string;
  citedByCount: number;
  doiUrl: string;
  keyFindingSummary: string;
}

export interface EeatBriefResponse {
  niche: string;
  citations: AcademicCitation[];
  editorialBrief: {
    recommendedHeadline: string;
    thesisStatement: string;
    authorityHooks: string[];
    outlineSections: { h2: string; citationToEmbed: string; keyPoints: string }[];
  };
}

// ============================================================================
// ANTI-THIN PAGE ARCHITECTURE & CANNIBALIZATION PREVENTION ENGINE TYPES
// ============================================================================

export interface KeywordPlannerInputItem {
  keyword: string;
  monthlySearches: number;
  averageCpc: number;
  lowTopOfPageBid: number;
  highTopOfPageBid: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  competitionIndex: number;
  intent?: SearchIntent;
}

export type PageKeywordRole =
  | 'primary'
  | 'secondary'
  | 'h2_subheading'
  | 'faq_query'
  | 'semantic_variation';

export type SchemaMarkupArchetype =
  | 'Article'
  | 'FAQPage'
  | 'HowTo'
  | 'Dataset'
  | 'Review'
  | 'Table'
  | 'TechArticle'
  | 'WebPage';

export interface PageKeywordNode {
  keyword: string;
  role: PageKeywordRole;
  monthlySearches: number;
  averageCpc: number;
  competitionIndex: number;
  mappedSectionHeading: string;
}

export interface SubheadingHierarchyNode {
  heading: string;
  level: 'h2' | 'h3';
  targetKeywords: string[];
  contentPurpose: string;
}

export interface RecommendedFreeApi {
  name: string;
  endpointPattern: string;
  authType: string;
  enrichmentUseCase: string;
}

export interface ArchitecturePageBlueprint {
  id: string;
  pillarCategory: string;
  pageTitle: string;
  h1: string;
  urlSlug: string;
  pageArchetype: string;
  primaryKeyword: string;
  totalMonthlyVolume: number;
  avgCpc: number;
  avgCompetitionIndex: number;
  cannibalizationTermsMerged: string[];
  antiThinContentWarning: string;
  keywordTree: PageKeywordNode[];
  subheadingsHierarchy: SubheadingHierarchyNode[];
  depthDifferentiators: string[];
  editorialDirectives: {
    targetWordCount: number;
    searchIntent: string;
    schemaMarkupType: SchemaMarkupArchetype;
    informationGainHook: string;
    editorialChecklist: string[];
  };
  recommendedFreeApis: RecommendedFreeApi[];
}

export interface ArchetypeAuditItem {
  id: number;
  archetypeName: string;
  urlPrefix: string;
  defaultSchema: SchemaMarkupArchetype;
  status: 'activated' | 'omitted';
  matchedKeywordsCount: number;
  matchedSampleKeywords: string[];
  reason: string;
}

export interface PillarClusterGroup {
  pillarName: string;
  pillarSlug: string;
  pillarDescription: string;
  totalVolume: number;
  totalKeywordsMerged: number;
  masterPages: ArchitecturePageBlueprint[];
}

export interface KeywordArchitectureTreeResponse {
  domain: string;
  industry: string;
  totalKeywordsClustered: number;
  totalDistinctPagesRecommended: number;
  thinPagesPreventedCount: number;
  activeArchetypesCount: number;
  archetypeAuditCatalog: ArchetypeAuditItem[];
  pillars: PillarClusterGroup[];
  masterBlueprints: ArchitecturePageBlueprint[];
}

// ============================================================================
// PROGRAMMATIC SEO (pSEO) BLUEPRINT BUILDER & CODE GENERATOR TYPES
// ============================================================================

export type PseoPatternCategory =
  | 'geo'
  | 'comparisons'
  | 'integrations'
  | 'industries'
  | 'calculators'
  | 'templates'
  | 'glossary';

export interface PseoDatabaseField {
  fieldName: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'date';
  sampleValue: string;
  description: string;
}

export interface PseoContentSection {
  heading: string;
  dataBindingField: string;
  informationGainDirective: string;
  antiThinRules: string;
}

export interface PseoQualityGuardrails {
  minimumUniqueDataPointsPerUrl: number;
  cannibalizationPreventionRule: string;
  thinContentWarning: string;
  internalLinkingStrategy: string;
  schemaOrgType: string;
}

export interface PseoCodeSnippets {
  nextjsAppRouter: string;
  astroPage: string;
  csvDataset: string;
  xmlSitemap: string;
  bulkAiPrompt: string;
}

export interface PseoPatternBlueprint {
  id: string;
  patternCategory: PseoPatternCategory;
  patternName: string;
  urlPattern: string;
  h1Template: string;
  titleTagTemplate: string;
  metaDescriptionTemplate: string;
  primaryModifierVariable: string;
  secondaryModifierVariable: string;
  modifierSampleValues: string[];
  matchedKeywords: string[];
  totalClusterVolume: number;
  avgCpc: number;
  databaseSchemaFields: PseoDatabaseField[];
  contentSections: PseoContentSection[];
  qualityGuardrails: PseoQualityGuardrails[];
  guardrailSummary: PseoQualityGuardrails;
  codeSnippets: PseoCodeSnippets;
}

export interface PseoArchitectureResponse {
  domain: string;
  industry: string;
  totalSourceKeywords: number;
  totalPatternsGenerated: number;
  patterns: PseoPatternBlueprint[];
}

// ============================================================================
// SUGGEST RELATED KEYWORDS & INTENT EXPANSION ENGINE TYPES
// ============================================================================

export interface SuggestedRelatedTerm {
  keyword: string;
  monthlySearches: number;
  averageCpc: number;
  lowTopOfPageBid: number;
  highTopOfPageBid: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  competitionIndex: number; // 0 to 100
  intentCategory: 'Question' | 'Commercial' | 'Informational' | 'Comparison' | 'Long-Tail';
  relevanceScore: number; // 75 to 99
  rationale: string;
}

export interface RelatedTermsResponse {
  seedKeywords: string[];
  totalSuggested: number;
  suggestedTerms: SuggestedRelatedTerm[];
}

// ============================================================================
// FREE YOUTUBE KEYWORD & OUTLIER FINDER TOOL TYPES
// ============================================================================

export type YouTubeIntentCategory =
  | 'Tutorial & How-To'
  | 'Review & Comparison'
  | 'Beginner Guide'
  | 'Case Study & Results'
  | 'Mistakes & Secrets'
  | 'Tools & Setup';

export type YouTubeWeakSpotType =
  | 'Small Channel Outlier (<5K Subs)'
  | 'Outdated Top Video (>2 Yrs Old)'
  | 'Weak Packaging / Low CTR'
  | 'Shorts-Only Gap (No Deep Video)';

export interface YouTubeKeywordOpportunity {
  id: string;
  keyword: string;
  intentCategory: YouTubeIntentCategory;
  monthlyYoutubeSearches: number;
  searchVelocityTrend: number[]; // 12 months
  yoYGrowthPercent: number;
  opportunityScore: number; // 0-100 overall VidIQ/TubeBuddy style score
  competitionScore: number; // 0-100
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedRpmUsd: number; // Creator AdSense RPM ($)
  advertiserCpcUsd: number; // YouTube Ads CPC ($)
  weakSpotType: YouTubeWeakSpotType;
  avgTopChannelSubs: number;
  avgTopVideoViews: number;
  outlierMultiplier: number; // e.g. 5.8x Views-to-Subs ratio
  topVideoAgeMonths: number;
  recommendedVideoFormat: string;
  recommendedDuration: string;
  highCtrTitles: string[];
  thumbnailHookIdea: string;
  recommendedTags: string[];
  chapterOutline: string[];
  isLiveYoutubeSuggest?: boolean;
  matchedVideo?: {
    videoId: string;
    title: string;
    channelTitle: string;
    viewCount: number;
    subscriberCount: number;
    outlierRatio: number;
    publishedText: string;
    lengthText: string;
    videoUrl: string;
    thumbnailUrl: string;
  };
}

export interface YouTubeAutocompleteResponse {
  seed: string;
  source: string;
  totalCount: number;
  categories: {
    related: string[];
    tutorials: string[];
    comparisons: string[];
    mistakes: string[];
    tools: string[];
    caseStudies: string[];
  };
}

export interface YouTubeLiveVideoOutlier {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  publishedText?: string;
  lengthText?: string;
  ageMonths: number;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  subscriberCount: number;
  outlierRatio: number; // viewCount / subscriberCount
  isOutlier: boolean; // outlierRatio >= 2.0
  isSmallChannel: boolean; // subscriberCount < 10000
  tags: string[];
  chapters?: string[];
  videoUrl: string;
}

export interface YouTubeKeywordExploreResponse {
  seed: string;
  niche: string;
  source: string;
  realDataApiConnected?: boolean;
  summary: {
    totalKeywords: number;
    totalMonthlyViewsPotential: number;
    avgOpportunityScore: number;
    smallChannelOutlierCount: number;
    avgEstimatedRpm: number;
  };
  keywords: YouTubeKeywordOpportunity[];
  globalVideoTags: string[];
  liveSerpVideos?: YouTubeLiveVideoOutlier[];
}

export type PlatformType =
  | 'youtube'
  | 'amazon'
  | 'tiktok'
  | 'etsy'
  | 'local'
  | 'google';

export interface PlatformKeywordItem {
  id: string;
  keyword: string;
  platform: PlatformType;
  monthlySearchesEst: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  competitionScore: number;
  estimatedCpcOrRpm: number;
  intent: string;
  category: string;
  opportunityScore: number;
  recommendedTags: string[];
  rationale: string;
}

export interface PlatformExplorerResponse {
  seed: string;
  platform: PlatformType;
  sourceLabel: string;
  totalResults: number;
  platformStats: {
    totalVolumeEst: number;
    avgCompetitionScore: number;
    lowCompetitionPercent: number;
    topCategoryOrNiche: string;
    commercialIntentScore: number;
  };
  keywords: PlatformKeywordItem[];
  readyToPasteTags: string[];
  faqEntities: Array<{ question: string; answer: string }>;
  crossPlatformRecommendations: Array<{
    platform: PlatformType;
    label: string;
    suggestedQuery: string;
  }>;
}

export type QuestionStem =
  | 'what'
  | 'why'
  | 'how'
  | 'where'
  | 'who'
  | 'which'
  | 'when'
  | 'can_are'
  | 'prepositions'
  | 'comparisons';

export interface PaaQuestionItem {
  id: string;
  question: string;
  stem: QuestionStem;
  monthlySearchesEst: number;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  competitionScore: number;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Troubleshooting';
  directAnswerSnippet?: string;
  opportunityScore: number;
  wordCount: number;
  isFeaturedSnippetCandidate: boolean;
}

export interface PaaQuestionTreeResponse {
  seed: string;
  sourceLabel: string;
  totalQuestions: number;
  questionBranches: {
    what: PaaQuestionItem[];
    why: PaaQuestionItem[];
    how: PaaQuestionItem[];
    where: PaaQuestionItem[];
    who: PaaQuestionItem[];
    which: PaaQuestionItem[];
    when: PaaQuestionItem[];
    canAre: PaaQuestionItem[];
  };
  prepositionBranches: {
    for: PaaQuestionItem[];
    with: PaaQuestionItem[];
    without: PaaQuestionItem[];
    versus: PaaQuestionItem[];
  };
  allQuestions: PaaQuestionItem[];
  summary: {
    totalMonthlyVolume: number;
    avgCompetitionScore: number;
    featuredSnippetCount: number;
    topStem: string;
  };
  readyToPasteFaqSchema: string;
  readyToPasteMarkdown: string;
}



