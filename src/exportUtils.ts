import {
  ExploreResponse,
  KeywordOpportunity,
  SerpXrayResponse,
  PseoMatrixResponse,
  EeatBriefResponse,
} from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'serpgpt-export'
  );
}

// 1. Export Keywords Table (CSV)
export function exportKeywordsCsv(keywords: KeywordOpportunity[], niche: string, geo: string) {
  const headers = [
    'Keyword',
    'Market',
    'Intent',
    'Monthly Searches',
    '3M Velocity (%)',
    'Low Top-of-Page Bid (USD)',
    'High Top-of-Page Bid (USD)',
    'Ads Competition Index (0-100)',
    'Organic Difficulty (1-100)',
    'Arbitrage Score (1-99)',
    'Est Monthly Traffic Value (USD)',
    'SERP Weak Spot Type',
    'Weak Spot Domain',
    'Domain OpenPageRank (0-10)',
    'Weak Spot Opportunity Note',
    'AI Overview Survival',
    'Estimated Organic CTR (%)',
    'AI Survival Reason',
    ...MONTHS.map((m) => `Vol ${m}`),
  ];

  const rows = keywords.map((k) => [
    `"${k.keyword.replace(/"/g, '""')}"`,
    geo,
    k.intent,
    k.avgMonthlySearches,
    `${k.velocity3m >= 0 ? '+' : ''}${k.velocity3m}%`,
    k.lowTopOfPageBid.toFixed(2),
    k.highTopOfPageBid.toFixed(2),
    k.competitionIndex,
    k.organicDifficulty,
    k.arbitrageScore,
    k.trafficValueMonthly,
    `"${k.weakSpot.type}"`,
    `"${k.weakSpot.topDomain}"`,
    k.weakSpot.domainPageRank.toFixed(1),
    `"${(k.weakSpot.opportunityNote || '').replace(/"/g, '""')}"`,
    k.aiSurvival.status,
    `${k.aiSurvival.ctrEstimate}%`,
    `"${(k.aiSurvival.reason || '').replace(/"/g, '""')}"`,
    ...(k.monthlyTrend || []).map((v) => v),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerFileDownload(csv, `serpgpt-keywords-${slugify(niche)}-${geo.toLowerCase()}.csv`, 'text/csv;charset=utf-8;');
}

// 2. Export Single Keyword Deep-Dive Card (Markdown)
export function exportSingleKeywordCardMd(kw: KeywordOpportunity, geo: string) {
  const monthRows = MONTHS.map((m, i) => `| ${m} | ${(kw.monthlyTrend[i] || 0).toLocaleString()} |`).join('\n');
  const md = `# Keyword Intelligence Card: ${kw.keyword} (${geo})

- **Search Intent:** ${kw.intent}
- **Avg. Monthly Searches:** ${kw.avgMonthlySearches.toLocaleString()} /mo
- **3-Month Velocity:** ${kw.velocity3m >= 0 ? `+${kw.velocity3m}%` : `${kw.velocity3m}%`}
- **Google Ads CPC Bid Spread:** $${kw.lowTopOfPageBid.toFixed(2)} – $${kw.highTopOfPageBid.toFixed(2)}
- **Google Ads Competition Index:** ${kw.competitionIndex}/100
- **CPC Arbitrage Score:** ${kw.arbitrageScore}/99
- **Est. Monthly Traffic Value:** $${kw.trafficValueMonthly.toLocaleString()}/mo

## SERP Weak-Spot Signal
- **Weak-Spot Type:** ${kw.weakSpot.type}
- **Target Ranking Domain:** ${kw.weakSpot.topDomain} (OpenPageRank ${kw.weakSpot.domainPageRank.toFixed(1)}/10)
- **Opportunity Note:** ${kw.weakSpot.opportunityNote}

## AI Overview Survival
- **Status:** ${kw.aiSurvival.status} (Est. Organic CTR: ${kw.aiSurvival.ctrEstimate}%)
- **Reason:** ${kw.aiSurvival.reason}

## International Geo-Arbitrage Matrix
| Market | High CPC Bid (USD) | Competition Index (0-100) | Monthly Volume |
| :--- | :---: | :---: | :---: |
| **US** | $${kw.geoArbitrage.US.cpcHigh.toFixed(2)} | ${kw.geoArbitrage.US.competitionIndex}/100 | ${kw.geoArbitrage.US.volume.toLocaleString()} |
| **UK** | $${kw.geoArbitrage.UK.cpcHigh.toFixed(2)} | ${kw.geoArbitrage.UK.competitionIndex}/100 | ${kw.geoArbitrage.UK.volume.toLocaleString()} |
| **CA** | $${kw.geoArbitrage.CA.cpcHigh.toFixed(2)} | ${kw.geoArbitrage.CA.competitionIndex}/100 | ${kw.geoArbitrage.CA.volume.toLocaleString()} |
| **AU** | $${kw.geoArbitrage.AU.cpcHigh.toFixed(2)} | ${kw.geoArbitrage.AU.competitionIndex}/100 | ${kw.geoArbitrage.AU.volume.toLocaleString()} |

## 12-Month Search Volume Breakdown
| Month | Search Volume |
| :--- | :---: |
${monthRows}
`;

  triggerFileDownload(md, `keyword-card-${slugify(kw.keyword)}.md`, 'text/markdown;charset=utf-8;');
}

// 3. Export SERP Weak-Spot X-Ray Results Card (CSV & Markdown)
export function exportSerpXrayCsv(xray: SerpXrayResponse) {
  const headers = [
    'Keyword',
    'Position',
    'Page Title',
    'Domain',
    'URL',
    'OpenPageRank (0-10)',
    'Estimated DA (0-100)',
    'Is Weak Spot',
    'Weak Spot Diagnosis',
  ];
  const rows = xray.topResults.map((r) => [
    `"${xray.keyword.replace(/"/g, '""')}"`,
    r.position,
    `"${r.title.replace(/"/g, '""')}"`,
    r.domain,
    `"${r.url}"`,
    r.pageRank.toFixed(1),
    r.estimatedDa,
    r.isWeakSpot ? 'YES' : 'NO',
    `"${r.weakSpotReason.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerFileDownload(csv, `serp-xray-${slugify(xray.keyword)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportSerpXrayMarkdown(xray: SerpXrayResponse) {
  const compLines = xray.topResults
    .map(
      (r) =>
        `### #${r.position} — ${r.title}\n- **Domain:** ${r.domain} (${r.url})\n- **Authority:** OpenPageRank ${r.pageRank.toFixed(1)}/10 · Est. DA ${r.estimatedDa}\n- **Weak Spot:** ${r.isWeakSpot ? 'YES' : 'NO'} — ${r.weakSpotReason}`
    )
    .join('\n\n');

  const paaLines = xray.peopleAlsoAsk.map((q) => `- ${q}`).join('\n');

  const md = `# SERP Weak-Spot X-Ray Report: "${xray.keyword}"

## Recommended Content Wedge to Outrank Top 3
- **Recommended Format:** ${xray.winStrategy.recommendedFormat}
- **Target Word Count:** ${xray.winStrategy.targetWordCount.toLocaleString()} words + interactive tool
- **Winning Angle:** ${xray.winStrategy.angleToBeatTop3}
${
  xray.pageSpeedAudit
    ? `- **Competitor Mobile PageSpeed Audit (${xray.pageSpeedAudit.testedUrl}):** Score ${xray.pageSpeedAudit.performanceScore}/100 · LCP ${xray.pageSpeedAudit.lcp} · CLS ${xray.pageSpeedAudit.cls}`
    : ''
}

## Top 5 Google SERP Competitors
${compLines}

## Live "People Also Ask" Questions (FAQ H3 Targets)
${paaLines}
`;

  triggerFileDownload(md, `serp-xray-report-${slugify(xray.keyword)}.md`, 'text/markdown;charset=utf-8;');
}

// 4. Export Programmatic SEO (pSEO) Matrix Card (CSV & Markdown Blueprint)
export function exportPseoCombinationsCsv(pseo: PseoMatrixResponse) {
  const headers = [
    'Niche',
    'Generated Page Title',
    'URL Slug',
    'Target Keyword',
    'Page Template Type',
    'Est Monthly Volume',
    'Google Ads CPC (USD)',
    'Ads Competition Index (0-100)',
  ];
  const rows = pseo.combinations.map((c) => [
    `"${pseo.niche.replace(/"/g, '""')}"`,
    `"${c.sampleTitle.replace(/"/g, '""')}"`,
    `"${c.urlSlug}"`,
    `"${c.targetKeyword.replace(/"/g, '""')}"`,
    `"${c.pageTemplateType.replace(/"/g, '""')}"`,
    c.estMonthlyVolume,
    c.estCpc.toFixed(2),
    c.competitionIndex,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerFileDownload(csv, `pseo-matrix-${slugify(pseo.niche)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportPseoBlueprintMd(pseo: PseoMatrixResponse) {
  const combos = pseo.combinations
    .map(
      (c) =>
        `| ${c.sampleTitle} | \`${c.urlSlug}\` | ${c.pageTemplateType} | ${c.estMonthlyVolume.toLocaleString()}/mo | $${c.estCpc.toFixed(2)} | ${c.competitionIndex}/100 |`
    )
    .join('\n');

  const wireframes = pseo.wireframeSections
    .map(
      (w) =>
        `### ${w.heading}\n- **Purpose:** ${w.purpose}\n- **Dynamic Schema Variables:** \`${w.dynamicVariables}\``
    )
    .join('\n\n');

  const md = `# Programmatic SEO (pSEO) Multiplier Blueprint: ${pseo.niche}

- **Master Title Pattern:** \`${pseo.headTermPattern}\`
- **URL Route Structure:** \`${pseo.urlStructure}\`
- **Total Projected Cluster Pages:** ${pseo.totalProjectedPages.toLocaleString()} pages
- **Projected Monthly Organic Traffic:** ${pseo.totalProjectedMonthlyTraffic.toLocaleString()} visits/mo
- **Projected Monthly Traffic Value:** $${pseo.totalProjectedTrafficValue.toLocaleString()}/mo

## Dual Modifier Axes
- **Axis A (${pseo.modifierAxisA.label}):** ${pseo.modifierAxisA.values.join(', ')}
- **Axis B (${pseo.modifierAxisB.label}):** ${pseo.modifierAxisB.values.join(', ')}

## High-ROI Programmatic Page Combinations
| Page Title | URL Slug | Component Template | Est. Volume | CPC | Ads Comp |
| :--- | :--- | :--- | :---: | :---: | :---: |
${combos}

## Anti-Thin-Content Page Wireframe Architecture
${wireframes}
`;

  triggerFileDownload(md, `pseo-blueprint-${slugify(pseo.niche)}.md`, 'text/markdown;charset=utf-8;');
}

// 5. Export OpenAlex E-E-A-T Citations & Content Brief Card (CSV & Markdown)
export function exportEeatCitationsCsv(eeat: EeatBriefResponse) {
  const headers = [
    'Niche',
    'Study Title',
    'Authors',
    'Publication Year',
    'Journal / Venue',
    'Cited By Count',
    'DOI / Source URL',
    'Key Finding Summary',
  ];
  const rows = eeat.citations.map((c) => [
    `"${eeat.niche.replace(/"/g, '""')}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.authors.replace(/"/g, '""')}"`,
    c.publicationYear,
    `"${c.journalOrVenue.replace(/"/g, '""')}"`,
    c.citedByCount,
    `"${c.doiUrl}"`,
    `"${c.keyFindingSummary.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  triggerFileDownload(csv, `eeat-citations-${slugify(eeat.niche)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportEeatBriefMd(eeat: EeatBriefResponse) {
  const citationsList = eeat.citations
    .map(
      (c, i) =>
        `${i + 1}. **${c.title}** (${c.publicationYear})\n   - *Authors:* ${c.authors} · *Venue:* ${c.journalOrVenue} · *Cited by:* ${c.citedByCount.toLocaleString()}\n   - *DOI:* ${c.doiUrl}\n   - *Key Takeaway:* ${c.keyFindingSummary}`
    )
    .join('\n\n');

  const hooks = eeat.editorialBrief.authorityHooks.map((h) => `- ${h}`).join('\n');
  const sections = eeat.editorialBrief.outlineSections
    .map(
      (s) =>
        `### ${s.h2}\n- **Citation to Embed:** ${s.citationToEmbed}\n- **Execution Notes:** ${s.keyPoints}`
    )
    .join('\n\n');

  const md = `# Empirical E-E-A-T Content Brief & Academic Citations: ${eeat.niche}

## Recommended Authority Headline
**${eeat.editorialBrief.recommendedHeadline}**

## Core Thesis Statement
${eeat.editorialBrief.thesisStatement}

## Data-Backed Intro Hooks
${hooks}

## Peer-Reviewed OpenAlex Citations
${citationsList}

## Article H2 Outline & Citation Placement
${sections}
`;

  triggerFileDownload(md, `eeat-content-brief-${slugify(eeat.niche)}.md`, 'text/markdown;charset=utf-8;');
}

// 6. Export Autocomplete Seeds Card (CSV)
export function exportAutocompleteSeedsCsv(
  seed: string,
  geo: string,
  categories: {
    related?: string[];
    questions: string[];
    commercial: string[];
    tools: string[];
    longtail: string[];
  }
) {
  const rows: string[] = ['Category,Seed Niche,Market,Suggested Keyword Phrase'];
  const appendGroup = (label: string, items: string[]) => {
    items.forEach((phrase) => {
      rows.push(`"${label}","${seed.replace(/"/g, '""')}",${geo},"${phrase.replace(/"/g, '""')}"`);
    });
  };
  if (categories.related && categories.related.length > 0) {
    appendGroup('Related Keywords & Semantic Clusters', categories.related);
  }
  appendGroup('Questions (How/What/Who)', categories.questions);
  appendGroup('Buyer & Commercial Modifiers', categories.commercial);
  appendGroup('Interactive Calculators & Templates', categories.tools);
  appendGroup('Untapped Long-Tail Phrases', categories.longtail);

  triggerFileDownload(
    rows.join('\n'),
    `autocomplete-seeds-${slugify(seed)}-${geo.toLowerCase()}.csv`,
    'text/csv;charset=utf-8;'
  );
}

// 7. Master Full-Suite Bundle Export (All 4 Tools Combined — JSON & Markdown)
export function exportFullSuiteBundleJson(
  explore: ExploreResponse,
  xray: SerpXrayResponse,
  pseo: PseoMatrixResponse,
  eeat: EeatBriefResponse
) {
  const payload = {
    exportedAt: new Date().toISOString(),
    platform: 'https://serpgpt.pro',
    niche: explore.summary.niche,
    market: explore.summary.geo,
    arbitrageExplorer: explore,
    serpWeakSpotXray: xray,
    programmaticSeoMatrix: pseo,
    openalexEeatBrief: eeat,
  };
  triggerFileDownload(
    JSON.stringify(payload, null, 2),
    `serpgpt-full-suite-${slugify(explore.summary.niche)}.json`,
    'application/json;charset=utf-8;'
  );
}
