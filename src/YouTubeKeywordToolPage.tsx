import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Flame,
  Play,
  Tag,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  CheckSquare,
  Square,
  ExternalLink,
} from 'lucide-react';
import {
  YouTubeAutocompleteResponse,
  YouTubeKeywordExploreResponse,
  YouTubeIntentCategory,
  YouTubeWeakSpotType,
} from './types';

interface YouTubeKeywordToolPageProps {
  initialSeed?: string;
  onBackToHome: () => void;
  onOpenWebKeywordPlanner: (seed: string) => void;
}

const INTENT_CATEGORIES: Array<'ALL' | YouTubeIntentCategory> = [
  'ALL',
  'Tutorial & How-To',
  'Review & Comparison',
  'Beginner Guide',
  'Case Study & Results',
  'Mistakes & Secrets',
  'Tools & Setup',
];

export default function YouTubeKeywordToolPage({
  initialSeed,
  onOpenWebKeywordPlanner,
}: YouTubeKeywordToolPageProps) {
  const [seedInput, setSeedInput] = useState<string>(initialSeed || '');
  const [activeQuery, setActiveQuery] = useState<string>(initialSeed || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exploreData, setExploreData] = useState<YouTubeKeywordExploreResponse | null>(null);

  // Live YouTube Autocomplete (ds=yt) state
  const [ytSuggestData, setYtSuggestData] = useState<YouTubeAutocompleteResponse | null>(null);
  const [ytSuggestLoading, setYtSuggestLoading] = useState<boolean>(false);
  const [activeSuggestTab, setActiveSuggestTab] = useState<
    'related' | 'tutorials' | 'comparisons' | 'mistakes' | 'tools' | 'caseStudies'
  >('related');

  // Filters & sorting
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | YouTubeIntentCategory>('ALL');
  const [selectedWeakSpot, setSelectedWeakSpot] = useState<'ALL' | YouTubeWeakSpotType>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'opportunityScore' | 'monthlyYoutubeSearches' | 'outlierMultiplier' | 'estimatedRpmUsd' | 'competitionScore'
  >('opportunityScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Expanded video blueprint row
  const [expandedKeywordId, setExpandedKeywordId] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const runYoutubeScan = async (targetSeed: string) => {
    const clean = targetSeed.trim();
    if (!clean) {
      setErrorMsg('Please enter a YouTube keyword or topic to scan.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setActiveQuery(clean);
    try {
      const res = await fetch('/api/youtube/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean, categoryFilter: 'ALL' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to scan YouTube SERP (${res.status})`);
      }
      setExploreData(data);
      if (data.keywords && data.keywords.length > 0) {
        setExpandedKeywordId(data.keywords[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch live YouTube data.');
      setExploreData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveYoutubeSuggest = async (targetSeed: string) => {
    const clean = targetSeed.trim();
    if (clean.length < 2) {
      setYtSuggestData(null);
      return;
    }
    setYtSuggestLoading(true);
    try {
      const res = await fetch('/api/youtube/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean }),
      });
      if (res.ok) {
        const data: YouTubeAutocompleteResponse = await res.json();
        setYtSuggestData(data);
      }
    } catch {
      // Ignore network hiccup
    } finally {
      setYtSuggestLoading(false);
    }
  };

  useEffect(() => {
    if (initialSeed && initialSeed.trim()) {
      runYoutubeScan(initialSeed.trim());
      fetchLiveYoutubeSuggest(initialSeed.trim());
    }
  }, [initialSeed]);

  // Inject low-competition YouTube Keyword & Outlier Finder SEO tags into <head>
  useEffect(() => {
    const prevTitle = document.title;
    const activeSeed = activeQuery.trim();
    const pageTitle = activeSeed
      ? `${activeSeed} — Free YouTube Keyword Tool, Outlier Finder & Video Tags | SERPgpt.pro`
      : 'Free YouTube Keyword Tool, Outlier Finder & Tag Generator (2026) | SERPgpt.pro';
    const pageDesc =
      '100% free YouTube keyword research tool powered by live YouTube Autocomplete (ds=yt). Find small-channel outlier videos, low-competition video tags, and AdSense RPM metrics without login.';
    const pageKeywords = [
      'free youtube keyword research tool',
      'free youtube keyword tool',
      'best free youtube keyword tool',
      'free youtube keyword generator tool',
      'free youtube tag generator tool',
      'free youtube tag extractor tool',
      'youtube outlier finder',
      'youtube video outlier finder',
      'how to find outliers youtube',
      'free vidiq and tubebuddy alternative',
      ...(activeSeed ? [activeSeed, `${activeSeed} youtube tags`, `${activeSeed} youtube keywords`] : []),
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
  }, [activeQuery]);

  const handleSeedInputChange = (val: string) => {
    setSeedInput(val);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      if (val.trim().length >= 2) {
        fetchLiveYoutubeSuggest(val.trim());
      } else {
        setYtSuggestData(null);
      }
    }, 280);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAndSortedKeywords = useMemo(() => {
    if (!exploreData?.keywords) return [];
    return exploreData.keywords
      .filter((item) => {
        if (selectedCategory !== 'ALL' && item.intentCategory !== selectedCategory) return false;
        if (selectedWeakSpot !== 'ALL' && item.weakSpotType !== selectedWeakSpot) return false;
        if (
          searchFilter.trim() &&
          !item.keyword.toLowerCase().includes(searchFilter.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        return sortDir === 'desc' ? valB - valA : valA - valB;
      });
  }, [exploreData, selectedCategory, selectedWeakSpot, searchFilter, sortBy, sortDir]);

  const toggleSort = (
    field:
      | 'opportunityScore'
      | 'monthlyYoutubeSearches'
      | 'outlierMultiplier'
      | 'estimatedRpmUsd'
      | 'competitionScore'
  ) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'competitionScore' ? 'asc' : 'desc');
    }
  };

  const toggleSelectKeyword = (kw: string) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedKeywords.size === filteredAndSortedKeywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(filteredAndSortedKeywords.map((k) => k.keyword)));
    }
  };

  const exportCsv = () => {
    if (!filteredAndSortedKeywords.length) return;
    const headers = [
      'YouTube Keyword',
      'Intent Category',
      'Monthly YouTube Searches',
      'YoY Velocity Growth (%)',
      'Opportunity Score (0-100)',
      'Competition Score (0-100)',
      'Outlier Weak Spot',
      'Outlier Multiplier (Views/Subs)',
      'Avg Top Channel Subs',
      'Estimated Creator RPM ($)',
      'Advertiser CPC ($)',
      'Recommended Video Format',
      'High-CTR Title Idea #1',
      'Recommended Video Tags',
    ];
    const rows = filteredAndSortedKeywords.map((k) => [
      `"${k.keyword.replace(/"/g, '""')}"`,
      `"${k.intentCategory}"`,
      k.monthlyYoutubeSearches,
      `${k.yoYGrowthPercent}%`,
      k.opportunityScore,
      k.competitionScore,
      `"${k.weakSpotType}"`,
      `${k.outlierMultiplier}x`,
      k.avgTopChannelSubs,
      `$${k.estimatedRpmUsd.toFixed(2)}`,
      `$${k.advertiserCpcUsd.toFixed(2)}`,
      `"${k.recommendedVideoFormat} (${k.recommendedDuration})"`,
      `"${(k.highCtrTitles[0] || '').replace(/"/g, '""')}"`,
      `"${k.recommendedTags.join(', ').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-keywords-${activeQuery.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSuggestList = useMemo(() => {
    if (!ytSuggestData?.categories) return [];
    return ytSuggestData.categories[activeSuggestTab] || [];
  }, [ytSuggestData, activeSuggestTab]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Section & Search Box */}
      <div className="bg-gradient-to-br from-slate-900/95 via-[#111322] to-rose-950/20 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Flame className="w-4 h-4" />
            <span>100% Free VidIQ &amp; TubeBuddy Alternative</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Free YouTube Keyword Tool, Outlier Video Finder &amp; Tag Studio
          </h1>
          <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
            Uncover high-velocity YouTube video keywords where small channels are outranking large creators, complete with AdSense RPM estimates, high-CTR title hooks, and copy-ready YouTube tags.
          </p>
        </div>

        {/* Main YouTube Keyword Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runYoutubeScan(seedInput);
            fetchLiveYoutubeSuggest(seedInput);
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Play className="w-4 h-4 text-rose-400 fill-rose-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={seedInput}
              onChange={(e) => handleSeedInputChange(e.target.value)}
              placeholder="Enter any YouTube topic or keyword..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-950/90 border border-slate-700/90 focus:border-rose-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning YouTube...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find YouTube Keywords</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 font-medium">
            {errorMsg}
          </div>
        )}
      </div>

      {/* LIVE YOUTUBE AUTOCOMPLETE STREAM PANEL (Shown when user types or searches) */}
      {ytSuggestData && ytSuggestData.totalCount > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-base font-bold text-white">
                  Related YouTube Search Suggestions
                </h2>
                {ytSuggestLoading && (
                  <RefreshCw className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time phrases viewers are typing into YouTube for <span className="text-white font-semibold">&ldquo;{seedInput || activeQuery}&rdquo;</span>. Click any phrase to scan.
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              {ytSuggestData.totalCount} suggestions
            </div>
          </div>

          {/* Category Tabs for YouTube Autocomplete */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { id: 'related', label: 'Related Searches', count: ytSuggestData.categories.related.length },
              { id: 'tutorials', label: 'How-To & Tutorials', count: ytSuggestData.categories.tutorials.length },
              { id: 'comparisons', label: 'Reviews & VS', count: ytSuggestData.categories.comparisons.length },
              { id: 'mistakes', label: 'Mistakes & Secrets', count: ytSuggestData.categories.mistakes.length },
              { id: 'tools', label: 'Tools & Setup', count: ytSuggestData.categories.tools.length },
              { id: 'caseStudies', label: 'Case Studies', count: ytSuggestData.categories.caseStudies.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSuggestTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  activeSuggestTab === tab.id
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 opacity-75 font-mono">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Autocomplete Chips Grid */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {activeSuggestList.map((suggestion, idx) => (
              <div
                key={`${suggestion}-${idx}`}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-rose-500/50 group transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSeedInput(suggestion);
                    runYoutubeScan(suggestion);
                  }}
                  className="flex items-center gap-2 text-left text-xs text-slate-200 group-hover:text-rose-300 font-medium truncate flex-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyText(suggestion, `sug-${idx}`)}
                  className="text-slate-500 hover:text-white p-1 rounded transition-colors cursor-pointer shrink-0"
                  title="Copy keyword"
                >
                  {copiedId === `sug-${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER, BULK TAG GENERATOR & EXPORT WORKBENCH */}
      {exploreData && exploreData.keywords.length > 0 && (
        <>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Intent Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {INTENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Video Intents' : cat}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Copy All Tags & Export CSV */}
              <div className="flex flex-wrap items-center gap-2">
                {exploreData.globalVideoTags && exploreData.globalVideoTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(exploreData.globalVideoTags.join(', '), 'global-tags')
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-rose-300 transition-colors cursor-pointer"
                  >
                    {copiedId === 'global-tags' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied Tags!</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-3.5 h-3.5 text-rose-400" />
                        <span>Copy All Video Tags</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export YouTube Plan CSV</span>
                </button>
              </div>
            </div>

            {/* Secondary Filter Row: Weak-Spot Filter & Text Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter keywords in table..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedWeakSpot}
                  onChange={(e) => setSelectedWeakSpot(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All YouTube Weak Spots (Outliers + Old Videos)</option>
                  <option value="Small Channel Outlier (<5K Subs)">
                    Small Channel Outlier (&lt;5K Subs Ranking Top 3)
                  </option>
                  <option value="Outdated Top Video (>2 Yrs Old)">
                    Outdated Top Video (&gt;2 Years Old)
                  </option>
                  <option value="Weak Packaging / Low CTR">
                    Weak Packaging / Low CTR Titles
                  </option>
                  <option value="Shorts-Only Gap (No Deep Video)">
                    Shorts-Only Gap (No Deep Long-Form Video)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                <span>
                  Showing <strong className="text-white">{filteredAndSortedKeywords.length}</strong> YouTube keywords
                </span>
              </div>
            </div>
          </div>

          {/* YOUTUBE KEYWORD & OUTLIER TABLE + INLINE VIDEO BLUEPRINT STUDIO */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 w-10">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        {selectedKeywords.size > 0 &&
                        selectedKeywords.size === filteredAndSortedKeywords.length ? (
                          <CheckSquare className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">YouTube Keyword &amp; Creator Intent</th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleSort('opportunityScore')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>Opp. Score</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleSort('monthlyYoutubeSearches')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>Monthly YT Searches</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleSort('outlierMultiplier')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>Outlier Weak Spot (Views/Subs)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleSort('estimatedRpmUsd')}
                        className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                      >
                        <span>Creator RPM / CPC</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4 text-right">Video Blueprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {filteredAndSortedKeywords.map((item) => {
                    const isExpanded = expandedKeywordId === item.id;
                    const isSelected = selectedKeywords.has(item.keyword);

                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          className={`transition-colors ${
                            isExpanded
                              ? 'bg-slate-800/60'
                              : 'hover:bg-slate-900/60'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleSelectKeyword(item.keyword)}
                              className="text-slate-400 hover:text-white cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-rose-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Keyword & Category */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-sm">
                                  {item.keyword}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span className="text-indigo-300 font-medium">
                                  {item.intentCategory}
                                </span>
                                <span>·</span>
                                <span>{item.recommendedVideoFormat}</span>
                                <span>({item.recommendedDuration})</span>
                              </div>
                              {item.matchedVideo && (
                                <a
                                  href={item.matchedVideo.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300/90 hover:text-emerald-200 mt-0.5 truncate max-w-md"
                                >
                                  <Play className="w-3 h-3 fill-emerald-400 text-emerald-400 shrink-0" />
                                  <span className="truncate">
                                    Top Match: &ldquo;{item.matchedVideo.title}&rdquo; ({item.matchedVideo.channelTitle} · {item.matchedVideo.viewCount.toLocaleString()} views)
                                  </span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Opportunity & Competition Score */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                                  item.opportunityScore >= 85
                                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                                    : 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
                                }`}
                              >
                                {item.opportunityScore}/100
                              </div>
                              <div className="text-[11px] text-slate-400">
                                <div>Comp: {item.competitionScore}/100</div>
                                <div className="text-emerald-400 font-semibold">
                                  {item.competitionLevel}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Monthly YouTube Searches & YoY Velocity */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white text-sm">
                              {item.monthlyYoutubeSearches.toLocaleString()}/mo
                            </div>
                            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                              <TrendingUp className="w-3 h-3" />
                              <span>+{item.yoYGrowthPercent}% YoY velocity</span>
                            </div>
                          </td>

                          {/* Outlier Weak Spot & Multiplier */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                  item.weakSpotType === 'Small Channel Outlier (<5K Subs)'
                                    ? 'text-amber-300'
                                    : item.weakSpotType === 'Outdated Top Video (>2 Yrs Old)'
                                    ? 'text-sky-300'
                                    : 'text-indigo-300'
                                }`}
                              >
                                <Zap className="w-3 h-3 shrink-0" />
                                <span>{item.weakSpotType}</span>
                              </span>
                              <div className="text-[11px] text-slate-400 font-mono">
                                <span className="text-white font-semibold">
                                  {item.outlierMultiplier}x Views/Subs
                                </span>{' '}
                                · Avg Sub: {item.avgTopChannelSubs.toLocaleString()} · Top Age:{' '}
                                {item.topVideoAgeMonths}mo
                              </div>
                            </div>
                          </td>

                          {/* Creator RPM & Advertiser CPC */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-emerald-300 text-sm">
                              ${item.estimatedRpmUsd.toFixed(2)} RPM
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Ad CPC: ${item.advertiserCpcUsd.toFixed(2)}
                            </div>
                          </td>

                          {/* Expand Blueprint Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedKeywordId(isExpanded ? null : item.id)
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isExpanded
                                  ? 'bg-rose-600 text-white border-rose-500'
                                  : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-700'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isExpanded ? 'Hide Studio' : 'Video Blueprint'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED YOUTUBE VIDEO PACKAGING & TAG STUDIO */}
                        {isExpanded && (
                          <tr className="bg-slate-950/95 border-b border-slate-800">
                            <td colSpan={7} className="p-5 sm:p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {/* Column 1: High-CTR Video Titles & Thumbnail Hook */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                      <Flame className="w-3.5 h-3.5" />
                                      <span>Ranking Video Titles</span>
                                    </h4>
                                  </div>

                                  <div className="space-y-2">
                                    {item.highCtrTitles.map((title, tIdx) => (
                                      <div
                                        key={tIdx}
                                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                                      >
                                        <span className="text-xs font-semibold text-white leading-snug">
                                          {title}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCopyText(title, `${item.id}-title-${tIdx}`)
                                          }
                                          className="text-slate-400 hover:text-white p-1 shrink-0 cursor-pointer"
                                          title="Copy title"
                                        >
                                          {copiedId === `${item.id}-title-${tIdx}` ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="pt-3 border-t border-slate-800">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                                      SERP Video Performance
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                      {item.thumbnailHookIdea}
                                    </p>
                                  </div>
                                </div>

                                {/* Column 2: Retention Chapter Timestamps Outline */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Video Chapters</span>
                                    </h4>
                                    {item.chapterOutline.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyText(
                                            item.chapterOutline.join('\n'),
                                            `${item.id}-chapters`
                                          )
                                        }
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-white cursor-pointer"
                                      >
                                        {copiedId === `${item.id}-chapters` ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            <span className="text-emerald-300">Copied!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copy Chapters</span>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  {item.chapterOutline.length > 0 ? (
                                    <div className="space-y-2 font-mono text-xs text-slate-300">
                                      {item.chapterOutline.map((chap, cIdx) => (
                                        <div
                                          key={cIdx}
                                          className="p-2 rounded bg-slate-950/90 border border-slate-800/80"
                                        >
                                          {chap}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-400">
                                      No timestamp chapters published on the matched SERP video.
                                    </p>
                                  )}
                                </div>

                                {/* Column 3: YouTube Studio Tags & Outlier Telemetry */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5" />
                                        <span>Copy-Ready Video Tags</span>
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyText(
                                            item.recommendedTags.join(', '),
                                            `${item.id}-tags`
                                          )
                                        }
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white cursor-pointer"
                                      >
                                        {copiedId === `${item.id}-tags` ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" />
                                            <span>Copied Tags!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copy Comma-Separated</span>
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                      {item.recommendedTags.map((tag, tagIdx) => (
                                        <span
                                          key={tagIdx}
                                          className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                                    {item.matchedVideo && (
                                      <div className="flex items-center gap-3 pb-2.5 border-b border-slate-800/80">
                                        {item.matchedVideo.thumbnailUrl && (
                                          <img
                                            src={item.matchedVideo.thumbnailUrl}
                                            alt={item.matchedVideo.title}
                                            className="w-16 h-10 object-cover rounded border border-slate-800 shrink-0"
                                          />
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <a
                                            href={item.matchedVideo.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] font-bold text-white hover:text-rose-300 truncate block"
                                          >
                                            {item.matchedVideo.title}
                                          </a>
                                          <div className="text-[10px] text-slate-400 font-mono truncate">
                                            {item.matchedVideo.channelTitle} · {item.matchedVideo.publishedText} · {item.matchedVideo.lengthText}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-slate-400 text-[11px]">
                                          Views vs. Channel Subs
                                        </div>
                                        <div className="font-mono font-bold text-white mt-0.5">
                                          {item.avgTopVideoViews.toLocaleString()} views /{' '}
                                          {item.avgTopChannelSubs.toLocaleString()} subs
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => onOpenWebKeywordPlanner(item.keyword)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-[11px] cursor-pointer"
                                      >
                                        <span>Web SERP Scan</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

