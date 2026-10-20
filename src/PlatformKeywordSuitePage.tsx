import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Zap,
  ShoppingBag,
  Video,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  HelpCircle,
  Share2,
  Globe,
  Building2,
} from 'lucide-react';
import { PlatformType, PlatformKeywordItem, PlatformExplorerResponse } from './types';
import { PLATFORM_TOOLS, PlatformToolMeta } from './platformToolsData';

interface PlatformKeywordSuitePageProps {
  initialPlatform?: PlatformType;
  initialQuery?: string;
  onNavigatePlatform?: (platform: PlatformType) => void;
  onBackToHome: () => void;
  onOpenWebKeywordPlanner: (seed: string) => void;
}

const GEO_MARKETS = [
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'UK', label: '🇬🇧 United Kingdom' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'NG', label: '🇳🇬 Nigeria' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'BR', label: '🇧🇷 Brazil' },
  { code: 'AE', label: '🇦🇪 UAE' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'MX', label: '🇲🇽 Mexico' },
  { code: 'ZA', label: '🇿🇦 South Africa' },
  { code: 'ES', label: '🇪🇸 Spain' },
  { code: 'IT', label: '🇮🇹 Italy' },
];

export default function PlatformKeywordSuitePage({
  initialPlatform = 'amazon',
  initialQuery,
  onNavigatePlatform,
  onBackToHome,
  onOpenWebKeywordPlanner,
}: PlatformKeywordSuitePageProps) {
  const [currentPlatform, setCurrentPlatform] = useState<PlatformType>(
    initialPlatform === 'google' ? 'amazon' : initialPlatform
  );
  const toolMeta: PlatformToolMeta = PLATFORM_TOOLS[currentPlatform] || PLATFORM_TOOLS.amazon;

  const [seedInput, setSeedInput] = useState<string>(
    initialQuery || toolMeta.starterSeeds[0] || ''
  );
  const [targetCity, setTargetCity] = useState<string>('');
  const [selectedGeo, setSelectedGeo] = useState<string>('US');

  const [activeQuery, setActiveQuery] = useState<string>(
    initialQuery || toolMeta.starterSeeds[0] || ''
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<PlatformExplorerResponse | null>(null);

  // Filters & sorting
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [selectedIntent, setSelectedIntent] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'opportunity' | 'volume' | 'competition' | 'cpc'>('opportunity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const runPlatformSearch = async (
    platformToRun: PlatformType,
    queryToRun: string,
    overrideGeo?: string,
    overrideCity?: string
  ) => {
    const clean = queryToRun.trim();
    if (!clean) {
      setErrorMsg('Please enter a seed keyword or service to analyze.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setActiveQuery(clean);

    const geoToUse = overrideGeo !== undefined ? overrideGeo : selectedGeo;
    const cityToUse = overrideCity !== undefined ? overrideCity : targetCity;

    try {
      const res = await fetch('/api/platform/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: clean,
          platform: platformToRun,
          geo: geoToUse,
          targetLocation: cityToUse,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const resData: PlatformExplorerResponse = await res.json();
      setData(resData);
      setSelectedIds(new Set(resData.keywords.map((k) => k.id)));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch platform search queries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run initial search
    const seed = initialQuery || toolMeta.starterSeeds[0] || '';
    setSeedInput(seed);
    runPlatformSearch(currentPlatform, seed);
  }, [currentPlatform]);

  const handleSwitchPlatform = (newPlatform: PlatformType) => {
    if (newPlatform === currentPlatform) return;
    setCurrentPlatform(newPlatform);
    if (onNavigatePlatform) {
      onNavigatePlatform(newPlatform);
    }
    const meta = PLATFORM_TOOLS[newPlatform];
    const newSeed = meta.starterSeeds[0] || seedInput;
    setSeedInput(newSeed);
    runPlatformSearch(newPlatform, newSeed);

    // Update browser URL silently without reload
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', meta.slug);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.keywords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.keywords.map((k) => k.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredKeywords = useMemo(() => {
    if (!data) return [];
    return data.keywords
      .filter((k) => {
        if (filterQuery) {
          const q = filterQuery.toLowerCase();
          if (!k.keyword.toLowerCase().includes(q) && !k.intent.toLowerCase().includes(q)) {
            return false;
          }
        }
        if (selectedIntent !== 'ALL' && k.intent !== selectedIntent) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'opportunity') diff = b.opportunityScore - a.opportunityScore;
        else if (sortBy === 'volume') diff = b.monthlySearchesEst - a.monthlySearchesEst;
        else if (sortBy === 'competition') diff = a.competitionScore - b.competitionScore;
        else if (sortBy === 'cpc') diff = b.estimatedCpcOrRpm - a.estimatedCpcOrRpm;
        return sortDir === 'asc' ? -diff : diff;
      });
  }, [data, filterQuery, selectedIntent, sortBy, sortDir]);

  const distinctIntents = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.keywords.map((k) => k.intent)));
  }, [data]);

  // Export CSV
  const handleExportCsv = () => {
    if (!data || filteredKeywords.length === 0) return;
    const rows = [
      ['Keyword', 'Platform', 'Estimated Monthly Searches', 'Competition', 'Competition Score', 'Estimated CPC/RPM ($)', 'Intent', 'Opportunity Score', 'Rationale'],
      ...filteredKeywords.map((k) => [
        `"${k.keyword.replace(/"/g, '""')}"`,
        k.platform,
        k.monthlySearchesEst,
        k.competition,
        k.competitionScore,
        k.estimatedCpcOrRpm,
        `"${k.intent}"`,
        k.opportunityScore,
        `"${k.rationale.replace(/"/g, '""')}"`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentPlatform}-keywords-${activeQuery.replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formatted tags / backend terms for 1-click copy
  const formattedPlatformTags = useMemo(() => {
    if (!data) return '';
    const selectedList = data.keywords.filter((k) => selectedIds.has(k.id));
    const kws = selectedList.length > 0 ? selectedList.map((k) => k.keyword) : data.keywords.map((k) => k.keyword);

    if (currentPlatform === 'tiktok') {
      return kws.map((k) => '#' + k.replace(/[^a-zA-Z0-9]/g, '')).join(' ');
    }
    if (currentPlatform === 'etsy') {
      return kws
        .slice(0, 13)
        .map((k) => (k.length > 20 ? k.substring(0, 20) : k))
        .join(', ');
    }
    if (currentPlatform === 'amazon') {
      const joined = Array.from(
        new Set(
          kws
            .join(' ')
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 2)
        )
      ).join(' ');
      return joined.length > 249 ? joined.substring(0, 246) : joined;
    }
    return kws.join(', ');
  }, [data, selectedIds, currentPlatform]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Clean Sub-Nav & Touch-Friendly Horizontal Platform Switcher */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBackToHome}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>← Home</span>
            </button>
            <span className="text-slate-700">/</span>
            <span className="text-slate-300 font-semibold">{toolMeta.name}</span>
          </div>

          {/* Touch-Friendly Horizontal Platform Tabs */}
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs min-w-max">
              <button
                type="button"
                onClick={() => handleSwitchPlatform('amazon')}
                className={`whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentPlatform === 'amazon'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Amazon</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPlatform('tiktok')}
                className={`whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentPlatform === 'tiktok'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>TikTok</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPlatform('etsy')}
                className={`whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentPlatform === 'etsy'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Etsy</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPlatform('local')}
                className={`whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentPlatform === 'local'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Local SEO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('serpgpt:navigate', { detail: 'youtube-keyword-tool' }));
                  }
                }}
                className="whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>YouTube</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-4 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* Neat Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>{toolMeta.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {toolMeta.h1}
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {toolMeta.tagline}
          </p>

          {/* Clean, Mobile-Optimized Search Bar */}
          <div className="pt-2 sm:pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runPlatformSearch(currentPlatform, seedInput);
              }}
              className="relative max-w-3xl mx-auto flex flex-col gap-2.5 shadow-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-3 text-left transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                {/* Seed Query Input */}
                <div className={`flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition-colors ${currentPlatform === 'local' ? 'md:col-span-5' : 'md:col-span-8'}`}>
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    placeholder={currentPlatform === 'local' ? 'Service or Business (e.g. plumber, dentist, lawyer)' : toolMeta.heroPlaceholder}
                    className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm font-medium min-w-0"
                  />
                  {seedInput && (
                    <button
                      type="button"
                      onClick={() => setSeedInput('')}
                      className="text-slate-500 hover:text-slate-300 px-1 text-xs shrink-0 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Target City/Area Input (Local SEO) */}
                {currentPlatform === 'local' && (
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-emerald-500 transition-colors md:col-span-4">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      value={targetCity}
                      onChange={(e) => setTargetCity(e.target.value)}
                      placeholder="Target City / Area (e.g. Lagos, Miami, London)"
                      className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm font-medium min-w-0"
                    />
                    {targetCity && (
                      <button
                        type="button"
                        onClick={() => setTargetCity('')}
                        className="text-slate-500 hover:text-slate-300 px-1 text-xs shrink-0 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* Geo Country Selector */}
                <div className={`flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition-colors ${currentPlatform === 'local' ? 'md:col-span-3' : 'md:col-span-4'}`}>
                  <Globe className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <select
                    value={selectedGeo}
                    onChange={(e) => {
                      setSelectedGeo(e.target.value);
                      runPlatformSearch(currentPlatform, seedInput, e.target.value);
                    }}
                    className="w-full bg-transparent text-slate-200 focus:outline-none text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    {GEO_MARKETS.map((m) => (
                      <option key={m.code} value={m.code} className="bg-slate-900 text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching Live Completion API...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Search {currentPlatform === 'local' ? 'Local SEO Keywords' : currentPlatform === 'etsy' ? 'Etsy Buyer Tags' : `${currentPlatform.toUpperCase()} Keywords`}</span>
                  </>
                )}
              </button>
            </form>

            {/* Trending Starter Seeds */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-slate-400">
              <span className="text-slate-500 font-medium mr-1">Trending:</span>
              {toolMeta.starterSeeds.map((seed) => (
                <button
                  key={seed}
                  onClick={() => {
                    setSeedInput(seed);
                    runPlatformSearch(currentPlatform, seed);
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => runPlatformSearch(currentPlatform, seedInput)}
              className="underline hover:text-white font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Live Metrics Banner */}
        {data && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Total Monthly Reach</div>
              <div className="text-2xl font-bold text-white mt-1">
                {data.platformStats.totalVolumeEst.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-1">Estimated search impressions</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Low Competition</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {data.platformStats.lowCompetitionPercent}%
              </div>
              <div className="text-xs text-slate-500 mt-1">High-opportunity terms</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Buyer Intent Score</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">
                {data.platformStats.commercialIntentScore}/100
              </div>
              <div className="text-xs text-slate-500 mt-1">Conversion likelihood</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Top Detected Category</div>
              <div className="text-lg font-bold text-amber-300 mt-1 truncate">
                {data.platformStats.topCategoryOrNiche}
              </div>
              <div className="text-xs text-slate-500 mt-1">{data.totalResults} keywords found</div>
            </div>
          </div>
        )}

        {/* Ready-to-Paste Formatted Tags & Export Center */}
        {data && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-400" />
                  {currentPlatform === 'amazon' && 'Amazon 249-Byte Backend Search Terms'}
                  {currentPlatform === 'tiktok' && 'Viral TikTok Hashtag Block (#tag format)'}
                  {currentPlatform === 'etsy' && 'Etsy 13 Listing Tags (20-character limit verified)'}
                  {currentPlatform === 'local' && 'Local Geo Keyword Matrix'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ready to copy directly into your listing manager or video caption.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(formattedPlatformTags, 'platform-tags')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {copiedKey === 'platform-tags' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Tags</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 font-mono select-all overflow-x-auto max-h-24">
              {formattedPlatformTags || 'No keywords selected.'}
            </div>
          </div>
        )}

        {/* Cross-Platform Deep Linking Suggestions */}
        {data && data.crossPlatformRecommendations && (
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Explore across platforms:</span>
            {data.crossPlatformRecommendations.map((rec) => (
              <button
                key={rec.platform}
                onClick={() => handleSwitchPlatform(rec.platform)}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{rec.label}</span>
                <span className="text-slate-500">→</span>
              </button>
            ))}
          </div>
        )}

        {/* Filter and Table Tools */}
        {data && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Extracted {toolMeta.name} Queries</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                    {filteredKeywords.length} results
                  </span>
                </h2>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search filter input */}
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter keywords..."
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                {/* Intent Filter */}
                {distinctIntents.length > 1 && (
                  <select
                    value={selectedIntent}
                    onChange={(e) => setSelectedIntent(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Intents ({data.keywords.length})</option>
                    {distinctIntents.map((intent) => (
                      <option key={intent} value={intent}>
                        {intent}
                      </option>
                    ))}
                  </select>
                )}

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="opportunity">Sort: Opportunity Score</option>
                  <option value="volume">Sort: Search Reach</option>
                  <option value="competition">Sort: Lowest Competition</option>
                  <option value="cpc">Sort: Highest CPC / RPM</option>
                </select>

                <button
                  onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white"
                  title="Toggle Ascending/Descending"
                >
                  {sortDir === 'desc' ? '↓ High to Low' : '↑ Low to High'}
                </button>
              </div>
            </div>

            {/* Keyword Data Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === data.keywords.length && data.keywords.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Search Query</th>
                      <th className="py-3 px-4">Intent & Category</th>
                      <th className="py-3 px-4 text-right">Estimated Reach</th>
                      <th className="py-3 px-4 text-center">Competition</th>
                      <th className="py-3 px-4 text-right">Est. CPC / Value</th>
                      <th className="py-3 px-4 text-center">Opportunity</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredKeywords.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          selectedIds.has(item.id) ? 'bg-indigo-950/15' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-100 text-sm">{item.keyword}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">{item.rationale}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-medium">
                            {item.intent}
                          </span>
                          <div className="text-slate-500 text-[11px] mt-1">{item.category}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-200">
                          {item.monthlySearchesEst.toLocaleString()} /mo
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              item.competition === 'LOW'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.competition === 'MEDIUM'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {item.competition} ({item.competitionScore}/100)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-300">
                          ${item.estimatedCpcOrRpm.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-indigo-400">
                            <span>{item.opportunityScore}</span>
                            <span className="text-[10px] text-slate-500">/100</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopy(item.keyword, item.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Copy keyword"
                            >
                              {copiedKey === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => onOpenWebKeywordPlanner(item.keyword)}
                              className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                              title="Explore in Google Keyword Planner"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Guide & Ranking Blueprint Section */}
        <div className="mt-16 pt-12 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                How to Rank #1 on {toolMeta.name.replace('Free ', '')}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Understanding the key search ranking algorithm signals that drive organic visibility and conversions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {toolMeta.rankingFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">{rf.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{rf.desc}</p>
                </div>
              ))}
            </div>

            {/* Platform FAQs Accordion */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3">
                {toolMeta.faqs.map((faq, idx) => {
                  const isOpen = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
