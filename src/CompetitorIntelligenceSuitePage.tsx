import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  ArrowUpRight,
  Download,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Layers,
  Globe,
  TrendingUp,
  FolderTree,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  COMPETITOR_MASTER_BLUEPRINTS,
  CompetitorMasterPageBlueprint,
  findCompetitorBlueprintByPath,
} from './competitorArchitectureData';
import { triggerFileDownload, slugify } from './exportUtils';

interface CompetitorIntelligenceSuitePageProps {
  activeSlug: string;
  onSelectBlueprintSlug: (slug: string) => void;
  onLaunchKeywordScan: (seedKeyword: string) => void;
  onLaunchSitemapExtractor?: () => void;
  onBackToHome: () => void;
}

interface SiteProfileData {
  domain: string;
  crawledUrl: string;
  crawlStatus: string;
  title: string;
  metaDescription: string;
  h1: string;
  detectedNiche: string;
  extractedTopics: string[];
  domainAuthority: number;
}

interface CompetitorDomainProfile {
  name?: string;
  domain: string;
  liveTitle?: string;
  liveDescription?: string;
  similarityScore: number;
  estMonthlyTraffic: number;
  estOrganicKeywords: number;
  avgCpc: number;
  estMonthlyTrafficValue: number;
  domainAuthority: number;
  referringDomains: number;
  topSharedKeywords: string[];
  topLandingPage: string;
  paidAdHeadline: string;
  estMonthlyAdSpend: number;
}

interface KeywordGapRecord {
  keyword: string;
  monthlySearches: number;
  cpc: number;
  competitionIndex: number;
  competitorRank: number;
  competitorDomain: string;
  gapType: 'Missing Keyword' | 'Weak Competitor Page' | 'High-CPC Spy Keyword';
  intent: 'Commercial' | 'Transactional' | 'Informational';
}

export default function CompetitorIntelligenceSuitePage({
  activeSlug,
  onSelectBlueprintSlug,
  onLaunchKeywordScan,
  onLaunchSitemapExtractor,
  onBackToHome,
}: CompetitorIntelligenceSuitePageProps) {
  const activeBlueprint: CompetitorMasterPageBlueprint = useMemo(() => {
    return findCompetitorBlueprintByPath(activeSlug) || COMPETITOR_MASTER_BLUEPRINTS[0];
  }, [activeSlug]);

  const [targetInput, setTargetInput] = useState<string>('');
  const [vsTargetA, setVsTargetA] = useState<string>('');
  const [vsTargetB, setVsTargetB] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<{
    target: string;
    siteProfile: SiteProfileData | null;
    competitors: CompetitorDomainProfile[];
    keywordGaps: KeywordGapRecord[];
  }>({
    target: '',
    siteProfile: null,
    competitors: [],
    keywordGaps: [],
  });
  const [scanError, setScanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'competitors' | 'keyword-gaps' | 'ad-sales-finder' | 'vs-matrix'
  >('competitors');
  const [gapFilter, setGapFilter] = useState<'ALL' | KeywordGapRecord['gapType']>('ALL');
  const [dbSearchFilter, setDbSearchFilter] = useState<string>('');
  const [maxCompCap, setMaxCompCap] = useState<number>(25);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [copiedFlag, setCopiedFlag] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Sync active tool tab with the active blueprint's defaultToolMode when route changes
  useEffect(() => {
    const mode = activeBlueprint.defaultToolMode;
    if (mode === 'competitor-finder' || mode === 'backlink-keyword-spy' || mode === 'comparable-tools') {
      setActiveTab('competitors');
    } else if (mode === 'keyword-gap-checker' || mode === 'low-comp-records') {
      setActiveTab('keyword-gaps');
    } else if (mode === 'vs-comparison') {
      setActiveTab('vs-matrix');
    } else if (mode === 'best-spy-shortlist') {
      setActiveTab('ad-sales-finder');
    }
  }, [activeBlueprint]);

  // Inject dynamic <title>, <meta name="description">, <meta name="keywords">, and JSON-LD into <head>
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${activeBlueprint.pageTitle} | SERPgpt.pro`;

    const setMetaTag = (selector: string, attr: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          const propMatch = selector.match(/property="([^"]+)"/);
          if (propMatch) el.setAttribute('property', propMatch[1]);
        } else if (selector.includes('name=')) {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) el.setAttribute('name', nameMatch[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    const allKw = [activeBlueprint.primaryKeyword, ...activeBlueprint.cannibalizationTermsMerged].join(', ');
    setMetaTag('meta[name="description"]', 'content', activeBlueprint.rationale);
    setMetaTag('meta[name="keywords"]', 'content', allKw);
    setMetaTag('meta[property="og:title"]', 'content', activeBlueprint.pageTitle);
    setMetaTag('meta[property="og:description"]', 'content', activeBlueprint.rationale);
    setMetaTag('meta[property="og:url"]', 'content', `https://serpgpt.pro${activeBlueprint.urlSlug}`);

    const scriptId = 'serpgpt-competitor-blueprint-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type':
            activeBlueprint.editorialDirectives.schemaMarkupType === 'Table'
              ? 'TechArticle'
              : activeBlueprint.editorialDirectives.schemaMarkupType,
          headline: activeBlueprint.h1,
          name: activeBlueprint.pageTitle,
          description: activeBlueprint.rationale,
          url: `https://serpgpt.pro${activeBlueprint.urlSlug}`,
          keywords: allKw,
          author: {
            '@type': 'Organization',
            name: 'SERPgpt.pro',
            url: 'https://serpgpt.pro',
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: activeBlueprint.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
      ],
    });

    return () => {
      document.title = prevTitle;
    };
  }, [activeBlueprint]);

  const filteredGaps = useMemo(() => {
    return analysisData.keywordGaps.filter((g) => {
      if (gapFilter !== 'ALL' && g.gapType !== gapFilter) return false;
      if (g.competitionIndex > maxCompCap) return false;
      if (dbSearchFilter && !g.keyword.toLowerCase().includes(dbSearchFilter.toLowerCase())) return false;
      return true;
    });
  }, [analysisData.keywordGaps, gapFilter, maxCompCap, dbSearchFilter]);

  const selectedVsCompetitor = useMemo(() => {
    if (analysisData.competitors.length === 0) return null;
    const match = analysisData.competitors.find(
      (c) => c.domain.toLowerCase() === vsTargetB.trim().toLowerCase()
    );
    return match || analysisData.competitors[0];
  }, [analysisData.competitors, vsTargetB]);

  const handleRunCompetitorScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = targetInput.trim();
    if (!clean) {
      setScanError('Please enter a website domain, URL, or brand name to analyze.');
      return;
    }
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await fetch('/api/competitor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: clean }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || `Failed to analyze competitor (${res.status})`);
      }
      const comps: CompetitorDomainProfile[] = Array.isArray(json.competitors) ? json.competitors : [];
      const resolvedTarget = json.target || clean;
      setAnalysisData({
        target: resolvedTarget,
        siteProfile: json.siteProfile || null,
        competitors: comps,
        keywordGaps: Array.isArray(json.keywordGaps) ? json.keywordGaps : [],
      });
      setVsTargetA(resolvedTarget);
      if (comps[0]?.domain) {
        setVsTargetB(comps[0].domain);
      }
    } catch (err: any) {
      setScanError(err?.message || 'Failed to analyze competitor domain.');
      setAnalysisData({ target: clean, siteProfile: null, competitors: [], keywordGaps: [] });
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportCompetitorsCsv = () => {
    if (analysisData.competitors.length === 0) return;
    const headers = [
      'Competitor Domain',
      'Website Title',
      'Similarity (%)',
      'Est Monthly Organic Traffic',
      'Est Organic Keywords',
      'Avg CPC (USD)',
      'Est Monthly Traffic Value (USD)',
      'Domain Authority (0-100)',
      'Referring Domains',
      'Top Shared Keywords',
    ];
    const rows = analysisData.competitors.map((c) => [
      `"${c.domain}"`,
      `"${(c.liveTitle || '').replace(/"/g, '""')}"`,
      c.similarityScore,
      c.estMonthlyTraffic,
      c.estOrganicKeywords,
      c.avgCpc.toFixed(2),
      c.estMonthlyTrafficValue,
      c.domainAuthority,
      c.referringDomains,
      `"${c.topSharedKeywords.join('; ')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerFileDownload(
      csv,
      `competitors-${slugify(analysisData.target || 'scan')}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const handleCopyTable = () => {
    if (analysisData.competitors.length === 0) return;
    const text = analysisData.competitors
      .map(
        (c) =>
          `${c.domain}\tSimilarity: ${c.similarityScore}%\tTraffic: ${c.estMonthlyTraffic.toLocaleString()}/mo\tKeywords: ${c.estOrganicKeywords.toLocaleString()}\tDA: ${c.domainAuthority}`
      )
      .join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedFlag(true);
      setTimeout(() => setCopiedFlag(false), 1800);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <span className="text-slate-400">{activeBlueprint.pillarCategory}</span>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <span className="font-semibold text-indigo-400">{activeBlueprint.h1}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onLaunchKeywordScan(
                analysisData.siteProfile?.detectedNiche || activeBlueprint.primaryKeyword
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-300 hover:text-white transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open in Free Keyword Explorer</span>
          </button>
          {onLaunchSitemapExtractor && (
            <button
              type="button"
              onClick={onLaunchSitemapExtractor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-emerald-300 hover:text-white transition-colors cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extract Competitor Sitemap</span>
            </button>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-4xl mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
          <span className="text-emerald-400 font-semibold">{activeBlueprint.pageArchetype}</span>
          <span aria-hidden="true">·</span>
          <span>Primary Topic: {activeBlueprint.primaryKeyword}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 [text-wrap:balance]">
          {activeBlueprint.h1}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {activeBlueprint.rationale}
        </p>
      </div>

      {/* 7-Page Pillar & Blueprint Switcher Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-6">
        <div className="text-[11px] font-semibold text-slate-400 mb-2 px-1">
          Competitor Intelligence &amp; Keyword Spy Suite (7 Consolidated Hubs):
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {COMPETITOR_MASTER_BLUEPRINTS.map((bp) => {
            const isCurrent = bp.urlSlug.toLowerCase() === activeBlueprint.urlSlug.toLowerCase();
            return (
              <button
                key={bp.id}
                type="button"
                onClick={() => onSelectBlueprintSlug(bp.urlSlug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {bp.primaryKeyword}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Website Crawler & Competitor Lookup Command Bar */}
      <form
        onSubmit={handleRunCompetitorScan}
        className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Enter any website domain or URL (e.g. serpgpt.pro, cal.com, linear.app, stripe.com)..."
              aria-label="Website domain or URL input"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crawling Site &amp; Competitors...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Scan Website &amp; Find Competitors</span>
              </>
            )}
          </button>
        </div>

        {scanError && (
          <div className="mt-3 px-3.5 py-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
            {scanError}
          </div>
        )}
      </form>

      {/* LIVE WEBSITE INTELLIGENCE & TOPIC X-RAY CARD */}
      {analysisData.siteProfile && (
        <div className="bg-slate-900/95 border border-indigo-500/30 rounded-xl p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {analysisData.siteProfile.crawlStatus}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-indigo-300">
                {analysisData.siteProfile.crawledUrl}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-300">
                Detected Niche:{' '}
                <strong className="text-emerald-400">{analysisData.siteProfile.detectedNiche}</strong>
              </span>
              <span className="text-sky-400 font-semibold">
                DA {analysisData.siteProfile.domainAuthority}/100
              </span>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white mb-1">
            {analysisData.siteProfile.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {analysisData.siteProfile.metaDescription}
          </p>

          {analysisData.siteProfile.extractedTopics.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-2">
                Extracted Website Topics &amp; Core Search Intent (Click any topic to run a full keyword scan):
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {analysisData.siteProfile.extractedTopics.map((topic, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => onLaunchKeywordScan(topic)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 hover:bg-indigo-950/70 border border-slate-800 hover:border-indigo-500/50 text-xs text-indigo-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Search className="w-3 h-3 text-indigo-400" />
                    <span>{topic}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Workbench Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
          {[
            {
              id: 'competitors',
              label: `1. Direct Competitors (${analysisData.competitors.length})`,
            },
            {
              id: 'keyword-gaps',
              label: `2. Relevant Website Keywords (${analysisData.keywordGaps.length})`,
            },
            {
              id: 'ad-sales-finder',
              label: '3. Competitor Positioning & Funnels',
            },
            {
              id: 'vs-matrix',
              label: '4. Head-to-Head Domain Compare',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {analysisData.competitors.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTable}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {copiedFlag ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy Data</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportCompetitorsCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State before user scans a website */}
      {!analysisData.target && !isScanning && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center mb-10">
          <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white mb-1">
            Enter Any Website Domain Above to Crawl Its Niche, Competitors &amp; Relevant Keywords
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Our backend crawls the live HTML, title, meta description, and headings of the target website to understand what it is about, discovers its real-world competitors in that exact niche, and extracts live low-competition keywords.
          </p>
        </div>
      )}

      {/* =====================================================================
          TAB 1: COMPETITOR FINDER & BACKLINK / KEYWORD OVERLAP TABLE
         ===================================================================== */}
      {analysisData.target && activeTab === 'competitors' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden mb-10">
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Direct Niche Competitors &amp; Domain Overlap for{' '}
                <span className="text-indigo-400">{analysisData.target}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Discovered from {analysisData.target}&apos;s live niche (
                <strong className="text-slate-200">
                  {analysisData.siteProfile?.detectedNiche || analysisData.target}
                </strong>
                ), Google Autocomplete competitor graphs, and OpenPageRank Domain Authority.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {analysisData.competitors.length} Direct Competitors Found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4">Competitor Domain, Live Positioning &amp; Shared Keywords</th>
                  <th className="py-3 px-3 text-right">Overlap</th>
                  <th className="py-3 px-3 text-right">Organic Traffic</th>
                  <th className="py-3 px-3 text-right">Keywords</th>
                  <th className="py-3 px-3 text-right">Authority &amp; Backlinks</th>
                  <th className="py-3 px-3 text-right">Traffic Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {analysisData.competitors.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-white">{comp.domain}</div>
                      {comp.liveTitle && (
                        <div className="text-xs text-slate-300 truncate mt-0.5">{comp.liveTitle}</div>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                        {comp.topSharedKeywords.map((kw, kIdx) => (
                          <React.Fragment key={kIdx}>
                            {kIdx > 0 && <span aria-hidden="true">·</span>}
                            <button
                              type="button"
                              onClick={() => onLaunchKeywordScan(kw)}
                              className="text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
                            >
                              {kw}
                            </button>
                          </React.Fragment>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-emerald-400 font-semibold whitespace-nowrap">
                      {comp.similarityScore}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-white whitespace-nowrap">
                      {comp.estMonthlyTraffic.toLocaleString()}/mo
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-200 whitespace-nowrap">
                      {comp.estOrganicKeywords.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                      <div className="text-sky-400 font-semibold">DA {comp.domainAuthority}/100</div>
                      <div className="text-[11px] text-slate-400">
                        {comp.referringDomains.toLocaleString()} ref domains
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-emerald-400 font-semibold whitespace-nowrap">
                      ${comp.estMonthlyTrafficValue.toLocaleString()}/mo
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setVsTargetA(analysisData.target);
                            setVsTargetB(comp.domain);
                            setActiveTab('vs-matrix');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                        >
                          Compare VS
                        </button>
                        <button
                          type="button"
                          onClick={() => onLaunchKeywordScan(comp.topSharedKeywords[0] || comp.domain)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          Spy Keywords
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: RELEVANT WEBSITE KEYWORDS & COMPETITOR GAP MATRIX
         ===================================================================== */}
      {analysisData.target && activeTab === 'keyword-gaps' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden mb-10">
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Relevant Website Keywords &amp; Low-Competition Gap Matrix for{' '}
                <span className="text-indigo-400">{analysisData.target}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Harvested from {analysisData.target}&apos;s crawled topics (
                {analysisData.siteProfile?.extractedTopics.slice(0, 3).join(', ') || analysisData.target})
                and live Google Autocomplete buyer-intent expansions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={dbSearchFilter}
                onChange={(e) => setDbSearchFilter(e.target.value)}
                placeholder="Filter keywords..."
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {(['ALL', 'High-CPC Spy Keyword', 'Missing Keyword', 'Weak Competitor Page'] as const).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGapFilter(type)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      gapFilter === type
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {type === 'ALL' ? 'All Keywords' : type}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4">Relevant Website / Competitor Keyword</th>
                  <th className="py-3 px-3">Classification &amp; Intent</th>
                  <th className="py-3 px-3 text-right">Monthly Volume</th>
                  <th className="py-3 px-3 text-right">Google Ads CPC</th>
                  <th className="py-3 px-3 text-right">Comp Index</th>
                  <th className="py-3 px-3 text-right">Matched Competitor</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredGaps.map((gap, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{gap.keyword}</td>
                    <td className="py-3.5 px-3 text-xs">
                      <span className="text-indigo-300 font-medium">{gap.gapType}</span>
                      <span className="text-slate-600 mx-1.5" aria-hidden="true">·</span>
                      <span className="text-slate-400">{gap.intent}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-white whitespace-nowrap">
                      {gap.monthlySearches.toLocaleString()}/mo
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-emerald-400 font-bold whitespace-nowrap">
                      ${gap.cpc.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono whitespace-nowrap">
                      <span className="text-emerald-400 font-bold">{gap.competitionIndex}</span>
                      <span className="text-xs text-slate-500">/100</span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-xs text-slate-300 whitespace-nowrap">
                      #{gap.competitorRank} ({gap.competitorDomain})
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onLaunchKeywordScan(gap.keyword)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        <span>Analyze Keyword</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: COMPETITOR POSITIONING, HEADLINES & FUNNEL TRACKER
         ===================================================================== */}
      {analysisData.target && activeTab === 'ad-sales-finder' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 mb-10">
          <div className="pb-4 border-b border-slate-800 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white">
                Competitor Homepage Positioning &amp; Funnel Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect the live homepage titles, meta descriptions, landing URLs, and commercial CPC bids of {analysisData.target}&apos;s top competitors.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">Live Crawled Competitor Metadata</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisData.competitors.map((comp, idx) => (
              <div
                key={idx}
                className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                    <span className="font-bold text-indigo-400">{comp.domain}</span>
                    <span className="font-mono text-emerald-400">
                      Est. Ad Value: ${comp.estMonthlyAdSpend.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1.5">{comp.paidAdHeadline}</div>
                  {comp.liveDescription && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                      {comp.liveDescription}
                    </p>
                  )}
                  <div className="text-xs text-slate-400 font-mono truncate mb-3">
                    Landing URL: {comp.topLandingPage}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400">
                    Avg CPC Bid: <strong className="text-emerald-400 font-mono">${comp.avgCpc.toFixed(2)}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onLaunchKeywordScan(comp.topSharedKeywords[0] || comp.domain)}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    <span>Scan &ldquo;{comp.topSharedKeywords[0] || comp.domain}&rdquo;</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: DYNAMIC HEAD-TO-HEAD COMPETITOR COMPARISON (VS) MATRIX
         ===================================================================== */}
      {analysisData.target && activeTab === 'vs-matrix' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 mb-10">
          <div className="pb-4 border-b border-slate-800 mb-5">
            <h2 className="text-base font-bold text-white">
              Live Head-to-Head Domain Comparison ({analysisData.target} vs{' '}
              {selectedVsCompetitor?.domain || 'Competitor'})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your crawled target website side-by-side against any discovered competitor in your niche.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Scanned Target Website</label>
                <input
                  type="text"
                  value={vsTargetA || analysisData.target}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-emerald-400 font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Discovered Competitor to Compare</label>
                <select
                  value={selectedVsCompetitor?.domain || ''}
                  onChange={(e) => setVsTargetB(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  {analysisData.competitors.map((c) => (
                    <option key={c.domain} value={c.domain}>
                      {c.domain} (Overlap: {c.similarityScore}% · DA {c.domainAuthority})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedVsCompetitor && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 bg-slate-950/60">
                    <th className="py-3 px-4">Comparison Dimension</th>
                    <th className="py-3 px-4 text-emerald-400">{analysisData.target}</th>
                    <th className="py-3 px-4 text-indigo-300">{selectedVsCompetitor.domain}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-sm">
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-300">Live Website Title</td>
                    <td className="py-3 px-4 text-slate-200">
                      {analysisData.siteProfile?.title || analysisData.target}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {selectedVsCompetitor.liveTitle || selectedVsCompetitor.domain}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-300">Detected Primary Niche</td>
                    <td className="py-3 px-4 text-emerald-300 font-semibold">
                      {analysisData.siteProfile?.detectedNiche || 'Primary Target'}
                    </td>
                    <td className="py-3 px-4 text-indigo-300">
                      {selectedVsCompetitor.similarityScore}% Niche Overlap
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-300">OpenPageRank Domain Authority</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      DA {analysisData.siteProfile?.domainAuthority ?? 42}/100
                    </td>
                    <td className="py-3 px-4 font-mono text-sky-400 font-bold">
                      DA {selectedVsCompetitor.domainAuthority}/100 ({selectedVsCompetitor.referringDomains.toLocaleString()} ref domains)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-300">Est. Monthly Organic Traffic &amp; Keywords</td>
                    <td className="py-3 px-4 font-mono text-slate-200">
                      {analysisData.keywordGaps.length} priority keyword opportunities identified
                    </td>
                    <td className="py-3 px-4 font-mono text-white">
                      {selectedVsCompetitor.estMonthlyTraffic.toLocaleString()}/mo ({selectedVsCompetitor.estOrganicKeywords.toLocaleString()} keywords)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-300">Core Target Keywords</td>
                    <td className="py-3 px-4 text-xs text-emerald-300">
                      {(analysisData.siteProfile?.extractedTopics || []).slice(0, 4).join(' · ')}
                    </td>
                    <td className="py-3 px-4 text-xs text-indigo-300">
                      {selectedVsCompetitor.topSharedKeywords.join(' · ')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          AUTHORITATIVE EDITORIAL GUIDE & METHODOLOGY SECTIONS FOR THIS PAGE
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeBlueprint.subheadingsHierarchy.map((sec, idx) => (
            <section
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7"
            >
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3">{sec.heading}</h2>
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                {sec.editorialParagraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
              {sec.keyTakeaways.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                  {sec.keyTakeaways.map((takeaway, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-2 text-xs text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Frequently Asked Questions */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7">
            <h2 className="text-lg font-bold text-white mb-4">
              Frequently Asked Questions About {activeBlueprint.h1}
            </h2>
            <div className="space-y-3">
              {activeBlueprint.faqs.map((faq, fIdx) => {
                const isOpen = openFaqIdx === fIdx;
                return (
                  <div
                    key={fIdx}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : fIdx)}
                      className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-sm font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Related Pillar Pages & Quick Keyword Clusters */}
        <aside className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-1">
              All 7 Competitor &amp; Spy Hub Pages
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Explore all 5 pillars in our consolidated Competitor Intelligence suite:
            </p>
            <div className="space-y-2">
              {COMPETITOR_MASTER_BLUEPRINTS.map((bp) => {
                const isCurrent = bp.urlSlug === activeBlueprint.urlSlug;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => onSelectBlueprintSlug(bp.urlSlug)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-950/60 border-indigo-500/60 text-white'
                        : 'bg-slate-950/80 border-slate-800/90 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{bp.h1}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {bp.pageArchetype} · {bp.totalMonthlyVolume.toLocaleString()}/mo
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">
              High-Value Keywords Covered in This Guide
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Click any topic below to launch a live Google Ads CPC &amp; low-competition scan:
            </p>
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {activeBlueprint.keywordTree.map((kt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onLaunchKeywordScan(kt.keyword)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <span className="text-xs text-slate-200 group-hover:text-indigo-300 truncate">
                    {kt.keyword}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                    {kt.monthlySearches.toLocaleString()}/mo
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
