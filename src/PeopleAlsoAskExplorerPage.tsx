import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  HelpCircle,
  Search,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Code,
  FileText,
  Compass,
  ArrowRight,
  Zap,
  Globe,
  Share2,
  Layers,
  Network,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image,
  Eye,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  Flame,
  ShieldCheck,
  CornerDownRight,
  PlayCircle,
  BarChart3,
} from 'lucide-react';
import { PaaQuestionTreeResponse, PaaQuestionItem } from './types';

interface PeopleAlsoAskExplorerPageProps {
  initialSeed?: string;
  onBackToHome: () => void;
  onOpenWebKeywordPlanner: (seed: string) => void;
}

const STEM_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; hex: string; iconText: string; angle: number }
> = {
  what: {
    label: 'WHAT',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    hex: '#a855f7',
    iconText: '💡',
    angle: -Math.PI / 2, // Top (12 o'clock)
  },
  why: {
    label: 'WHY',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hex: '#3b82f6',
    iconText: '❓',
    angle: -Math.PI / 4, // Top-Right (1:30)
  },
  how: {
    label: 'HOW',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hex: '#10b981',
    iconText: '🛠️',
    angle: 0, // Right (3 o'clock)
  },
  where: {
    label: 'WHERE',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    hex: '#f59e0b',
    iconText: '📍',
    angle: Math.PI / 4, // Bottom-Right (4:30)
  },
  who: {
    label: 'WHO',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    hex: '#f43f5e',
    iconText: '👤',
    angle: Math.PI / 2, // Bottom (6 o'clock)
  },
  which: {
    label: 'WHICH',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    hex: '#06b6d4',
    iconText: '⚖️',
    angle: (3 * Math.PI) / 4, // Bottom-Left (7:30)
  },
  when: {
    label: 'WHEN',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    hex: '#f97316',
    iconText: '⏱️',
    angle: Math.PI, // Left (9 o'clock)
  },
  can_are: {
    label: 'CAN / ARE',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    hex: '#6366f1',
    iconText: '🛡️',
    angle: (-3 * Math.PI) / 4, // Top-Left (10:30)
  },
};

const STARTER_SEEDS = [
  { term: 'crm software', category: 'SaaS & Tech' },
  { term: 'dropshipping', category: 'E-commerce' },
  { term: 'personal injury lawyer', category: 'Legal & Local' },
  { term: 'ketogenic diet', category: 'Health & Diet' },
  { term: 'ai resume builder', category: 'AI Tools' },
  { term: 'real estate investing', category: 'Finance' },
];

const GEO_COUNTRIES = [
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', label: 'Canada', flag: '🇨🇦' },
  { code: 'AU', label: 'Australia', flag: '🇦🇺' },
  { code: 'DE', label: 'Germany', flag: '🇩🇪' },
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'IN', label: 'India', flag: '🇮🇳' },
];

export default function PeopleAlsoAskExplorerPage({
  initialSeed = 'crm software',
  onBackToHome,
  onOpenWebKeywordPlanner,
}: PeopleAlsoAskExplorerPageProps) {
  const [seedInput, setSeedInput] = useState<string>(initialSeed);
  const [activeQuery, setActiveQuery] = useState<string>(initialSeed);
  const [selectedGeo, setSelectedGeo] = useState<string>('US');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<PaaQuestionTreeResponse | null>(null);

  // View modes: wheel (radial), mindmap (grid), cards (table), prepositions, serp_sim (SERP simulator)
  const [viewMode, setViewMode] = useState<'wheel' | 'mindmap' | 'cards' | 'prepositions' | 'serp_sim'>('wheel');
  const [wheelStyle, setWheelStyle] = useState<'radial' | 'columns'>('radial');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedHoverQuestion, setSelectedHoverQuestion] = useState<PaaQuestionItem | null>(null);
  const [activeStemTab, setActiveStemTab] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [intentFilter, setIntentFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [serpDeviceMode, setSerpDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [openSerpItemIndex, setOpenSerpItemIndex] = useState<number | null>(0);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const runPaaExploration = async (targetSeed: string, geoCode: string = selectedGeo) => {
    const clean = targetSeed.trim();
    if (!clean) {
      setErrorMsg('Please enter a topic or keyword.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setActiveQuery(clean);

    try {
      const res = await fetch('/api/paa/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-test': '1' },
        body: JSON.stringify({ query: clean, geo: geoCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to explore PAA questions (${res.status})`);
      }
      setTreeData(data);
      if (data.allQuestions && data.allQuestions.length > 0) {
        setExpandedQuestionId(data.allQuestions[0].id);
        setSelectedHoverQuestion(data.allQuestions[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch People Also Ask questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPaaExploration(initialSeed, selectedGeo);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleExportCsv = () => {
    if (!treeData || treeData.allQuestions.length === 0) return;
    const rows = [
      ['Question', 'Stem', 'Estimated Monthly Volume', 'Competition', 'Competition Score', 'Intent', 'Featured Snippet Candidate', 'Direct Answer Snippet'],
      ...treeData.allQuestions.map((q) => [
        `"${q.question.replace(/"/g, '""')}"`,
        q.stem,
        q.monthlySearchesEst,
        q.competition,
        q.competitionScore,
        `"${q.intent}"`,
        q.isFeaturedSnippetCandidate ? 'Yes' : 'No',
        `"${(q.directAnswerSnippet || '').replace(/"/g, '""')}"`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `serpgpt-paa-tree-${activeQuery.replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export SVG Radial Wheel to PNG image
  const handleExportWheelImage = async (format: 'png' | 'svg') => {
    if (!svgRef.current) return;
    setIsExportingImage(true);
    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      // Add namespaces if missing
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      if (format === 'svg') {
        const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `serpgpt-question-wheel-${activeQuery.replace(/\s+/g, '-')}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');

        // Fill background
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, 2400, 2400);

        // Watermark header and branding
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('SERPgpt.pro — Free AnswerThePublic Alternative', 80, 100);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px sans-serif';
        ctx.fillText(`Topic: "${activeQuery.toUpperCase()}" • ${treeData?.totalQuestions || 0} Questions • Generated Live`, 80, 145);

        const img = new window.Image();
        const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Draw centered on 2400x2400 canvas
            ctx.drawImage(img, 100, 180, 2200, 2140);
            resolve(true);
          };
          img.onerror = reject;
          img.src = url;
        });

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `serpgpt-question-wheel-${activeQuery.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Failed to export wheel image:', e);
      alert('Could not export image. Please try again or download CSV.');
    } finally {
      setIsExportingImage(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    if (!treeData) return [];
    return treeData.allQuestions.filter((q) => {
      if (activeStemTab !== 'all' && q.stem !== activeStemTab) return false;
      if (intentFilter !== 'all' && q.intent.toLowerCase() !== intentFilter.toLowerCase()) return false;
      if (filterQuery) {
        const queryLower = filterQuery.toLowerCase();
        return q.question.toLowerCase().includes(queryLower);
      }
      return true;
    });
  }, [treeData, activeStemTab, intentFilter, filterQuery]);

  // Generate Radial Wheel Geometry
  const wheelData = useMemo(() => {
    if (!treeData) return null;
    const branches = treeData.questionBranches;
    const stems = Object.keys(STEM_CONFIG);
    const stemRadius = 185;
    const leafRadius = 410;

    const stemNodes: Array<{
      key: string;
      label: string;
      color: string;
      hex: string;
      iconText: string;
      x: number;
      y: number;
      angle: number;
      questions: Array<PaaQuestionItem & { leafX: number; leafY: number; angle: number }>;
    }> = [];

    stems.forEach((stemKey) => {
      const config = STEM_CONFIG[stemKey];
      const rawQs = (branches as any)[stemKey] || [];
      const angle = config.angle;
      const x = stemRadius * Math.cos(angle);
      const y = stemRadius * Math.sin(angle);

      // Distribute questions in sector around stem angle (+/- 18 degrees)
      const qCount = rawQs.length;
      const sectorSpread = 0.35; // radians (~20 deg each side)
      const qsWithCoords = rawQs.map((q: PaaQuestionItem, idx: number) => {
        const offset = qCount > 1 ? ((idx - (qCount - 1) / 2) / ((qCount - 1) / 2)) * sectorSpread : 0;
        const qAngle = angle + offset;
        const leafX = leafRadius * Math.cos(qAngle);
        const leafY = leafRadius * Math.sin(qAngle);
        return {
          ...q,
          leafX,
          leafY,
          angle: qAngle,
        };
      });

      stemNodes.push({
        key: stemKey,
        label: config.label,
        color: config.color,
        hex: config.hex,
        iconText: config.iconText,
        x,
        y,
        angle,
        questions: qsWithCoords,
      });
    });

    return { stemNodes };
  }, [treeData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-28">
      {/* Clean Sub-Nav */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>← Home</span>
            </button>
            <span className="text-slate-700">/</span>
            <span className="text-purple-300 font-semibold">People Also Ask &amp; Question Tree</span>
          </div>

          <button
            onClick={() => onOpenWebKeywordPlanner(activeQuery)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keyword Planner</span>
          </button>
        </div>
      </div>

      {/* Hero Banner with Search Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-4 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* Neat Compact Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Google "People Also Ask" Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            People Also Ask &amp; Question Tree
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Extract customer questions clustered by <strong className="text-purple-300">What, Why, How, Where &amp; Can</strong> with interactive visual radial wheel and 1-click FAQ Schema.
          </p>

          {/* Interactive Mobile-Optimized Search Bar & Geo Selector */}
          <div className="pt-2 sm:pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runPaaExploration(seedInput, selectedGeo);
              }}
              className="relative max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center shadow-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-2 gap-2 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all"
            >
              <div className="flex items-center flex-1 min-w-0 bg-slate-950/60 sm:bg-transparent rounded-xl px-2 py-1 sm:p-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 ml-2 shrink-0" />
                <input
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="Enter topic: crm software, dropshipping, keto..."
                  className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-sm sm:text-base font-medium min-w-0"
                />
                {seedInput && (
                  <button
                    type="button"
                    onClick={() => setSeedInput('')}
                    className="text-slate-500 hover:text-slate-300 px-2 py-1 text-xs shrink-0 cursor-pointer"
                    aria-label="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {/* Country Geo Selector */}
                <select
                  value={selectedGeo}
                  onChange={(e) => {
                    const nextGeo = e.target.value;
                    setSelectedGeo(nextGeo);
                    runPaaExploration(seedInput || activeQuery, nextGeo);
                  }}
                  className="px-2.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer shrink-0 min-h-[44px]"
                >
                  {GEO_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Network className="w-4 h-4" />
                      <span>Explore Tree</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Trending Starter Seeds */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
              <span className="text-slate-500 font-medium">Quick Topics:</span>
              {STARTER_SEEDS.map((s) => (
                <button
                  key={s.term}
                  onClick={() => {
                    setSeedInput(s.term);
                    runPaaExploration(s.term, selectedGeo);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 hover:text-white transition-colors cursor-pointer"
                >
                  {s.term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => runPaaExploration(seedInput, selectedGeo)}
              className="underline hover:text-white font-medium cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Live Metrics Summary Cards */}
        {treeData && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Discovered Questions</span>
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {treeData.totalQuestions}
              </div>
              <div className="text-[11px] text-purple-400 mt-1">Across 8 Google Question Stems</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Estimated Monthly Search Demand</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                {treeData.summary.totalMonthlyVolume.toLocaleString()} /mo
              </div>
              <div className="text-[11px] text-slate-500 mt-1">High-intent organic inquiries</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Featured Snippet Targets</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1">
                {treeData.summary.featuredSnippetCount} Prime
              </div>
              <div className="text-[11px] text-slate-500 mt-1">40-55 word direct answer candidates</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Average Keyword Difficulty</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
                {treeData.summary.avgCompetitionScore} / 100
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Low KD long-tail ranking opportunity</div>
            </div>
          </div>
        )}

        {/* 1-Click Action & Schema Hub */}
        {treeData && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-500/20 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>1-Click Schema.org FAQPage (JSON-LD) &amp; Visual Presentation Exports</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Valid Google structured data ready to paste into your CMS, plus high-res radial wheel image download for client audits.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleExportWheelImage('png')}
                  disabled={isExportingImage}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  title="Download circular question wheel as high-resolution PNG"
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>Download Wheel (PNG)</span>
                </button>

                <button
                  onClick={() => handleCopy(treeData.readyToPasteFaqSchema, 'faq-schema')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {copiedKey === 'faq-schema' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Schema!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy FAQ Schema (JSON-LD)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopy(treeData.readyToPasteMarkdown, 'markdown-faq')}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedKey === 'markdown-faq' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Markdown!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Switcher & Filter Controls */}
        {treeData && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
            {/* View Mode Navigation Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('wheel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'wheel'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Radial Question Wheel</span>
              </button>

              <button
                onClick={() => setViewMode('mindmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'mindmap'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Stem Cards Grid</span>
              </button>

              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Data Table ({treeData.allQuestions.length})</span>
              </button>

              <button
                onClick={() => setViewMode('prepositions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'prepositions'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Prepositions &amp; Vs</span>
              </button>

              <button
                onClick={() => setViewMode('serp_sim')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'serp_sim'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Google SERP Preview</span>
              </button>
            </div>

            {/* Filter and Search within questions */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Search Intents</option>
                <option value="informational">Informational</option>
                <option value="commercial">Commercial / Comparison</option>
                <option value="transactional">Transactional</option>
                <option value="troubleshooting">Troubleshooting</option>
              </select>

              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter questions..."
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-44 sm:w-56"
              />
            </div>
          </div>
        )}

        {/* 1. VISUAL RADIAL QUESTION WHEEL (ANSWERTHETPUBLIC STYLE SVG CANVAS) */}
        {treeData && viewMode === 'wheel' && wheelData && (
          <div className="mt-8 space-y-6">
            {/* Visual Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interactive AnswerThePublic Radial Wheel</span>
                </span>
                <span className="text-xs text-slate-500">• Hover nodes to preview snippet • Click to drill down</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400 min-w-10 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <button
                  onClick={() => handleExportWheelImage('png')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>
                <button
                  onClick={() => handleExportWheelImage('svg')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer border border-slate-700"
                >
                  <span>SVG</span>
                </button>
              </div>
            </div>

            {/* The SVG Radial Wheel Container */}
            <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl flex items-center justify-center p-4 min-h-[680px]">
              {/* Background ambient radial glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08)_0,rgba(3,7,18,0)_70%)] pointer-events-none" />

              <div
                className="transition-transform duration-200 ease-out origin-center"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <svg
                  ref={svgRef}
                  viewBox="-600 -600 1200 1200"
                  className="w-[880px] h-[880px] sm:w-[1050px] sm:h-[1050px] select-none"
                >
                  <defs>
                    {/* Glowing Filters */}
                    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                      <stop offset="70%" stopColor="#4c1d95" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1e1b4b" stopOpacity="1" />
                    </radialGradient>
                  </defs>

                  {/* Concentric Decorative Orbit Circles */}
                  <circle cx="0" cy="0" r="185" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
                  <circle cx="0" cy="0" r="410" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 7" opacity="0.3" />

                  {/* Connecting Bezier Branches from Stems to Questions */}
                  {wheelData.stemNodes.map((stem) => {
                    return stem.questions.map((q) => {
                      const isHovered = selectedHoverQuestion?.id === q.id;
                      // Cubic bezier with radial control points
                      const cp1x = (185 + 60) * Math.cos(stem.angle);
                      const cp1y = (185 + 60) * Math.sin(stem.angle);
                      const cp2x = (410 - 70) * Math.cos(q.angle);
                      const cp2y = (410 - 70) * Math.sin(q.angle);
                      const pathD = `M ${stem.x} ${stem.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${q.leafX} ${q.leafY}`;

                      return (
                        <g key={`branch-${q.id}`}>
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isHovered ? stem.hex : '#334155'}
                            strokeWidth={isHovered ? 2.5 : 1.2}
                            strokeOpacity={isHovered ? 1 : 0.45}
                            className="transition-all duration-150"
                          />
                        </g>
                      );
                    });
                  })}

                  {/* Spoke Connectors from Center to 8 Stem Nodes */}
                  {wheelData.stemNodes.map((stem) => (
                    <line
                      key={`spoke-${stem.key}`}
                      x1="0"
                      y1="0"
                      x2={stem.x}
                      y2={stem.y}
                      stroke={stem.hex}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                    />
                  ))}

                  {/* Question Leaf Nodes and Labels */}
                  {wheelData.stemNodes.map((stem) => {
                    return stem.questions.map((q) => {
                      const isHovered = selectedHoverQuestion?.id === q.id;
                      const isRightSide = q.leafX >= 0;
                      const textAnchor = isRightSide ? 'start' : 'end';
                      const textX = isRightSide ? q.leafX + 10 : q.leafX - 10;
                      const textY = q.leafY + 4;

                      // Truncate long display text in wheel for readability
                      const displayTitle = q.question.length > 38 ? q.question.slice(0, 36) + '...' : q.question;

                      return (
                        <g
                          key={`leaf-${q.id}`}
                          className="cursor-pointer group"
                          onMouseEnter={() => setSelectedHoverQuestion(q)}
                          onClick={() => {
                            setSelectedHoverQuestion(q);
                            setExpandedQuestionId(q.id);
                          }}
                        >
                          {/* Dot Circle Node */}
                          <circle
                            cx={q.leafX}
                            cy={q.leafY}
                            r={isHovered ? 6 : 4}
                            fill={stem.hex}
                            stroke="#0f172a"
                            strokeWidth="2"
                            className="transition-all duration-150"
                          />

                          {/* Hover outline ring */}
                          {isHovered && (
                            <circle
                              cx={q.leafX}
                              cy={q.leafY}
                              r="10"
                              fill="none"
                              stroke={stem.hex}
                              strokeWidth="1.5"
                              opacity="0.8"
                            />
                          )}

                          {/* Text Label */}
                          <text
                            x={textX}
                            y={textY}
                            textAnchor={textAnchor}
                            fill={isHovered ? '#ffffff' : '#cbd5e1'}
                            fontSize={isHovered ? '11px' : '10px'}
                            fontWeight={isHovered ? '700' : '500'}
                            className="transition-all duration-150 drop-shadow"
                          >
                            {displayTitle}
                          </text>
                        </g>
                      );
                    });
                  })}

                  {/* 8 Question Stem Middle Ring Badges */}
                  {wheelData.stemNodes.map((stem) => (
                    <g key={`stem-node-${stem.key}`} className="cursor-pointer">
                      <circle
                        cx={stem.x}
                        cy={stem.y}
                        r="32"
                        fill="#090d16"
                        stroke={stem.hex}
                        strokeWidth="2.5"
                        filter="url(#neon-glow)"
                      />
                      <circle cx={stem.x} cy={stem.y} r="28" fill="#0f172a" />
                      <text
                        x={stem.x}
                        y={stem.y - 4}
                        textAnchor="middle"
                        fontSize="14px"
                      >
                        {stem.iconText}
                      </text>
                      <text
                        x={stem.x}
                        y={stem.y + 12}
                        textAnchor="middle"
                        fill={stem.hex}
                        fontSize="9px"
                        fontWeight="900"
                        letterSpacing="0.5px"
                      >
                        {stem.label}
                      </text>
                    </g>
                  ))}

                  {/* Central Topic Node */}
                  <g className="cursor-pointer">
                    <circle
                      cx="0"
                      cy="0"
                      r="65"
                      fill="url(#centerGradient)"
                      stroke="#c084fc"
                      strokeWidth="3"
                      filter="url(#neon-glow)"
                    />
                    <circle cx="0" cy="0" r="54" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                    <text
                      x="0"
                      y="-12"
                      textAnchor="middle"
                      fill="#d8b4fe"
                      fontSize="9px"
                      fontWeight="800"
                      letterSpacing="1px"
                    >
                      TOPIC NODE
                    </text>
                    <text
                      x="0"
                      y="8"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="14px"
                      fontWeight="900"
                    >
                      {activeQuery.length > 18 ? activeQuery.slice(0, 16) + '..' : activeQuery}
                    </text>
                    <text
                      x="0"
                      y="26"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9px"
                      fontWeight="600"
                    >
                      {treeData.totalQuestions} Questions
                    </text>
                  </g>
                </svg>
              </div>

              {/* Floating Interactive Question Inspector Card */}
              {selectedHoverQuestion && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-purple-500/30 shadow-2xl space-y-3 z-20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                        {selectedHoverQuestion.stem.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        {selectedHoverQuestion.monthlySearchesEst.toLocaleString()} /mo
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedHoverQuestion.competition === 'LOW'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      KD {selectedHoverQuestion.competitionScore}/100
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {selectedHoverQuestion.question}
                  </h4>

                  <p className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                    <span className="text-[10px] text-purple-400 font-semibold block mb-0.5">
                      Target Featured Snippet Answer:
                    </span>
                    {selectedHoverQuestion.directAnswerSnippet}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleCopy(selectedHoverQuestion.question, 'float-q')}
                      className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'float-q' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'float-q' ? 'Copied' : 'Copy Question'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSeedInput(selectedHoverQuestion.question.replace(/\?$/, ''));
                        runPaaExploration(selectedHoverQuestion.question.replace(/\?$/, ''), selectedGeo);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Drill Deeper</span>
                    </button>

                    <button
                      onClick={() => onOpenWebKeywordPlanner(selectedHoverQuestion.question)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Planner</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CATEGORIZED STEM CARDS GRID VIEW */}
        {treeData && viewMode === 'mindmap' && (
          <div className="mt-8 space-y-8">
            <div className="text-center">
              <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/30 shadow-xl">
                <span className="text-xs uppercase tracking-wider text-purple-300 font-semibold">
                  Core Topic Node
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white capitalize mt-0.5">
                  "{activeQuery}"
                </h2>
                <div className="text-xs text-slate-400 mt-1">
                  8 Question Stems • {treeData.totalQuestions} Questions Harvested Live ({selectedGeo})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Object.entries(treeData.questionBranches).map(([stemKey, questions]) => {
                const config = STEM_CONFIG[stemKey] || {
                  label: stemKey.toUpperCase(),
                  color: 'text-indigo-400',
                  bg: 'bg-indigo-500/10',
                  border: 'border-indigo-500/30',
                  iconText: '❓',
                };

                const visibleList = questions.filter(
                  (q) => !filterQuery || q.question.toLowerCase().includes(filterQuery.toLowerCase())
                );

                if (visibleList.length === 0) return null;

                return (
                  <div
                    key={stemKey}
                    className={`rounded-2xl border ${config.border} bg-slate-900/70 p-5 flex flex-col justify-between shadow-lg hover:border-purple-500/50 transition-all`}
                  >
                    <div>
                      {/* Stem Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config.iconText}</span>
                          <span className={`font-black text-sm tracking-wider ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                          {visibleList.length} Qs
                        </span>
                      </div>

                      {/* Question Branches List */}
                      <div className="mt-3.5 space-y-2.5">
                        {visibleList.map((q) => {
                          const isExpanded = expandedQuestionId === q.id;
                          return (
                            <div
                              key={q.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isExpanded
                                  ? 'bg-slate-800/90 border-purple-500/50'
                                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                              }`}
                            >
                              <div
                                onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                                className="flex items-start justify-between gap-2 cursor-pointer"
                              >
                                <span className="text-xs font-semibold text-slate-100 hover:text-purple-300 leading-snug">
                                  {q.question}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-400">
                                <span className="font-mono text-emerald-400 font-semibold">
                                  {q.monthlySearchesEst.toLocaleString()} /mo
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {q.intent}
                                </span>
                              </div>

                              {/* Expanded Direct Answer Snippet & Drill Down */}
                              {isExpanded && (
                                <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 space-y-2">
                                  <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/40">
                                    <div className="text-[10px] text-purple-400 font-semibold mb-1 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      <span>Featured Snippet Target Answer:</span>
                                    </div>
                                    {q.directAnswerSnippet}
                                  </div>

                                  <div className="flex items-center justify-between gap-2 text-xs">
                                    <button
                                      onClick={() => handleCopy(q.question, q.id)}
                                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-medium"
                                    >
                                      {copiedKey === q.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="text-emerald-400">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSeedInput(q.question.replace(/\?$/, ''));
                                        runPaaExploration(q.question.replace(/\?$/, ''), selectedGeo);
                                      }}
                                      className="text-xs text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                                      title="Explore questions branching from this question"
                                    >
                                      <CornerDownRight className="w-3 h-3" />
                                      <span>Drill Down</span>
                                    </button>

                                    <button
                                      onClick={() => onOpenWebKeywordPlanner(q.question)}
                                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Planner</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DATA TABLE VIEW */}
        {treeData && viewMode === 'cards' && (
          <div className="mt-8 space-y-4">
            {/* Stem Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveStemTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeStemTab === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Stems ({treeData.allQuestions.length})
              </button>

              {Object.keys(treeData.questionBranches).map((stemKey) => {
                const config = STEM_CONFIG[stemKey] || { label: stemKey.toUpperCase() };
                const count = (treeData.questionBranches as any)[stemKey]?.length || 0;
                return (
                  <button
                    key={stemKey}
                    onClick={() => setActiveStemTab(stemKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeStemTab === stemKey
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Questions Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">People Also Ask Question</th>
                      <th className="py-3 px-4">Stem</th>
                      <th className="py-3 px-4 text-right">Estimated Reach</th>
                      <th className="py-3 px-4 text-center">Competition</th>
                      <th className="py-3 px-4">Search Intent</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredQuestions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-white max-w-md">
                          <div>{q.question}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {q.directAnswerSnippet}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 text-[11px] font-semibold">
                            {q.stem}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-200">
                          {q.monthlySearchesEst.toLocaleString()} /mo
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              q.competition === 'LOW'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {q.competition} ({q.competitionScore}/100)
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[11px] font-medium">
                            {q.intent}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopy(q.question, q.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Copy question"
                            >
                              {copiedKey === q.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setSeedInput(q.question.replace(/\?$/, ''));
                                runPaaExploration(q.question.replace(/\?$/, ''), selectedGeo);
                              }}
                              className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white transition-colors cursor-pointer"
                              title="Explore deep question tree"
                            >
                              <CornerDownRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onOpenWebKeywordPlanner(q.question)}
                              className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                              title="Analyze in Google Keyword Planner"
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

        {/* 4. PREPOSITIONS & COMPARISONS VIEW */}
        {treeData && viewMode === 'prepositions' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.entries(treeData.prepositionBranches).map(([prepKey, items]) => (
              <div
                key={prepKey}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    {prepKey === 'versus' ? 'VS / COMPARISONS' : `${prepKey.toUpperCase()}`}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {items.length} terms
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200 font-medium">{item.question}</span>
                      <button
                        onClick={() => handleCopy(item.question, item.id)}
                        className="p-1 rounded text-slate-500 hover:text-white cursor-pointer"
                        title="Copy"
                      >
                        {copiedKey === item.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. LIVE GOOGLE SERP PAA SIMULATOR */}
        {treeData && viewMode === 'serp_sim' && (
          <div className="mt-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>Google Desktop &amp; Mobile SERP Feature Simulator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  See how Google renders the "People Also Ask" accordion on real search result pages.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSerpDeviceMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    serpDeviceMode === 'desktop' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setSerpDeviceMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    serpDeviceMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Google SERP Card Preview */}
            <div
              className={`mx-auto rounded-3xl border border-slate-800 bg-[#202124] text-slate-100 p-6 shadow-2xl transition-all ${
                serpDeviceMode === 'mobile' ? 'max-w-md' : 'w-full'
              }`}
            >
              {/* Google Search Header Simulation */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700/60 mb-5 text-xs text-slate-400">
                <div className="font-bold text-white flex items-center gap-1">
                  <span className="text-blue-400 font-black">G</span>
                  <span className="text-red-400 font-black">o</span>
                  <span className="text-amber-400 font-black">o</span>
                  <span className="text-blue-400 font-black">g</span>
                  <span className="text-green-400 font-black">l</span>
                  <span className="text-red-400 font-black">e</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#303134] text-slate-200 border border-slate-600/50 flex-1 truncate font-mono">
                  {activeQuery}
                </div>
              </div>

              {/* People Also Ask SERP Accordion Box */}
              <div className="rounded-2xl border border-slate-700 bg-[#303134]/40 overflow-hidden">
                <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">People also ask</h4>
                  <span className="text-xs text-slate-400">Google SERP Feature</span>
                </div>

                <div className="divide-y divide-slate-700/60">
                  {treeData.allQuestions.slice(0, 6).map((q, idx) => {
                    const isOpen = openSerpItemIndex === idx;
                    return (
                      <div key={q.id} className="transition-colors">
                        <button
                          onClick={() => setOpenSerpItemIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between text-sm text-slate-200 hover:text-white font-medium cursor-pointer"
                        >
                          <span>{q.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 space-y-3 bg-[#202124]/60 text-xs">
                            <p className="text-slate-300 leading-relaxed font-normal">
                              {q.directAnswerSnippet}
                            </p>

                            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 underline font-medium cursor-pointer">
                                  https://yourdomain.com &gt; {activeQuery.replace(/\s+/g, '-')} &gt; faq
                                </span>
                              </div>
                              <span className="text-slate-500 font-mono">Rank #1 Snippet</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Comparison Matrix: AnswerThePublic vs. SERPgpt.pro */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">
                Honest Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Why SERPgpt is the #1 Free AnswerThePublic Alternative
              </h2>
              <p className="text-slate-400 text-sm">
                No paywalls, no forced daily query throttles, and no watermarks on your client reports.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Feature / Metric</th>
                    <th className="py-3.5 px-4 font-bold text-purple-400 bg-purple-950/20">
                      SERPgpt PAA Explorer
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-slate-500">
                      AnswerThePublic (Paid)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Monthly Subscription</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-purple-950/10">$0 / Month (100% Free)</td>
                    <td className="py-3 px-4 text-slate-400">$99 / Month</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Daily Search Limit</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-purple-950/10">Unlimited Searches</td>
                    <td className="py-3 px-4 text-slate-400">1 to 2 free searches/day</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Schema.org FAQPage (JSON-LD)</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-purple-950/10">1-Click Instant Copy</td>
                    <td className="py-3 px-4 text-slate-400">Not Available</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Radial Question Wheel Export</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-purple-950/10">High-Res PNG &amp; SVG (No Watermark)</td>
                    <td className="py-3 px-4 text-slate-400">Watermarked on free tier</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Sign-Up &amp; Credit Card Required</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-purple-950/10">Never (Zero Friction)</td>
                    <td className="py-3 px-4 text-slate-400">Email &amp; Credit card capture</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Algorithm & SEO Strategy Guide (High E-E-A-T and Ranking Strategy) */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                How to Rank in Google's "People Also Ask" Boxes
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                People Also Ask snippets account for over 52% of Google SERPs. Follow this 3-step blueprint to rank in position #0.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  1
                </div>
                <h3 className="text-base font-bold text-white pt-1">Exact Match H2 / H3 Headings</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use the exact PAA question as an `&lt;h2&gt;` or `&lt;h3&gt;` subheading on your target URL. Google NLP prioritizes question-formatted headings.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  2
                </div>
                <h3 className="text-base font-bold text-white pt-1">The 45-Word Snippet Target</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide a concise, direct answer in 40 to 55 words immediately below the heading before expanding with lists or data tables.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  3
                </div>
                <h3 className="text-base font-bold text-white pt-1">FAQPage Schema Structured Data</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Embed our generated Schema.org FAQPage JSON-LD in your &lt;head&gt; tag. Googlebot reads this to confirm direct answer authenticity.
                </p>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <span>Frequently Asked Questions about PAA &amp; AnswerThePublic</span>
              </h3>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaqIndex(expandedFaqIndex === 0 ? null : 0)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>How is this tool a 100% free alternative to AnswerThePublic and AlsoAsked?</span>
                    {expandedFaqIndex === 0 ? (
                      <ChevronUp className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {expandedFaqIndex === 0 && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      AnswerThePublic limits free users to 1 or 2 daily searches and forces an expensive subscription. SERPgpt's PAA Explorer is 100% free with unlimited searches, real-time Google Autocomplete streams across all 8 question stems, and instant FAQ Schema generator without credit card or login.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaqIndex(expandedFaqIndex === 1 ? null : 1)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Can I paste the generated FAQ Schema directly into WordPress, Webflow, or Shopify?</span>
                    {expandedFaqIndex === 1 ? (
                      <ChevronUp className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {expandedFaqIndex === 1 && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      Yes! Click "Copy FAQ Schema (JSON-LD)" and paste the snippet directly into your page's Custom HTML block, WordPress header script, or theme editor. It complies with official Google Schema.org standards.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaqIndex(expandedFaqIndex === 2 ? null : 2)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>How can I download the circular question wheel for client presentations?</span>
                    {expandedFaqIndex === 2 ? (
                      <ChevronUp className="w-4 h-4 text-purple-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  {expandedFaqIndex === 2 && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      Simply click "Download Wheel (PNG)" or "SVG" at the top of the canvas. The tool generates a clean, high-resolution vector or 2400x2400 graphic with zero watermarks, perfect for client SEO pitch decks and content roadmaps.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
