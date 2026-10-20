import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  ArrowUpRight,
  FileCode,
  Database,
  ShieldCheck,
  FolderTree,
  Video,
  Image as ImageIcon,
  Table as TableIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import {
  SITEMAP_MASTER_BLUEPRINTS,
  SitemapMasterPageBlueprint,
  findSitemapBlueprintByPath,
} from './sitemapArchitectureData';

export interface ExtractedUrlItem {
  loc: string;
  subfolder: string;
  depth: number;
  lastmod: string;
  changefreq: string;
  priority: string;
  images: string[];
  videos: Array<{ title: string; url: string }>;
  sourceSitemap: string;
}

interface SitemapExtractorToolPageProps {
  activeSlug: string;
  onSelectBlueprintSlug: (slug: string) => void;
  onLaunchKeywordScan: (seedKeyword: string) => void;
  onBackToHome: () => void;
}

const PYTHON_EXTRACTOR_SCRIPT = `import csv
import gzip
import urllib.request
import xml.etree.ElementTree as ET

NAMESPACES = {
    "sm": "http://www.sitemaps.org/schemas/sitemap/0.9",
    "image": "http://www.google.com/schemas/sitemap-image/1.1",
    "video": "http://www.google.com/schemas/sitemap-video/1.1",
}

def fetch_xml_root(sitemap_url: str) -> ET.Element:
    req = urllib.request.Request(
        sitemap_url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; SitemapExtractor/2.0)"}
    )
    with urllib.request.urlopen(req, timeout=15) as response:
        raw_bytes = response.read()
        if sitemap_url.endswith(".gz"):
            raw_bytes = gzip.decompress(raw_bytes)
        return ET.fromstring(raw_bytes)

def extract_sitemap_urls(sitemap_url: str, max_child_sitemaps: int = 10) -> list[dict]:
    root = fetch_xml_root(sitemap_url)
    extracted = []
    child_sitemaps = root.findall("sm:sitemap/sm:loc", NAMESPACES)
    if child_sitemaps:
        for child in child_sitemaps[:max_child_sitemaps]:
            if child.text:
                extracted.extend(extract_sitemap_urls(child.text.strip(), max_child_sitemaps))
        return extracted
    for url_node in root.findall("sm:url", NAMESPACES):
        loc = url_node.findtext("sm:loc", default="", namespaces=NAMESPACES).strip()
        lastmod = url_node.findtext("sm:lastmod", default="", namespaces=NAMESPACES).strip()
        priority = url_node.findtext("sm:priority", default="0.5", namespaces=NAMESPACES).strip()
        images = [
            img.text.strip()
            for img in url_node.findall("image:image/image:loc", NAMESPACES)
            if img.text
        ]
        if loc:
            extracted.append({
                "url": loc,
                "lastmod": lastmod,
                "priority": priority,
                "image_count": len(images),
                "first_image": images[0] if images else "",
                "source_sitemap": sitemap_url,
            })
    return extracted
`;

export default function SitemapExtractorToolPage({
  activeSlug,
  onSelectBlueprintSlug,
  onBackToHome,
}: SitemapExtractorToolPageProps) {
  const currentBlueprint: SitemapMasterPageBlueprint = useMemo(() => {
    return findSitemapBlueprintByPath(activeSlug) || SITEMAP_MASTER_BLUEPRINTS[0];
  }, [activeSlug]);

  const [sitemapInputUrl, setSitemapInputUrl] = useState<string>('');
  const [inputMode, setInputMode] = useState<'url' | 'raw-xml'>('url');
  const [rawXmlInput, setRawXmlInput] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);
  const [extractedUrls, setExtractedUrls] = useState<ExtractedUrlItem[]>([]);

  const [activeToolTab, setActiveToolTab] = useState<
    'extractor' | 'csv-excel' | 'compare' | 'python' | 'visual-tree' | 'video-image'
  >(currentBlueprint.defaultToolTab);

  // Table filter & sort states
  const [urlSearchFilter, setUrlSearchFilter] = useState<string>('');
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>('ALL');
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sync active tool tab when user navigates between sitemap guide routes
  useEffect(() => {
    setActiveToolTab(currentBlueprint.defaultToolTab);
  }, [currentBlueprint.slug, currentBlueprint.defaultToolTab]);

  // Run live extraction when user submits a URL or raw XML
  const runSitemapExtraction = async (overrideUrl?: string, useRawXml?: boolean) => {
    const isXmlMode = useRawXml ?? inputMode === 'raw-xml';
    const targetUrl = (overrideUrl ?? sitemapInputUrl).trim();
    if (!isXmlMode && !targetUrl) {
      setExtractNotice('Please enter a valid XML sitemap URL or website domain.');
      return;
    }
    if (isXmlMode && !rawXmlInput.trim()) {
      setExtractNotice('Please paste raw XML sitemap content to parse.');
      return;
    }

    setIsExtracting(true);
    setExtractNotice(null);
    try {
      const payload = isXmlMode ? { rawXml: rawXmlInput } : { sitemapUrl: targetUrl };

      const res = await fetch('/api/sitemap/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setExtractedUrls([]);
        setExtractNotice(data?.error || `Failed to extract sitemap (${res.status}).`);
        return;
      }
      if (Array.isArray(data.urls)) {
        setExtractedUrls(data.urls);
      }
      if (data.notice) {
        setExtractNotice(data.notice);
      }
    } catch (err: any) {
      setExtractedUrls([]);
      setExtractNotice(err?.message || 'Failed to parse XML sitemap.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Subfolder distribution for facet pills & Visual Sitemap Tree
  const subfolderStats = useMemo(() => {
    const counts = new Map<string, ExtractedUrlItem[]>();
    extractedUrls.forEach((item) => {
      const folder = item.subfolder || '/';
      const existing = counts.get(folder) || [];
      existing.push(item);
      counts.set(folder, existing);
    });
    return Array.from(counts.entries())
      .map(([folder, items]) => ({
        folder,
        count: items.length,
        percentage: extractedUrls.length > 0 ? Math.round((items.length / extractedUrls.length) * 100) : 0,
        items,
      }))
      .sort((a, b) => b.count - a.count);
  }, [extractedUrls]);

  const filteredUrls = useMemo(() => {
    return extractedUrls.filter((u) => {
      if (selectedSubfolder !== 'ALL' && u.subfolder !== selectedSubfolder) {
        return false;
      }
      if (urlSearchFilter.trim()) {
        return u.loc.toLowerCase().includes(urlSearchFilter.toLowerCase());
      }
      return true;
    });
  }, [extractedUrls, selectedSubfolder, urlSearchFilter]);

  const mediaUrls = useMemo(() => {
    return extractedUrls.filter((u) => u.images.length > 0 || u.videos.length > 0);
  }, [extractedUrls]);

  // Silently inject SEO <title>, <meta name="description">, <meta name="keywords">, canonical link, and JSON-LD into <head>
  useEffect(() => {
    const canonicalHref = `https://serpgpt.pro${currentBlueprint.slug}`;
    document.title = `${currentBlueprint.title} | SERPgpt.pro`;

    const allKeywords = [
      currentBlueprint.primaryKeyword,
      ...currentBlueprint.cannibalizationTermsMerged,
    ].join(', ');

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

    setMetaTag('meta[name="description"]', 'content', currentBlueprint.informationGainHook);
    setMetaTag('meta[name="keywords"]', 'content', allKeywords);
    setMetaTag('meta[property="og:title"]', 'content', currentBlueprint.title);
    setMetaTag('meta[property="og:description"]', 'content', currentBlueprint.informationGainHook);
    setMetaTag('meta[property="og:url"]', 'content', canonicalHref);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalHref;

    const scriptId = 'serpgpt-sitemap-blueprint-jsonld';
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
            currentBlueprint.schemaType === 'Table' ? 'TechArticle' : currentBlueprint.schemaType,
          headline: currentBlueprint.h1,
          name: currentBlueprint.title,
          description: currentBlueprint.informationGainHook,
          url: canonicalHref,
          keywords: allKeywords,
          author: {
            '@type': 'Organization',
            name: 'SERPgpt.pro',
            url: 'https://serpgpt.pro',
          },
        },
        {
          '@type': 'SoftwareApplication',
          name: currentBlueprint.h1,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: currentBlueprint.faqs.map((f) => ({
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
  }, [currentBlueprint]);

  // Export & Copy Helpers
  const handleCopyPlainList = () => {
    const text = filteredUrls.map((u) => u.loc).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedState('plain-list');
      setTimeout(() => setCopiedState(null), 2000);
    }
  };

  const handleCopyPythonScript = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PYTHON_EXTRACTOR_SCRIPT);
      setCopiedState('python-script');
      setTimeout(() => setCopiedState(null), 2000);
    }
  };

  const handleDownloadCsv = () => {
    const headers = [
      'URL',
      'Subfolder',
      'Path Depth',
      'Last Modified',
      'Change Frequency',
      'Priority',
      'Image Count',
      'Video Count',
      'Source Sitemap',
    ];
    const rows = filteredUrls.map((u) => [
      `"${u.loc.replace(/"/g, '""')}"`,
      `"${u.subfolder}"`,
      u.depth,
      u.lastmod,
      u.changefreq,
      u.priority,
      u.images.length,
      u.videos.length,
      `"${u.sourceSitemap.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitemap-extracted-urls-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const txt = filteredUrls.map((u) => u.loc).join('\n');
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitemap-urls-list-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-6">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-indigo-400 font-semibold">XML Site Map Extractor</span>
        </div>
      </div>

      {/* Clean Hero Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-3">
          {currentBlueprint.h1}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Enter any website domain or XML sitemap URL below to extract canonical URLs, directory structures, last-modified dates, and embedded image or video assets—ready to export to CSV, Excel, or plain text.
        </p>
      </header>

      {/* ===================================================================== */}
      {/* ABOVE-THE-FOLD INTERACTIVE WORKSPACE: LIVE XML SITEMAP EXTRACTOR TOOL */}
      {/* ===================================================================== */}
      <section className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-7 mb-12 shadow-2xl">
        {/* Top Input Mode Switcher + URL Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800 mb-5">
          <div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>XML Sitemap &amp; SitemapIndex Parser</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Extract URLs, Directories &amp; Media from Any Sitemap
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Extract by URL / Domain
            </button>
            <button
              type="button"
              onClick={() => setInputMode('raw-xml')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                inputMode === 'raw-xml'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Paste Raw XML Sitemap
            </button>
          </div>
        </div>

        {inputMode === 'url' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSitemapExtraction(sitemapInputUrl, false);
            }}
            className="flex flex-col sm:flex-row gap-2.5 mb-5"
          >
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={sitemapInputUrl}
                onChange={(e) => setSitemapInputUrl(e.target.value)}
                placeholder="Enter XML Sitemap URL or Domain (e.g. https://serpgpt.pro/sitemap.xml)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isExtracting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
              <span>{isExtracting ? 'Extracting Sitemap...' : 'Extract Sitemap URLs'}</span>
            </button>
          </form>
        ) : (
          <div className="mb-5 space-y-3">
            <textarea
              rows={5}
              value={rawXmlInput}
              onChange={(e) => setRawXmlInput(e.target.value)}
              placeholder="Paste raw <urlset> or <sitemapindex> XML content here..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => runSitemapExtraction(undefined, true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Code2 className="w-4 h-4" />
                <span>Parse Pasted XML Sitemap</span>
              </button>
            </div>
          </div>
        )}

        {extractNotice && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-center justify-between">
            <span>{extractNotice}</span>
            <button
              type="button"
              onClick={() => setExtractNotice(null)}
              className="underline ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Interactive Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 rounded-xl p-2 mb-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveToolTab('extractor')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeToolTab === 'extractor'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>URL Table ({extractedUrls.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('csv-excel')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeToolTab === 'csv-excel'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CSV / Excel / Plain-Text</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('visual-tree')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeToolTab === 'visual-tree'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Visual Tree ({subfolderStats.length} Directories)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('compare')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeToolTab === 'compare'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>CMS Sitemap Formats</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('python')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeToolTab === 'python'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Python Script</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveToolTab('video-image')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeToolTab === 'video-image'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video &amp; Image Media ({mediaUrls.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPlainList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              {copiedState === 'plain-list' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied {filteredUrls.length} URLs!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy URLs</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* Subfolder Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Filter by Directory:</span>
            <button
              type="button"
              onClick={() => setSelectedSubfolder('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                selectedSubfolder === 'ALL'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              ALL ({extractedUrls.length})
            </button>
            {subfolderStats.map((sf) => (
              <button
                key={sf.folder}
                type="button"
                onClick={() => setSelectedSubfolder(sf.folder)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                  selectedSubfolder === sf.folder
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sf.folder} ({sf.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={urlSearchFilter}
              onChange={(e) => setUrlSearchFilter(e.target.value)}
              placeholder="Filter extracted URLs..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* TAB 1: SEARCHABLE EXTRACTED URL DATABASE TABLE */}
        {activeToolTab === 'extractor' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Extracted URL (&lt;loc&gt;)</th>
                    <th className="py-3 px-3">Directory</th>
                    <th className="py-3 px-3">Last Modified</th>
                    <th className="py-3 px-3">Frequency / Priority</th>
                    <th className="py-3 px-4 text-right">Media Assets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs font-mono">
                  {filteredUrls.map((item, idx) => (
                    <tr key={item.loc + idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2.5 px-4 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-4 text-slate-100 break-all">
                        <a
                          href={item.loc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 inline-flex items-center gap-1.5"
                        >
                          <span>{item.loc}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                        </a>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/50 text-indigo-300">
                          {item.subfolder}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{item.lastmod}</td>
                      <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                        {item.changefreq} · <span className="text-emerald-400">{item.priority}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {item.images.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 mr-1.5">
                            <ImageIcon className="w-3 h-3" />
                            {item.images.length}
                          </span>
                        )}
                        {item.videos.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/80 text-purple-300">
                            <Video className="w-3 h-3" />
                            {item.videos.length}
                          </span>
                        )}
                        {item.images.length === 0 && item.videos.length === 0 && (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CSV / EXCEL / PLAIN-TEXT LIST CONVERTER */}
        {activeToolTab === 'csv-excel' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Plain-Text URL List ({filteredUrls.length} URLs — 1 per line)
                </span>
                <button
                  type="button"
                  onClick={handleCopyPlainList}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedState === 'plain-list' ? 'Copied to Clipboard!' : 'Copy All Lines'}
                </button>
              </div>
              <textarea
                readOnly
                rows={10}
                value={filteredUrls.map((u) => u.loc).join('\n')}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">
                  Instant Sitemap Export Formats
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Download your filtered sitemap inventory in UTF-8 CSV (for Microsoft Excel &amp; Google Sheets) or raw newline-delimited TXT (for Screaming Frog &amp; CLI tools).
                </p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export to Excel / CSV ({filteredUrls.length} rows)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Plain-Text (.txt) List</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Columns included: <code className="text-slate-200">URL, Subfolder, Depth, LastMod, ChangeFreq, Priority, Images, Videos</code>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VISUAL SITEMAP HIERARCHY TREE */}
        {activeToolTab === 'visual-tree' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Visual Sitemap Directory Tree
                </h3>
                <p className="text-xs text-slate-400">
                  Interactive visual breakdown of all {extractedUrls.length} URLs grouped by top-level directory folder.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subfolderStats.map((group) => (
                <div
                  key={group.folder}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800">
                      <span className="font-mono text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5" />
                        {group.folder}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-300 text-[11px] font-mono">
                        {group.count} URLs ({group.percentage}%)
                      </span>
                    </div>

                    <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {group.items.map((u, i) => {
                        let shortPath = u.loc;
                        try {
                          shortPath = new URL(u.loc).pathname;
                        } catch {
                          // Keep full
                        }
                        return (
                          <li
                            key={i}
                            className="text-xs font-mono text-slate-300 truncate bg-slate-950/70 px-2.5 py-1 rounded border border-slate-800/60"
                            title={u.loc}
                          >
                            ├─ {shortPath}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WORDPRESS / YOAST / SHOPIFY COMPARISON MATRIX */}
        {activeToolTab === 'compare' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                    <th className="py-3 px-4">CMS / Sitemap Generator</th>
                    <th className="py-3 px-4">Default Root Sitemap Endpoint</th>
                    <th className="py-3 px-4">Child Sitemap Structure</th>
                    <th className="py-3 px-4">Includes Image Tags?</th>
                    <th className="py-3 px-4 text-right">One-Click Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Standard XML Sitemap</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">/sitemap.xml</td>
                    <td className="py-3 px-4">Primary URLset + Image &amp; Video Extensions</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">Yes (&lt;image:loc&gt; + &lt;video:video&gt;)</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSitemapInputUrl('https://serpgpt.pro/sitemap.xml');
                          setActiveToolTab('extractor');
                          runSitemapExtraction('https://serpgpt.pro/sitemap.xml', false);
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-600 text-white font-semibold cursor-pointer"
                      >
                        Load Sitemap
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">WordPress Core (5.5+)</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">/wp-sitemap.xml</td>
                    <td className="py-3 px-4">wp-sitemap-posts-post-1.xml, wp-sitemap-posts-page-1.xml</td>
                    <td className="py-3 px-4 text-slate-400">No (URL + LastMod only)</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">Supported</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Yoast SEO / RankMath</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">/sitemap_index.xml</td>
                    <td className="py-3 px-4">post-sitemap.xml, page-sitemap.xml, category-sitemap.xml</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">Yes (&lt;image:image&gt; count)</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">Supported</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Shopify E-Commerce</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">/sitemap.xml</td>
                    <td className="py-3 px-4">sitemap_products_1.xml, sitemap_collections_1.xml</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">Yes (Product Image CDN URLs)</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">Supported</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PYTHON SITEMAP URL EXTRACTOR SCRIPT */}
        {activeToolTab === 'python' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Python 3 Recursive Sitemap &amp; Image Extractor Script
                </h3>
                <p className="text-xs text-slate-400">
                  Zero external dependencies required (uses Python standard library <code className="text-indigo-300">xml.etree.ElementTree</code>, <code className="text-indigo-300">gzip</code>, and <code className="text-indigo-300">csv</code>).
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPythonScript}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedState === 'python-script' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Python Script!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Python Script</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[360px]">
              {PYTHON_EXTRACTOR_SCRIPT}
            </pre>
          </div>
        )}

        {/* TAB 6: VIDEO & IMAGE MEDIA SITEMAP HARVESTER */}
        {activeToolTab === 'video-image' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Parent Page URL (&lt;loc&gt;)</th>
                    <th className="py-3 px-4">Extracted &lt;image:loc&gt; Assets</th>
                    <th className="py-3 px-4">Extracted &lt;video:content_loc&gt; Assets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono">
                  {mediaUrls.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-white break-all">{m.loc}</td>
                      <td className="py-3 px-4 text-sky-300">
                        {m.images.length > 0 ? m.images.join(', ') : '—'}
                      </td>
                      <td className="py-3 px-4 text-purple-300">
                        {m.videos.length > 0
                          ? m.videos.map((v) => `${v.title} (${v.url})`).join(', ')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* CLEAN EDITORIAL GUIDE SECTIONS                                        */}
      {/* ===================================================================== */}
      <section className="space-y-6 mb-12">
        {currentBlueprint.sections.map((sec, idx) => (
          <article
            key={idx}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8"
          >
            {sec.level === 'H2' ? (
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{sec.heading}</h2>
            ) : (
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">{sec.heading}</h3>
            )}

            <div className="space-y-3.5 text-sm sm:text-base text-slate-300 leading-relaxed">
              {sec.editorialContent.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {sec.keyTakeaways.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <ul className="space-y-1.5">
                  {sec.keyTakeaways.map((tk, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </section>

      {/* ===================================================================== */}
      {/* FREQUENTLY ASKED QUESTIONS                                            */}
      {/* ===================================================================== */}
      <section className="mb-12 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {currentBlueprint.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden"
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
                  <div className="px-5 pb-4 pt-3 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/70">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* RELATED SITEMAP EXTRACTOR GUIDES & TOOLS (CLEAN INTERNAL LINKS)       */}
      {/* ===================================================================== */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="pb-4 border-b border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-white">
            Related Sitemap Tools &amp; Guides
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore specialized sitemap workflows for CSV conversion, Python automation, visual architecture trees, and media extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SITEMAP_MASTER_BLUEPRINTS.map((bp) => {
            const isActive = bp.slug === currentBlueprint.slug;
            return (
              <a
                key={bp.id}
                href={bp.slug}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectBlueprintSlug(bp.slug);
                }}
                className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between group ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50 text-slate-300'
                }`}
              >
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 leading-snug">
                    {bp.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {bp.sections[0]?.description || bp.h1}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400">
                  <span>{isActive ? 'Currently Viewing' : 'Open Guide'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
