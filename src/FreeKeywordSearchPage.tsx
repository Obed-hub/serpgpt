import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  RefreshCw,
  ArrowUpDown,
  Sparkles,
  ArrowLeft,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Code2,
  Layers,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  ExploreResponse,
  KeywordOpportunity,
  SearchIntent,
  SuggestedRelatedTerm,
  RelatedTermsResponse,
} from './types';
import { MasterSeoPageData } from './seoMasterPagesData';
import { buildAllMasterPagesFromKeywords } from './backgroundPageBuilder';
import {
  convertSuggestedTermToOpportunity,
  generateSuggestedRelatedTerms,
} from './architectureEngine';
import {
  exportAutocompleteSeedsCsv,
  triggerFileDownload,
} from './exportUtils';
import RankImplementationModal from './RankImplementationModal';
import AntiThinArchitectureView from './AntiThinArchitectureView';

type GeoMarket = 'US' | 'UK' | 'CA' | 'AU';
type SortField = 'volume' | 'competition' | 'cpc' | 'arbitrage';
type IntentCategoryFilter = 'ALL' | SuggestedRelatedTerm['intentCategory'];

interface AutocompleteCategories {
  related: string[];
  questions: string[];
  commercial: string[];
  tools: string[];
  longtail: string[];
}

interface FreeKeywordSearchPageProps {
  onNavigateBackToSuite: () => void;
  onOpenMasterSeoPage?: (slug: string) => void;
  initialSeedQuery?: string;
}

const EMPTY_EXPLORE_DATA: ExploreResponse = {
  summary: {
    niche: '',
    geo: 'US',
    totalMonthlyVolume: 0,
    totalMonthlyTrafficValue: 0,
    avgLowBid: 0,
    avgHighBid: 0,
    avgCompetitionIndex: 0,
    weakSpotCount: 0,
    clickSafeCount: 0,
    dataSourceBadges: [],
    googleAdsCustomerConnected: '',
  },
  keywords: [],
};

const INTENT_CATEGORY_TABS: Array<{
  label: string;
  value: IntentCategoryFilter;
}> = [
  { label: 'All Intents', value: 'ALL' },
  { label: 'Question', value: 'Question' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Informational', value: 'Informational' },
  { label: 'Comparison', value: 'Comparison' },
  { label: 'Long-Tail', value: 'Long-Tail' },
];

export default function FreeKeywordSearchPage({
  onNavigateBackToSuite,
  onOpenMasterSeoPage,
  initialSeedQuery,
}: FreeKeywordSearchPageProps) {
  const [query, setQuery] = useState<string>(initialSeedQuery || '');
  const [geo] = useState<GeoMarket>('US');
  const [maxComp, setMaxComp] = useState<number>(65);
  const [minVolume, setMinVolume] = useState<number>(0);
  const [intentFilter, setIntentFilter] = useState<'ALL' | SearchIntent>('ALL');
  const [textFilter, setTextFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('volume');
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const [data, setData] = useState<ExploreResponse>(EMPTY_EXPLORE_DATA);
  const [, setSelectedKeyword] = useState<KeywordOpportunity | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // ============================================================================
  // SUGGEST RELATED KEYWORDS & INTENT EXPANSION ENGINE STATE
  // ============================================================================
  const [relatedExpansion, setRelatedExpansion] = useState<RelatedTermsResponse>({
    seedKeywords: [],
    totalSuggested: 0,
    suggestedTerms: [],
  });
  const [activeIntentTab, setActiveIntentTab] = useState<IntentCategoryFilter>('ALL');
  const [selectedSuggestedSet, setSelectedSuggestedSet] = useState<Set<string>>(new Set());
  const [isExpandingRelated, setIsExpandingRelated] = useState<boolean>(false);
  const [copiedRelated, setCopiedRelated] = useState<boolean>(false);
  const [injectionBannerMsg, setInjectionBannerMsg] = useState<string | null>(null);

  // Per-row Suggest Related Keywords & Intent Expansion drawer state
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [rowIntentTab, setRowIntentTab] = useState<IntentCategoryFilter>('ALL');
  const [rowExpansionCache, setRowExpansionCache] = useState<Record<string, RelatedTermsResponse>>({});
  const [loadingRowKeyword, setLoadingRowKeyword] = useState<string | null>(null);

  const expansionPanelRef = useRef<HTMLDivElement | null>(null);
  const architectureSectionRef = useRef<HTMLDivElement | null>(null);

  const [autocompleteGroups, setAutocompleteGroups] = useState<AutocompleteCategories>({
    related: [],
    questions: [],
    commercial: [],
    tools: [],
    longtail: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [copiedBulk, setCopiedBulk] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [buildKitModalTarget, setBuildKitModalTarget] = useState<{
    primary: KeywordOpportunity;
    peers: KeywordOpportunity[];
  } | null>(null);

  // Set of lowercase keywords currently in the active keyword plan
  const activePlanKeywordSet = useMemo(() => {
    return new Set(data.keywords.map((k) => k.keyword.trim().toLowerCase()));
  }, [data.keywords]);

  // Automatic Background Page Builder Queue on /free-keyword-search
  const builtMasterPages = useMemo<MasterSeoPageData[]>(() => {
    if (!data.keywords || data.keywords.length === 0) return [];
    return buildAllMasterPagesFromKeywords(
      data.keywords,
      data.summary.niche || query
    );
  }, [data.keywords, data.summary.niche, query]);

  // Inject low-competition Google Keyword API SEO tags into <head>
  useEffect(() => {
    const prevTitle = document.title;
    const activeSeed = query.trim();
    const pageTitle = activeSeed
      ? `${activeSeed} — Free Keyword Research & Low-Competition Finder | SERPgpt.pro`
      : 'Free Keyword Research Tool Without Login & Google Keyword Planner (No Sign Up) | SERPgpt.pro';
    const pageDesc =
      'Use Google Keyword Planner without campaign or paying. Find low-competition keywords, Google Ads CPC bids, related intent clusters, and SERP weak spots with no sign up.';
    const pageKeywords = [
      'free keyword research tool without login',
      'free keyword research tool no sign up',
      'low competition keyword finder',
      'google keyword planner without campaign 2026',
      'google keyword planner without paying',
      'google keyword planner without login',
      'google keyword planner no sign up',
      'use google keyword planner without paying',
      'free keyword competition checker',
      ...(activeSeed ? [activeSeed, `${activeSeed} keywords`, `low competition ${activeSeed} keywords`] : []),
    ].join(', ');

    document.title = pageTitle;
    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', pageDesc);
    setMeta('meta[name="keywords"]', pageKeywords);
    setMeta('meta[property="og:title"]', pageTitle);
    setMeta('meta[property="og:description"]', pageDesc);
    setMeta('meta[name="twitter:title"]', pageTitle);
    setMeta('meta[name="twitter:description"]', pageDesc);

    return () => {
      document.title = prevTitle;
    };
  }, [query]);

  useEffect(() => {
    if (!builtMasterPages || builtMasterPages.length === 0) return;
    fetch('/api/published-pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pages: builtMasterPages,
        industry: data.summary.niche || query,
      }),
    }).catch(() => {
      // Ignore network error
    });
  }, [builtMasterPages, data.summary.niche, query]);

  const fetchAutocompleteGroups = async (seed: string, market: GeoMarket) => {
    const cleanSeed = seed.trim();
    if (!cleanSeed) {
      setAutocompleteGroups({ related: [], questions: [], commercial: [], tools: [], longtail: [] });
      return;
    }
    try {
      const res = await fetch('/api/keywords/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanSeed, geo: market }),
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json?.categories) {
        setAutocompleteGroups({
          related: Array.isArray(json.categories.related) ? json.categories.related : [],
          questions: Array.isArray(json.categories.questions) ? json.categories.questions : [],
          commercial: Array.isArray(json.categories.commercial) ? json.categories.commercial : [],
          tools: Array.isArray(json.categories.tools) ? json.categories.tools : [],
          longtail: Array.isArray(json.categories.longtail) ? json.categories.longtail : [],
        });
      }
    } catch {
      // Ignore network hiccup
    }
  };

  // Run Suggest Related Keywords & Intent Expansion (live API only, no demo fallback)
  const handleExpandRelatedSeeds = async (
    seedsInput: string[],
    options?: { scrollToPanel?: boolean }
  ) => {
    const activeSeeds = seedsInput.map((s) => s.trim()).filter(Boolean);
    if (activeSeeds.length === 0) {
      setRelatedExpansion({ seedKeywords: [], totalSuggested: 0, suggestedTerms: [] });
      return;
    }
    const existingList = data.keywords.map((k) => k.keyword);

    setSelectedSuggestedSet(new Set());
    if (options?.scrollToPanel && expansionPanelRef.current) {
      expansionPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setIsExpandingRelated(true);
    try {
      const res = await fetch('/api/keywords/related-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedKeywords: activeSeeds,
          existingKeywords: existingList,
          geo,
        }),
      });
      if (res.status === 429) {
        const errJson = await res.json().catch(() => ({}));
        setErrorMsg(
          errJson?.error ||
            'Rate limit reached for your IP address. Please wait a moment before expanding more keywords.'
        );
        return;
      }
      if (res.ok) {
        const json: RelatedTermsResponse = await res.json();
        setRelatedExpansion({
          seedKeywords: Array.isArray(json?.seedKeywords) ? json.seedKeywords : activeSeeds,
          totalSuggested: Array.isArray(json?.suggestedTerms) ? json.suggestedTerms.length : 0,
          suggestedTerms: Array.isArray(json?.suggestedTerms) ? json.suggestedTerms : [],
        });
      }
    } catch {
      // Do not fall back to demo data
    } finally {
      setIsExpandingRelated(false);
    }
  };

  // Expand an individual row inside the keyword results table into 20–24 related search queries (live API only)
  const handleToggleRowExpansion = async (rowKw: KeywordOpportunity) => {
    if (expandedRowId === rowKw.id) {
      setExpandedRowId(null);
      return;
    }
    setExpandedRowId(rowKw.id);
    setRowIntentTab('ALL');

    const cacheKey = rowKw.keyword.trim().toLowerCase();
    if (rowExpansionCache[cacheKey]) {
      return;
    }

    const existingList = data.keywords.map((k) => k.keyword);
    setLoadingRowKeyword(cacheKey);
    try {
      const res = await fetch('/api/keywords/related-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedKeywords: [rowKw.keyword],
          existingKeywords: existingList,
          geo,
        }),
      });
      if (res.status === 429) {
        const errJson = await res.json().catch(() => ({}));
        setErrorMsg(
          errJson?.error ||
            'Rate limit reached for your IP address. Please wait a moment before expanding more rows.'
        );
        return;
      }
      if (res.ok) {
        const json: RelatedTermsResponse = await res.json();
        if (Array.isArray(json?.suggestedTerms)) {
          setRowExpansionCache((prev) => ({
            ...prev,
            [cacheKey]: json,
          }));
        }
      }
    } catch {
      // Do not populate fallback data
    } finally {
      setLoadingRowKeyword(null);
    }
  };

  // Inject 1 or more SuggestedRelatedTerm items directly into Active Keyword Plan & Anti-Thin Page Architecture Tree
  const handleInjectRelatedTermsIntoPlan = (
    termsToInject: SuggestedRelatedTerm[],
    sourceLabel?: string
  ) => {
    if (!termsToInject || termsToInject.length === 0) return;

    const currentLowerSet = new Set(data.keywords.map((k) => k.keyword.trim().toLowerCase()));
    const uniqueNewTerms = termsToInject.filter(
      (t) => !currentLowerSet.has(t.keyword.trim().toLowerCase())
    );

    if (uniqueNewTerms.length === 0) {
      setInjectionBannerMsg(
        `All selected related keywords are already in your Active Keyword Plan & Anti-Thin Page Architecture Tree.`
      );
      return;
    }

    const convertedOpportunities: KeywordOpportunity[] = uniqueNewTerms.map((term, idx) =>
      convertSuggestedTermToOpportunity(term, idx)
    );

    setData((prev) => {
      const mergedKeywords = [...convertedOpportunities, ...prev.keywords];
      const totalMonthlyVolume = mergedKeywords.reduce((s, k) => s + k.avgMonthlySearches, 0);
      const totalMonthlyTrafficValue = mergedKeywords.reduce((s, k) => s + k.trafficValueMonthly, 0);
      const avgLowBid =
        mergedKeywords.length > 0
          ? Number(
              (
                mergedKeywords.reduce((s, k) => s + k.lowTopOfPageBid, 0) / mergedKeywords.length
              ).toFixed(2)
            )
          : 0;
      const avgHighBid =
        mergedKeywords.length > 0
          ? Number(
              (
                mergedKeywords.reduce((s, k) => s + k.highTopOfPageBid, 0) / mergedKeywords.length
              ).toFixed(2)
            )
          : 0;
      const avgCompetitionIndex =
        mergedKeywords.length > 0
          ? Math.round(
              mergedKeywords.reduce((s, k) => s + k.competitionIndex, 0) / mergedKeywords.length
            )
          : 25;

      return {
        summary: {
          ...prev.summary,
          niche: prev.summary.niche || query.trim(),
          totalMonthlyVolume,
          totalMonthlyTrafficValue,
          avgLowBid,
          avgHighBid,
          avgCompetitionIndex,
          weakSpotCount: mergedKeywords.filter((k) => k.weakSpot.hasWeakSpot).length,
          clickSafeCount: mergedKeywords.filter((k) => k.aiSurvival.status === 'Click-Safe').length,
        },
        keywords: mergedKeywords,
      };
    });

    // Clear selection after injection
    setSelectedSuggestedSet(new Set());

    // Ensure maxComp filter doesn't hide newly injected terms
    const maxInjectedComp = Math.max(...uniqueNewTerms.map((t) => t.competitionIndex), maxComp);
    if (maxInjectedComp > maxComp) {
      setMaxComp(Math.min(100, maxInjectedComp + 5));
    }

    setInjectionBannerMsg(
      `Injected ${uniqueNewTerms.length} related search ${
        uniqueNewTerms.length === 1 ? 'query' : 'queries'
      }${sourceLabel ? ` (${sourceLabel})` : ''} into your Active Keyword Plan & Anti-Thin Page Architecture Tree.`
    );
  };

  // Live As-You-Type Related Keywords & Autocomplete update whenever the user types in the keyword input
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setAutocompleteGroups({ related: [], questions: [], commercial: [], tools: [], longtail: [] });
      return;
    }
    const seeds = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const timer = setTimeout(() => {
      if (seeds.length > 0) {
        fetchAutocompleteGroups(seeds[0], geo);
        handleExpandRelatedSeeds(seeds);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, geo]);

  useEffect(() => {
    if (initialSeedQuery && initialSeedQuery.trim()) {
      handleRunFreeSearch(initialSeedQuery.trim(), 'US');
    }
  }, [initialSeedQuery]);

  const handleRunFreeSearch = async (overrideSeed?: string, overrideGeo?: GeoMarket) => {
    const targetSeed = (overrideSeed ?? query).trim();
    if (!targetSeed) {
      setErrorMsg('Please enter a keyword or topic to analyze.');
      return;
    }
    const targetGeo = overrideGeo ?? geo;
    setQuery(targetSeed);

    const seedsList = targetSeed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsLoading(true);
    setErrorMsg(null);

    fetchAutocompleteGroups(seedsList[0] || targetSeed, targetGeo);
    handleExpandRelatedSeeds(seedsList);

    try {
      const res = await fetch('/api/keywords/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: seedsList[0] || targetSeed,
          geo: targetGeo,
          maxCompetition: maxComp,
          count: 25,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Search failed (${res.status})`);
      }

      const result: ExploreResponse = await res.json();
      setData(result);
      setCheckedIds(new Set());
      if (result.keywords?.[0]) {
        setSelectedKeyword(result.keywords[0]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not reach live keyword service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setErrorMsg(null);
    try {
      const existing = data.keywords.map((k) => k.keyword);
      const res = await fetch('/api/keywords/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim() || data.summary.niche,
          geo,
          maxCompetition: maxComp,
          count: 20,
          excludeKeywords: existing,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load additional keywords');
      }
      const moreData: ExploreResponse = await res.json();
      const existingSet = new Set(existing.map((k) => k.toLowerCase()));
      const deduped = (moreData.keywords || [])
        .filter((k) => !existingSet.has(k.keyword.toLowerCase()))
        .map((k, idx) => ({ ...k, id: `free-exp-${Date.now()}-${idx}` }));

      setData((prev) => ({
        summary: prev.summary,
        keywords: [...prev.keywords, ...deduped],
      }));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not expand keyword list.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filtered SuggestedRelatedTerm list by active 5-Intent Category tab
  const filteredSuggestedTerms = useMemo(() => {
    if (activeIntentTab === 'ALL') return relatedExpansion.suggestedTerms;
    return relatedExpansion.suggestedTerms.filter((t) => t.intentCategory === activeIntentTab);
  }, [relatedExpansion.suggestedTerms, activeIntentTab]);

  // Count per Intent Category for tab badges
  const intentCategoryCounts = useMemo(() => {
    const counts: Record<IntentCategoryFilter, number> = {
      ALL: relatedExpansion.suggestedTerms.length,
      Question: 0,
      Commercial: 0,
      Informational: 0,
      Comparison: 0,
      'Long-Tail': 0,
    };
    for (const t of relatedExpansion.suggestedTerms) {
      counts[t.intentCategory] = (counts[t.intentCategory] || 0) + 1;
    }
    return counts;
  }, [relatedExpansion.suggestedTerms]);

  const toggleSelectSuggestedTerm = (kw: string) => {
    setSelectedSuggestedSet((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  };

  const toggleSelectAllSuggestedInView = () => {
    const viewKws = filteredSuggestedTerms.map((t) => t.keyword);
    const allSelected =
      viewKws.length > 0 && viewKws.every((kw) => selectedSuggestedSet.has(kw));
    if (allSelected) {
      setSelectedSuggestedSet((prev) => {
        const next = new Set(prev);
        viewKws.forEach((kw) => next.delete(kw));
        return next;
      });
    } else {
      setSelectedSuggestedSet((prev) => {
        const next = new Set(prev);
        viewKws.forEach((kw) => next.add(kw));
        return next;
      });
    }
  };

  const handleCopySuggestedTerms = () => {
    const text = filteredSuggestedTerms
      .map(
        (r) =>
          `${r.keyword}\t${r.intentCategory}\t${r.monthlySearches}/mo\t$${r.averageCpc.toFixed(2)} ($${r.lowTopOfPageBid.toFixed(2)}-$${r.highTopOfPageBid.toFixed(2)})\t${r.competition} (${r.competitionIndex}/100)\tRelevance:${r.relevanceScore}%\t${r.rationale}`
      )
      .join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedRelated(true);
      setTimeout(() => setCopiedRelated(false), 1800);
    }
  };

  const handleExportSuggestedCsv = () => {
    const headers = [
      'Suggested Keyword',
      'Intent Category',
      'Relevance Score (%)',
      'Monthly Searches',
      'Average CPC (USD)',
      'Low Top of Page Bid (USD)',
      'High Top of Page Bid (USD)',
      'Competition Tier',
      'Competition Index (0-100)',
      'SEO & Architecture Rationale',
    ];
    const rows = filteredSuggestedTerms.map((t) => [
      `"${t.keyword.replace(/"/g, '""')}"`,
      t.intentCategory,
      t.relevanceScore,
      t.monthlySearches,
      t.averageCpc.toFixed(2),
      t.lowTopOfPageBid.toFixed(2),
      t.highTopOfPageBid.toFixed(2),
      t.competition,
      t.competitionIndex,
      `"${t.rationale.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerFileDownload(
      csv,
      `suggested-related-keywords-${(relatedExpansion.seedKeywords[0] || 'seed')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const filteredAndSortedKeywords = useMemo(() => {
    const mapped = data.keywords.map((kw) => {
      const g = kw.geoArbitrage?.[geo];
      if (!g || geo === 'US') return kw;
      return {
        ...kw,
        avgMonthlySearches: g.volume,
        highTopOfPageBid: g.cpcHigh,
        lowTopOfPageBid: Number((g.cpcHigh * 0.16).toFixed(2)),
        competitionIndex: g.competitionIndex,
        trafficValueMonthly: Math.round(g.volume * 0.32 * g.cpcHigh),
      };
    });

    const filtered = mapped.filter((kw) => {
      if (kw.competitionIndex > maxComp) return false;
      if (kw.avgMonthlySearches < minVolume) return false;
      if (intentFilter !== 'ALL' && kw.intent !== intentFilter) return false;
      if (textFilter && !kw.keyword.toLowerCase().includes(textFilter.toLowerCase())) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'volume') diff = a.avgMonthlySearches - b.avgMonthlySearches;
      else if (sortBy === 'competition') diff = a.competitionIndex - b.competitionIndex;
      else if (sortBy === 'cpc') diff = a.highTopOfPageBid - b.highTopOfPageBid;
      else diff = a.arbitrageScore - b.arbitrageScore;
      return sortDesc ? -diff : diff;
    });
  }, [data.keywords, geo, maxComp, minVolume, intentFilter, textFilter, sortBy, sortDesc]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(field);
      setSortDesc(field !== 'competition');
    }
  };

  const toggleCheckRow = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCheckAll = () => {
    if (checkedIds.size === filteredAndSortedKeywords.length && filteredAndSortedKeywords.length > 0) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredAndSortedKeywords.map((k) => k.id)));
    }
  };

  const handleCopyKeywords = (onlyChecked: boolean) => {
    const list = onlyChecked
      ? filteredAndSortedKeywords.filter((k) => checkedIds.has(k.id))
      : filteredAndSortedKeywords;
    const text = list
      .map((k) => `${k.keyword}\t${k.avgMonthlySearches}/mo\t$${k.highTopOfPageBid.toFixed(2)}\tComp:${k.competitionIndex}/100`)
      .join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedBulk(true);
      setTimeout(() => setCopiedBulk(false), 1800);
    }
  };

  const handleExportCsv = (onlyChecked: boolean) => {
    const list =
      onlyChecked && checkedIds.size > 0
        ? filteredAndSortedKeywords.filter((k) => checkedIds.has(k.id))
        : filteredAndSortedKeywords;

    const headers = [
      'Keyword',
      'Country',
      'Intent',
      'Monthly Volume',
      '3M Velocity (%)',
      'Low Bid (USD)',
      'High Bid (USD)',
      'Competition Index (0-100)',
      'Arbitrage Score',
      'SERP Weak Spot',
      'AI Survival',
    ];
    const rows = list.map((k) => [
      `"${k.keyword.replace(/"/g, '""')}"`,
      geo,
      k.intent,
      k.avgMonthlySearches,
      `${k.velocity3m}%`,
      k.lowTopOfPageBid.toFixed(2),
      k.highTopOfPageBid.toFixed(2),
      k.competitionIndex,
      k.arbitrageScore,
      `"${k.weakSpot.type} (${k.weakSpot.topDomain})"`,
      k.aiSurvival.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `free-keywords-${query.toLowerCase().replace(/\s+/g, '-')}-${geo.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const intentBadgeStyle = (cat: SuggestedRelatedTerm['intentCategory']) => {
    switch (cat) {
      case 'Question':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'Commercial':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'Comparison':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
      case 'Long-Tail':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'Informational':
      default:
        return 'bg-sky-950/80 text-sky-300 border-sky-700/60';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBackToSuite}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-medium text-indigo-400">
            Google Keyword Planner · Suggest Related Keywords &amp; Anti-Thin Architecture
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            architectureSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-800/60 rounded-lg transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>View Anti-Thin Page Architecture Tree ({data.keywords.length} Keywords)</span>
        </button>
      </div>

      {/* Dedicated Page Header & Search Box */}
      <div className="max-w-4xl mx-auto text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 [text-wrap:balance]">
          Google Keyword Planner &amp; Suggest Related Intent Expansion
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-6">
          Expand any seed keyword or table row into 20–24 high-synergy related search queries across 5 intent categories, and inject them directly into your active keyword plan and Anti-Thin Page Architecture Tree.
        </p>

        {/* Search Command Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunFreeSearch(query, geo);
          }}
          className="bg-slate-900/95 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row gap-2.5 shadow-xl"
        >
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter 1 or more comma-separated seed keywords (e.g. Semrush Alternative, Government Grants, CRM)..."
              aria-label="Free keyword search input"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const seeds = query
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              handleExpandRelatedSeeds(seeds, { scrollToPanel: true });
            }}
            disabled={isExpandingRelated}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-indigo-500/50 text-indigo-300 hover:text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Layers className={`w-4 h-4 text-indigo-400 ${isExpandingRelated ? 'animate-spin' : ''}`} />
            <span>Suggest Related (24)</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning SERP...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Find Free Keywords</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* INJECTION CONFIRMATION TOAST BANNER */}
      {injectionBannerMsg && (
        <div className="mb-6 bg-emerald-950/60 border border-emerald-700/70 rounded-xl px-4 py-3 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{injectionBannerMsg}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                architectureSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer"
            >
              Inspect Updated Architecture Tree ↓
            </button>
            <button
              type="button"
              onClick={() => setInjectionBannerMsg(null)}
              className="text-emerald-300 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ============================================================================
          SUGGEST RELATED KEYWORDS & INTENT EXPANSION ENGINE (20–24 QUERIES / 5 INTENTS)
          ============================================================================ */}
      <div
        ref={expansionPanelRef}
        className="bg-slate-900/95 border border-indigo-500/30 rounded-xl p-5 mb-6 shadow-lg"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/90 mb-4">
          <div className="flex items-start gap-2.5">
            <Layers className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Suggest Related Keywords &amp; Intent Expansion Engine
                </h2>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-xs font-mono text-indigo-300">
                  Seeds: {relatedExpansion.seedKeywords.map((s) => `"${s}"`).join(', ')}
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-xs text-emerald-400 font-medium">
                  {isExpandingRelated
                    ? 'Expanding 24 high-synergy queries...'
                    : `${relatedExpansion.totalSuggested} high-synergy queries across 5 intents`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select individual or bulk related search queries below to inject them directly into your Active Keyword Plan and 38-Archetype Anti-Thin Page Architecture Tree.
              </p>
            </div>
          </div>

          {/* Bulk Injection & Export Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleSelectAllSuggestedInView}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {filteredSuggestedTerms.length > 0 &&
                filteredSuggestedTerms.every((t) => selectedSuggestedSet.has(t.keyword))
                  ? 'Deselect View'
                  : `Select View (${filteredSuggestedTerms.length})`}
              </span>
            </button>

            {selectedSuggestedSet.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  const chosen = relatedExpansion.suggestedTerms.filter((t) =>
                    selectedSuggestedSet.has(t.keyword)
                  );
                  handleInjectRelatedTermsIntoPlan(chosen, `${chosen.length} selected terms`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inject Selected into Plan &amp; Tree ({selectedSuggestedSet.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                handleInjectRelatedTermsIntoPlan(
                  filteredSuggestedTerms,
                  activeIntentTab === 'ALL'
                    ? `all ${filteredSuggestedTerms.length} expanded terms`
                    : `${filteredSuggestedTerms.length} ${activeIntentTab} terms`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {activeIntentTab === 'ALL'
                  ? `+ Inject All ${relatedExpansion.totalSuggested} into Plan & Tree`
                  : `+ Inject All ${filteredSuggestedTerms.length} ${activeIntentTab} Terms`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopySuggestedTerms}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {copiedRelated ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportSuggestedCsv}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* 5 Intent Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {INTENT_CATEGORY_TABS.map((tab) => {
              const count = intentCategoryCounts[tab.value] || 0;
              const isActive = activeIntentTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveIntentTab(tab.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {checkedIds.size > 0 && (
            <button
              type="button"
              onClick={() => {
                const selectedKeywords = data.keywords
                  .filter((k) => checkedIds.has(k.id))
                  .map((k) => k.keyword);
                handleExpandRelatedSeeds(selectedKeywords, { scrollToPanel: false });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Expand {checkedIds.size} Checked Table Row(s) as Seeds</span>
            </button>
          )}
        </div>

        {/* Grid of 20–24 High-Synergy SuggestedRelatedTerm Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSuggestedTerms.map((item, idx) => {
            const isSelected = selectedSuggestedSet.has(item.keyword);
            const alreadyInPlan = activePlanKeywordSet.has(item.keyword.trim().toLowerCase());
            return (
              <div
                key={`${item.keyword}-${idx}`}
                className={`bg-slate-950/95 border rounded-xl p-3.5 transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : alreadyInPlan
                    ? 'border-emerald-800/60 bg-emerald-950/10'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top row: Checkbox + Keyword + Relevance Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      onClick={() => toggleSelectSuggestedTerm(item.keyword)}
                      className="flex items-start gap-2 cursor-pointer min-w-0"
                    >
                      <button
                        type="button"
                        aria-label={`Select ${item.keyword}`}
                        className="mt-0.5 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-xs sm:text-sm font-bold text-white leading-snug break-words">
                        {item.keyword}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-semibold text-emerald-400 shrink-0">
                      {item.relevanceScore}% Match
                    </span>
                  </div>

                  {/* Second row: Intent Category + Volume + CPC + Competition */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] mt-2">
                    <span
                      className={`px-2 py-0.5 rounded border font-semibold ${intentBadgeStyle(
                        item.intentCategory
                      )}`}
                    >
                      {item.intentCategory}
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {item.monthlySearches.toLocaleString()}/mo
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-emerald-400">
                      ${item.averageCpc.toFixed(2)} CPC
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      (${item.lowTopOfPageBid.toFixed(2)}–${item.highTopOfPageBid.toFixed(2)})
                    </span>
                    <span className="text-slate-600">·</span>
                    <span
                      className={`font-mono font-semibold ${
                        item.competition === 'LOW'
                          ? 'text-emerald-400'
                          : item.competition === 'MEDIUM'
                          ? 'text-sky-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.competition} ({item.competitionIndex})
                    </span>
                  </div>

                  {/* Rationale */}
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {item.rationale}
                  </p>
                </div>

                {/* Bottom Action Row: Inject into Plan & Architecture Tree OR Scan SERP */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {alreadyInPlan ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>In Active Plan &amp; Tree</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleInjectRelatedTermsIntoPlan([item], `"${item.keyword}"`)
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-600 border border-emerald-800/60 rounded-md transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Inject into Plan &amp; Tree</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRunFreeSearch(item.keyword, geo)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>Make Primary Seed</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Difficulty Cap:</span>
          </span>
          {[
            { label: 'Ultra-Low (≤ 18)', val: 18 },
            { label: 'Low Comp (≤ 30)', val: 30 },
            { label: 'Moderate (≤ 65)', val: 65 },
            { label: 'All (≤ 100)', val: 100 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setMaxComp(preset.val)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                maxComp === preset.val
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Intent Filter */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value as any)}
            aria-label="Filter by search intent"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Search Intents</option>
            <option value="Commercial">Commercial Intent</option>
            <option value="Transactional">Transactional Intent</option>
            <option value="Informational">Informational Intent</option>
          </select>

          {/* Min Volume Filter */}
          <select
            value={minVolume}
            onChange={(e) => setMinVolume(Number(e.target.value))}
            aria-label="Minimum monthly search volume"
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value={0}>Min Vol: Any</option>
            <option value={1000}>Min Vol: 1,000+/mo</option>
            <option value={10000}>Min Vol: 10,000+/mo</option>
            <option value={25000}>Min Vol: 25,000+/mo</option>
          </select>
        </div>

        {/* Right Side: Instant Text Filter + Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-grow sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="Filter active plan..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => handleCopyKeywords(checkedIds.size > 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedBulk ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>{checkedIds.size > 0 ? `Copy Selected (${checkedIds.size})` : 'Copy Plan'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleExportCsv(checkedIds.size > 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{checkedIds.size > 0 ? `Export (${checkedIds.size}) CSV` : 'Export Plan CSV'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-amber-950/40 border border-amber-800/60 rounded-lg px-4 py-3 text-xs text-amber-200 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* FULL-WIDTH INTERACTIVE SORTABLE KEYWORD TABLE WITH PER-ROW 24-QUERY INTENT EXPANSION */}
      <div className="w-full">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-950/70">
                  <th className="py-3 pl-4 pr-2 w-8">
                    <button
                      type="button"
                      onClick={toggleCheckAll}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      aria-label="Select all keywords"
                    >
                      {checkedIds.size === filteredAndSortedKeywords.length &&
                      filteredAndSortedKeywords.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Active Plan Keyword, Weak-Spot Signal &amp; Intent Expansion</th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('volume')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>Volume</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('competition')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>Comp (0–100)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('cpc')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>CPC Range</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('arbitrage')}
                      className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      <span>Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredAndSortedKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      No keywords match your current filter.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMaxComp(100);
                          setMinVolume(0);
                          setIntentFilter('ALL');
                          setTextFilter('');
                        }}
                        className="text-indigo-400 underline ml-1"
                      >
                        Reset all filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedKeywords.map((kw) => {
                    const isChecked = checkedIds.has(kw.id);
                    const isExpanded = expandedRowId === kw.id;
                    const cacheKey = kw.keyword.trim().toLowerCase();
                    const rowExpansionData =
                      rowExpansionCache[cacheKey] ||
                      generateSuggestedRelatedTerms([kw.keyword]);
                    const filteredRowTerms =
                      rowIntentTab === 'ALL'
                        ? rowExpansionData.suggestedTerms
                        : rowExpansionData.suggestedTerms.filter(
                            (t) => t.intentCategory === rowIntentTab
                          );

                    return (
                      <React.Fragment key={kw.id}>
                        <tr className="hover:bg-slate-800/40 transition-colors">
                          <td
                            className="py-3.5 pl-4 pr-2 cursor-pointer"
                            onClick={() => toggleCheckRow(kw.id)}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-100 flex items-center gap-2">
                              <span>{kw.keyword}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span className="text-indigo-300">{kw.intent}</span>
                              <span aria-hidden="true">·</span>
                              <span className={kw.weakSpot.hasWeakSpot ? 'text-emerald-400' : 'text-slate-400'}>
                                {kw.weakSpot.type} ({kw.weakSpot.topDomain})
                              </span>
                              <span aria-hidden="true">·</span>
                              <button
                                type="button"
                                onClick={() => handleToggleRowExpansion(kw)}
                                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                              >
                                <span>Suggest Related ({rowExpansionData.totalSuggested})</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            <div className="font-semibold text-white">{kw.avgMonthlySearches.toLocaleString()}</div>
                            <div
                              className={`text-[11px] ${
                                kw.velocity3m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {kw.velocity3m >= 0 ? `+${kw.velocity3m}%` : `${kw.velocity3m}%`} 3M
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            <span
                              className={`font-bold ${
                                kw.competitionIndex <= 20
                                  ? 'text-emerald-400'
                                  : kw.competitionIndex <= 35
                                  ? 'text-sky-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {kw.competitionIndex}
                            </span>
                            <span className="text-xs text-slate-500">/100</span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            <div className="text-slate-200">
                              ${kw.lowTopOfPageBid.toFixed(2)} –{' '}
                              <span className="text-emerald-400 font-semibold">
                                ${kw.highTopOfPageBid.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                            <span className="font-bold text-indigo-300">{kw.arbitrageScore}/99</span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleRowExpansion(kw)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                                  isExpanded
                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                    : 'text-slate-200 hover:text-white bg-slate-950 hover:bg-slate-800 border-slate-800'
                                }`}
                              >
                                <Layers className="w-3.5 h-3.5 text-indigo-300" />
                                <span>Suggest Related (24)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setBuildKitModalTarget({
                                    primary: kw,
                                    peers: filteredAndSortedKeywords.filter((k) => k.id !== kw.id),
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-600 border border-emerald-800/60 rounded-lg transition-colors cursor-pointer"
                              >
                                <Code2 className="w-3.5 h-3.5" />
                                <span>Build #1 Kit</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Per-Row 20–24 Query Suggest Related Keywords & Intent Expansion Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-950/95">
                            <td colSpan={7} className="px-4 py-5 border-t border-indigo-500/30">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs sm:text-sm font-bold text-white">
                                      24 High-Synergy Related Queries for{' '}
                                      <span className="text-indigo-400">"{kw.keyword}"</span>
                                    </span>
                                    {loadingRowKeyword === cacheKey && (
                                      <span className="text-xs text-emerald-400 font-mono">
                                        Syncing live intent signals...
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Filter across all 5 intent categories and inject high-synergy terms directly into your Active Keyword Plan &amp; Anti-Thin Page Architecture Tree.
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleInjectRelatedTermsIntoPlan(
                                        filteredRowTerms,
                                        `from "${kw.keyword}"`
                                      )
                                    }
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>
                                      + Inject {filteredRowTerms.length} Terms into Plan &amp; Tree
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedRowId(null);
                                      handleExpandRelatedSeeds([kw.keyword], { scrollToPanel: true });
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <span>Open in Top Expansion Workbench</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Row-level 5 Intent Category Filter Tabs */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                {INTENT_CATEGORY_TABS.map((tab) => {
                                  const count =
                                    tab.value === 'ALL'
                                      ? rowExpansionData.suggestedTerms.length
                                      : rowExpansionData.suggestedTerms.filter(
                                          (t) => t.intentCategory === tab.value
                                        ).length;
                                  return (
                                    <button
                                      key={tab.value}
                                      type="button"
                                      onClick={() => setRowIntentTab(tab.value)}
                                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                                        rowIntentTab === tab.value
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                      }`}
                                    >
                                      {tab.label} ({count})
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {filteredRowTerms.map((rel, rIdx) => {
                                  const inPlan = activePlanKeywordSet.has(
                                    rel.keyword.trim().toLowerCase()
                                  );
                                  return (
                                    <div
                                      key={rIdx}
                                      className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-lg p-3 flex flex-col justify-between gap-2"
                                    >
                                      <div>
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="text-xs font-bold text-white leading-snug">
                                            {rel.keyword}
                                          </span>
                                          <span className="font-mono text-[10px] text-emerald-400 shrink-0">
                                            {rel.relevanceScore}%
                                          </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                                          <span
                                            className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${intentBadgeStyle(
                                              rel.intentCategory
                                            )}`}
                                          >
                                            {rel.intentCategory}
                                          </span>
                                          <span className="font-mono text-slate-200">
                                            {rel.monthlySearches.toLocaleString()}/mo
                                          </span>
                                          <span aria-hidden="true">·</span>
                                          <span className="font-mono text-emerald-400">
                                            ${rel.averageCpc.toFixed(2)} CPC
                                          </span>
                                          <span aria-hidden="true">·</span>
                                          <span className="font-mono text-sky-400">
                                            {rel.competition} ({rel.competitionIndex})
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                                          {rel.rationale}
                                        </p>
                                      </div>

                                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                        {inPlan ? (
                                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>In Active Plan</span>
                                          </span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleInjectRelatedTermsIntoPlan(
                                                [rel],
                                                `"${rel.keyword}"`
                                              )
                                            }
                                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-600 border border-emerald-800/60 rounded transition-colors cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Inject into Plan</span>
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setExpandedRowId(null);
                                            handleRunFreeSearch(rel.keyword, geo);
                                          }}
                                          className="text-[11px] text-slate-400 hover:text-indigo-300 inline-flex items-center gap-0.5 cursor-pointer"
                                        >
                                          <span>Scan</span>
                                          <ChevronRight className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Load More Footer */}
          <div className="px-4 py-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Showing <strong className="text-white font-mono tabular-nums">{filteredAndSortedKeywords.length}</strong>{' '}
              active plan keywords (Comp ≤ {maxComp}/100) · Total in Plan:{' '}
              <strong className="text-emerald-400 font-mono">{data.keywords.length}</strong>
            </span>
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMore ? 'animate-spin' : ''}`} />
              <span>{isLoadingMore ? 'Loading +20 Keywords...' : '+ Load 20 More Keywords'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================
          ANTI-THIN PAGE ARCHITECTURE & CANNIBALIZATION PREVENTION TREE
          (AUTOMATICALLY CLUSTERS ACTIVE KEYWORD PLAN + INJECTED RELATED TERMS)
          ============================================================================ */}
      <div ref={architectureSectionRef} className="mt-10">
        <AntiThinArchitectureView
          keywords={data.keywords}
          industry={data.summary.niche || query || 'Free Keyword Planner'}
          defaultDomain="serpgpt.pro"
          onOpenLiveMasterPage={onOpenMasterSeoPage}
          onExpandClusterKeyword={(seedKw) => {
            setQuery(seedKw);
            handleExpandRelatedSeeds([seedKw], { scrollToPanel: true });
          }}
        />
      </div>

      {/* LIVE GOOGLE AUTOCOMPLETE & RELATED KEYWORD HARVESTER PANEL (APPEARS BEFORE GUIDES) */}
      <div className="mt-10 bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-base font-bold text-white">
              Live Google Autocomplete &amp; Related Seed Harvester: <span className="text-indigo-400">{query}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any real-time Google Search suggestion or related keyword below to run a deep low-competition &amp; CPC scan on that exact phrase.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400">Direct Google Suggest Stream</span>
            <button
              type="button"
              onClick={() => exportAutocompleteSeedsCsv(query, geo, autocompleteGroups)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Autocomplete &amp; Related CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { title: 'Related Keywords & Clusters', items: autocompleteGroups.related },
            { title: 'Questions (How / What / Who)', items: autocompleteGroups.questions },
            { title: 'Buyer & Commercial Modifiers', items: autocompleteGroups.commercial },
            { title: 'Interactive Calculators & Tools', items: autocompleteGroups.tools },
            { title: 'Untapped Long-Tail Phrases', items: autocompleteGroups.longtail },
          ].map((group, idx) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-indigo-300 mb-3">{group.title}</h3>
              <div className="space-y-1.5">
                {group.items.length === 0 ? (
                  <div className="text-xs text-slate-500">Type a keyword above to load suggestions...</div>
                ) : (
                  group.items.map((phrase, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRunFreeSearch(phrase, geo)}
                      className="w-full text-left text-xs text-slate-300 hover:text-white hover:bg-slate-900 px-2.5 py-1.5 rounded transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <span className="truncate">{phrase}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KEYWORD RESEARCH GUIDES & PLAYBOOKS */}
      <div className="mt-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Free Keyword Research &amp; SEO Ranking Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Step-by-step tutorials, platform comparisons, and interactive calculators for ranking in low-competition niches.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {builtMasterPages.slice(0, 8).map((hub) => (
            <a
              key={hub.id}
              href={hub.slug}
              onClick={(e) => {
                if (onOpenMasterSeoPage) {
                  e.preventDefault();
                  onOpenMasterSeoPage(hub.slug);
                }
              }}
              className="bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2">
                  {hub.pageTitle}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {hub.metaDescription}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 group-hover:text-indigo-300 font-semibold">
                <span>Read Guide</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {buildKitModalTarget && (
        <RankImplementationModal
          keyword={buildKitModalTarget.primary}
          clusterKeywords={buildKitModalTarget.peers}
          niche={data.summary.niche}
          geo={geo}
          onClose={() => setBuildKitModalTarget(null)}
        />
      )}
    </div>
  );
}
