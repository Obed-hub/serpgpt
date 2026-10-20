import React, { useState } from 'react';
import { KeywordOpportunity } from './types';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  Wrench,
  Sparkles,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import { slugify, triggerFileDownload } from './exportUtils';

interface RankImplementationModalProps {
  keyword: KeywordOpportunity;
  clusterKeywords: KeywordOpportunity[];
  niche: string;
  geo: string;
  onClose: () => void;
}

type BuilderTrack = 'ai-builder' | 'manual-cms' | 'negative-list';
type NegativeMatchType = 'broad' | 'phrase' | 'exact';

export default function RankImplementationModal({
  keyword,
  clusterKeywords,
  niche,
  geo,
  onClose,
}: RankImplementationModalProps) {
  const [activeTrack, setActiveTrack] = useState<BuilderTrack>('ai-builder');
  const [negMatchType, setNegMatchType] = useState<NegativeMatchType>('phrase');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const targetSlug = `/${slugify(niche)}/${slugify(keyword.keyword)}`;
  const supportingCluster = clusterKeywords
    .filter((k) => k.id !== keyword.id)
    .slice(0, 6);

  // 1. Track A: Master Prompt for AI Website Builders (Cursor, Bolt, Lovable, v0, Claude)
  const aiBuilderPrompt = `# Role: Senior Full-Stack SEO & Conversion Engineer
Build a high-converting, zero-thin-content interactive landing page to rank #1 on Google (${geo}) for the primary keyword:
"${keyword.keyword}" (${keyword.avgMonthlySearches.toLocaleString()} searches/mo · Google Ads CPC: $${keyword.highTopOfPageBid.toFixed(2)} · Competition Index: ${keyword.competitionIndex}/100).

## Why This Page Will Outrank Current Top 3 Results
- **Current SERP Weak Spot:** ${keyword.weakSpot.type} (${keyword.weakSpot.topDomain}, OpenPageRank ${keyword.weakSpot.domainPageRank.toFixed(1)}/10)
- **Vulnerability to Exploit:** ${keyword.weakSpot.opportunityNote}
- **Anti-AI-Overview Strategy (${keyword.aiSurvival.status} · ${keyword.aiSurvival.ctrEstimate}% CTR):** ${keyword.aiSurvival.reason}

## 1. Route & Metadata Specification
- **Route Path:** \`${targetSlug}\`
- **Title Tag (<60 chars):** \`${keyword.keyword.replace(/\b\w/g, (c) => c.toUpperCase())} (2026 Live Tool & Guide)\`
- **Meta Description (<155 chars):** \`Interactive ${keyword.keyword} calculator and verified 2026 directory. Compare exact requirements, costs, and eligibility in under 60 seconds.\`

## 2. Mandatory Above-the-Fold Interactive Micro-Tool (Anti-Thin-Content Core)
Do NOT build a wall-of-text blog post. Build a functional interactive React/TypeScript component above the fold:
- **Interactive Input Controls:** Allow the user to filter or calculate their exact scenario for "${keyword.keyword}" (e.g., State/Region selector, Budget/Size slider, and Qualification status toggle).
- **Live Output Card:** Dynamically compute estimated payout/savings, qualification score, and direct official links with tabular numerals (\`tabular-nums\`).
- **Export Action:** Include a "Download Personalized Checklist (CSV / Markdown)" button.

## 3. Consolidated Secondary Keyword H2 Sections (Avoid Keyword Cannibalization)
Instead of creating thin separate pages for closely related queries, fulfill these ${supportingCluster.length} supporting low-competition keywords as structured H2 sections on this same page:
${supportingCluster.map((k, i) => `${i + 1}. **H2: ${k.keyword.replace(/\b\w/g, (c) => c.toUpperCase())}** (${k.avgMonthlySearches.toLocaleString()}/mo · Comp ${k.competitionIndex}/100) — Include a comparison table or step-by-step checklist.`).join('\n')}

## 4. Schema.org JSON-LD Structured Data
Inject both \`SoftwareApplication\` and \`FAQPage\` JSON-LD in the document head so Google awards Rich Snippets.`;

  // Ready-to-drop Next.js / Astro / Vite programmatic SEO JSON dataset
  const seoRoutesJson = JSON.stringify(
    [keyword, ...supportingCluster].map((k) => ({
      slug: `/${slugify(niche)}/${slugify(k.keyword)}`,
      primaryKeyword: k.keyword,
      intent: k.intent,
      monthlyVolume: k.avgMonthlySearches,
      cpcHighUsd: k.highTopOfPageBid,
      competitionIndex: k.competitionIndex,
      metaTitle: `${k.keyword.replace(/\b\w/g, (c) => c.toUpperCase())} [2026 Verified Guide & Tool]`,
      metaDescription: `Complete 2026 breakdown for ${k.keyword}. Check eligibility, compare top options, and use our free interactive calculator.`,
      serpWeakSpotToBeat: `${k.weakSpot.type} on ${k.weakSpot.topDomain}: ${k.weakSpot.opportunityNote}`,
    })),
    null,
    2
  );

  // 2. Track B: Manual Website Builders (WordPress, Webflow, Framer, Shopify, Custom HTML)
  const manualHeadAndSchemaSnippet = `<!-- Paste into WordPress / Webflow / HTML <head> for "${keyword.keyword}" -->
<title>${keyword.keyword.replace(/\b\w/g, (c) => c.toUpperCase())} – 2026 Calculator & Complete Guide</title>
<meta name="description" content="Verified 2026 resource for ${keyword.keyword}. Compare requirements, exact figures, and step-by-step qualification rules." />
<link rel="canonical" href="https://yourdomain.com${targetSlug}" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "${keyword.keyword.replace(/\b\w/g, (c) => c.toUpperCase())} Interactive Tool",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does ${keyword.keyword} work in 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${keyword.weakSpot.opportunityNote.replace(/"/g, "'")}"
          }
        },
        {
          "@type": "Question",
          "name": "What is required to qualify or get started with ${keyword.keyword}?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${keyword.aiSurvival.reason.replace(/"/g, "'")}"
          }
        }
      ]
    }
  ]
}
</script>`;

  const manualHtmlBodyBlock = `<!-- Paste into WordPress Gutenberg (Custom HTML Block) or Webflow Rich Text -->
<section class="serpgpt-authority-block" style="font-family: system-ui, sans-serif; max-width: 820px; margin: 2rem auto; line-height: 1.6;">
  <h1>${keyword.keyword.replace(/\b\w/g, (c) => c.toUpperCase())} (2026 Verified Guide)</h1>
  <p><strong>Quick Summary:</strong> ${keyword.weakSpot.opportunityNote} ${keyword.aiSurvival.reason}</p>

  <h2>2026 Comparison &amp; Qualification Matrix</h2>
  <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
    <thead>
      <tr style="background: #0f172a; color: #ffffff; text-align: left;">
        <th style="padding: 12px; border: 1px solid #334155;">Program / Option</th>
        <th style="padding: 12px; border: 1px solid #334155;">Primary Requirement</th>
        <th style="padding: 12px; border: 1px solid #334155;">2026 Status</th>
      </tr>
    </thead>
    <tbody>
      ${[keyword, ...supportingCluster.slice(0, 3)]
        .map(
          (k) => `<tr>
        <td style="padding: 12px; border: 1px solid #cbd5e1;"><strong>${k.keyword}</strong></td>
        <td style="padding: 12px; border: 1px solid #cbd5e1;">${k.aiSurvival.reason}</td>
        <td style="padding: 12px; border: 1px solid #cbd5e1;">Verified Open (${geo})</td>
      </tr>`
        )
        .join('\n      ')}
    </tbody>
  </table>

  <h2>Frequently Asked Questions</h2>
  ${supportingCluster
    .slice(0, 4)
    .map(
      (k) => `<h3>${k.keyword.replace(/\b\w/g, (c) => c.toUpperCase())}?</h3>
  <p>${k.weakSpot.opportunityNote} ${k.aiSurvival.reason}</p>`
    )
    .join('\n  ')}
</section>`;

  // 3. Track C: Negative Keyword Exclusion List Generator (For Google Ads & Excel Export)
  const rawNegativeTerms = [
    { category: 'Zero-Budget / Freebie Hunters', term: 'torrent' },
    { category: 'Zero-Budget / Freebie Hunters', term: 'cracked' },
    { category: 'Zero-Budget / Freebie Hunters', term: 'pirated' },
    { category: 'Zero-Budget / Freebie Hunters', term: 'scam' },
    { category: 'Job & Career Seekers', term: 'jobs' },
    { category: 'Job & Career Seekers', term: 'salary' },
    { category: 'Job & Career Seekers', term: 'hiring' },
    { category: 'Job & Career Seekers', term: 'internship' },
    { category: 'Job & Career Seekers', term: 'resume' },
    { category: 'Job & Career Seekers', term: 'glassdoor' },
    { category: 'Academic & Homework Queries', term: 'wikipedia' },
    { category: 'Academic & Homework Queries', term: 'definition' },
    { category: 'Academic & Homework Queries', term: 'meaning' },
    { category: 'Academic & Homework Queries', term: 'essay' },
    { category: 'Academic & Homework Queries', term: 'coursework' },
    { category: 'Unqualified Forum & Support Clicks', term: 'login problem' },
    { category: 'Unqualified Forum & Support Clicks', term: 'customer service phone number' },
    { category: 'Unqualified Forum & Support Clicks', term: 'cancel subscription' },
    { category: 'Unqualified Forum & Support Clicks', term: 'refund policy' },
    { category: `Niche Exclusions (${niche})`, term: `${niche.toLowerCase()} meme` },
    { category: `Niche Exclusions (${niche})`, term: `${niche.toLowerCase()} history` },
    { category: `Niche Exclusions (${niche})`, term: `${niche.toLowerCase()}homework` },
  ];

  const formatNegativeTerm = (term: string, match: NegativeMatchType) => {
    if (match === 'exact') return `[${term}]`;
    if (match === 'phrase') return `"${term}"`;
    return term;
  };

  const formattedNegativeText = rawNegativeTerms
    .map((item) => formatNegativeTerm(item.term, negMatchType))
    .join('\n');

  const handleDownloadNegativeExcelCsv = () => {
    const headers = ['Negative Keyword', 'Match Type', 'Exclusion Category', 'Campaign / Niche'];
    const rows = rawNegativeTerms.map((item) => [
      `"${formatNegativeTerm(item.term, negMatchType).replace(/"/g, '""')}"`,
      negMatchType.toUpperCase(),
      `"${item.category}"`,
      `"${niche}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerFileDownload(
      csv,
      `google-ads-negative-keywords-${slugify(niche)}-${negMatchType}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400">
              #1 Ranking Implementation Kit · Zero Thin Pages Architecture
            </div>
            <h2 className="text-lg font-bold text-white truncate">
              Build &amp; Rank: &ldquo;{keyword.keyword}&rdquo;
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Track Selector Tabs */}
        <div className="px-6 pt-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTrack('ai-builder')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTrack === 'ai-builder'
                ? 'border-indigo-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>1. AI Website Builder (Cursor / Bolt / Lovable)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrack('manual-cms')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTrack === 'manual-cms'
                ? 'border-indigo-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. Manual Builder (WordPress / Webflow / HTML)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrack('negative-list')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
              activeTrack === 'negative-list'
                ? 'border-indigo-500 text-white bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Negative Keyword List &amp; Excel Export</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Anti-Thin-Content Cluster Fulfillment Architecture Summary */}
          <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">
                  Zero-Thin-Pages Consolidation Architecture (1 URL = {supportingCluster.length + 1} Keywords)
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Instead of publishing {supportingCluster.length + 1} separate thin articles that trigger Google&apos;s <strong className="text-white">Scaled Content Abuse / Doorway Page</strong> penalty, consolidate this entire cluster into <strong className="text-emerald-400 font-mono">{targetSlug}</strong>:
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-semibold whitespace-nowrap shrink-0">
                Combined Vol: {[keyword, ...supportingCluster].reduce((s, k) => s + k.avgMonthlySearches, 0).toLocaleString()}/mo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3">
                <div className="font-semibold text-white mb-1">1. Canonical Pillar H1 + Tool</div>
                <div className="font-mono text-indigo-300 truncate">{keyword.keyword}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Fulfilled via above-the-fold interactive calculator &amp; live filter matrix.
                </div>
              </div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3">
                <div className="font-semibold text-white mb-1">
                  2. Interactive State &amp; H2 Sub-Sections ({supportingCluster.length} Keywords)
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {supportingCluster.map((k) => k.keyword).join(' · ')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Fulfilled via filterable tabs (<code className="text-emerald-400">?type=...</code>) + H2 comparison tables on the same page.
                </div>
              </div>
              <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3">
                <div className="font-semibold text-white mb-1">3. SERP Weak-Spot Takeover</div>
                <div className="text-[11px] text-emerald-400 font-medium truncate">
                  Outranks: {keyword.weakSpot.topDomain} (PR {keyword.weakSpot.domainPageRank.toFixed(1)})
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Replaces unstructured forum/thin text with verified Schema.org JSON-LD &amp; instant answers.
                </div>
              </div>
            </div>
          </div>

          {/* TRACK 1: AI BUILDER PROMPT & JSON ROUTES */}
          {activeTrack === 'ai-builder' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Master Prompt for Cursor / Bolt / Lovable / Claude Code
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Consolidates 1 primary keyword + {supportingCluster.length} supporting cluster keywords into 1 interactive tool page so Google never flags you for thin doorway pages.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(aiBuilderPrompt, 'ai-prompt')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'ai-prompt' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Prompt!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy AI Builder Prompt</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerFileDownload(
                          aiBuilderPrompt,
                          `cursor-seo-prompt-${slugify(keyword.keyword)}.md`,
                          'text/markdown;charset=utf-8;'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 max-h-60 overflow-y-auto">
                  {aiBuilderPrompt}
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ready-to-Import `seo-routes-data.json` (Next.js / Astro / Vite)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Drop this JSON file into your codebase to dynamically populate meta titles, descriptions, slugs, and SERP weak-spot angles.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(seoRoutesJson, 'routes-json')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'routes-json' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied JSON</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerFileDownload(
                          seoRoutesJson,
                          `seo-routes-${slugify(niche)}.json`,
                          'application/json;charset=utf-8;'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download seo-routes.json</span>
                    </button>
                  </div>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
                  {seoRoutesJson}
                </pre>
              </div>
            </div>
          )}

          {/* TRACK 2: MANUAL CMS BUILDERS (WORDPRESS / WEBFLOW / HTML) */}
          {activeTrack === 'manual-cms' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <div className="text-xs font-bold text-white">
                      1. &lt;head&gt; SEO Meta Tags + FAQPage &amp; SoftwareApplication JSON-LD Schema
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Paste into WordPress (RankMath / WPCode Header), Webflow Page Settings, or Shopify theme.liquid.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(manualHeadAndSchemaSnippet, 'manual-head')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'manual-head' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied Schema!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy &lt;head&gt; &amp; JSON-LD</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 max-h-52 overflow-y-auto">
                  {manualHeadAndSchemaSnippet}
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <div className="text-xs font-bold text-white">
                      2. Ready-to-Paste Authority Comparison Table &amp; Consolidated FAQ HTML Block
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Paste directly into a WordPress Custom HTML block or Webflow Embed to beat thin forum threads.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyText(manualHtmlBodyBlock, 'manual-body')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'manual-body' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied HTML!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy HTML Block</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerFileDownload(
                          `${manualHeadAndSchemaSnippet}\n\n${manualHtmlBodyBlock}`,
                          `wordpress-webflow-kit-${slugify(keyword.keyword)}.html`,
                          'text/html;charset=utf-8;'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download .html</span>
                    </button>
                  </div>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 max-h-52 overflow-y-auto">
                  {manualHtmlBodyBlock}
                </pre>
              </div>
            </div>
          )}

          {/* TRACK 3: NEGATIVE KEYWORD LIST GENERATOR & EXCEL EXPORT */}
          {activeTrack === 'negative-list' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Google Ads Negative Keyword Exclusion List ({niche})
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Eliminate wasted ad spend from job seekers, homework queries, and support clicks. Export directly to Excel/CSV.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
                      {(
                        [
                          { id: 'broad', label: 'Broad' },
                          { id: 'phrase', label: '"Phrase"' },
                          { id: 'exact', label: '[Exact]' },
                        ] as { id: NegativeMatchType; label: string }[]
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setNegMatchType(m.id)}
                          className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                            negMatchType === m.id
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => copyText(formattedNegativeText, 'neg-copy')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'neg-copy' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Copy List</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadNegativeExcelCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export to Excel (.CSV)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <pre className="text-xs font-mono text-emerald-300 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 max-h-60 overflow-y-auto">
                    {formattedNegativeText}
                  </pre>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="font-semibold text-white">Included Protection Categories:</div>
                    <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                      <li>
                        <strong className="text-slate-200">Zero-Budget / Piracy:</strong> Blocks clicks for torrent, cracked, pirated, scam.
                      </li>
                      <li>
                        <strong className="text-slate-200">Employment &amp; Careers:</strong> Blocks job seekers searching salary, hiring, resume, internship.
                      </li>
                      <li>
                        <strong className="text-slate-200">Academic &amp; Definitions:</strong> Blocks zero-conversion homework queries (wikipedia, essay, meaning).
                      </li>
                      <li>
                        <strong className="text-slate-200">Support &amp; Churn:</strong> Blocks existing customers looking for login help or cancellation.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
