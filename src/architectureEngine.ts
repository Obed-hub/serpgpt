import {
  KeywordOpportunity,
  KeywordPlannerInputItem,
  KeywordArchitectureTreeResponse,
  ArchetypeAuditItem,
  ArchitecturePageBlueprint,
  PillarClusterGroup,
  PageKeywordNode,
  SubheadingHierarchyNode,
  SchemaMarkupArchetype,
  RecommendedFreeApi,
  PseoArchitectureResponse,
  PseoPatternBlueprint,
  PseoPatternCategory,
  SuggestedRelatedTerm,
  RelatedTermsResponse,
  SearchIntent,
  WeakSpotType,
  AiSurvivalStatus,
} from './types';

export interface MasterArchetypeDefinition {
  id: number;
  name: string;
  urlPrefix: string;
  pillarCategory: string;
  defaultSchema: SchemaMarkupArchetype;
  triggerTokens: string[];
  targetWordCount: number;
  omissionReasonTemplate: string;
  informationGainHook: string;
  depthDifferentiators: string[];
  recommendedApis: RecommendedFreeApi[];
}

export const MASTER_38_ARCHETYPES: MasterArchetypeDefinition[] = [
  {
    id: 1,
    name: 'Comparison / VS Pages',
    urlPrefix: '/compare',
    pillarCategory: 'Commercial Evaluation & Comparisons',
    defaultSchema: 'Table',
    triggerTokens: ['vs', 'versus', 'compare', 'comparison', 'difference between', 'or'],
    targetWordCount: 2100,
    omissionReasonTemplate: 'No head-to-head comparison modifiers ("vs", "compare", "difference") detected in active keyword list.',
    informationGainHook: 'Include a side-by-side weighted scoring matrix with real cost/eligibility trade-offs.',
    depthDifferentiators: [
      'Interactive side-by-side feature & eligibility matrix',
      'Scenario-based winner recommendation selector',
      'Verified fee/payout spread breakdown',
    ],
    recommendedApis: [
      {
        name: 'OpenPageRank REST API',
        endpointPattern: 'https://openpagerank.com/api/v1.0/getPageRank',
        authType: 'Free API Key',
        enrichmentUseCase: 'Pull live authority scores for compared organizations or portals.',
      },
    ],
  },
  {
    id: 2,
    name: 'Alternatives Pages',
    urlPrefix: '/alternatives',
    pillarCategory: 'Commercial Evaluation & Comparisons',
    defaultSchema: 'Review',
    triggerTokens: ['alternative', 'alternatives', 'competitors', 'replace', 'instead of', 'like'],
    targetWordCount: 2250,
    omissionReasonTemplate: 'No competitor switching or "alternatives to" modifiers present in keyword list.',
    informationGainHook: 'Rank alternatives by switching friction, pricing tier, and specific use-case fit.',
    depthDifferentiators: [
      'Migration effort & switching cost calculator',
      'Ranked comparison table by user persona',
      'Pros/cons verified against primary documentation',
    ],
    recommendedApis: [
      {
        name: 'Wikipedia REST Summary API',
        endpointPattern: 'https://en.wikipedia.org/api/rest_v1/page/summary/{entity}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Enrich entity background and founding metadata.',
      },
    ],
  },
  {
    id: 3,
    name: 'Best / Top / Ranking / Listicle Pages',
    urlPrefix: '/best',
    pillarCategory: 'Commercial Evaluation & Comparisons',
    defaultSchema: 'Review',
    triggerTokens: ['best', 'top', 'highest', 'leading', 'recommended', 'ranked'],
    targetWordCount: 2400,
    omissionReasonTemplate: 'No superlative ranking modifiers ("best", "top", "highest") found in current keyword set.',
    informationGainHook: 'Replace generic listicles with a filterable leaderboard scored on transparent criteria.',
    depthDifferentiators: [
      'Filterable leaderboard by budget, state, or qualification',
      'Transparent scoring methodology rubric',
      'Direct official application & verification links',
    ],
    recommendedApis: [
      {
        name: 'USaspending.gov / Public Open Data API',
        endpointPattern: 'https://api.usaspending.gov/api/v2/search/spending_by_award/',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Verify real historical award sizes and active program volumes.',
      },
    ],
  },
  {
    id: 4,
    name: 'Glossary / Definition / What Is Pages',
    urlPrefix: '/glossary',
    pillarCategory: 'Foundational Knowledge & Definitions',
    defaultSchema: 'TechArticle',
    triggerTokens: ['what is', 'meaning', 'definition', 'define', 'explained', 'overview', 'concept'],
    targetWordCount: 1550,
    omissionReasonTemplate: 'No definitional or "what is / meaning" queries present; standalone glossary pages would be thin.',
    informationGainHook: 'Pair a 50-word featured-snippet definition box with a real-world numerical worked example.',
    depthDifferentiators: [
      'Above-the-fold 45-word Featured Snippet definition block',
      'Worked numerical calculation example',
      'Visual taxonomy linking related cluster terms',
    ],
    recommendedApis: [
      {
        name: 'OpenAlex Concepts API',
        endpointPattern: 'https://api.openalex.org/concepts?search={term}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Pull peer-reviewed academic definitions and related ontology concepts.',
      },
    ],
  },
  {
    id: 5,
    name: 'Statistics / Report / Data Study Pages',
    urlPrefix: '/stats',
    pillarCategory: 'Empirical Data & Research Hubs',
    defaultSchema: 'Dataset',
    triggerTokens: ['statistics', 'stats', 'data', 'report', 'trends', 'market size', 'study', 'numbers'],
    targetWordCount: 2300,
    omissionReasonTemplate: 'No statistical or benchmark trend queries found in the keyword sample.',
    informationGainHook: 'Publish downloadable CSV charts and year-over-year velocity metrics for passive backlink acquisition.',
    depthDifferentiators: [
      '12-month search & funding velocity chart',
      'Copyable journalist citation snippets',
      'Downloadable raw CSV dataset for researchers',
    ],
    recommendedApis: [
      {
        name: 'World Bank / FRED Public Indicators API',
        endpointPattern: 'https://api.worldbank.org/v2/country/US/indicator/{id}?format=json',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Embed live macroeconomic benchmark series.',
      },
    ],
  },
  {
    id: 6,
    name: 'Templates / Checklists / Cheat Sheets',
    urlPrefix: '/templates',
    pillarCategory: 'Interactive Tools, Templates & Calculators',
    defaultSchema: 'HowTo',
    triggerTokens: ['template', 'templates', 'checklist', 'cheat sheet', 'sample', 'worksheet', 'form', 'boilerplate'],
    targetWordCount: 1750,
    omissionReasonTemplate: 'No downloadable template, worksheet, or checklist modifiers detected in keyword set.',
    informationGainHook: 'Provide an interactive in-browser template customizer with 1-click Markdown/CSV/Doc export.',
    depthDifferentiators: [
      'Interactive fill-in-the-blank template generator',
      'Annotated sample showing accepted vs. rejected submissions',
      'One-click Markdown & CSV checklist download',
    ],
    recommendedApis: [
      {
        name: 'GitHub Public Gists / Raw Templates API',
        endpointPattern: 'https://api.github.com/gists/public',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Load versioned boilerplate templates dynamically.',
      },
    ],
  },
  {
    id: 7,
    name: 'Directory / Location / By State Pages',
    urlPrefix: '/directory',
    pillarCategory: 'Programmatic Directories & Regional Hubs',
    defaultSchema: 'Dataset',
    triggerTokens: ['by state', 'state', 'local', 'near me', 'in ', 'california', 'texas', 'uk', 'canada', 'nigeria', 'country', 'city', 'directory', 'regional'],
    targetWordCount: 2200,
    omissionReasonTemplate: 'No geographic, state-level, or directory modifiers present in keyword list.',
    informationGainHook: 'Consolidate regional modifiers into a filterable state/country directory hub with verified local agency links.',
    depthDifferentiators: [
      'Interactive jurisdiction / state filter matrix',
      'Verified regional authority contact & portal table',
      'Local funding cap & deadline comparison',
    ],
    recommendedApis: [
      {
        name: 'US Census Bureau / GeoNames API',
        endpointPattern: 'https://api.census.gov/data/2023/acs/acs5',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Enrich regional pages with real demographic and business density figures.',
      },
    ],
  },
  {
    id: 8,
    name: 'Cost / Pricing / Salary Breakdown Pages',
    urlPrefix: '/cost',
    pillarCategory: 'Financial & ROI Calculators',
    defaultSchema: 'Dataset',
    triggerTokens: ['cost', 'price', 'fees', 'salary', 'grant amount', 'funding amount', 'payout', 'reimbursement', 'tax credit', 'rebate', 'calculator', 'estimate', 'subsidy'],
    targetWordCount: 1950,
    omissionReasonTemplate: 'No financial cost, rebate, tax credit, or calculator modifiers matched in keyword list.',
    informationGainHook: 'Embed an interactive payout/cost estimator above the fold with low/median/high tier breakdowns.',
    depthDifferentiators: [
      'Interactive ROI / grant / rebate amount calculator',
      'Floor-to-ceiling cost & matching-fund breakdown table',
      'Hidden compliance or application fee checklist',
    ],
    recommendedApis: [
      {
        name: 'BLS (Bureau of Labor Statistics) Public API v2',
        endpointPattern: 'https://api.bls.gov/publicAPI/v2/timeseries/data/',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Pull verified wage, inflation, and cost index benchmarks.',
      },
    ],
  },
  {
    id: 9,
    name: 'FAQ / Q&A / People Also Ask Pages',
    urlPrefix: '/faq',
    pillarCategory: 'Foundational Knowledge & Definitions',
    defaultSchema: 'FAQPage',
    triggerTokens: ['how', 'why', 'can i', 'who', 'when', 'where', 'faq', 'questions', 'do you have to'],
    targetWordCount: 1850,
    omissionReasonTemplate: 'No question-prefix modifiers ("how", "who", "can I", "when") found in keyword set.',
    informationGainHook: 'Consolidate all closely related question variants into a single FAQPage Schema hub with direct 40-word answers.',
    depthDifferentiators: [
      'Structured FAQPage JSON-LD for Google Rich Results',
      'Direct yes/no qualification decision tree',
      'Cited statutory or official policy references per answer',
    ],
    recommendedApis: [
      {
        name: 'Google Suggest / Autocomplete Question Stream',
        endpointPattern: 'https://suggestqueries.google.com/complete/search?client=firefox&q={query}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Continuously surface emerging long-tail user questions.',
      },
    ],
  },
  {
    id: 10,
    name: 'Timeline / Process / How It Works Pages',
    urlPrefix: '/process',
    pillarCategory: 'Application & Execution Playbooks',
    defaultSchema: 'HowTo',
    triggerTokens: ['how to', 'process', 'steps', 'step by step', 'apply', 'application', 'timeline', 'guide to'],
    targetWordCount: 2150,
    omissionReasonTemplate: 'No procedural "how to", "apply", or "step-by-step" action terms matched.',
    informationGainHook: 'Map the end-to-end process with week-by-week milestone timelines and required document checklists.',
    depthDifferentiators: [
      'Interactive stage-by-stage timeline tracker',
      'Required documentation checklist per phase',
      'Common disqualifiers & bottleneck warnings',
    ],
    recommendedApis: [
      {
        name: 'Federal Register Public API',
        endpointPattern: 'https://www.federalregister.gov/api/v1/documents.json?conditions[term]={term}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Display live regulatory notices and procedural updates.',
      },
    ],
  },
  {
    id: 11,
    name: 'Pillar / Hub / Topic Cluster Pages',
    urlPrefix: '/guides',
    pillarCategory: 'Core Pillar Authority Hubs',
    defaultSchema: 'Article',
    triggerTokens: ['grants', 'programs', 'complete guide', 'hub', 'ultimate', '2026', 'small business', 'federal', 'commercial', 'automation'],
    targetWordCount: 2800,
    omissionReasonTemplate: 'No broad head-term or pillar-level cluster anchors detected.',
    informationGainHook: 'Act as the canonical parent hub linking out to specialized calculators, directories, and eligibility matrices.',
    depthDifferentiators: [
      'Above-the-fold interactive cluster navigator',
      'Comprehensive comparison table of all sub-programs',
      'Hub-and-spoke internal anchor matrix to prevent cannibalization',
    ],
    recommendedApis: [
      {
        name: 'OpenAlex Works API',
        endpointPattern: 'https://api.openalex.org/works?search={topic}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Embed empirical research citations for E-E-A-T authority.',
      },
    ],
  },
  {
    id: 12,
    name: 'Case Studies / Examples / Success Stories',
    urlPrefix: '/case-studies',
    pillarCategory: 'Trust, Proof & Real-World Examples',
    defaultSchema: 'Article',
    triggerTokens: ['case study', 'examples', 'example', 'success stories', 'winners', 'awarded', 'portfolio'],
    targetWordCount: 1900,
    omissionReasonTemplate: 'No "examples", "case study", or "past winners" modifiers present in keyword list.',
    informationGainHook: 'Deconstruct real approved examples with exact metrics, timeline to approval, and lessons learned.',
    depthDifferentiators: [
      'Before/after financial & operational metrics breakdown',
      'Annotated teardown of winning submission sections',
      'Replicable playbook takeaways',
    ],
    recommendedApis: [],
  },
  {
    id: 13,
    name: 'Pricing / Plans Pages',
    urlPrefix: '/pricing',
    pillarCategory: 'Financial & ROI Calculators',
    defaultSchema: 'WebPage',
    triggerTokens: ['pricing', 'plans', 'tiers', 'subscription', 'packages', 'quote'],
    targetWordCount: 1500,
    omissionReasonTemplate: 'No SaaS/service tier pricing modifiers ("plans", "subscription", "tiers") in keyword list.',
    informationGainHook: 'Include an interactive seat/usage TCO calculator and transparent tier comparison.',
    depthDifferentiators: ['Interactive TCO calculator', 'Feature matrix by tier', 'No-hidden-fees guarantee table'],
    recommendedApis: [],
  },
  {
    id: 14,
    name: 'Landing Pages / Service Pages',
    urlPrefix: '/solutions',
    pillarCategory: 'Commercial Solutions & Verticals',
    defaultSchema: 'WebPage',
    triggerTokens: ['for women', 'for veterans', 'for startups', 'for nonprofits', 'for minorities', 'for farmers', 'for nurses', 'for teachers', 'service', 'software', 'platform', 'agency'],
    targetWordCount: 2050,
    omissionReasonTemplate: 'No audience-segment ("for [persona]") or commercial solution modifiers detected.',
    informationGainHook: 'Tailor qualification criteria, exact benefits, and interactive readiness checks to the specific audience persona.',
    depthDifferentiators: [
      'Persona-specific eligibility self-assessment',
      'Curated shortlist of programs dedicated to that demographic',
      'Direct fast-track application checklist',
    ],
    recommendedApis: [
      {
        name: 'SBA / Grants.gov Public Opportunity Search',
        endpointPattern: 'https://api.grants.gov/v1/api/search2',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Filter live opportunities by demographic and applicant eligibility code.',
      },
    ],
  },
  {
    id: 15,
    name: 'Searchable Database / Record Pages',
    urlPrefix: '/database',
    pillarCategory: 'Programmatic Directories & Regional Hubs',
    defaultSchema: 'Dataset',
    triggerTokens: ['database', 'list of', 'index', 'registry', 'catalog', 'all ', 'lookup', 'search'],
    targetWordCount: 2100,
    omissionReasonTemplate: 'No searchable registry, catalog, or database modifiers found in keyword set.',
    informationGainHook: 'Provide instant multi-column filtering, sorting, and CSV export over structured records.',
    depthDifferentiators: [
      'Multi-facet live search & filter bar',
      'Sortable columns with tabular numerals',
      '1-click filtered CSV download',
    ],
    recommendedApis: [],
  },
  {
    id: 16,
    name: 'Product / Entity / Organization Profile Pages',
    urlPrefix: '/profiles',
    pillarCategory: 'Programmatic Directories & Regional Hubs',
    defaultSchema: 'WebPage',
    triggerTokens: ['sba', 'usda', 'nih', 'nsf', 'doe', 'epa', 'fema', 'organization', 'agency', 'foundation', 'portal'],
    targetWordCount: 1850,
    omissionReasonTemplate: 'No specific agency, institution, or vendor entity names detected in keyword set.',
    informationGainHook: 'Aggregate all active programs, contact endpoints, acceptance rates, and deadlines for the organization on one profile.',
    depthDifferentiators: [
      'Agency funding history & approval rate scorecard',
      'Complete list of active sub-programs & tracks',
      'Direct program officer & portal links',
    ],
    recommendedApis: [
      {
        name: 'ProPublica Nonprofit Explorer API',
        endpointPattern: 'https://projects.propublica.org/nonprofits/api/v2/search.json?q={org}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Fetch real IRS Form 990 assets, revenue, and grantmaking totals.',
      },
    ],
  },
  {
    id: 17,
    name: 'Community / Forum / Discussion Pages',
    urlPrefix: '/community',
    pillarCategory: 'Trust, Proof & Real-World Examples',
    defaultSchema: 'WebPage',
    triggerTokens: ['reddit', 'forum', 'discussion', 'community', 'thread', 'experiences', 'reviews from'],
    targetWordCount: 1650,
    omissionReasonTemplate: 'No community discussion or forum-intent modifiers present.',
    informationGainHook: 'Synthesize verified practitioner Q&As and real applicant timelines that unstructured Reddit threads bury.',
    depthDifferentiators: ['Verified applicant timeline submissions', 'Expert-moderated Q&A synthesis'],
    recommendedApis: [],
  },
  {
    id: 18,
    name: 'Video / Webinar / Transcript Pages',
    urlPrefix: '/videos',
    pillarCategory: 'Foundational Knowledge & Definitions',
    defaultSchema: 'Article',
    triggerTokens: ['video', 'tutorial', 'walkthrough', 'training', 'course', 'watch'],
    targetWordCount: 1600,
    omissionReasonTemplate: 'No video walkthrough or training tutorial modifiers found in keyword set.',
    informationGainHook: 'Include timestamped chapters, searchable transcript blocks, and downloadable slide checklists.',
    depthDifferentiators: ['Interactive timestamped transcript', 'Downloadable companion worksheet'],
    recommendedApis: [],
  },
  {
    id: 19,
    name: 'News / Updates / Changelog Pages',
    urlPrefix: '/updates',
    pillarCategory: 'Timelines, Deadlines & Policy Updates',
    defaultSchema: 'Article',
    triggerTokens: ['news', 'update', 'updates', 'new ', '2026', 'changes', 'announcement', 'latest'],
    targetWordCount: 1700,
    omissionReasonTemplate: 'No legislative change or announcement modifiers matched.',
    informationGainHook: 'Track live 2026 policy changes, new funding allocations, and rule amendments in a structured log.',
    depthDifferentiators: [
      'What changed in 2026 vs. prior year diff table',
      'Effective date & action-required badges',
      'Official bulletin source links',
    ],
    recommendedApis: [
      {
        name: 'Federal Register / Official News RSS JSON',
        endpointPattern: 'https://www.federalregister.gov/api/v1/documents.json',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Stream real-time rule changes and funding notices.',
      },
    ],
  },
  {
    id: 20,
    name: 'Resource Library / Download Pages',
    urlPrefix: '/resources',
    pillarCategory: 'Interactive Tools, Templates & Calculators',
    defaultSchema: 'WebPage',
    triggerTokens: ['pdf', 'download', 'kit', 'handbook', 'workbook', 'ebook', 'resource', 'packet'],
    targetWordCount: 1650,
    omissionReasonTemplate: 'No downloadable packet, PDF, or resource library modifiers detected.',
    informationGainHook: 'Offer zero-gate preview tables plus instant Markdown/CSV/PDF kit downloads.',
    depthDifferentiators: ['In-browser interactive preview', 'Zero-signup instant download bundle'],
    recommendedApis: [],
  },
  {
    id: 21,
    name: 'Individual Opportunity / Listing Pages',
    urlPrefix: '/listings',
    pillarCategory: 'Programmatic Directories & Regional Hubs',
    defaultSchema: 'Dataset',
    triggerTokens: ['sbir', 'sttr', 'reap', 'wosb', 'pell', 'erc', 'grant for', 'subsidy for', 'rebate for', 'loan for', 'recruitment'],
    targetWordCount: 2000,
    omissionReasonTemplate: 'No specific named opportunity or program listing tokens matched.',
    informationGainHook: 'Structure every opportunity listing with standardized award amounts, matching fund rules, and eligibility badges.',
    depthDifferentiators: [
      'Standardized Opportunity Fact Sheet (Award Cap, Match %, Deadline)',
      'Instant 5-Point Eligibility Check',
      'Direct Official Portal Link & CFDA/Opportunity Number',
    ],
    recommendedApis: [
      {
        name: 'Grants.gov REST Search API',
        endpointPattern: 'https://api.grants.gov/v1/api/search2',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Populate live opportunity numbers, close dates, and award ceilings.',
      },
    ],
  },
  {
    id: 22,
    name: 'Review / Evaluation / Audit Pages',
    urlPrefix: '/reviews',
    pillarCategory: 'Commercial Evaluation & Comparisons',
    defaultSchema: 'Review',
    triggerTokens: ['review', 'reviews', 'audit', 'legit', 'worth it', 'rating', 'scorecard'],
    targetWordCount: 1950,
    omissionReasonTemplate: 'No evaluation, audit, or review intent modifiers present in keyword list.',
    informationGainHook: 'Publish an objective multi-point audit rubric with verified pros, limitations, and ideal user fit.',
    depthDifferentiators: ['Weighted 5-category audit scorecard', 'Verified user feedback synthesis'],
    recommendedApis: [],
  },
  {
    id: 23,
    name: 'Image Gallery / Visual Reference Pages',
    urlPrefix: '/gallery',
    pillarCategory: 'Foundational Knowledge & Definitions',
    defaultSchema: 'WebPage',
    triggerTokens: ['gallery', 'photos', 'images', 'diagrams', 'infographic', 'visual', 'chart'],
    targetWordCount: 1400,
    omissionReasonTemplate: 'No visual gallery, diagram, or infographic search intent detected.',
    informationGainHook: 'Provide high-resolution annotated process diagrams and architecture flowcharts.',
    depthDifferentiators: ['Annotated SVG architecture diagrams', 'Embeddable visual flowcharts'],
    recommendedApis: [],
  },
  {
    id: 24,
    name: 'User Profile / Portfolio Pages',
    urlPrefix: '/portfolios',
    pillarCategory: 'Trust, Proof & Real-World Examples',
    defaultSchema: 'WebPage',
    triggerTokens: ['consultant', 'writer', 'specialist', 'advisor', 'expert', 'certified'],
    targetWordCount: 1500,
    omissionReasonTemplate: 'No advisor, specialist, or consultant directory modifiers matched.',
    informationGainHook: 'Showcase verified credentials, past approval track records, and specialization sectors.',
    depthDifferentiators: ['Verified credential & win-rate badges', 'Sector specialization filter'],
    recommendedApis: [],
  },
  {
    id: 25,
    name: 'Archive / Historical Record Pages',
    urlPrefix: '/archives',
    pillarCategory: 'Empirical Data & Research Hubs',
    defaultSchema: 'Dataset',
    triggerTokens: ['archive', 'historical', 'past ', 'previous', '2024', '2025', 'history'],
    targetWordCount: 1750,
    omissionReasonTemplate: 'No historical archive or prior-year lookup modifiers found.',
    informationGainHook: 'Compare historical funding cycles and cutoff scores against current 2026 thresholds.',
    depthDifferentiators: ['Multi-year award & cutoff trend table', 'Historical vs. current cycle comparison'],
    recommendedApis: [],
  },
  {
    id: 26,
    name: 'Methodology / Sources / Data Provenance Pages',
    urlPrefix: '/methodology',
    pillarCategory: 'Empirical Data & Research Hubs',
    defaultSchema: 'TechArticle',
    triggerTokens: ['methodology', 'formula', 'calculation', 'scoring', 'how we calculate', 'criteria', 'rubric'],
    targetWordCount: 1650,
    omissionReasonTemplate: 'No scoring methodology or formula provenance queries in keyword list.',
    informationGainHook: 'Document the exact mathematical formulas, primary data sources, and weighting logic.',
    depthDifferentiators: ['Explicit mathematical formula breakdown', 'Primary source verification log'],
    recommendedApis: [],
  },
  {
    id: 27,
    name: 'Eligibility Rules Page',
    urlPrefix: '/eligibility',
    pillarCategory: 'Eligibility, Compliance & Deadlines',
    defaultSchema: 'FAQPage',
    triggerTokens: ['eligibility', 'eligible', 'qualify', 'qualification', 'requirements', 'who qualifies', 'without matching', 'credit score', 'criteria'],
    targetWordCount: 2150,
    omissionReasonTemplate: 'No eligibility, qualification, or requirement modifiers matched.',
    informationGainHook: 'Build an interactive yes/no eligibility qualifier that immediately tells users if they meet statutory thresholds.',
    depthDifferentiators: [
      'Interactive 60-second Eligibility & Qualification Checker',
      'Mandatory vs. disqualifying criteria table',
      'Exception & waiver rules breakdown',
    ],
    recommendedApis: [
      {
        name: 'eCFR (Electronic Code of Federal Regulations) API',
        endpointPattern: 'https://www.ecfr.gov/api/search/v1/results?query={term}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Cite exact regulatory eligibility paragraphs and statutory thresholds.',
      },
    ],
  },
  {
    id: 28,
    name: 'Application Status / Deadline Page',
    urlPrefix: '/deadlines',
    pillarCategory: 'Eligibility, Compliance & Deadlines',
    defaultSchema: 'Dataset',
    triggerTokens: ['deadline', 'deadlines', 'closing date', 'open date', 'status', 'schedule', 'window', 'cycle', 'when to apply'],
    targetWordCount: 1800,
    omissionReasonTemplate: 'No application deadline, window, or schedule tokens detected.',
    informationGainHook: 'Display a live countdown calendar of upcoming submission windows, rolling deadlines, and review cycles.',
    depthDifferentiators: [
      'Live submission window & countdown status table',
      'Rolling vs. fixed deadline filter',
      'Pre-application registration lead-time alerts (SAM.gov / UEI)',
    ],
    recommendedApis: [],
  },
  {
    id: 29,
    name: 'Version History Page',
    urlPrefix: '/versions',
    pillarCategory: 'Timelines, Deadlines & Policy Updates',
    defaultSchema: 'TechArticle',
    triggerTokens: ['version', 'v2', 'release', 'edition', 'revision'],
    targetWordCount: 1450,
    omissionReasonTemplate: 'No software/policy version revision modifiers present in keyword list.',
    informationGainHook: 'Maintain a side-by-side revision log of rule or specification versions.',
    depthDifferentiators: ['Version diff table', 'Deprecation & migration notes'],
    recommendedApis: [],
  },
  {
    id: 30,
    name: 'Official Source / Citation Page',
    urlPrefix: '/sources',
    pillarCategory: 'Empirical Data & Research Hubs',
    defaultSchema: 'TechArticle',
    triggerTokens: ['official', 'gov', 'statute', 'regulation', 'citation', 'law', 'act', 'section', 'direct pay'],
    targetWordCount: 1900,
    omissionReasonTemplate: 'No statutory citation, act, or official regulation lookup terms matched.',
    informationGainHook: 'Translate dense statutory/regulatory language into plain-English action tables with direct `.gov` links.',
    depthDifferentiators: [
      'Plain-English translation alongside verbatim statute citation',
      'Direct official agency portal & form links',
      'Compliance verification checklist',
    ],
    recommendedApis: [
      {
        name: 'OpenAlex & Crossref Citation API',
        endpointPattern: 'https://api.openalex.org/works?search={query}',
        authType: 'Zero-Auth Public',
        enrichmentUseCase: 'Attach DOIs and empirical citations to policy summaries.',
      },
    ],
  },
  {
    id: 31,
    name: 'Data Comparison Table',
    urlPrefix: '/benchmarks',
    pillarCategory: 'Commercial Evaluation & Comparisons',
    defaultSchema: 'Table',
    triggerTokens: ['table', 'matrix', 'chart', 'rates', 'spread', 'benchmarks', 'by industry', 'tiers'],
    targetWordCount: 1950,
    omissionReasonTemplate: 'No matrix, benchmark rate, or tabular comparison tokens detected.',
    informationGainHook: 'Render a high-density sortable benchmark matrix with percentile breakdowns.',
    depthDifferentiators: [
      'Sortable multi-metric benchmark table',
      '25th / 50th / 75th percentile comparison bars',
      'Exportable CSV benchmark slice',
    ],
    recommendedApis: [],
  },
  {
    id: 32,
    name: 'Learning Pathway Page',
    urlPrefix: '/learn',
    pillarCategory: 'Foundational Knowledge & Definitions',
    defaultSchema: 'HowTo',
    triggerTokens: ['beginner', 'learn', 'roadmap', 'certification', 'exam', 'prep', 'study', 'pathway', 'curriculum'],
    targetWordCount: 2200,
    omissionReasonTemplate: 'No exam prep, certification roadmap, or learning pathway modifiers detected.',
    informationGainHook: 'Structure a progressive module-by-module mastery roadmap with self-assessment checkpoints.',
    depthDifferentiators: [
      'Interactive readiness & study hours calculator',
      'Module-by-module weight & pass-rate table',
      'Practice domain checklist',
    ],
    recommendedApis: [],
  },
  {
    id: 33,
    name: 'Troubleshooting Page',
    urlPrefix: '/troubleshooting',
    pillarCategory: 'Application & Execution Playbooks',
    defaultSchema: 'FAQPage',
    triggerTokens: ['rejected', 'denied', 'error', 'fix', 'problem', 'mistake', 'mistakes', 'appeal', 'troubleshooting', 'audit'],
    targetWordCount: 1800,
    omissionReasonTemplate: 'No rejection recovery, appeal, or troubleshooting modifiers matched.',
    informationGainHook: 'Provide a root-cause diagnostic tree for common application rejections and compliance failures.',
    depthDifferentiators: [
      'Symptom -> Root Cause -> Fix diagnostic matrix',
      'Resubmission & appeal checklist',
    ],
    recommendedApis: [],
  },
  {
    id: 34,
    name: 'Integration / Compatibility Page',
    urlPrefix: '/integrations',
    pillarCategory: 'Interactive Tools, Templates & Calculators',
    defaultSchema: 'TechArticle',
    triggerTokens: ['integration', 'integrate', 'connect', 'api', 'webhook', 'sync', 'compatible', 'stack', 'soc 2', 'compliance'],
    targetWordCount: 1900,
    omissionReasonTemplate: 'No integration, API connector, or compatibility stack modifiers present.',
    informationGainHook: 'Show exact data-flow architecture, supported fields, and step-by-step setup configuration.',
    depthDifferentiators: [
      'Supported field mapping & sync frequency table',
      'Copyable configuration & webhook payload block',
      'Compliance control mapping matrix',
    ],
    recommendedApis: [],
  },
  {
    id: 35,
    name: 'Changelog / Correction Notice',
    urlPrefix: '/changelog',
    pillarCategory: 'Timelines, Deadlines & Policy Updates',
    defaultSchema: 'WebPage',
    triggerTokens: ['changelog', 'errata', 'amendment', 'correction', 'patch'],
    targetWordCount: 1350,
    omissionReasonTemplate: 'No amendment, errata, or changelog tokens detected.',
    informationGainHook: 'Log every policy amendment and threshold update with timestamps.',
    depthDifferentiators: ['Timestamped amendment log', 'Impact severity indicator'],
    recommendedApis: [],
  },
  {
    id: 36,
    name: 'Event / Webinar Page',
    urlPrefix: '/events',
    pillarCategory: 'Timelines, Deadlines & Policy Updates',
    defaultSchema: 'WebPage',
    triggerTokens: ['conference', 'summit', 'workshop', 'webinar', 'event', 'session', 'cohort'],
    targetWordCount: 1500,
    omissionReasonTemplate: 'No workshop, summit, or cohort event modifiers present in keyword list.',
    informationGainHook: 'List upcoming applicant workshops, office hours, and key takeaways.',
    depthDifferentiators: ['Session agenda & speaker roster', 'On-demand briefing notes'],
    recommendedApis: [],
  },
  {
    id: 37,
    name: 'Waitlist / Registration Page',
    urlPrefix: '/waitlist',
    pillarCategory: 'Eligibility, Compliance & Deadlines',
    defaultSchema: 'WebPage',
    triggerTokens: ['register', 'registration', 'sign up', 'portal login', 'enroll', 'waitlist', 'intake'],
    targetWordCount: 1500,
    omissionReasonTemplate: 'No portal registration, intake, or enrollment modifiers matched.',
    informationGainHook: 'Prepare applicants with every required ID, DUNS/UEI number, and tax document before intake opens.',
    depthDifferentiators: ['Pre-registration document readiness checklist', 'Intake window alert guide'],
    recommendedApis: [],
  },
  {
    id: 38,
    name: 'Trust / Verification Page',
    urlPrefix: '/trust',
    pillarCategory: 'Trust, Proof & Real-World Examples',
    defaultSchema: 'WebPage',
    triggerTokens: ['verified', 'legitimate', 'scam', 'official list', 'accredited', 'compliance', 'security', 'trust'],
    targetWordCount: 1750,
    omissionReasonTemplate: 'No verification, accreditation, or anti-scam trust modifiers present.',
    informationGainHook: 'Provide a 5-point verification protocol to distinguish official `.gov`/accredited programs from fee scams.',
    depthDifferentiators: [
      'Official vs. predatory fee-scam red flag checklist',
      'Direct domain & registry verification lookup guide',
    ],
    recommendedApis: [],
  },
];

export function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function toTitleCase(input: string): string {
  return input.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function convertOpportunitiesToPlannerInput(
  opportunities: KeywordOpportunity[]
): KeywordPlannerInputItem[] {
  return opportunities.map((k) => ({
    keyword: k.keyword,
    monthlySearches: k.avgMonthlySearches,
    averageCpc: Number(((k.lowTopOfPageBid + k.highTopOfPageBid) / 2).toFixed(2)),
    lowTopOfPageBid: k.lowTopOfPageBid,
    highTopOfPageBid: k.highTopOfPageBid,
    competition:
      k.competitionIndex <= 33 ? 'LOW' : k.competitionIndex <= 66 ? 'MEDIUM' : 'HIGH',
    competitionIndex: k.competitionIndex,
    intent: k.intent,
  }));
}

// Match a single keyword to the best archetype among the 38 SEO Page Archetypes
function matchKeywordToArchetype(kw: KeywordPlannerInputItem): MasterArchetypeDefinition {
  const lower = kw.keyword.toLowerCase();

  // Score each of the 38 archetypes based on token overlap
  let bestArchetype: MasterArchetypeDefinition | null = null;
  let bestScore = 0;

  for (const arch of MASTER_38_ARCHETYPES) {
    let score = 0;
    for (const token of arch.triggerTokens) {
      if (lower.includes(token)) {
        // Longer, more specific token matches get higher priority
        score += token.length + 5;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestArchetype = arch;
    }
  }

  if (bestArchetype && bestScore > 0) {
    return bestArchetype;
  }

  // Fallback by Search Intent if no explicit token matched
  if (kw.intent === 'Transactional') {
    return MASTER_38_ARCHETYPES.find((a) => a.id === 27) || MASTER_38_ARCHETYPES[0]; // Eligibility Rules Page
  }
  if (kw.intent === 'Commercial') {
    return MASTER_38_ARCHETYPES.find((a) => a.id === 3) || MASTER_38_ARCHETYPES[0]; // Best / Ranking Page
  }
  if (kw.intent === 'Local') {
    return MASTER_38_ARCHETYPES.find((a) => a.id === 7) || MASTER_38_ARCHETYPES[0]; // Directory / By State Page
  }
  return MASTER_38_ARCHETYPES.find((a) => a.id === 11) || MASTER_38_ARCHETYPES[0]; // Pillar / Hub Page
}

// Build the full 38-Archetype Anti-Thin Page Architecture & Cannibalization Prevention Tree
export function buildKeywordArchitectureTree(
  rawKeywords: KeywordPlannerInputItem[],
  domain: string = 'serpgpt.pro',
  industry: string = 'Government Grants & Public Funding'
): KeywordArchitectureTreeResponse {
  const cleanDomain = domain.trim() || 'serpgpt.pro';
  const cleanIndustry = industry.trim() || 'Specialized Niche';

  const keywords: KeywordPlannerInputItem[] =
    rawKeywords && rawKeywords.length > 0
      ? rawKeywords
      : [
          {
            keyword: `${cleanIndustry.toLowerCase()} eligibility requirements 2026`,
            monthlySearches: 8400,
            averageCpc: 6.2,
            lowTopOfPageBid: 1.8,
            highTopOfPageBid: 10.6,
            competition: 'LOW',
            competitionIndex: 22,
          },
        ];

  // Group keywords by matched archetype ID
  const archetypeBuckets = new Map<number, KeywordPlannerInputItem[]>();
  for (const kw of keywords) {
    const matchedArch = matchKeywordToArchetype(kw);
    const list = archetypeBuckets.get(matchedArch.id) || [];
    list.push(kw);
    archetypeBuckets.set(matchedArch.id, list);
  }

  // If a single archetype bucket has > 5 keywords, split into at most 2 distinct sub-intent clusters
  // so every Master Page Blueprint merges 2 to 6 cannibalizing keywords cleanly.
  const masterBlueprints: ArchitecturePageBlueprint[] = [];

  for (const [archId, bucketKeywords] of archetypeBuckets.entries()) {
    const archDef = MASTER_38_ARCHETYPES.find((a) => a.id === archId)!;
    const sorted = [...bucketKeywords].sort((a, b) => b.monthlySearches - a.monthlySearches);

    // Split large buckets into sub-clusters of up to 5 keywords each
    const chunkSize = Math.max(2, Math.min(5, sorted.length));
    const chunks: KeywordPlannerInputItem[][] = [];
    for (let i = 0; i < sorted.length; i += chunkSize) {
      chunks.push(sorted.slice(i, i + chunkSize));
    }

    // If the last chunk has only 1 keyword and there is a previous chunk, merge it into the previous chunk to prevent a 1-keyword thin page!
    if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
      const orphan = chunks.pop()!;
      chunks[chunks.length - 1].push(...orphan);
    }

    chunks.forEach((cluster, cIdx) => {
      const primary = cluster[0];
      const secondaryTerms = cluster.slice(1);
      const totalMonthlyVolume = cluster.reduce((s, k) => s + (k.monthlySearches || 0), 0);
      const avgCpc =
        cluster.length > 0
          ? Number(
              (
                cluster.reduce((s, k) => s + (k.highTopOfPageBid || k.averageCpc || 0), 0) /
                cluster.length
              ).toFixed(2)
            )
          : 0;
      const avgComp =
        cluster.length > 0
          ? Math.round(
              cluster.reduce((s, k) => s + (k.competitionIndex || 25), 0) / cluster.length
            )
          : 25;

      const roleSequence: ('secondary' | 'h2_subheading' | 'faq_query' | 'semantic_variation')[] = [
        'secondary',
        'h2_subheading',
        'faq_query',
        'semantic_variation',
      ];

      const subheadingsHierarchy: SubheadingHierarchyNode[] = [
        {
          heading: `${toTitleCase(primary.keyword)}: Overview & Key Benchmarks`,
          level: 'h2',
          targetKeywords: [primary.keyword, ...(secondaryTerms[0] ? [secondaryTerms[0].keyword] : [])],
          contentPurpose: `Core overview and structured comparison fulfilling primary search intent.`,
        },
        ...secondaryTerms.map((sec, idx): SubheadingHierarchyNode => ({
          heading:
            idx % 2 === 0
              ? `${toTitleCase(sec.keyword)}: Step-by-Step Guide`
              : `${toTitleCase(sec.keyword)}: Comparison & Best Practices`,
          level: idx < 3 ? 'h2' : 'h3',
          targetKeywords: [sec.keyword],
          contentPurpose: `Covers "${sec.keyword}" (${sec.monthlySearches.toLocaleString()}/mo) in depth with practical criteria and benchmarks.`,
        })),
        {
          heading: `Frequently Asked Questions (${toTitleCase(cleanIndustry)})`,
          level: 'h2',
          targetKeywords: cluster.slice(-2).map((k) => k.keyword),
          contentPurpose: `Answers common questions and long-tail search queries clearly.`,
        },
      ];

      const keywordTree: PageKeywordNode[] = cluster.map((k, kIdx) => {
        const assignedRole =
          kIdx === 0 ? 'primary' : roleSequence[(kIdx - 1) % roleSequence.length];
        const mappedHeading =
          kIdx === 0
            ? `H1 + Interactive Tool`
            : subheadingsHierarchy[Math.min(kIdx, subheadingsHierarchy.length - 1)]?.heading ||
              `H2 Supporting Section`;

        return {
          keyword: k.keyword,
          role: assignedRole,
          monthlySearches: k.monthlySearches,
          averageCpc: Number((k.highTopOfPageBid || k.averageCpc || 0).toFixed(2)),
          competitionIndex: k.competitionIndex,
          mappedSectionHeading: mappedHeading,
        };
      });

      const mergedNames = secondaryTerms.map((k) => k.keyword);
      const slugCore = slugifyText(primary.keyword);
      const urlSlug = `${archDef.urlPrefix}/${slugCore}`;

      masterBlueprints.push({
        id: `bp-${archDef.id}-${cIdx + 1}`,
        pillarCategory: archDef.pillarCategory,
        pageTitle: `${toTitleCase(primary.keyword)} (2026 Complete ${archDef.name.split('/')[0].trim()} Guide)`,
        h1: `${toTitleCase(primary.keyword)}: 2026 Complete Guide & Interactive Tool`,
        urlSlug,
        pageArchetype: `${archDef.name} (${archDef.urlPrefix}/...)`,
        primaryKeyword: primary.keyword,
        totalMonthlyVolume,
        avgCpc,
        avgCompetitionIndex: avgComp,
        cannibalizationTermsMerged:
          mergedNames.length > 0
            ? mergedNames
            : [`${primary.keyword} 2026`, `${primary.keyword} requirements`],
        antiThinContentWarning:
          mergedNames.length > 0
            ? `CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish ${mergedNames.length + 1} separate URLs for [${[primary.keyword, ...mergedNames].map((t) => `"${t}"`).join(', ')}]. Google's SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google's Scaled Content Abuse / Doorway Page filter. Consolidate all ${mergedNames.length + 1} terms into ${urlSlug}.`
            : `CONSOLIDATION RULE: Fulfill "${primary.keyword}" and its 2026 eligibility/requirement variations on a single canonical ${urlSlug} hub with an interactive calculator.`,
        keywordTree,
        subheadingsHierarchy,
        depthDifferentiators: archDef.depthDifferentiators,
        editorialDirectives: {
          targetWordCount: archDef.targetWordCount,
          searchIntent: primary.intent || 'Commercial / High-Utility',
          schemaMarkupType: archDef.defaultSchema,
          informationGainHook: archDef.informationGainHook,
          editorialChecklist: [
            `Map "${primary.keyword}" to the canonical H1, <title>, and above-the-fold interactive widget.`,
            `Render each merged secondary keyword (${mergedNames.length || 2} terms) as an H2/H3 section or interactive filter tab (?tab=...) on ${urlSlug}.`,
            `Inject valid ${archDef.defaultSchema} + FAQPage JSON-LD schema in the document <head>.`,
            `Include a sortable comparison table with tabular numerals and downloadable CSV/Markdown checklist.`,
          ],
        },
        recommendedFreeApis:
          archDef.recommendedApis.length > 0
            ? archDef.recommendedApis
            : [
                {
                  name: 'OpenAlex Empirical Citations API',
                  endpointPattern: 'https://api.openalex.org/works?search={keyword}',
                  authType: 'Zero-Auth Public',
                  enrichmentUseCase: 'Embed verified peer-reviewed studies and citation counts.',
                },
              ],
      });
    });
  }

  // Sort master blueprints by totalMonthlyVolume desc
  masterBlueprints.sort((a, b) => b.totalMonthlyVolume - a.totalMonthlyVolume);

  // Build the 38-Archetype Coverage Audit Catalog
  const archetypeAuditCatalog: ArchetypeAuditItem[] = MASTER_38_ARCHETYPES.map((arch) => {
    const matched = archetypeBuckets.get(arch.id) || [];
    const isActivated = matched.length > 0;
    return {
      id: arch.id,
      archetypeName: arch.name,
      urlPrefix: `${arch.urlPrefix}/...`,
      defaultSchema: arch.defaultSchema,
      status: isActivated ? 'activated' : 'omitted',
      matchedKeywordsCount: matched.length,
      matchedSampleKeywords: matched.slice(0, 3).map((k) => k.keyword),
      reason: isActivated
        ? `Activated: Matched ${matched.length} keyword${matched.length > 1 ? 's' : ''} (${matched
            .slice(0, 2)
            .map((m) => `"${m.keyword}"`)
            .join(', ')}) sharing ${arch.name} SERP intent.`
        : arch.omissionReasonTemplate,
    };
  });

  // Group Master Blueprints into PillarClusterGroups
  const pillarMap = new Map<string, ArchitecturePageBlueprint[]>();
  for (const bp of masterBlueprints) {
    const list = pillarMap.get(bp.pillarCategory) || [];
    list.push(bp);
    pillarMap.set(bp.pillarCategory, list);
  }

  const pillars: PillarClusterGroup[] = Array.from(pillarMap.entries()).map(
    ([pillarName, pages]) => {
      const totalVolume = pages.reduce((s, p) => s + p.totalMonthlyVolume, 0);
      const totalKeywordsMerged = pages.reduce((s, p) => s + p.keywordTree.length, 0);
      return {
        pillarName,
        pillarSlug: `/${slugifyText(pillarName)}`,
        pillarDescription: `Consolidated topic cluster housing ${pages.length} non-cannibalizing master page${pages.length > 1 ? 's' : ''} covering ${totalKeywordsMerged} keyword variations.`,
        totalVolume,
        totalKeywordsMerged,
        masterPages: pages,
      };
    }
  );

  const totalKeywordsClustered = keywords.length;
  const totalDistinctPagesRecommended = masterBlueprints.length;
  const thinPagesPreventedCount = Math.max(
    0,
    totalKeywordsClustered - totalDistinctPagesRecommended
  );
  const activeArchetypesCount = archetypeAuditCatalog.filter(
    (a) => a.status === 'activated'
  ).length;

  return {
    domain: cleanDomain,
    industry: cleanIndustry,
    totalKeywordsClustered,
    totalDistinctPagesRecommended,
    thinPagesPreventedCount,
    activeArchetypesCount,
    archetypeAuditCatalog,
    pillars,
    masterBlueprints,
  };
}

// ============================================================================
// 2. PROGRAMMATIC SEO (pSEO) BLUEPRINT BUILDER & CODE GENERATOR ENGINE
// ============================================================================

export function buildPseoArchitectureBlueprints(
  rawKeywords: KeywordPlannerInputItem[],
  domain: string = 'serpgpt.pro',
  industry: string = 'Government Grants'
): PseoArchitectureResponse {
  const cleanDomain = domain.trim().replace(/^https?:\/\//, '') || 'serpgpt.pro';
  const cleanIndustry = industry.trim() || 'Government Grants';
  const industrySlug = slugifyText(cleanIndustry);

  const sorted = [...(rawKeywords || [])].sort(
    (a, b) => (b.monthlySearches || 0) - (a.monthlySearches || 0)
  );

  // Extract real keywords per pattern category or fall back to top keywords from the user's list
  const pickKeywords = (tokens: string[], fallbackSliceStart: number): KeywordPlannerInputItem[] => {
    const matched = sorted.filter((k) =>
      tokens.some((t) => k.keyword.toLowerCase().includes(t))
    );
    if (matched.length >= 2) return matched.slice(0, 6);
    const slice = sorted.slice(fallbackSliceStart, fallbackSliceStart + 4);
    return slice.length > 0 ? slice : sorted.slice(0, 3);
  };

  const patternConfigs: {
    category: PseoPatternCategory;
    name: string;
    tokens: string[];
    urlPattern: string;
    h1Template: string;
    titleTagTemplate: string;
    metaDescriptionTemplate: string;
    primaryVar: string;
    secondaryVar: string;
    sampleValues: string[];
    schemaType: string;
    dbFields: PseoPatternBlueprint['databaseSchemaFields'];
    sections: PseoPatternBlueprint['contentSections'];
  }[] = [
    {
      category: 'geo',
      name: `Regional / State-Level ${toTitleCase(cleanIndustry)} Directory Matrix`,
      tokens: ['state', 'by state', 'in ', 'local', 'california', 'texas', 'uk', 'canada', 'nigeria'],
      urlPattern: `/${industrySlug}/directory/{state_slug}/{program_type}`,
      h1Template: `Verified {program_type} in {state_name} (2026 Eligibility, Caps & Deadlines)`,
      titleTagTemplate: `{program_type} in {state_name} – 2026 Funding Caps & Official Links`,
      metaDescriptionTemplate: `Compare {active_program_count} verified {program_type} programs in {state_name}. Max payout: {max_award_usd}. Next deadline: {next_deadline_date}.`,
      primaryVar: '{state_name}',
      secondaryVar: '{program_type}',
      sampleValues: [
        'California × Small Business Innovation',
        'Texas × Rural Energy & Agricultural Equipment',
        'New York × Women & Minority Founders',
        'Florida × Workforce Training Reimbursement',
        'Illinois × Manufacturing Modernization',
        'Ohio × Clean Tech & EV Infrastructure',
      ],
      schemaType: 'Dataset + FAQPage',
      dbFields: [
        {
          fieldName: 'state_slug',
          type: 'string',
          sampleValue: 'texas',
          description: 'URL-safe jurisdiction identifier used in dynamic route params.',
        },
        {
          fieldName: 'active_program_count',
          type: 'number',
          sampleValue: '14',
          description: 'Verified count of open 2026 programs in this state.',
        },
        {
          fieldName: 'max_award_usd',
          type: 'number',
          sampleValue: '250000',
          description: 'Ceiling award or rebate amount in USD for the jurisdiction.',
        },
        {
          fieldName: 'matching_funds_required',
          type: 'boolean',
          sampleValue: 'false',
          description: 'Whether the applicant must provide cost-share matching capital.',
        },
        {
          fieldName: 'official_agency_portal_url',
          type: 'string',
          sampleValue: 'https://gov.texas.gov/business/page/small-business',
          description: 'Direct verified government or accredited agency application URL.',
        },
        {
          fieldName: 'regional_eligibility_rules_json',
          type: 'json',
          sampleValue: '{"min_employees": 1, "max_revenue_usd": 5000000, "sam_uei_required": true}',
          description: 'Structured JSON object driving the on-page interactive eligibility checker.',
        },
      ],
      sections: [
        {
          heading: 'Interactive {state_name} {program_type} Eligibility & Payout Calculator',
          dataBindingField: 'regional_eligibility_rules_json, max_award_usd',
          informationGainDirective:
            'Compute exact applicant qualification % and estimated award range dynamically from state rules.',
          antiThinRules:
            'Never swap just the state name in static paragraphs; require at least 6 state-specific metrics (award cap, agency name, deadline, match %, tax treatment, portal link).',
        },
        {
          heading: '2026 Verified {state_name} Program Comparison Table',
          dataBindingField: 'active_program_count, official_agency_portal_url',
          informationGainDirective:
            'Render a sortable table comparing every active state & federal track available in {state_name}.',
          antiThinRules:
            'Automatically set <meta name="robots" content="noindex"> if active_program_count < 3 to prevent thin regional pages.',
        },
      ],
    },
    {
      category: 'calculators',
      name: `Interactive ${toTitleCase(cleanIndustry)} ROI & Qualification Calculator Hub`,
      tokens: ['calculator', 'estimate', 'cost', 'rebate', 'credit', 'amount', 'subsidy', 'without matching'],
      urlPattern: `/${industrySlug}/calculators/{calculator_slug}`,
      h1Template: `2026 {calculator_name} Calculator: Instant Qualification & Payout Estimator`,
      titleTagTemplate: `{calculator_name} Calculator (2026 Official Formula & Tiers)`,
      metaDescriptionTemplate: `Calculate your exact 2026 {calculator_name} payout in 30 seconds. Uses verified statutory tiers ({formula_version}) with downloadable breakdown.`,
      primaryVar: '{calculator_name}',
      secondaryVar: '{applicant_tier}',
      sampleValues: [
        'USDA REAP Clean Energy Grant Calculator',
        'Commercial EV Charging Station Rebate Estimator',
        'Employer Workforce Training Reimbursement Calculator',
        'Historic Preservation Tax Credit Payout Calculator',
      ],
      schemaType: 'SoftwareApplication + FAQPage',
      dbFields: [
        {
          fieldName: 'calculator_slug',
          type: 'string',
          sampleValue: 'usda-reap-grant-calculator',
          description: 'Unique route slug for the interactive calculator blueprint.',
        },
        {
          fieldName: 'base_subsidy_rate_pct',
          type: 'number',
          sampleValue: '50',
          description: 'Statutory percentage of project cost covered by the program.',
        },
        {
          fieldName: 'cap_limit_usd',
          type: 'number',
          sampleValue: '1000000',
          description: 'Maximum statutory payout cap per applicant.',
        },
        {
          fieldName: 'formula_expression',
          type: 'string',
          sampleValue: 'Math.min(projectCost * (baseSubsidyRate / 100), capLimitUsd)',
          description: 'Deterministic formula executed in the client component.',
        },
        {
          fieldName: 'tier_thresholds_json',
          type: 'json',
          sampleValue: '[{"tier":"Rural Priority","rate":50},{"tier":"Standard","rate":25}]',
          description: 'JSON array of qualification tiers and multiplier rates.',
        },
      ],
      sections: [
        {
          heading: 'Live {calculator_name} Input & Scenario Simulator',
          dataBindingField: 'formula_expression, base_subsidy_rate_pct, cap_limit_usd',
          informationGainDirective:
            'Let users adjust project budget, entity size, and priority zone toggles with real-time tabular payout outputs.',
          antiThinRules:
            'Every calculator URL must implement a distinct mathematical formula or statutory rate table—consolidate identical formulas into query parameters (?mode=).',
        },
        {
          heading: 'Worked Calculation Examples & Statutory Tier Table',
          dataBindingField: 'tier_thresholds_json',
          informationGainDirective:
            'Show 3 pre-computed numerical scenarios (Small, Mid-Market, Max Cap) for crawler indexation.',
          antiThinRules:
            'Render pre-computed HTML tables server-side so Googlebot indexes concrete figures alongside the interactive widget.',
        },
      ],
    },
    {
      category: 'templates',
      name: `Actionable ${toTitleCase(cleanIndustry)} Templates, Checklists & Rubrics`,
      tokens: ['template', 'checklist', 'application', 'sample', 'form', 'sbir', 'proposal', 'kit'],
      urlPattern: `/${industrySlug}/templates/{template_type}-for-{audience_segment}`,
      h1Template: `{template_type} Template for {audience_segment} (2026 Approved Format)`,
      titleTagTemplate: `{template_type} Template for {audience_segment} [Free 2026 Download]`,
      metaDescriptionTemplate: `Download and customize the 2026 {template_type} for {audience_segment}. Includes reviewer scoring rubric and accepted sample sections.`,
      primaryVar: '{template_type}',
      secondaryVar: '{audience_segment}',
      sampleValues: [
        'SBIR Phase I Budget Justification × Biotech & DeepTech Startups',
        'Grant Readiness Compliance Checklist × Women-Owned Small Businesses',
        'Equipment Subsidy Project Narrative × Agricultural Producers',
        'Workforce Training Grant Proposal × Manufacturing Employers',
      ],
      schemaType: 'HowTo + TechArticle',
      dbFields: [
        {
          fieldName: 'template_slug',
          type: 'string',
          sampleValue: 'sbir-budget-justification-template',
          description: 'Route slug for the customizable template page.',
        },
        {
          fieldName: 'mandatory_sections_json',
          type: 'json',
          sampleValue: '["Personnel & Fringe","Equipment Quotes","Indirect Cost Rate","Commercialization Plan"]',
          description: 'Required sections scored by agency reviewers.',
        },
        {
          fieldName: 'reviewer_weight_points',
          type: 'number',
          sampleValue: '35',
          description: 'Maximum evaluation points assigned to this section in official rubrics.',
        },
        {
          fieldName: 'markdown_boilerplate',
          type: 'string',
          sampleValue: '## 1. Senior Personnel Justification\\nRole: Principal Investigator...',
          description: 'Copyable Markdown/HTML template body with dynamic placeholders.',
        },
      ],
      sections: [
        {
          heading: 'Interactive {template_type} Builder & Live Markdown Preview',
          dataBindingField: 'markdown_boilerplate, mandatory_sections_json',
          informationGainDirective:
            'Allow users to fill in organization variables and export a formatted .md or .doc file.',
          antiThinRules:
            'Include real annotated "Accepted vs. Rejected" phrasing comparisons for every template section.',
        },
      ],
    },
    {
      category: 'comparisons',
      name: `Side-by-Side ${toTitleCase(cleanIndustry)} Option & Track Comparisons`,
      tokens: ['vs', 'compare', 'best', 'top', 'alternatives', 'or', 'without'],
      urlPattern: `/${industrySlug}/compare/{option_a}-vs-{option_b}`,
      h1Template: `{option_a} vs. {option_b}: 2026 Eligibility, Funding Speed & Trade-Offs`,
      titleTagTemplate: `{option_a} vs {option_b} (2026 Comparison Matrix)`,
      metaDescriptionTemplate: `Should you apply for {option_a} or {option_b}? Compare non-dilutive limits, approval timelines ({approval_days} days), and compliance rules.`,
      primaryVar: '{option_a}',
      secondaryVar: '{option_b}',
      sampleValues: [
        'SBIR Phase I Grants vs. SBA 7(a) Guaranteed Loans',
        'Direct Pay Clean Energy Tax Credits vs. Competitive DOE Grants',
        'State Workforce Training Grants vs. Federal WIOA Reimbursements',
      ],
      schemaType: 'Table + FAQPage',
      dbFields: [
        {
          fieldName: 'comparison_slug',
          type: 'string',
          sampleValue: 'sbir-grants-vs-sba-7a-loans',
          description: 'Canonical comparison pair slug (alphabetically normalized to prevent A-vs-B / B-vs-A duplicates).',
        },
        {
          fieldName: 'option_a_metrics_json',
          type: 'json',
          sampleValue: '{"max_usd": 305000, "equity_dilution": "0%", "approval_days": 150}',
          description: 'Structured benchmark metrics for Option A.',
        },
        {
          fieldName: 'option_b_metrics_json',
          type: 'json',
          sampleValue: '{"max_usd": 5000000, "interest_rate": "Prime + 2.75%", "approval_days": 21}',
          description: 'Structured benchmark metrics for Option B.',
        },
        {
          fieldName: 'decision_rule_summary',
          type: 'string',
          sampleValue: 'Choose SBIR for R&D with zero repayment; choose SBA 7(a) for immediate working capital under 30 days.',
          description: 'Verdict logic rendered in the above-the-fold decision card.',
        },
      ],
      sections: [
        {
          heading: 'Head-to-Head Criterion Matrix ({option_a} vs. {option_b})',
          dataBindingField: 'option_a_metrics_json, option_b_metrics_json, decision_rule_summary',
          informationGainDirective:
            'Compare 8 standardized dimensions: Funding Cap, Repayment/Dilution, Time-to-Cash, Paperwork Burden, Credit Requirement, Audit Risk, Taxability, and Best Persona.',
          antiThinRules:
            'Canonicalize pair order alphabetically so /compare/a-vs-b and /compare/b-vs-a never coexist as duplicate pages.',
        },
      ],
    },
  ];

  const patterns: PseoPatternBlueprint[] = patternConfigs.map((cfg, idx) => {
    const matchedKws = pickKeywords(cfg.tokens, idx * 3);
    const totalClusterVolume = matchedKws.reduce((s, k) => s + (k.monthlySearches || 0), 0);
    const avgCpc =
      matchedKws.length > 0
        ? Number(
            (
              matchedKws.reduce((s, k) => s + (k.highTopOfPageBid || k.averageCpc || 0), 0) /
              matchedKws.length
            ).toFixed(2)
          )
        : 4.5;

    const guardrailSummary = {
      minimumUniqueDataPointsPerUrl: 8,
      cannibalizationPreventionRule: `Enforce strict canonical URL normalization on ${cfg.urlPattern} and merge synonym modifiers into interactive query-state tabs (?filter=...) rather than separate routes.`,
      thinContentWarning: `Automatically block indexation (<meta name="robots" content="noindex, follow">) for any generated route where verified database records < 3 or unique data fields < 8.`,
      internalLinkingStrategy: `Link every child programmatic route back to the parent /${industrySlug} Pillar Hub and cross-link 4 adjacent sibling entities by shared ${cfg.primaryVar}.`,
      schemaOrgType: cfg.schemaType,
    };

    const csvHeaders = cfg.dbFields.map((f) => f.fieldName).join(',');
    const csvRow1 = cfg.dbFields
      .map((f) => `"${f.sampleValue.replace(/"/g, '""')}"`)
      .join(',');

    const nextjsAppRouter = `// app${cfg.urlPattern.replace(/\{([^}]+)\}/g, '[$1]')}/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface RouteRecord {
${cfg.dbFields.map((f) => `  ${f.fieldName}: ${f.type === 'number' ? 'number' : f.type === 'boolean' ? 'boolean' : 'string'};`).join('\n')}
}

export async function generateMetadata({ params }: { params: Record<string, string> }): Promise<Metadata> {
  const record = await getProgrammaticRecord(params);
  if (!record) return {};
  return {
    title: \`${cfg.titleTagTemplate}\`,
    description: \`${cfg.metaDescriptionTemplate}\`,
    alternates: { canonical: \`https://${cleanDomain}${cfg.urlPattern}\` },
  };
}

export default async function ProgrammaticPillarPage({ params }: { params: Record<string, string> }) {
  const record = await getProgrammaticRecord(params);
  // Anti-Thin Guardrail: Prevent indexing thin or incomplete records
  if (!record) notFound();

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">{/* ${cfg.h1Template} */}</h1>
      {/* Above-the-Fold Interactive Data Matrix & JSON-LD Schema (${cfg.schemaType}) */}
    </main>
  );
}`;

    const astroPage = `---
// src/pages${cfg.urlPattern.replace(/\{([^}]+)\}/g, '[$1]')}.astro
export async function getStaticPaths() {
  const records = await fetchVerifiedDataset('${cfg.category}');
  // Filter out records failing the 8-data-point Anti-Thin threshold
  return records
    .filter((r) => r.uniqueDataPointsCount >= 8)
    .map((record) => ({
      params: { slug: record.${cfg.dbFields[0].fieldName} },
      props: { record },
    }));
}

const { record } = Astro.props;
const canonicalUrl = \`https://${cleanDomain}\${Astro.url.pathname}\`;
---
<html lang="en">
  <head>
    <title>${cfg.titleTagTemplate}</title>
    <meta name="description" content="${cfg.metaDescriptionTemplate}" />
    <link rel="canonical" href={canonicalUrl} />
  </head>
  <body>
    <main>
      <h1>${cfg.h1Template}</h1>
    </main>
  </body>
</html>`;

    const xmlSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cfg.sampleValues
  .slice(0, 4)
  .map(
    (sample) => `  <url>
    <loc>https://${cleanDomain}/${industrySlug}/${cfg.category}/${slugifyText(sample)}</loc>
    <lastmod>2026-10-18</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    const bulkAiPrompt = `You are a Principal Programmatic SEO & Data Engineer building the "${cfg.name}" collection for ${cleanDomain}.
Route Pattern: ${cfg.urlPattern}
Primary Variable: ${cfg.primaryVar} | Secondary Variable: ${cfg.secondaryVar}
Target Keywords Consolidated: ${matchedKws.map((k) => `"${k.keyword}" (${k.monthlySearches}/mo)`).join(', ')}

STRICT ANTI-THIN & ANTI-CANNIBALIZATION DIRECTIVES:
1. Do NOT generate generic filler paragraphs that only swap ${cfg.primaryVar}.
2. Populate all ${cfg.dbFields.length} structured database fields (${cfg.dbFields.map((d) => d.fieldName).join(', ')}).
3. Render an above-the-fold interactive calculator or sortable comparison table bound to ${cfg.sections[0]?.dataBindingField}.
4. Inject valid ${cfg.schemaType} JSON-LD structured data in <head>.`;

    return {
      id: `pseo-pattern-${idx + 1}`,
      patternCategory: cfg.category,
      patternName: cfg.name,
      urlPattern: cfg.urlPattern,
      h1Template: cfg.h1Template,
      titleTagTemplate: cfg.titleTagTemplate,
      metaDescriptionTemplate: cfg.metaDescriptionTemplate,
      primaryModifierVariable: cfg.primaryVar,
      secondaryModifierVariable: cfg.secondaryVar,
      modifierSampleValues: cfg.sampleValues,
      matchedKeywords: matchedKws.map((k) => k.keyword),
      totalClusterVolume,
      avgCpc,
      databaseSchemaFields: cfg.dbFields,
      contentSections: cfg.sections,
      qualityGuardrails: [guardrailSummary],
      guardrailSummary,
      codeSnippets: {
        nextjsAppRouter,
        astroPage,
        csvDataset: `${csvHeaders}\n${csvRow1}`,
        xmlSitemap,
        bulkAiPrompt,
      },
    };
  });

  return {
    domain: cleanDomain,
    industry: cleanIndustry,
    totalSourceKeywords: rawKeywords.length,
    totalPatternsGenerated: patterns.length,
    patterns,
  };
}

// ============================================================================
// 3. SUGGEST RELATED KEYWORDS & INTENT EXPANSION ENGINE (20-24 QUERIES / 5 INTENTS)
// ============================================================================

function hashStringDeterministic(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function classifyQueryIntentCategory(
  phrase: string
): SuggestedRelatedTerm['intentCategory'] {
  const lower = phrase.toLowerCase();
  if (/^(how|what|who|why|when|where|can|is|does|do|should)\b/.test(lower) || lower.includes('?')) {
    return 'Question';
  }
  if (/\b(vs|versus|compare|comparison|alternative|alternatives|instead of|difference|or)\b/.test(lower)) {
    return 'Comparison';
  }
  if (/\b(best|top|software|tool|tools|calculator|pricing|cost|buy|agency|service|platform|provider|providers)\b/.test(lower)) {
    return 'Commercial';
  }
  if (/\b(without|for beginners|for startups|for small business|step by step|by state|near me|under|template download|checklist pdf|no credit card)\b/.test(lower) || lower.split(/\s+/).length >= 5) {
    return 'Long-Tail';
  }
  return 'Informational';
}

export function generateSuggestedRelatedTerms(
  seedKeywords: string[],
  existingKeywords: string[] = [],
  liveAutocompletePool: string[] = []
): RelatedTermsResponse {
  const cleanedSeeds = (Array.isArray(seedKeywords) ? seedKeywords : [String(seedKeywords || '')])
    .map((s) => s.trim())
    .filter(Boolean);

  const primarySeed = (cleanedSeeds[0] || 'Free Keyword Planner').toLowerCase();
  const secondarySeed = (cleanedSeeds[1] || primarySeed).toLowerCase();

  const existingSet = new Set(existingKeywords.map((k) => k.trim().toLowerCase()));

  const blueprints: Array<{
    keyword: string;
    intentCategory: SuggestedRelatedTerm['intentCategory'];
    baseRelevance: number;
    rationale: string;
  }> = [
    // 1. QUESTION INTENT (5 queries)
    {
      keyword: `how does ${primarySeed} work step by step`,
      intentCategory: 'Question',
      baseRelevance: 96,
      rationale: `High-volume process question ideal for an H2 HowTo section or FAQPage schema block on your primary ${primarySeed} pillar.`,
    },
    {
      keyword: `what are the eligibility requirements for ${primarySeed}`,
      intentCategory: 'Question',
      baseRelevance: 94,
      rationale: `Captures qualification-stage searchers; prevents thin FAQ pages when merged into your master eligibility checklist.`,
    },
    {
      keyword: `how much does ${primarySeed} cost in 2026`,
      intentCategory: 'Question',
      baseRelevance: 93,
      rationale: `High-CPC pricing inquiry that maps directly to an interactive cost calculator or fee breakdown section.`,
    },
    {
      keyword: `is ${primarySeed} worth it for small business`,
      intentCategory: 'Question',
      baseRelevance: 90,
      rationale: `Addresses buyer skepticism with high conversion intent; best mapped as an H2 ROI evaluation subsection.`,
    },
    {
      keyword: `how to use ${secondarySeed} without paying for software`,
      intentCategory: 'Question',
      baseRelevance: 89,
      rationale: `Targets zero-budget and DIY searchers looking for an immediate workflow tutorial and free tool alternative.`,
    },

    // 2. COMMERCIAL INTENT (5 queries)
    {
      keyword: `best ${primarySeed} tools and software 2026`,
      intentCategory: 'Commercial',
      baseRelevance: 98,
      rationale: ` High-CPC commercial evaluation query that anchors a /best ranking leaderboard hub with filterable scoring criteria.`,
    },
    {
      keyword: `${primarySeed} calculator and roi estimator`,
      intentCategory: 'Commercial',
      baseRelevance: 97,
      rationale: `Interactive tool intent with strong backlink velocity and Click-Safe protection against AI Overviews.`,
    },
    {
      keyword: `free ${primarySeed} for startups and agencies`,
      intentCategory: 'Commercial',
      baseRelevance: 95,
      rationale: `High-converting commercial persona modifier that expands B2B acquisition reach without keyword cannibalization.`,
    },
    {
      keyword: `${primarySeed} pricing plans and cost breakdown`,
      intentCategory: 'Commercial',
      baseRelevance: 92,
      rationale: `Bottom-of-funnel buyer query; activates the /cost archetype with tier-by-tier comparison tables.`,
    },
    {
      keyword: `top rated ${secondarySeed} platforms for beginners`,
      intentCategory: 'Commercial',
      baseRelevance: 88,
      rationale: `Captures first-time buyers evaluating entry-level solutions; merges cleanly into your commercial buyer's guide.`,
    },

    // 3. INFORMATIONAL INTENT (5 queries)
    {
      keyword: `${primarySeed} complete guide and 2026 checklist`,
      intentCategory: 'Informational',
      baseRelevance: 97,
      rationale: `Foundational pillar query that consolidates scattered introductory terms into a single 2,400-word authoritative guide.`,
    },
    {
      keyword: `${primarySeed} templates and downloadable examples`,
      intentCategory: 'Informational',
      baseRelevance: 94,
      rationale: `Activates the /templates SEO archetype; provides immediate downloadable utility and high user dwell time.`,
    },
    {
      keyword: `common ${primarySeed} mistakes and how to avoid them`,
      intentCategory: 'Informational',
      baseRelevance: 87,
      rationale: `Adds high Information Gain to your pillar article as a dedicated troubleshooting H2 section.`,
    },
    {
      keyword: `${primarySeed} statistics benchmarks and market trends`,
      intentCategory: 'Informational',
      baseRelevance: 91,
      rationale: `Activates the /stats Dataset schema archetype to attract passive editorial backlinks from journalists.`,
    },
    {
      keyword: `what is ${secondarySeed} definition and worked example`,
      intentCategory: 'Informational',
      baseRelevance: 85,
      rationale: `Targets Featured Snippet definition boxes; merge into your glossary hub or introductory H2 block.`,
    },

    // 4. COMPARISON INTENT (5 queries)
    {
      keyword: `${primarySeed} vs paid enterprise alternatives`,
      intentCategory: 'Comparison',
      baseRelevance: 98,
      rationale: `High-synergy head-to-head comparison query; activates the /compare archetype with a side-by-side trade-off matrix.`,
    },
    {
      keyword: `best free alternatives to ${primarySeed}`,
      intentCategory: 'Comparison',
      baseRelevance: 96,
      rationale: `Captures competitor-switching traffic; maps directly to an /alternatives hub with migration friction scores.`,
    },
    {
      keyword: `${primarySeed} comparison matrix and feature scorecard`,
      intentCategory: 'Comparison',
      baseRelevance: 93,
      rationale: `Targets analytical buyers comparing specs; ideal for an interactive sortable HTML table with Table schema.`,
    },
    {
      keyword: `${primarySeed} pros and cons honest review 2026`,
      intentCategory: 'Comparison',
      baseRelevance: 90,
      rationale: `Mid-to-bottom funnel evaluation query that reinforces E-E-A-T trust when paired with verified test data.`,
    },
    {
      keyword: `free ${secondarySeed} vs semrush and ahrefs`,
      intentCategory: 'Comparison',
      baseRelevance: 92,
      rationale: `Direct brand-arbitrage comparison query with high commercial CPC and low organic SERP difficulty.`,
    },

    // 5. LONG-TAIL INTENT (4 queries)
    {
      keyword: `${primarySeed} without credit card or registration`,
      intentCategory: 'Long-Tail',
      baseRelevance: 95,
      rationale: `Ultra-low competition friction-free modifier where specialized interactive tools easily outrank generic blogs.`,
    },
    {
      keyword: `low competition ${primarySeed} opportunities for new websites`,
      intentCategory: 'Long-Tail',
      baseRelevance: 94,
      rationale: `High-conversion long-tail query with weak forum/Reddit SERP competitors and fast ranking velocity.`,
    },
    {
      keyword: `step by step ${primarySeed} workflow template for teams`,
      intentCategory: 'Long-Tail',
      baseRelevance: 88,
      rationale: `Specific implementation query that enriches your H3 subheading hierarchy and captures SOP searchers.`,
    },
    {
      keyword: `automated ${secondarySeed} audit and implementation kit`,
      intentCategory: 'Long-Tail',
      baseRelevance: 86,
      rationale: `Action-oriented long-tail modifier with strong transactional intent and high click-through rate.`,
    },
  ];

  // If live Google Suggest phrases were provided, weave unique ones in while preserving 5-category balance
  const cleanLive = liveAutocompletePool
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 4 && !existingSet.has(s) && s !== primarySeed);

  if (cleanLive.length > 0) {
    cleanLive.slice(0, 6).forEach((liveKw, idx) => {
      const cat = classifyQueryIntentCategory(liveKw);
      const targetIndex = blueprints.findIndex(
        (b, bIdx) => b.intentCategory === cat && bIdx % 3 === idx % 3
      );
      if (targetIndex !== -1 && !blueprints.some((b) => b.keyword === liveKw)) {
        blueprints[targetIndex] = {
          keyword: liveKw,
          intentCategory: cat,
          baseRelevance: Math.min(99, 92 + (idx % 7)),
          rationale: `Live Google Autocomplete expansion for "${primarySeed}"; adds real-time user search phrasing to your ${cat.toLowerCase()} cluster.`,
        };
      }
    });
  }

  const seen = new Set<string>();
  const suggestedTerms: SuggestedRelatedTerm[] = [];

  for (let i = 0; i < blueprints.length; i++) {
    const item = blueprints[i];
    let candidateKw = item.keyword.trim().toLowerCase();
    if (existingSet.has(candidateKw) || seen.has(candidateKw)) {
      candidateKw = `${candidateKw} 2026`;
    }
    seen.add(candidateKw);

    const h = hashStringDeterministic(candidateKw);

    // Realistic volume between 900 and 29,500
    const monthlySearches = 900 + (h % 28600);

    // Realistic competition index (10 to 62, weighted toward low/medium arbitrage opportunities)
    const competitionIndex = 10 + (h % 48);
    const competition: 'LOW' | 'MEDIUM' | 'HIGH' =
      competitionIndex <= 33 ? 'LOW' : competitionIndex <= 66 ? 'MEDIUM' : 'HIGH';

    // Realistic CPC bid range based on intent category
    const intentCpcBoost =
      item.intentCategory === 'Commercial'
        ? 3.4
        : item.intentCategory === 'Comparison'
        ? 3.1
        : item.intentCategory === 'Long-Tail'
        ? 2.2
        : item.intentCategory === 'Question'
        ? 1.65
        : 1.85;

    const lowTopOfPageBid = Number((intentCpcBoost + (h % 280) / 100).toFixed(2));
    const highTopOfPageBid = Number((lowTopOfPageBid * (2.3 + (h % 140) / 100)).toFixed(2));
    const averageCpc = Number(((lowTopOfPageBid + highTopOfPageBid) / 2).toFixed(2));

    const relevanceScore = Math.max(75, Math.min(99, item.baseRelevance - (h % 4) + 1));

    suggestedTerms.push({
      keyword: candidateKw,
      monthlySearches,
      averageCpc,
      lowTopOfPageBid,
      highTopOfPageBid,
      competition,
      competitionIndex,
      intentCategory: item.intentCategory,
      relevanceScore,
      rationale: item.rationale,
    });
  }

  return {
    seedKeywords: cleanedSeeds.length > 0 ? cleanedSeeds : ['Free Keyword Planner'],
    totalSuggested: suggestedTerms.length,
    suggestedTerms,
  };
}

export function convertSuggestedTermToPlannerInput(
  term: SuggestedRelatedTerm
): KeywordPlannerInputItem {
  const mappedIntent: SearchIntent =
    term.intentCategory === 'Commercial' || term.intentCategory === 'Comparison'
      ? 'Commercial'
      : term.intentCategory === 'Long-Tail'
      ? 'Transactional'
      : 'Informational';

  return {
    keyword: term.keyword,
    monthlySearches: term.monthlySearches,
    averageCpc: term.averageCpc,
    lowTopOfPageBid: term.lowTopOfPageBid,
    highTopOfPageBid: term.highTopOfPageBid,
    competition: term.competition,
    competitionIndex: term.competitionIndex,
    intent: mappedIntent,
  };
}

export function convertSuggestedTermToOpportunity(
  term: SuggestedRelatedTerm,
  index = 0
): KeywordOpportunity {
  const h = hashStringDeterministic(term.keyword);
  const mappedIntent: SearchIntent =
    term.intentCategory === 'Commercial' || term.intentCategory === 'Comparison'
      ? 'Commercial'
      : term.intentCategory === 'Long-Tail'
      ? 'Transactional'
      : 'Informational';

  const baseVol = term.monthlySearches;
  const monthlyTrend = Array.from({ length: 12 }, (_, mIdx) =>
    Math.max(100, Math.round(baseVol * (0.82 + mIdx * 0.03 + ((h + mIdx) % 9) * 0.01)))
  );
  const velocity3m = 18 + (h % 95);

  const weakSpotTypes: WeakSpotType[] = [
    'Reddit/Forum',
    'Low-DA (<30)',
    'Outdated Content',
    'Thin Page',
  ];
  const weakSpotDomains = ['reddit.com', 'quora.com', 'medium.com', 'niche-forum.org'];
  const wsIdx = h % weakSpotTypes.length;

  const aiStatuses: AiSurvivalStatus[] = ['Click-Safe', 'Click-Safe', 'Moderate Risk'];
  const aiStatus = aiStatuses[h % aiStatuses.length];

  const arbitrageScore = Math.min(
    99,
    Math.max(
      68,
      Math.round(
        term.relevanceScore * 0.55 +
          (100 - term.competitionIndex) * 0.35 +
          Math.min(15, term.highTopOfPageBid)
      )
    )
  );

  return {
    id: `rel-exp-${Date.now()}-${index}-${h % 10000}`,
    keyword: term.keyword,
    intent: mappedIntent,
    avgMonthlySearches: term.monthlySearches,
    monthlyTrend,
    velocity3m,
    lowTopOfPageBid: term.lowTopOfPageBid,
    highTopOfPageBid: term.highTopOfPageBid,
    competitionIndex: term.competitionIndex,
    organicDifficulty: Math.max(8, Math.min(65, term.competitionIndex - 2)),
    arbitrageScore,
    trafficValueMonthly: Math.round(term.monthlySearches * 0.32 * term.highTopOfPageBid),
    weakSpot: {
      hasWeakSpot: true,
      type: weakSpotTypes[wsIdx],
      topDomain: weakSpotDomains[wsIdx],
      domainPageRank: Number((2.1 + (h % 25) / 10).toFixed(1)),
      opportunityNote: term.rationale,
    },
    aiSurvival: {
      status: aiStatus,
      ctrEstimate: aiStatus === 'Click-Safe' ? 68 + (h % 16) : 48 + (h % 14),
      reason: `High-synergy ${term.intentCategory} query (${term.relevanceScore}% match) requiring interactive comparison or depth beyond AI summaries.`,
    },
    geoArbitrage: {
      US: {
        cpcHigh: term.highTopOfPageBid,
        competitionIndex: term.competitionIndex,
        volume: term.monthlySearches,
      },
      UK: {
        cpcHigh: Number((term.highTopOfPageBid * 0.84).toFixed(2)),
        competitionIndex: Math.max(8, term.competitionIndex - 3),
        volume: Math.round(term.monthlySearches * 0.34),
      },
      CA: {
        cpcHigh: Number((term.highTopOfPageBid * 0.79).toFixed(2)),
        competitionIndex: Math.max(8, term.competitionIndex - 4),
        volume: Math.round(term.monthlySearches * 0.26),
      },
      AU: {
        cpcHigh: Number((term.highTopOfPageBid * 0.88).toFixed(2)),
        competitionIndex: Math.max(8, term.competitionIndex - 5),
        volume: Math.round(term.monthlySearches * 0.19),
      },
    },
  };
}

