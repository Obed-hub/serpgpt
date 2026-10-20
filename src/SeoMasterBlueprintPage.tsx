import React, { useState, useEffect, useMemo } from 'react';
import { SEO_MASTER_PAGES, MasterSeoPageData } from './seoMasterPagesData';
import {
  generateDatabaseRecordsForPage,
  generateProcessStepsForPage,
} from './backgroundPageBuilder';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Database,
  SlidersHorizontal,
  ListChecks,
  Calculator,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  Layers,
} from 'lucide-react';

interface SeoMasterBlueprintPageProps {
  activeSlug: string;
  publishedPages?: MasterSeoPageData[];
  onSelectMasterSlug: (slug: string) => void;
  onLaunchLiveKeywordScan: (seedKeyword: string) => void;
  onBackToWorkbench: () => void;
}

type InteractiveWidgetMode = 'database' | 'compare' | 'process' | 'calculator';

function detectDefaultWidgetMode(slug: string, schemaType: string): InteractiveWidgetMode {
  const clean = slug.toLowerCase();
  if (
    clean.startsWith('/database/') ||
    clean.startsWith('/directory/') ||
    clean.startsWith('/listings/') ||
    schemaType === 'Dataset'
  ) {
    return 'database';
  }
  if (
    clean.startsWith('/process/') ||
    clean.startsWith('/learn/') ||
    clean.startsWith('/guides/') ||
    clean.startsWith('/troubleshooting/') ||
    schemaType === 'HowTo'
  ) {
    return 'process';
  }
  if (
    clean.startsWith('/compare/') ||
    clean.startsWith('/best/') ||
    clean.startsWith('/alternatives/') ||
    clean.startsWith('/reviews/') ||
    clean.startsWith('/benchmarks/') ||
    schemaType === 'Review' ||
    schemaType === 'Table'
  ) {
    return 'compare';
  }
  return 'calculator';
}

export default function SeoMasterBlueprintPage({
  activeSlug,
  publishedPages = SEO_MASTER_PAGES,
  onSelectMasterSlug,
  onLaunchLiveKeywordScan,
  onBackToWorkbench,
}: SeoMasterBlueprintPageProps) {
  const allPages = useMemo(() => {
    const map = new Map<string, MasterSeoPageData>();
    publishedPages.forEach((p) => map.set(p.slug.toLowerCase(), p));
    SEO_MASTER_PAGES.forEach((p) => {
      if (!map.has(p.slug.toLowerCase())) map.set(p.slug.toLowerCase(), p);
    });
    return Array.from(map.values());
  }, [publishedPages]);

  const [remoteFetchedPage, setRemoteFetchedPage] = useState<MasterSeoPageData | null>(null);

  const currentPage: MasterSeoPageData = useMemo(() => {
    const clean = activeSlug.replace(/\/+$/, '').toLowerCase();
    const localMatch = allPages.find((p) => p.slug.toLowerCase() === clean);
    if (localMatch) return localMatch;
    if (remoteFetchedPage && remoteFetchedPage.slug.toLowerCase() === clean) {
      return remoteFetchedPage;
    }
    return allPages[0] || SEO_MASTER_PAGES[0];
  }, [activeSlug, allPages, remoteFetchedPage]);

  // Fetch from server /api/published-pages if user navigated directly to a dynamically generated slug
  useEffect(() => {
    const clean = activeSlug.replace(/\/+$/, '').toLowerCase();
    const existsLocally = allPages.some((p) => p.slug.toLowerCase() === clean);
    if (!existsLocally && clean.startsWith('/')) {
      fetch(`/api/published-pages/by-slug?slug=${encodeURIComponent(clean)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.page) {
            setRemoteFetchedPage(data.page);
          }
        })
        .catch(() => {
          // Ignore network fallback
        });
    }
  }, [activeSlug, allPages]);

  const defaultMode = useMemo(
    () => detectDefaultWidgetMode(currentPage.slug, currentPage.schemaType),
    [currentPage.slug, currentPage.schemaType]
  );
  const [activeWidgetMode, setActiveWidgetMode] = useState<InteractiveWidgetMode>(defaultMode);

  useEffect(() => {
    setActiveWidgetMode(detectDefaultWidgetMode(currentPage.slug, currentPage.schemaType));
  }, [currentPage.slug, currentPage.schemaType]);

  // 1. DATABASE WIDGET STATE (/database/...)
  const dbRecords = useMemo(() => generateDatabaseRecordsForPage(currentPage), [currentPage]);
  const [dbSearch, setDbSearch] = useState<string>('');
  const [dbIntentFilter, setDbIntentFilter] = useState<string>('ALL');
  const [dbSortField, setDbSortField] = useState<'volume' | 'cpc' | 'comp'>('volume');
  const [dbSortDesc, setDbSortDesc] = useState<boolean>(true);

  const filteredDbRecords = useMemo(() => {
    return dbRecords
      .filter((r) => {
        if (
          dbSearch &&
          !r.keywordOrTool.toLowerCase().includes(dbSearch.toLowerCase()) &&
          !r.serpWeakSpot.toLowerCase().includes(dbSearch.toLowerCase()) &&
          !r.category.toLowerCase().includes(dbSearch.toLowerCase())
        ) {
          return false;
        }
        if (dbIntentFilter !== 'ALL' && r.intent !== dbIntentFilter && r.category !== dbIntentFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const mult = dbSortDesc ? -1 : 1;
        if (dbSortField === 'volume') return (a.monthlySearches - b.monthlySearches) * mult;
        if (dbSortField === 'cpc') return (a.cpcHigh - b.cpcHigh) * mult;
        return (a.competitionIndex - b.competitionIndex) * mult;
      });
  }, [dbRecords, dbSearch, dbIntentFilter, dbSortField, dbSortDesc]);

  // 2. COMPARE / BEST WIDGET STATE
  const [accuracyWeight, setAccuracyWeight] = useState<number>(45);
  const [zeroCostWeight, setZeroCostWeight] = useState<number>(35);
  const [cpcDataWeight, setCpcDataWeight] = useState<number>(20);

  // 3. PROCESS / HOW-TO CHECKLIST STATE
  const processSteps = useMemo(() => generateProcessStepsForPage(currentPage), [currentPage]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => new Set([1]));

  // 4. CALCULATOR STATE
  const [calcVolume, setCalcVolume] = useState<number>(currentPage.totalClusterVolume);
  const [ctrShare, setCtrShare] = useState<number>(34);
  const [conversionRate, setConversionRate] = useState<number>(3.5);
  const [customSeedInput, setCustomSeedInput] = useState<string>(currentPage.primaryKeyword);

  // 5. FAQ ACCORDION & GUIDE DRAWER STATE
  const [openFaqIndices, setOpenFaqIndices] = useState<Set<number>>(() => new Set([0, 1]));
  const [showTopClusterDrawer, setShowTopClusterDrawer] = useState<boolean>(false);

  useEffect(() => {
    setCustomSeedInput(currentPage.primaryKeyword);
    setCalcVolume(currentPage.totalClusterVolume);
    setDbSearch('');
    setDbIntentFilter('ALL');
    setCompletedSteps(new Set([1]));
    setOpenFaqIndices(new Set([0, 1]));
    setShowTopClusterDrawer(false);
  }, [currentPage.slug, currentPage.primaryKeyword, currentPage.totalClusterVolume]);

  // Build JSON-LD payload for silent <head> injection (SEO structured data)
  const jsonLdPayload = useMemo(() => {
    const canonicalHref = `https://serpgpt.pro${currentPage.slug}`;
    const primarySchemaNode =
      currentPage.schemaType === 'HowTo'
        ? {
            '@type': 'HowTo',
            name: currentPage.h1,
            description: currentPage.metaDescription,
            step: currentPage.sections.map((sec, idx) => ({
              '@type': 'HowToStep',
              position: idx + 1,
              name: sec.heading,
              text: sec.summaryParagraph,
            })),
          }
        : currentPage.schemaType === 'Dataset'
        ? {
            '@type': 'Dataset',
            name: currentPage.h1,
            description: currentPage.metaDescription,
            url: canonicalHref,
            keywords: [currentPage.primaryKeyword, ...currentPage.cannibalizationTermsMerged],
            creator: {
              '@type': 'Organization',
              name: 'SERPgpt.pro',
              url: 'https://serpgpt.pro',
            },
          }
        : {
            '@type': currentPage.schemaType === 'Table' ? 'TechArticle' : currentPage.schemaType,
            headline: currentPage.h1,
            name: currentPage.pageTitle,
            description: currentPage.metaDescription,
            url: canonicalHref,
          };

    return {
      '@context': 'https://schema.org',
      '@graph': [
        primarySchemaNode,
        {
          '@type': 'SoftwareApplication',
          name: currentPage.interactiveWidgetConfig.widgetTitle,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'SERPgpt.pro',
              item: 'https://serpgpt.pro/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'SEO Guides',
              item: 'https://serpgpt.pro/free-keyword-search',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: currentPage.pageTitle,
              item: canonicalHref,
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: currentPage.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
      ],
    };
  }, [currentPage]);

  // Dynamically update document <head> title, meta description, canonical URL, and JSON-LD Schema
  useEffect(() => {
    const canonicalHref = `https://serpgpt.pro${currentPage.slug}`;
    document.title = `${currentPage.pageTitle} | SERPgpt.pro`;

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

    const allKeywords = [
      currentPage.primaryKeyword,
      ...currentPage.cannibalizationTermsMerged,
    ].join(', ');
    setMetaTag('meta[name="description"]', 'content', currentPage.metaDescription);
    setMetaTag('meta[name="keywords"]', 'content', allKeywords);
    setMetaTag('meta[property="og:title"]', 'content', currentPage.pageTitle);
    setMetaTag('meta[property="og:description"]', 'content', currentPage.metaDescription);
    setMetaTag('meta[property="og:url"]', 'content', canonicalHref);
    setMetaTag('meta[name="twitter:title"]', 'content', currentPage.pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', currentPage.metaDescription);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalHref;

    const scriptId = 'serpgpt-dynamic-master-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdPayload);
  }, [currentPage, jsonLdPayload]);

  const projectedMonthlyClicks = Math.round(calcVolume * (ctrShare / 100));
  const projectedMonthlyAdValue = Math.round(projectedMonthlyClicks * currentPage.avgClusterCpc);
  const projectedConversions = Math.round(projectedMonthlyClicks * (conversionRate / 100));

  const handleExportDatabaseCsv = () => {
    const headers = [
      'Keyword or Platform',
      'Category',
      'Intent',
      'Monthly Searches',
      'Low Bid (USD)',
      'High Bid (USD)',
      'Competition Index',
      'SERP Opportunity',
    ];
    const rows = filteredDbRecords.map((r) => [
      `"${r.keywordOrTool.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.intent,
      r.monthlySearches,
      r.cpcLow.toFixed(2),
      r.cpcHigh.toFixed(2),
      r.competitionIndex,
      `"${r.serpWeakSpot.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPage.slug.replace(/\//g, '-').replace(/^-/, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  };

  const toggleFaqOpen = (idx: number) => {
    setOpenFaqIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const completionPct = Math.round(
    (completedSteps.size / Math.max(1, processSteps.length)) * 100
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={onBackToWorkbench}
            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Keyword Explorer</span>
          </button>
          <span aria-hidden="true" className="text-slate-600">/</span>
          <span className="text-slate-400">SEO Guides</span>
        </nav>

        <button
          type="button"
          onClick={() => setShowTopClusterDrawer((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Browse All Guides ({allPages.length})</span>
          {showTopClusterDrawer ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Collapsible Guide Switcher Drawer */}
      {showTopClusterDrawer && (
        <div className="mb-6 bg-slate-900/95 border border-indigo-500/40 rounded-xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
            <span>Select a Guide to Read:</span>
            <button
              type="button"
              onClick={() => setShowTopClusterDrawer(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allPages.map((page) => {
              const isActive = page.slug === currentPage.slug;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    onSelectMasterSlug(page.slug);
                    setShowTopClusterDrawer(false);
                  }}
                  className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold line-clamp-1">{page.pageTitle}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {page.metaDescription}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN STANDALONE WEBPAGE ARTICLE */}
      <article className="space-y-8">
        {/* 1. HERO HEADER & CLEAN TABLE OF CONTENTS */}
        <header className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {currentPage.h1}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl mb-6">
            {currentPage.metaDescription}
          </p>

          {/* Clean, Well-Arranged Table of Contents */}
          <div className="pt-5 border-t border-slate-800/80">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              In This Guide
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentPage.sections.map((sec, sIdx) => (
                <a
                  key={sIdx}
                  href={`#section-${sIdx + 1}`}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-950/90 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/60 text-xs text-slate-200 hover:text-white transition-colors flex items-center gap-2.5"
                >
                  <span className="w-5 h-5 rounded-md bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {sIdx + 1}
                  </span>
                  <span className="font-medium line-clamp-1">{sec.heading}</span>
                </a>
              ))}
              {currentPage.faqs.length > 0 && (
                <a
                  href="#faq-section"
                  className="px-3.5 py-2.5 rounded-lg bg-slate-950/90 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/60 text-xs text-indigo-300 hover:text-white transition-colors flex items-center gap-2.5"
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    ?
                  </span>
                  <span className="font-medium">
                    Frequently Asked Questions ({currentPage.faqs.length})
                  </span>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* 2. INTERACTIVE TOOL & BENCHMARK STUDIO */}
        <section className="bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-5 sm:p-8 shadow-xl space-y-6">
          {/* Interactive Tool Header & Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {currentPage.interactiveWidgetConfig.widgetTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentPage.interactiveWidgetConfig.widgetSubtitle}
              </p>
            </div>

            {/* Clean Mode Switcher */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
              {defaultMode === 'process' && (
                <button
                  type="button"
                  onClick={() => setActiveWidgetMode('process')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeWidgetMode === 'process'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Step Checklist</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveWidgetMode('compare')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeWidgetMode === 'compare'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Platform Comparison</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWidgetMode('database')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeWidgetMode === 'database'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Keyword Database</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWidgetMode('calculator')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeWidgetMode === 'calculator'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Traffic &amp; ROI Calculator</span>
              </button>
            </div>
          </div>

          {/* ===============================================================
              MODE A: INTERACTIVE FILTERABLE & SEARCHABLE DATABASE TABLE
             =============================================================== */}
          {activeWidgetMode === 'database' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-grow">
                  <div className="relative flex-grow sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={dbSearch}
                      onChange={(e) => setDbSearch(e.target.value)}
                      placeholder="Filter keywords or tools..."
                      aria-label="Filter database records"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {(['ALL', 'Commercial', 'Transactional', 'Informational'] as const).map(
                    (intentOpt) => (
                      <button
                        key={intentOpt}
                        type="button"
                        onClick={() => setDbIntentFilter(intentOpt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          dbIntentFilter === intentOpt
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {intentOpt === 'ALL' ? 'All' : intentOpt}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleExportDatabaseCsv}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-900/70">
                      <th className="py-3 px-4">Keyword / Platform</th>
                      <th className="py-3 px-4">Category &amp; Intent</th>
                      <th className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (dbSortField === 'volume') setDbSortDesc((v) => !v);
                            else {
                              setDbSortField('volume');
                              setDbSortDesc(true);
                            }
                          }}
                          className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                        >
                          <span>Monthly Volume</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (dbSortField === 'cpc') setDbSortDesc((v) => !v);
                            else {
                              setDbSortField('cpc');
                              setDbSortDesc(true);
                            }
                          }}
                          className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                        >
                          <span>CPC Range</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (dbSortField === 'comp') setDbSortDesc((v) => !v);
                            else {
                              setDbSortField('comp');
                              setDbSortDesc(false);
                            }
                          }}
                          className="inline-flex items-center gap-1 hover:text-white cursor-pointer"
                        >
                          <span>Difficulty</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredDbRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{rec.keywordOrTool}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {rec.category} · <span className="text-indigo-300">{rec.intent}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                          {rec.monthlySearches.toLocaleString()}/mo
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums whitespace-nowrap">
                          ${rec.cpcLow.toFixed(2)} – ${rec.cpcHigh.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sky-400 tabular-nums whitespace-nowrap">
                          {rec.competitionIndex}/100
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onLaunchLiveKeywordScan(rec.keywordOrTool)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span>Analyze</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              MODE B: SIDE-BY-SIDE COMPARISON MATRIX & WEIGHTED VERDICT SCORER
             =============================================================== */}
          {activeWidgetMode === 'compare' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Volume Accuracy Priority</span>
                    <span className="font-mono font-bold text-indigo-400">{accuracyWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={accuracyWeight}
                    onChange={(e) => setAccuracyWeight(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Free / No-Signup Priority</span>
                    <span className="font-mono font-bold text-emerald-400">{zeroCostWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={zeroCostWeight}
                    onChange={(e) => setZeroCostWeight(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>CPC &amp; Arbitrage Data Priority</span>
                    <span className="font-mono font-bold text-sky-400">{cpcDataWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={cpcDataWeight}
                    onChange={(e) => setCpcDataWeight(Number(e.target.value))}
                    className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 bg-slate-900/70">
                      <th className="py-3 px-4">Platform / Method</th>
                      <th className="py-3 px-4">Search Volume Data</th>
                      <th className="py-3 px-4">Access Requirement</th>
                      <th className="py-3 px-4">CPC &amp; SERP Insights</th>
                      <th className="py-3 px-4">Cost</th>
                      <th className="py-3 px-4 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {currentPage.interactiveWidgetConfig.platformsCompared.map((row, rIdx) => {
                      const baseScore = parseInt(row.verdictScore, 10) || 85;
                      const isFree = row.monthlyCost.includes('$0');
                      const dynamicScore = Math.min(
                        99,
                        Math.max(
                          52,
                          Math.round(
                            baseScore +
                              (isFree ? (zeroCostWeight - 35) * 0.15 : -(zeroCostWeight - 35) * 0.25) +
                              (rIdx === 0 ? (accuracyWeight - 45) * 0.1 : -(cpcDataWeight - 20) * 0.15)
                          )
                        )
                      );
                      return (
                        <tr
                          key={rIdx}
                          className={
                            rIdx === 0 ? 'bg-indigo-950/25 font-medium' : 'hover:bg-slate-900/40'
                          }
                        >
                          <td className="py-3 px-4 font-bold text-white">{row.name}</td>
                          <td className="py-3 px-4 text-slate-200">{row.exactVolumeAccess}</td>
                          <td className="py-3 px-4 text-slate-300">{row.requiresCreditCard}</td>
                          <td className="py-3 px-4 text-emerald-300">{row.cpcArbitrageData}</td>
                          <td className="py-3 px-4 font-mono text-slate-200 whitespace-nowrap">{row.monthlyCost}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums whitespace-nowrap">
                            {dynamicScore}/100
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              MODE C: STEP-BY-STEP EXECUTION CHECKLIST & PROGRESS TRACKER
             =============================================================== */}
          {activeWidgetMode === 'process' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Step-by-Step Progress: {completedSteps.size} of {processSteps.length} Completed
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Check off each step below as you follow the guide.
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-56">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                    {completionPct}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {processSteps.map((step) => {
                  const isDone = completedSteps.has(step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      onClick={() => toggleStepCompleted(step.stepNumber)}
                      className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-700/60'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                          className="w-4 h-4 mt-0.5 rounded accent-emerald-500 cursor-pointer shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono font-semibold text-indigo-400">
                              {step.durationLabel}
                            </span>
                            <span className="text-sm font-bold text-white">{step.title}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {step.copyableSnippet}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===============================================================
              MODE D: REACTIVE CLIENT-SIDE TRAFFIC & ROI CALCULATOR
             =============================================================== */}
          {activeWidgetMode === 'calculator' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Monthly Search Volume</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {calcVolume.toLocaleString()}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={Math.max(100000, currentPage.totalClusterVolume * 2)}
                  step={500}
                  value={calcVolume}
                  onChange={(e) => setCalcVolume(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer my-2"
                />
                <div className="text-[11px] text-slate-400">
                  Topic cluster demand: {currentPage.totalClusterVolume.toLocaleString()}/mo
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Estimated Organic CTR</span>
                  <span className="font-mono font-bold text-indigo-400 tabular-nums">
                    {ctrShare}%
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={65}
                  value={ctrShare}
                  onChange={(e) => setCtrShare(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer my-2"
                />
                <div className="text-[11px] text-slate-300">
                  Est. Monthly Visits:{' '}
                  <strong className="text-white">{projectedMonthlyClicks.toLocaleString()}</strong>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Conversion Rate (%)</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {conversionRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={15}
                  step={0.5}
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer my-2"
                />
                <div className="text-[11px] text-slate-300">
                  Leads: <strong className="text-emerald-400">{projectedConversions.toLocaleString()}</strong> · Ad Value:{' '}
                  <strong className="text-white">${projectedMonthlyAdValue.toLocaleString()}/mo</strong>
                </div>
              </div>
            </div>
          )}

          {/* Responsive Live Keyword Analyzer Footer (Zero Mobile Overflow) */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Want to explore live search volume, CPC bids, and ranking difficulty for another keyword?
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onLaunchLiveKeywordScan(customSeedInput);
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                value={customSeedInput}
                onChange={(e) => setCustomSeedInput(e.target.value)}
                aria-label="Analyze keyword in explorer"
                placeholder="Enter a keyword..."
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white w-full sm:w-56 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Keyword</span>
              </button>
            </form>
          </div>
        </section>

        {/* 3. IN-DEPTH EDITORIAL GUIDE SECTIONS */}
        <div className="space-y-6">
          {currentPage.sections.map((sec, sIdx) => (
            <section
              key={sIdx}
              id={`section-${sIdx + 1}`}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 scroll-mt-24"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400">
                  <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 font-mono text-[11px]">
                    Section 0{sIdx + 1}
                  </span>
                </span>
              </div>

              {sec.level === 'h2' ? (
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {sec.heading}
                </h2>
              ) : (
                <h3 className="text-lg sm:text-xl font-bold text-indigo-100 leading-snug">
                  {sec.heading}
                </h3>
              )}

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {sec.summaryParagraph}
              </p>

              {/* Key Takeaways Box */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Key Actionable Takeaways
                </div>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                  {sec.bulletTakeaways.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section Comparison Table */}
              {sec.comparisonRows.length > 0 && (
                <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-900/60">
                        <th className="py-3 px-4">Evaluation Factor</th>
                        <th className="py-3 px-4">Traditional Approach</th>
                        <th className="py-3 px-4">Recommended 2026 Method</th>
                        <th className="py-3 px-4 text-right">Key Benefit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {sec.comparisonRows.map((cRow, cIdx) => (
                        <tr key={cIdx}>
                          <td className="py-3 px-4 font-semibold text-white">{cRow.criterion}</td>
                          <td className="py-3 px-4 text-slate-400">{cRow.legacyOrPaidApproach}</td>
                          <td className="py-3 px-4 text-emerald-300 font-medium">
                            {cRow.serpgptVerified2026Method}
                          </td>
                          <td className="py-3 px-4 text-right text-indigo-300 font-medium whitespace-nowrap">
                            {cRow.statusBadge}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* 4. FREQUENTLY ASKED QUESTIONS */}
        <section
          id="faq-section"
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-24"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {currentPage.faqs.map((faq, fIdx) => {
              const isOpen = openFaqIndices.has(fIdx);
              return (
                <div
                  key={fIdx}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaqOpen(fIdx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <h3 className="text-sm font-bold text-white">{faq.question}</h3>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. RELATED KEYWORD RESEARCH & SEO GUIDES */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Related Keyword Research &amp; SEO Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore more step-by-step playbooks, platform comparisons, and low-competition keyword strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPages.map((hub) => {
              const isCurrent = hub.slug === currentPage.slug;
              return (
                <a
                  key={hub.id}
                  href={hub.slug}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectMasterSlug(hub.slug);
                  }}
                  className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-3 group ${
                    isCurrent
                      ? 'bg-indigo-950/30 border-indigo-500/60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/60'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {hub.pageTitle}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {hub.metaDescription}
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                </a>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );
}
