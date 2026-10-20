import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Calculator,
  PlusCircle,
  FolderTree,
  ShieldCheck,
} from 'lucide-react';
import {
  FREE_STARTUP_BLOG_ARTICLES,
  StartupBlogArticle,
  generateCustomStartupArticle,
} from './freeStartupBlogData';

interface FreeStartupBlogPageProps {
  activeArticleSlug?: string | null;
  onSelectArticle: (slug: string | null) => void;
  onLaunchKeywordScan: (seedKeyword: string) => void;
  onLaunchSitemapExtractor?: () => void;
  onBackToHome: () => void;
}

const CATEGORIES = [
  'ALL',
  'All-in-One SEO Suites',
  'Keyword Research',
  'Technical SEO & Sitemaps',
  'Content Optimization',
  'Competitor & PPC Intelligence',
] as const;

export default function FreeStartupBlogPage({
  activeArticleSlug,
  onSelectArticle,
  onLaunchKeywordScan,
  onLaunchSitemapExtractor,
  onBackToHome,
}: FreeStartupBlogPageProps) {
  const [customArticles, setCustomArticles] = useState<StartupBlogArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startupGeneratorInput, setStartupGeneratorInput] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive SEO Subscription Savings Calculator State
  const [selectedPaidIds, setSelectedPaidIds] = useState<Set<string>>(
    () =>
      new Set([
        'blog-free-version-semrush',
        'blog-free-version-ahrefs',
        'blog-free-version-surfer-clearscope',
      ])
  );

  const allArticles = useMemo(
    () => [...customArticles, ...FREE_STARTUP_BLOG_ARTICLES],
    [customArticles]
  );

  const activeArticle = useMemo<StartupBlogArticle | null>(() => {
    if (!activeArticleSlug) return null;
    const clean = activeArticleSlug.replace(/\/+$/, '').toLowerCase();
    const match = allArticles.find(
      (a) =>
        a.slug.toLowerCase() === clean ||
        (a.legacySlugs && a.legacySlugs.some((ls) => ls.toLowerCase() === clean))
    );
    if (match) return match;
    if (clean.startsWith('/blog/free-version-of-') || clean.startsWith('/blog/serpgpt-free-version-of-')) {
      const namePart = clean
        .replace('/blog/serpgpt-free-version-of-', '')
        .replace('/blog/free-version-of-', '')
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return generateCustomStartupArticle(namePart);
    }
    return null;
  }, [activeArticleSlug, allArticles]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      if (selectedCategory !== 'ALL' && article.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          article.bigStartupName.toLowerCase().includes(q) ||
          article.title.toLowerCase().includes(q) ||
          article.topFreeVersionName.toLowerCase().includes(q) ||
          article.primaryKeyword.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allArticles, selectedCategory, searchQuery]);

  // Calculate total monthly & annual SEO SaaS savings when switching to SERPgpt
  const savingsSummary = useMemo(() => {
    let monthlySaved = 0;
    allArticles.forEach((a) => {
      if (selectedPaidIds.has(a.id)) {
        monthlySaved += a.bigStartupMonthlyCost;
      }
    });
    return {
      monthlySaved,
      annualSaved: monthlySaved * 12,
    };
  }, [allArticles, selectedPaidIds]);

  const toggleCalculatorItem = (id: string) => {
    setSelectedPaidIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerateCustomBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupGeneratorInput.trim()) return;
    const newArt = generateCustomStartupArticle(startupGeneratorInput.trim());
    setCustomArticles((prev) => {
      const filtered = prev.filter((p) => p.slug !== newArt.slug);
      return [newArt, ...filtered];
    });
    setStartupGeneratorInput('');
    onSelectArticle(newArt.slug);
  };

  const openSitemapTool = () => {
    if (onLaunchSitemapExtractor) {
      onLaunchSitemapExtractor();
    } else {
      window.dispatchEvent(new CustomEvent('serpgpt:navigate', { detail: '/sources/site-map-extractor' }));
    }
  };

  // Inject dynamic <title>, <meta name="description">, <meta name="keywords">, canonical, and BlogPosting JSON-LD
  useEffect(() => {
    const prevTitle = document.title;
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

    if (activeArticle) {
      document.title = `${activeArticle.title} | SERPgpt.pro SEO Blog`;
      const allKeywords = [activeArticle.primaryKeyword, ...activeArticle.secondaryKeywords].join(', ');
      setMetaTag('meta[name="description"]', 'content', activeArticle.metaDescription);
      setMetaTag('meta[name="keywords"]', 'content', allKeywords);
      setMetaTag('meta[property="og:title"]', 'content', activeArticle.title);
      setMetaTag('meta[property="og:description"]', 'content', activeArticle.metaDescription);
      setMetaTag('meta[property="og:url"]', 'content', `https://serpgpt.pro${activeArticle.slug}`);
    } else {
      document.title =
        'Why SERPgpt is the 100% Free Version of Semrush, Ahrefs, Moz & Paid SEO Tools | SERPgpt.pro Blog';
      setMetaTag(
        'meta[name="description"]',
        'content',
        'Discover why SERPgpt.pro is the #1 free version of Semrush, Ahrefs, Moz Pro, Ubersuggest, SurferSEO, and Screaming Frog—with unlimited keyword research, Google Autocomplete, and XML sitemap extraction at $0/mo.'
      );
      setMetaTag(
        'meta[name="keywords"]',
        'content',
        'free version of semrush, serpgpt free version of semrush, free version of ahrefs, free version of ubersuggest, free version of moz pro, free version of screaming frog, free version of surfer seo'
      );
    }

    const scriptId = 'serpgpt-startup-blog-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    if (activeArticle) {
      scriptEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: activeArticle.h1,
            description: activeArticle.metaDescription,
            datePublished: '2026-10-19',
            author: {
              '@type': 'Person',
              name: activeArticle.authorName,
              jobTitle: activeArticle.authorRole,
            },
            publisher: {
              '@type': 'Organization',
              name: 'SERPgpt.pro',
              url: 'https://serpgpt.pro',
            },
            mainEntityOfPage: `https://serpgpt.pro${activeArticle.slug}`,
            keywords: [activeArticle.primaryKeyword, ...activeArticle.secondaryKeywords].join(', '),
          },
          {
            '@type': 'FAQPage',
            mainEntity: activeArticle.faqs.map((f) => ({
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
    } else {
      scriptEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'SERPgpt SEO Blog: The Free Version of Semrush, Ahrefs & Paid SEO Tools',
        description:
          'Official SEO guides explaining how SERPgpt.pro replaces Semrush, Ahrefs, Moz Pro, Ubersuggest, SurferSEO, and Screaming Frog for $0/month.',
        url: 'https://serpgpt.pro/blog',
        blogPost: allArticles.map((a) => ({
          '@type': 'BlogPosting',
          headline: a.title,
          url: `https://serpgpt.pro${a.slug}`,
        })),
      });
    }

    return () => {
      document.title = prevTitle;
    };
  }, [activeArticle, allArticles]);

  // ============================================================================
  // VIEW 1: SINGLE FULL SEO BLOG ARTICLE VIEW (/blog/serpgpt-free-version-of-...)
  // ============================================================================
  if (activeArticle) {
    return (
      <article className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Top Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-8 border-b border-slate-800 text-xs"
        >
          <div className="flex flex-wrap items-center gap-2 text-slate-400">
            <button
              type="button"
              onClick={onBackToHome}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-slate-700">/</span>
            <button
              type="button"
              onClick={() => onSelectArticle(null)}
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>SERPgpt Free vs. Paid SEO Blog</span>
            </button>
            <span className="text-slate-700">/</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">
              SERPgpt vs. {activeArticle.bigStartupName.split('(')[0].trim()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onLaunchKeywordScan(activeArticle.primaryKeyword)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Launch Free Keyword Search Now</span>
          </button>
        </nav>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
              SERPgpt = $0/mo (Save ${activeArticle.bigStartupAnnualCost.toLocaleString()}/year)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
              {activeArticle.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-5">
            {activeArticle.h1}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
            {activeArticle.metaDescription}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
                {activeArticle.authorName.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-white">{activeArticle.authorName}</div>
                <div className="text-slate-400">{activeArticle.authorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{activeArticle.readingTimeMinutes} min read</span>
              </span>
              <span>Updated {activeArticle.publishedDate}</span>
            </div>
          </div>
        </header>

        {/* Executive Verdict Box */}
        <section className="mb-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                Official Comparison Verdict
              </div>
              <h2 className="text-xl font-bold text-white">
                Paid Tool: <span className="text-rose-400 line-through">{activeArticle.bigStartupName}</span>{' '}
                → Free Version:{' '}
                <span className="text-emerald-400">{activeArticle.topFreeVersionName} ($0/mo)</span>
              </h2>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-right shrink-0">
              <div className="text-[11px] text-slate-400">Annual Savings with SERPgpt</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                ${activeArticle.bigStartupAnnualCost.toLocaleString()}/yr
              </div>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed mt-5">
            {activeArticle.summaryVerdict}
          </p>

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onLaunchKeywordScan(activeArticle.primaryKeyword)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Try SERPgpt Free Keyword Explorer</span>
            </button>
            <button
              type="button"
              onClick={openSitemapTool}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-800/60 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Try SERPgpt Free Sitemap Extractor</span>
            </button>
          </div>
        </section>

        {/* How SERPgpt Replaces the Paid Tool Module-by-Module */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">
            How SERPgpt.pro Serves as the Free Version of {activeArticle.bigStartupName.split('(')[0].trim()}
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Every core workflow below is included 100% free inside SERPgpt.pro with no daily search lockouts or credit card paywalls.
          </p>

          <div className="space-y-5">
            {activeArticle.alternatives.map((alt, idx) => (
              <div
                key={alt.name}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold">
                        Included Free #{idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-white">{alt.name}</h3>
                    </div>
                    <p className="text-xs text-indigo-300 mt-1 font-medium">
                      {alt.licenseOrTier} · {alt.featureParityScore}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono font-semibold text-emerald-400">
                      {alt.costComparison}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (alt.internalRoute === 'sitemap-extractor') {
                          openSitemapTool();
                        } else {
                          onLaunchKeywordScan(alt.seedKeyword || activeArticle.primaryKeyword);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Open Free Tool</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                  <div>
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                      What You Get Free in SERPgpt
                    </div>
                    <ul className="space-y-2">
                      {alt.keyCapabilities.map((cap) => (
                        <li key={cap} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white mb-1">Best Suited For</div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{alt.bestFor}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="text-xs font-semibold text-emerald-400 mb-1">Architecture Focus</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{alt.limitations}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Deep-Dive Editorial H2 Sections */}
        <section className="space-y-8 mb-12">
          {activeArticle.sections.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className="bg-slate-900/75 border border-slate-800 rounded-2xl p-6 sm:p-8"
            >
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{sec.heading}</h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                {sec.contentParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {sec.keyTakeaways.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                    Why Marketers Switch to SERPgpt
                  </div>
                  <ul className="space-y-2">
                    {sec.keyTakeaways.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Step-by-Step Zero-Downtime Switch Checklist */}
        <section className="mb-12 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            How to Switch from {activeArticle.bigStartupName.split('(')[0].trim()} to SERPgpt in 3 Minutes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Start running your keyword research and competitor sitemap audits on SERPgpt immediately for $0.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeArticle.migrationSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                      Step {step.stepNumber}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{step.timeEstimate}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion (Synced with FAQPage JSON-LD) */}
        <section className="mb-12 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Frequently Asked Questions: SERPgpt as the Free Version of {activeArticle.bigStartupName.split('(')[0].trim()}
          </h2>
          <div className="space-y-3">
            {activeArticle.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-white">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/70 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Internal Link Hub: Related "SERPgpt vs Paid SEO Tools" Guides */}
        <section className="border-t border-slate-800 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              More Guides: How SERPgpt Replaces Paid SEO Subscriptions
            </h2>
            <button
              type="button"
              onClick={() => onSelectArticle(null)}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              View All Comparisons →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allArticles
              .filter((a) => a.slug !== activeArticle.slug)
              .slice(0, 3)
              .map((related) => (
                <button
                  key={related.id}
                  type="button"
                  onClick={() => onSelectArticle(related.slug)}
                  className="text-left bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      Save ${related.bigStartupAnnualCost.toLocaleString()}/yr with SERPgpt
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 mt-1 mb-2">
                      {related.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{related.metaDescription}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400">
                    <span>Read Comparison</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
          </div>
        </section>
      </article>
    );
  }

  // ============================================================================
  // VIEW 2: MAIN SEO BLOG HUB (/blog) — SERPGPT IS THE FREE VERSION OF SEMRUSH & OTHERS
  // ============================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-medium text-indigo-400">
            SEO Blog: SERPgpt vs. Semrush, Ahrefs &amp; Paid SEO Tools
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onLaunchKeywordScan('free version of semrush')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Launch Free Keyword Search</span>
          </button>
        </div>
      </div>

      {/* Blog Hero Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-semibold mb-4">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official SERPgpt.pro SEO Comparison Blog</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-[1.15]">
          SERPgpt is the 100% Free Version of Semrush, Ahrefs &amp; Paid SEO Suites
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Stop paying $139.95/month for Semrush, $129/month for Ahrefs, or $189/month for SurferSEO. Read our technical guides to see how <strong className="text-white">SERPgpt.pro</strong> gives you unlimited keyword research, Google Autocomplete long-tails, SEO content guides, and XML sitemap extraction for <strong className="text-emerald-400">$0/month</strong>.
        </p>
      </div>

      {/* Head-to-Head Comparison Matrix: SERPgpt vs Semrush, Ahrefs, Moz/Ubersuggest, Screaming Frog */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Head-to-Head SEO Platform Matrix</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Why SERPgpt.pro Replaces Semrush, Ahrefs, Ubersuggest &amp; SurferSEO
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectArticle('/blog/serpgpt-free-version-of-semrush')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <span>Read Full Semrush vs. SERPgpt Guide</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 pr-4 font-semibold">SEO Capability</th>
                <th className="py-3 px-4 font-bold text-emerald-400 bg-emerald-950/25 rounded-t-lg">
                  SERPgpt.pro (Free Version)
                </th>
                <th className="py-3 px-4 font-semibold">Semrush</th>
                <th className="py-3 px-4 font-semibold">Ahrefs</th>
                <th className="py-3 pl-4 font-semibold">Ubersuggest / Moz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-white">Monthly Price</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 bg-emerald-950/15">
                  $0 / month Forever
                </td>
                <td className="py-3.5 px-4 font-mono text-rose-400">$139.95 – $499.95/mo</td>
                <td className="py-3.5 px-4 font-mono text-rose-400">$129 – $449/mo</td>
                <td className="py-3.5 pl-4 font-mono text-rose-400">$29 – $199/mo</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-white">Daily Keyword Searches</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-300 bg-emerald-950/15">
                  Unlimited (No Credit Caps)
                </td>
                <td className="py-3.5 px-4 text-slate-400">Capped at 10/day on free</td>
                <td className="py-3.5 px-4 text-slate-400">No free tier (Credit metered)</td>
                <td className="py-3.5 pl-4 text-slate-400">Capped at 3/day on free</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-white">Live Google Autocomplete Stream</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-300 bg-emerald-950/15">
                  Included Free Above Guides
                </td>
                <td className="py-3.5 px-4 text-slate-400">Paid Keyword Magic Tool</td>
                <td className="py-3.5 px-4 text-slate-400">Paid Matching Terms</td>
                <td className="py-3.5 pl-4 text-slate-400">Limited rows behind paywall</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-white">Cloud XML Sitemap URL Extractor</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-300 bg-emerald-950/15">
                  Unlimited Cloud Extraction + CSV
                </td>
                <td className="py-3.5 px-4 text-slate-400">Paid Site Audit Crawl Limits</td>
                <td className="py-3.5 px-4 text-slate-400">Requires $249/mo Standard</td>
                <td className="py-3.5 pl-4 text-slate-400">Capped crawl rows</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-semibold text-white">Automated H2 SEO Content Guides</td>
                <td className="py-3.5 px-4 font-semibold text-emerald-300 bg-emerald-950/15 rounded-b-lg">
                  Included Free + JSON-LD Schema
                </td>
                <td className="py-3.5 px-4 text-slate-400">Requires $249.95/mo Guru</td>
                <td className="py-3.5 px-4 text-slate-400">Paid add-on</td>
                <td className="py-3.5 pl-4 text-slate-400">Paid tier only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive SEO Subscription Savings Calculator */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-1">
              <Calculator className="w-4 h-4" />
              <span>Interactive SEO Stack Savings Calculator</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              See How Much You Save Using SERPgpt Instead of Paid SEO Tools
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click the paid SEO tools you are replacing with SERPgpt.pro to calculate your instant annual savings:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4 shrink-0">
            <div>
              <div className="text-[11px] text-slate-400">Monthly Cost Replaced</div>
              <div className="text-xl font-extrabold font-mono text-white">
                ${savingsSummary.monthlySaved.toLocaleString()}/mo
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <div className="text-[11px] text-slate-400">Annual Savings with SERPgpt</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400">
                ${savingsSummary.annualSaved.toLocaleString()}/yr
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
          {FREE_STARTUP_BLOG_ARTICLES.map((item) => {
            const isSelected = selectedPaidIds.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCalculatorItem(item.id)}
                className={`text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/50 border-indigo-500/60 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{item.bigStartupName.split('(')[0].trim()}</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">
                    Replaced by: SERPgpt.pro (Free)
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-rose-400 line-through">
                    ${item.bigStartupMonthlyCost}/mo
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 font-semibold">$0/mo</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Custom "SERPgpt is the Free Version of [Any SEO Tool]" Blog Generator */}
      <div className="bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Compare SERPgpt Against Any Other Paid SEO Tool</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Type any paid SEO or marketing tool (e.g., Majestic, Similarweb, Conductor, BrightEdge, MarketMuse) to generate a full SERPgpt free comparison guide.
            </p>
          </div>

          <form onSubmit={handleGenerateCustomBlog} className="flex flex-col sm:flex-row gap-2.5 flex-grow max-w-xl">
            <input
              type="text"
              value={startupGeneratorInput}
              onChange={(e) => setStartupGeneratorInput(e.target.value)}
              placeholder="Enter any paid SEO tool (e.g. Similarweb, Majestic, MarketMuse)..."
              className="flex-grow px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Compare with SERPgpt</span>
            </button>
          </form>
        </div>
      </div>

      {/* Category Filter + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All SEO Comparisons' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Semrush, Ahrefs, Moz, Surfer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of SEO Blog Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <article
            key={article.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-6 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[11px] font-semibold">
                  {article.category}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-mono font-semibold">
                  Save ${article.bigStartupAnnualCost.toLocaleString()}/yr
                </span>
              </div>

              <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2">
                <button
                  type="button"
                  onClick={() => onSelectArticle(article.slug)}
                  className="text-left cursor-pointer"
                >
                  {article.title}
                </button>
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                {article.metaDescription}
              </p>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 mb-4">
                <div className="text-[11px] text-slate-400">100% Free Replacement:</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">
                  {article.topFreeVersionName}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="text-slate-400">
                {article.readingTimeMinutes} min read
              </div>

              <button
                type="button"
                onClick={() => onSelectArticle(article.slug)}
                className="inline-flex items-center gap-1 font-semibold text-indigo-400 group-hover:text-indigo-300 cursor-pointer"
              >
                <span>Read SEO Guide</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
