import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  ArrowUpRight,
  FolderTree,
  Compass,
  Globe,
  Play,
  HelpCircle,
} from 'lucide-react';
import {
  MasterSeoPageData,
  findMasterSeoPageByPath,
  buildFreeKeywordPlannerExploreResponse,
} from './seoMasterPagesData';
import {
  buildAllMasterPagesFromKeywords,
  isMasterSeoRoutePrefix,
} from './backgroundPageBuilder';
import { findSitemapBlueprintByPath } from './sitemapArchitectureData';
import {
  COMPETITOR_MASTER_BLUEPRINTS,
  findCompetitorBlueprintByPath,
} from './competitorArchitectureData';
import { FREE_STARTUP_BLOG_ARTICLES } from './freeStartupBlogData';
import FreeKeywordSearchPage from './FreeKeywordSearchPage';
import SeoMasterBlueprintPage from './SeoMasterBlueprintPage';
import FreeStartupBlogPage from './FreeStartupBlogPage';
import SitemapExtractorToolPage from './SitemapExtractorToolPage';
import CompetitorIntelligenceSuitePage from './CompetitorIntelligenceSuitePage';
import YouTubeKeywordToolPage from './YouTubeKeywordToolPage';
import PlatformKeywordSuitePage from './PlatformKeywordSuitePage';
import PeopleAlsoAskExplorerPage from './PeopleAlsoAskExplorerPage';
import { findPlatformToolByPath, PLATFORM_TOOLS } from './platformToolsData';
import { PlatformType } from './types';


export default function App() {
  const [competitorBlueprintSlug, setCompetitorBlueprintSlug] = useState<string | null>(() => {
    const matched = findCompetitorBlueprintByPath(window.location.pathname);
    return matched ? matched.urlSlug : null;
  });

  const [sitemapBlueprintSlug, setSitemapBlueprintSlug] = useState<string | null>(() => {
    const matched = findSitemapBlueprintByPath(window.location.pathname);
    return matched ? matched.slug : null;
  });

  const [masterSeoSlug, setMasterSeoSlug] = useState<string | null>(() => {
    if (findCompetitorBlueprintByPath(window.location.pathname)) return null;
    if (findSitemapBlueprintByPath(window.location.pathname)) return null;
    const matched = findMasterSeoPageByPath(window.location.pathname);
    if (matched) return matched.slug;
    if (isMasterSeoRoutePrefix(window.location.pathname)) {
      return window.location.pathname.replace(/\/+$/, '');
    }
    return null;
  });

  const [blogArticleSlug, setBlogArticleSlug] = useState<string | null>(() => {
    const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    if (p.startsWith('/blog/') && p !== '/blog') {
      return p;
    }
    return null;
  });

  const [platformToolType, setPlatformToolType] = useState<PlatformType>(() => {
    const matched = findPlatformToolByPath(window.location.pathname);
    return matched ? matched.id : 'amazon';
  });

  const [currentPage, setCurrentPage] = useState<
    | 'suite'
    | 'free-search'
    | 'master-seo'
    | 'blog'
    | 'sitemap-extractor'
    | 'competitor-suite'
    | 'youtube-tool'
    | 'platform-tool'
    | 'paa-explorer'
  >(() => {
    const p = (window.location.pathname + window.location.hash).toLowerCase();
    if (p.includes('people-also-ask') || p.includes('question-tree')) return 'paa-explorer';
    const platformMatch = findPlatformToolByPath(window.location.pathname);
    if (platformMatch) {
      if (platformMatch.id === 'youtube') return 'youtube-tool';
      return 'platform-tool';
    }
    if (p.includes('youtube-keyword-tool')) return 'youtube-tool';
    if (findCompetitorBlueprintByPath(window.location.pathname)) return 'competitor-suite';
    if (findSitemapBlueprintByPath(window.location.pathname)) return 'sitemap-extractor';
    const rawPath = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    if (rawPath === '/blog' || rawPath.startsWith('/blog/')) return 'blog';
    const matched = findMasterSeoPageByPath(window.location.pathname);
    if (matched || isMasterSeoRoutePrefix(window.location.pathname)) return 'master-seo';
    return p.includes('free-keyword-search') ? 'free-search' : 'suite';
  });

  const [initialFreeSearchSeed, setInitialFreeSearchSeed] = useState<string | undefined>(undefined);

  // Sync visibility of the static #features section in index.html so it only shows on the landing page
  React.useEffect(() => {
    const featuresEl = document.getElementById('features');
    if (featuresEl) {
      if (currentPage === 'suite') {
        featuresEl.classList.remove('hidden');
      } else {
        featuresEl.classList.add('hidden');
      }
    }
  }, [currentPage]);

  React.useEffect(() => {
    const handleCustomRoute = (e: Event) => {
      const detail = String((e as CustomEvent).detail || '');
      const clean = detail.replace(/\/+$/, '').toLowerCase();

      const compMatch = findCompetitorBlueprintByPath(clean.startsWith('/') ? clean : `/${clean}`);
      if (compMatch || clean === 'competitor-finder' || clean === '/alternatives/free-competitor') {
        const slugToUse = compMatch ? compMatch.urlSlug : '/alternatives/free-competitor';
        setCompetitorBlueprintSlug(slugToUse);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('competitor-suite');
        return;
      }

      const sitemapMatch = findSitemapBlueprintByPath(clean.startsWith('/') ? clean : `/${clean}`);
      if (sitemapMatch || clean === 'sitemap-extractor' || clean === '/sources/site-map-extractor') {
        const slugToUse = sitemapMatch ? sitemapMatch.slug : '/sources/site-map-extractor';
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(slugToUse);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('sitemap-extractor');
        return;
      }

      if (clean === 'blog' || clean === '/blog') {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('blog');
        return;
      }
      if (clean.startsWith('/blog/') || clean.startsWith('blog/')) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(clean.startsWith('/') ? clean : `/${clean}`);
        setCurrentPage('blog');
        return;
      }
      const matched = findMasterSeoPageByPath(detail);
      if (matched) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(matched.slug);
        setCurrentPage('master-seo');
      } else if (isMasterSeoRoutePrefix(detail)) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(detail.replace(/\/+$/, ''));
        setCurrentPage('master-seo');
      } else if (
        detail === 'youtube-keyword-tool' ||
        clean === '/youtube-keyword-tool' ||
        clean === 'youtube-keyword-tool'
      ) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('youtube-tool');
      } else if (
        clean === '/tools/people-also-ask' ||
        clean === 'tools/people-also-ask' ||
        clean === '/people-also-ask' ||
        clean === 'people-also-ask' ||
        clean.includes('question-tree')
      ) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('paa-explorer');
      } else {
        const platformMatch = findPlatformToolByPath(clean.startsWith('/') ? clean : `/${clean}`);
        if (platformMatch) {
          setCompetitorBlueprintSlug(null);
          setSitemapBlueprintSlug(null);
          setMasterSeoSlug(null);
          setBlogArticleSlug(null);
          if (platformMatch.id === 'youtube') {
            setCurrentPage('youtube-tool');
          } else {
            setPlatformToolType(platformMatch.id);
            setCurrentPage('platform-tool');
          }
          return;
        }

        if (detail === 'free-keyword-search') {
          setCompetitorBlueprintSlug(null);
          setSitemapBlueprintSlug(null);
          setMasterSeoSlug(null);
          setCurrentPage('free-search');
        } else if (detail === 'home') {
          setCompetitorBlueprintSlug(null);
          setSitemapBlueprintSlug(null);
          setMasterSeoSlug(null);
          setBlogArticleSlug(null);
          setCurrentPage('suite');
        }
      }
    };

    const handlePopState = () => {
      const p = (window.location.pathname + window.location.hash).toLowerCase();
      if (p.includes('people-also-ask') || p.includes('question-tree')) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('paa-explorer');
        return;
      }
      const compMatch = findCompetitorBlueprintByPath(window.location.pathname);
      if (compMatch) {
        setCompetitorBlueprintSlug(compMatch.urlSlug);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('competitor-suite');
        return;
      }
      const sitemapMatch = findSitemapBlueprintByPath(window.location.pathname);
      if (sitemapMatch) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(sitemapMatch.slug);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('sitemap-extractor');
        return;
      }
      const platformMatch = findPlatformToolByPath(window.location.pathname);
      if (platformMatch) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        if (platformMatch.id === 'youtube') {
          setCurrentPage('youtube-tool');
        } else {
          setPlatformToolType(platformMatch.id);
          setCurrentPage('platform-tool');
        }
        return;
      }
      const rawPath = window.location.pathname.replace(/\/+$/, '').toLowerCase();
      if (rawPath === '/blog') {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(null);
        setCurrentPage('blog');
        return;
      }
      if (rawPath.startsWith('/blog/')) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(null);
        setBlogArticleSlug(rawPath);
        setCurrentPage('blog');
        return;
      }
      const matched = findMasterSeoPageByPath(window.location.pathname);
      if (matched) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(matched.slug);
        setCurrentPage('master-seo');
        return;
      }
      if (isMasterSeoRoutePrefix(window.location.pathname)) {
        setCompetitorBlueprintSlug(null);
        setSitemapBlueprintSlug(null);
        setMasterSeoSlug(window.location.pathname.replace(/\/+$/, ''));
        setCurrentPage('master-seo');
        return;
      }
      setCompetitorBlueprintSlug(null);
      setSitemapBlueprintSlug(null);
      setMasterSeoSlug(null);
      setBlogArticleSlug(null);
      if (p.includes('youtube-keyword-tool')) {
        setCurrentPage('youtube-tool');
      } else {
        setCurrentPage(p.includes('free-keyword-search') ? 'free-search' : 'suite');
      }
    };

    window.addEventListener('serpgpt:navigate', handleCustomRoute);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('serpgpt:navigate', handleCustomRoute);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateToPage = (
    page:
      | 'suite'
      | 'free-search'
      | 'blog'
      | 'sitemap-extractor'
      | 'competitor-suite'
      | 'youtube-tool'
      | 'platform-tool'
      | 'paa-explorer',
    seed?: string,
    targetPlatform?: PlatformType
  ) => {
    if (seed) {
      setInitialFreeSearchSeed(seed);
    }
    setMasterSeoSlug(null);
    if (page !== 'blog') {
      setBlogArticleSlug(null);
    }
    if (page === 'sitemap-extractor') {
      setSitemapBlueprintSlug('/sources/site-map-extractor');
    } else {
      setSitemapBlueprintSlug(null);
    }
    if (page === 'competitor-suite') {
      setCompetitorBlueprintSlug('/alternatives/free-competitor');
    } else {
      setCompetitorBlueprintSlug(null);
    }
    if (page === 'platform-tool' && targetPlatform) {
      setPlatformToolType(targetPlatform);
    }
    setCurrentPage(page);
    const targetUrl =
      page === 'free-search'
        ? '/free-keyword-search'
        : page === 'youtube-tool'
        ? '/youtube-keyword-tool'
        : page === 'paa-explorer'
        ? '/tools/people-also-ask'
        : page === 'platform-tool'
        ? (PLATFORM_TOOLS[targetPlatform || platformToolType]?.slug || '/tools/amazon-keyword-tool')
        : page === 'blog'
        ? '/blog'
        : page === 'sitemap-extractor'
        ? '/sources/site-map-extractor'
        : page === 'competitor-suite'
        ? '/alternatives/free-competitor'
        : '/';
    try {
      window.history.pushState({ route: page }, '', targetUrl);
    } catch {
      // Ignore in restricted iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPlatformTool = (platform: PlatformType, seed?: string) => {
    setCompetitorBlueprintSlug(null);
    setSitemapBlueprintSlug(null);
    setMasterSeoSlug(null);
    setBlogArticleSlug(null);
    setPlatformToolType(platform);
    if (seed) {
      setInitialFreeSearchSeed(seed);
    }
    setCurrentPage('platform-tool');
    const meta = PLATFORM_TOOLS[platform];
    const targetUrl = meta ? meta.slug : `/tools/${platform}-keywords`;
    try {
      window.history.pushState({ route: targetUrl }, '', targetUrl);
    } catch {
      // Ignore in restricted iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCompetitorBlueprint = (slug: string) => {
    setCompetitorBlueprintSlug(slug);
    setSitemapBlueprintSlug(null);
    setMasterSeoSlug(null);
    setBlogArticleSlug(null);
    setCurrentPage('competitor-suite');
    try {
      window.history.pushState({ route: slug }, '', slug);
    } catch {
      // Ignore in restricted iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSitemapBlueprint = (slug: string) => {
    setCompetitorBlueprintSlug(null);
    setSitemapBlueprintSlug(slug);
    setMasterSeoSlug(null);
    setBlogArticleSlug(null);
    setCurrentPage('sitemap-extractor');
    try {
      window.history.pushState({ route: slug }, '', slug);
    } catch {
      // Ignore in restricted iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openBlogArticle = (slug: string | null) => {
    setCompetitorBlueprintSlug(null);
    setSitemapBlueprintSlug(null);
    setMasterSeoSlug(null);
    setBlogArticleSlug(slug);
    setCurrentPage('blog');
    const targetUrl = slug || '/blog';
    try {
      window.history.pushState({ route: targetUrl }, '', targetUrl);
    } catch {
      // Ignore in restricted iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMasterSeoHub = (slug: string) => {
    const compMatch = findCompetitorBlueprintByPath(slug);
    if (compMatch) {
      openCompetitorBlueprint(compMatch.urlSlug);
      return;
    }
    const sitemapMatch = findSitemapBlueprintByPath(slug);
    if (sitemapMatch) {
      openSitemapBlueprint(sitemapMatch.slug);
      return;
    }
    setCompetitorBlueprintSlug(null);
    setSitemapBlueprintSlug(null);
    setMasterSeoSlug(slug);
    setCurrentPage('master-seo');
    try {
      window.history.pushState({ route: slug }, '', slug);
    } catch {
      // Ignore in restricted iframe
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publishedMasterPages = useMemo<MasterSeoPageData[]>(() => {
    return [];
  }, []);

  if (currentPage === 'competitor-suite') {
    return (
      <CompetitorIntelligenceSuitePage
        activeSlug={competitorBlueprintSlug || '/alternatives/free-competitor'}
        onSelectBlueprintSlug={(slug) => openCompetitorBlueprint(slug)}
        onLaunchKeywordScan={(seed) => navigateToPage('free-search', seed)}
        onLaunchSitemapExtractor={() => openSitemapBlueprint('/sources/site-map-extractor')}
        onBackToHome={() => navigateToPage('suite')}
      />
    );
  }

  if (currentPage === 'sitemap-extractor') {
    return (
      <SitemapExtractorToolPage
        activeSlug={sitemapBlueprintSlug || '/sources/site-map-extractor'}
        onSelectBlueprintSlug={(slug) => openSitemapBlueprint(slug)}
        onLaunchKeywordScan={(seed) => navigateToPage('free-search', seed)}
        onBackToHome={() => navigateToPage('suite')}
      />
    );
  }

  if (currentPage === 'blog') {
    return (
      <FreeStartupBlogPage
        activeArticleSlug={blogArticleSlug}
        onSelectArticle={(slug) => openBlogArticle(slug)}
        onLaunchKeywordScan={(seed) => navigateToPage('free-search', seed)}
        onLaunchSitemapExtractor={() => openSitemapBlueprint('/sources/site-map-extractor')}
        onBackToHome={() => navigateToPage('suite')}
      />
    );
  }

  if (currentPage === 'master-seo' && masterSeoSlug) {
    return (
      <SeoMasterBlueprintPage
        activeSlug={masterSeoSlug}
        publishedPages={publishedMasterPages}
        onSelectMasterSlug={(slug) => openMasterSeoHub(slug)}
        onLaunchLiveKeywordScan={(seed) => {
          navigateToPage('free-search', seed);
        }}
        onBackToWorkbench={() => {
          navigateToPage('free-search');
        }}
      />
    );
  }

  if (currentPage === 'youtube-tool') {
    return (
      <YouTubeKeywordToolPage
        initialSeed={initialFreeSearchSeed}
        onBackToHome={() => navigateToPage('suite')}
        onOpenWebKeywordPlanner={(seed) => navigateToPage('free-search', seed)}
      />
    );
  }

  if (currentPage === 'platform-tool') {
    return (
      <PlatformKeywordSuitePage
        initialPlatform={platformToolType}
        initialQuery={initialFreeSearchSeed}
        onNavigatePlatform={(p) => {
          setPlatformToolType(p);
          const meta = PLATFORM_TOOLS[p];
          if (meta && window.history?.pushState) {
            window.history.pushState({}, '', meta.slug);
          }
        }}
        onBackToHome={() => navigateToPage('suite')}
        onOpenWebKeywordPlanner={(seed) => navigateToPage('free-search', seed)}
      />
    );
  }

  if (currentPage === 'paa-explorer') {
    return (
      <PeopleAlsoAskExplorerPage
        initialSeed={initialFreeSearchSeed || 'crm software'}
        onBackToHome={() => navigateToPage('suite')}
        onOpenWebKeywordPlanner={(seed) => navigateToPage('free-search', seed)}
      />
    );
  }

  if (currentPage === 'free-search') {
    return (
      <FreeKeywordSearchPage
        onNavigateBackToSuite={() => navigateToPage('suite')}
        onOpenMasterSeoPage={(slug) => openMasterSeoHub(slug)}
        initialSeedQuery={initialFreeSearchSeed}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
      {/* CLEAN SAAS LANDING PAGE HERO */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>The 100% Free Version of Semrush, Ahrefs &amp; Paid SEO Suites</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.12] [text-wrap:balance]">
          Uncover High-Volume, Low-Competition Search &amp; Competitor Opportunities
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-9">
          SERPgpt.pro is the free version of Semrush, Ahrefs, and paid SEO tools—giving content creators, bloggers, and marketers unlimited keyword research, free competitor analysis, Google Autocomplete streams, and XML sitemap extraction at $0/month.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigateToPage('free-search')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Free Keyword Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigateToPage('paa-explorer')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-white" />
            <span>People Also Ask &amp; Question Tree</span>
          </button>

          <button
            type="button"
            onClick={() => navigateToPage('youtube-tool')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>YouTube Keyword Tool</span>
          </button>

          <button
            type="button"
            onClick={() => openCompetitorBlueprint('/alternatives/free-competitor')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-sm rounded-xl border border-indigo-500/40 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Competitor Finder &amp; Spy</span>
          </button>

          <button
            type="button"
            onClick={() => openSitemapBlueprint('/sources/site-map-extractor')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-sm rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-emerald-400" />
            <span>Site Map Extractor</span>
          </button>

          <button
            type="button"
            onClick={() => openBlogArticle(null)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 font-semibold text-sm rounded-xl border border-emerald-800/60 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>SEO Blog: Free Semrush</span>
          </button>
        </div>

        {/* Concise Product Feature Highlights */}
        <div className="mt-10 pt-8 border-t border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div
            onClick={() => navigateToPage('free-search')}
            className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-4 flex items-start gap-3 transition-colors cursor-pointer"
          >
            <Compass className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Low-Comp &amp; Related Keywords</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Analyze search demand, live related keywords as you type, and SERP weak spots.
              </p>
            </div>
          </div>

          <div
            onClick={() => openCompetitorBlueprint('/alternatives/free-competitor')}
            className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-4 flex items-start gap-3 transition-colors cursor-pointer"
          >
            <Globe className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Competitor Finder &amp; Spy Suite</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Find similar companies, spy on $55+ CPC competitor keywords, backlinks, and ads.
              </p>
            </div>
          </div>

          <div
            onClick={() => openSitemapBlueprint('/sources/site-map-extractor')}
            className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-4 flex items-start gap-3 transition-colors cursor-pointer"
          >
            <FolderTree className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">XML Site Map Extractor</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Extract URLs, directory structures, images, and video links from any website sitemap.
              </p>
            </div>
          </div>

          <div
            onClick={() => openBlogArticle(null)}
            className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-sky-500/40 rounded-xl p-4 flex items-start gap-3 transition-colors cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">SERPgpt vs. Semrush Blog</div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                See why SERPgpt.pro is the 100% free version of Semrush, Ahrefs, Moz, and SurferSEO.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FREE PLATFORM-SPECIFIC KEYWORD TOOLS (AMAZON, TIKTOK, ETSY, LOCAL SEO, YOUTUBE) */}
      <section className="mt-16 pt-12 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Programmatic Multi-Platform Tools (Zero Sign-Up)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Free Platform-Specific Keyword Research Tools
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Extract real buyer intent and viral search terms directly from Amazon, TikTok, Etsy, Google Local, and YouTube completion engines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              6 Dedicated Tools
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* People Also Ask & AnswerThePublic Alternative Card */}
          <article
            onClick={() => navigateToPage('paa-explorer')}
            className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-purple-500/10"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span className="text-purple-400 font-semibold">AnswerThePublic Alternative</span>
                <span className="font-mono text-purple-300">Live PAA Wheel</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors leading-snug mb-2">
                People Also Ask (PAA) &amp; Question Tree Explorer
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                Extract live Google People Also Ask questions clustered into a visual radial wheel across What, Why, How, Where &amp; Can with instant FAQ Schema generator.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono truncate max-w-[70%]">/tools/people-also-ask</span>
              <span className="inline-flex items-center gap-1 text-purple-400 font-semibold shrink-0">
                <span>Launch Tool</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>

          {/* Amazon Card */}
          <article
            onClick={() => openPlatformTool('amazon')}
            className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span className="text-amber-400 font-semibold">Amazon A9 Algorithm</span>
                <span className="font-mono text-emerald-400">Live Completion</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug mb-2">
                Free Amazon Keyword Tool &amp; Buyer Search Suggester
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                Extract high-converting product buyer searches from Amazon completion API with 249-byte backend search term generator and PPC bids.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono truncate max-w-[70%]">/tools/amazon-keyword-tool</span>
              <span className="inline-flex items-center gap-1 text-amber-400 font-semibold shrink-0">
                <span>Launch Tool</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>

          {/* TikTok Card */}
          <article
            onClick={() => openPlatformTool('tiktok')}
            className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span className="text-pink-400 font-semibold">TikTok FYP Signals</span>
                <span className="font-mono text-pink-400">Viral Search</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors leading-snug mb-2">
                Free TikTok Keyword &amp; Viral Trend Finder
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                Discover trending TikTok search queries, hashtag blocks, and high-retention video search topics used by top creators.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono truncate max-w-[70%]">/tools/tiktok-keyword-tool</span>
              <span className="inline-flex items-center gap-1 text-pink-400 font-semibold shrink-0">
                <span>Launch Tool</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>

          {/* Etsy Card */}
          <article
            onClick={() => openPlatformTool('etsy')}
            className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span className="text-orange-400 font-semibold">Etsy Shopper Search</span>
                <span className="font-mono text-orange-400">13 Listing Tags</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors leading-snug mb-2">
                Free Etsy Keyword Tool &amp; 13-Tag Generator
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                Discover high-intent Etsy buyer searches and generate verified 13-tag combinations (20-character limit verified) for handmade and digital listings.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono truncate max-w-[70%]">/tools/etsy-keyword-tool</span>
              <span className="inline-flex items-center gap-1 text-orange-400 font-semibold shrink-0">
                <span>Launch Tool</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>

          {/* Local SEO Card */}
          <article
            onClick={() => openPlatformTool('local')}
            className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span className="text-emerald-400 font-semibold">Google Map Pack</span>
                <span className="font-mono text-emerald-400">Geo &amp; Near Me</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-2">
                Free Local SEO Keyword &amp; "Near Me" Generator
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                Generate hyper-targeted local service keywords, emergency queries, and localized city landing page matrices for contractors and agencies.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono truncate max-w-[70%]">/tools/local-seo-keywords</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                <span>Launch Tool</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>

          {/* YouTube Card */}
          <article
            onClick={() => navigateToPage('youtube-tool')}
            className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                <span className="text-rose-400 font-semibold">YouTube (ds=yt) Search</span>
                <span className="font-mono text-rose-400">Outlier Finder</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors leading-snug mb-2">
                Free YouTube Keyword Tool &amp; Video Outlier Finder
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                Scan live YouTube autocomplete suggestions, analyze competitor video tags, and spot small channels with viral view-to-subscriber ratios.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono truncate max-w-[70%]">/tools/youtube-keyword-tool</span>
              <span className="inline-flex items-center gap-1 text-rose-400 font-semibold shrink-0">
                <span>Launch Tool</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* COMPETITOR INTELLIGENCE & KEYWORD SPY SUITE (7 CONSOLIDATED HUBS) */}
      <section className="mt-16 pt-12 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Competitor Finder, Compare &amp; Keyword Spy Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Free Competitor Analysis, Comparable Tools &amp; Keyword Spy Hubs
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Explore our 7 specialized competitor intelligence tools covering competitor lookup, backlink &amp; keyword spying, head-to-head VS comparisons, and comparable software directories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCompetitorBlueprint('/alternatives/free-competitor')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
          >
            <span>Open Competitor Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMPETITOR_MASTER_BLUEPRINTS.map((bp) => (
            <article
              key={bp.id}
              onClick={() => openCompetitorBlueprint(bp.urlSlug)}
              className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                  <span className="text-indigo-300 font-semibold">{bp.pageArchetype}</span>
                  <span className="font-mono text-emerald-400">
                    {bp.totalMonthlyVolume.toLocaleString()}/mo
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2">
                  {bp.h1}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {bp.rationale}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono truncate max-w-[70%]">{bp.urlSlug}</span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold shrink-0">
                  <span>Launch Tool</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FEATURED SEO BLOG — SERPGPT IS THE FREE VERSION OF SEMRUSH & OTHERS */}
      <section className="mt-16 pt-12 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Official SEO Comparison Blog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why SERPgpt is the Free Version of Semrush &amp; Paid SEO Tools
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Side-by-side breakdowns showing how SERPgpt.pro replaces $139–$499/month subscriptions to Semrush, Ahrefs, Moz, Ubersuggest, Screaming Frog, and SurferSEO for $0.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openBlogArticle(null)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
          >
            <span>Read All SEO Comparisons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FREE_STARTUP_BLOG_ARTICLES.slice(0, 6).map((article) => (
            <article
              key={article.id}
              onClick={() => openBlogArticle(article.slug)}
              className="bg-slate-900/75 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2.5">
                  <span className="text-indigo-300 font-semibold">{article.category}</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    Save ${article.bigStartupAnnualCost.toLocaleString()}/yr
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {article.metaDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold truncate max-w-[72%]">
                  Free Version: SERPgpt.pro
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 font-semibold shrink-0">
                  <span>Read</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
