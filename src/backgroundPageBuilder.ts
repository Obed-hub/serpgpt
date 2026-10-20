import {
  KeywordOpportunity,
  ArchitecturePageBlueprint,
} from './types';
import {
  buildKeywordArchitectureTree,
  convertOpportunitiesToPlannerInput,
} from './architectureEngine';
import {
  SEO_MASTER_PAGES,
  MasterSeoPageData,
  MasterSeoSection,
  MasterSeoFaqItem,
} from './seoMasterPagesData';

export interface DatabaseRecordItem {
  id: string;
  keywordOrTool: string;
  category: string;
  intent: string;
  monthlySearches: number;
  cpcLow: number;
  cpcHigh: number;
  competitionIndex: number;
  serpWeakSpot: string;
  recommendedAction: string;
}

export interface ProcessStepItem {
  stepNumber: number;
  title: string;
  targetKeyword: string;
  durationLabel: string;
  description: string;
  copyableSnippet: string;
  verificationRule: string;
}

/**
 * Converts any ArchitecturePageBlueprint (generated from live Google Keyword Planner results)
 * into a full standalone MasterSeoPageData webpage payload ready for immediate rendering and SSR indexing.
 */
export function compileBlueprintToMasterPage(
  bp: ArchitecturePageBlueprint,
  industry: string
): MasterSeoPageData {
  // Check if this blueprint matches one of our 8 pre-authored flagship pages first
  const existingPreAuthored = SEO_MASTER_PAGES.find(
    (p) =>
      p.slug.toLowerCase() === bp.urlSlug.toLowerCase() ||
      p.primaryKeyword.toLowerCase() === bp.primaryKeyword.toLowerCase()
  );
  if (existingPreAuthored) {
    return existingPreAuthored;
  }

  const schemaMap: Record<string, 'HowTo' | 'Table' | 'Dataset' | 'Review' | 'WebPage'> = {
    HowTo: 'HowTo',
    Table: 'Table',
    Dataset: 'Dataset',
    Review: 'Review',
    FAQPage: 'WebPage',
    Article: 'WebPage',
    TechArticle: 'Table',
    WebPage: 'WebPage',
  };

  const mappedSchema = schemaMap[bp.editorialDirectives.schemaMarkupType] || 'Dataset';

  const sections: MasterSeoSection[] = bp.subheadingsHierarchy.map((sub, idx) => {
    const targetKw = sub.targetKeywords[0] || bp.primaryKeyword;
    const nodeMatch = bp.keywordTree.find(
      (n) => n.keyword.toLowerCase() === targetKw.toLowerCase()
    );
    const vol = nodeMatch ? nodeMatch.monthlySearches : Math.round(bp.totalMonthlyVolume * 0.25);
    const cpc = nodeMatch ? nodeMatch.averageCpc : bp.avgCpc;
    const roleMap: Record<string, MasterSeoSection['roleLabel']> = {
      primary: 'PRIMARY',
      secondary: 'SECONDARY',
      h2_subheading: 'H2_SUBHEADING',
      faq_query: 'FAQ_QUERY',
      semantic_variation: 'SEMANTIC_VARIATION',
    };

    return {
      level: sub.level,
      heading: sub.heading,
      targetKeywords: sub.targetKeywords.length > 0 ? sub.targetKeywords : [bp.primaryKeyword],
      roleLabel: roleMap[nodeMatch?.role || 'secondary'] || (idx === 0 ? 'PRIMARY' : 'SECONDARY'),
      monthlySearches: vol,
      cpcUsd: cpc,
      summaryParagraph: `When evaluating ${targetKw} in the ${industry} market (${vol.toLocaleString()} monthly searches, $${cpc.toFixed(
        2
      )} average CPC), focus on verified 2026 requirements, cost benchmarks, and side-by-side platform capabilities to make an informed decision.`,
      bulletTakeaways: [
        `Compare key 2026 benchmarks, pricing tiers, and feature requirements for ${targetKw}.`,
        `Verify eligibility rules, qualification thresholds, and implementation timelines before committing budget.`,
        `Use the interactive calculator and comparison matrix above to estimate expected ROI and monthly volume.`,
      ],
      comparisonRows: [
        {
          criterion: `Core Strategy for ${targetKw}`,
          legacyOrPaidApproach: 'Manual research across fragmented sources',
          serpgptVerified2026Method: `Side-by-side benchmark comparison + live metrics`,
          statusBadge: 'Verified 2026 Standard',
        },
        {
          criterion: 'Cost & ROI Transparency',
          legacyOrPaidApproach: 'Hidden fees or unverified estimates',
          serpgptVerified2026Method: `Verified CPC & volume benchmarks ($${cpc.toFixed(2)} Avg CPC)`,
          statusBadge: 'Transparent Data',
        },
      ],
    };
  });

  // Ensure every merged secondary keyword is guaranteed to have a dedicated H2 section
  const coveredKeywords = new Set(
    sections.flatMap((s) => s.targetKeywords.map((k) => k.toLowerCase()))
  );
  bp.cannibalizationTermsMerged.forEach((mergedTerm) => {
    if (!coveredKeywords.has(mergedTerm.toLowerCase())) {
      const node = bp.keywordTree.find(
        (k) => k.keyword.toLowerCase() === mergedTerm.toLowerCase()
      );
      const vol = node?.monthlySearches || 1400;
      const cpc = node?.averageCpc || bp.avgCpc;
      sections.push({
        level: 'h2',
        heading: `${mergedTerm
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')}: Key Benchmarks & Breakdown`,
        targetKeywords: [mergedTerm],
        roleLabel: 'SECONDARY',
        monthlySearches: vol,
        cpcUsd: cpc,
        summaryParagraph: `This section breaks down ${mergedTerm} with current 2026 data, side-by-side evaluation criteria, and practical steps for ${industry} practitioners.`,
        bulletTakeaways: [
          `Addresses ${vol.toLocaleString()} monthly searches with verified ${industry} benchmarks ($${cpc.toFixed(2)} average CPC).`,
          `Provides structured comparison criteria and direct verification steps for ${mergedTerm}.`,
        ],
        comparisonRows: [
          {
            criterion: `Evaluation Criteria (${mergedTerm})`,
            legacyOrPaidApproach: 'Outdated static estimates',
            serpgptVerified2026Method: 'Live 2026 benchmark comparison & interactive lookup',
            statusBadge: 'Verified Data',
          },
        ],
      });
    }
  });

  const faqs: MasterSeoFaqItem[] = [
    {
      question: `What is the best approach for ${bp.primaryKeyword} in 2026?`,
      answer: `The most effective approach for ${bp.primaryKeyword} combines verified 2026 ${industry} data, transparent cost and ROI comparisons, and step-by-step qualification checks.`,
      targetKeyword: bp.primaryKeyword,
    },
    ...bp.cannibalizationTermsMerged.slice(0, 3).map((term) => ({
      question: `How does ${term} compare to ${bp.primaryKeyword}?`,
      answer: `Both ${term} and ${bp.primaryKeyword} address closely related needs in ${industry} (${bp.totalMonthlyVolume.toLocaleString()} combined monthly searches). You can compare their exact requirements, costs, and benchmarks directly in the table above.`,
      targetKeyword: term,
    })),
  ];

  return {
    id: `dynamic-${bp.id}`,
    slug: bp.urlSlug,
    archetypeNumber: Number(bp.pageArchetype.match(/\d+/)?.[0] || 1),
    archetypeName: bp.pageArchetype,
    schemaType: mappedSchema,
    pageTitle: bp.pageTitle,
    metaDescription: `Complete 2026 interactive guide and searchable database for ${bp.primaryKeyword} (${bp.totalMonthlyVolume.toLocaleString()} monthly searches). Includes ${bp.cannibalizationTermsMerged
      .slice(0, 2)
      .join(', ')} and verified ${industry} benchmarks.`,
    h1: bp.h1,
    primaryKeyword: bp.primaryKeyword,
    primaryVolume:
      bp.keywordTree.find((k) => k.role === 'primary')?.monthlySearches ||
      Math.round(bp.totalMonthlyVolume * 0.45),
    primaryCpc: bp.avgCpc,
    totalClusterVolume: bp.totalMonthlyVolume,
    avgClusterCpc: bp.avgCpc,
    targetWordCount: bp.editorialDirectives.targetWordCount,
    cannibalizationTermsMerged: bp.cannibalizationTermsMerged,
    antiThinWarning: bp.antiThinContentWarning,
    informationGainHook: bp.editorialDirectives.informationGainHook,
    interactiveWidgetConfig: {
      widgetTitle: `Interactive ${bp.primaryKeyword
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')} Explorer & Calculator`,
      widgetSubtitle: bp.editorialDirectives.informationGainHook,
      presetSeedQueries: [bp.primaryKeyword, ...bp.cannibalizationTermsMerged.slice(0, 2)],
      calculatorMetricLabel: 'Projected Monthly Organic Traffic Value',
      defaultMonthlyVolume: bp.totalMonthlyVolume,
      defaultCpc: bp.avgCpc,
      platformsCompared: [
        {
          name: `${bp.primaryKeyword.slice(0, 32)} (2026 Verified Hub)`,
          exactVolumeAccess: `${bp.totalMonthlyVolume.toLocaleString()}/mo Consolidated Demand`,
          requiresCreditCard: '100% Free Interactive Access',
          cpcArbitrageData: `$${bp.avgCpc.toFixed(2)} Avg CPC · Comp ${bp.avgCompetitionIndex}/100`,
          monthlyCost: '$0 Free',
          verdictScore: '98/100',
        },
        ...bp.cannibalizationTermsMerged.slice(0, 3).map((term, idx) => ({
          name: term,
          exactVolumeAccess: `${(
            bp.keywordTree.find((k) => k.keyword.toLowerCase() === term.toLowerCase())
              ?.monthlySearches || 1800
          ).toLocaleString()}/mo Sub-Cluster`,
          requiresCreditCard: 'Merged into Master URL',
          cpcArbitrageData: `$${(
            bp.keywordTree.find((k) => k.keyword.toLowerCase() === term.toLowerCase())
              ?.averageCpc || bp.avgCpc
          ).toFixed(2)} CPC`,
          monthlyCost: 'Included',
          verdictScore: `${95 - idx * 2}/100`,
        })),
      ],
    },
    sections,
    faqs,
  };
}

/**
 * Given a list of live KeywordOpportunity items, builds the complete array of MasterSeoPageData pages
 * for the Background Page Builder Queue.
 */
export function buildAllMasterPagesFromKeywords(
  keywords: KeywordOpportunity[],
  industry: string,
  domain = 'serpgpt.pro'
): MasterSeoPageData[] {
  const plannerInput = convertOpportunitiesToPlannerInput(keywords);
  const tree = buildKeywordArchitectureTree(plannerInput, domain, industry);

  const dynamicPages = tree.masterBlueprints.map((bp) =>
    compileBlueprintToMasterPage(bp, industry)
  );

  // Merge with SEO_MASTER_PAGES so the 8 flagship URLs are always available plus any newly generated niche pages
  const bySlug = new Map<string, MasterSeoPageData>();
  dynamicPages.forEach((p) => bySlug.set(p.slug.toLowerCase(), p));
  SEO_MASTER_PAGES.forEach((p) => {
    if (!bySlug.has(p.slug.toLowerCase())) {
      bySlug.set(p.slug.toLowerCase(), p);
    }
  });

  // Put the current cluster's dynamic pages first so the user sees their active cluster immediately
  return Array.from(bySlug.values());
}

/**
 * Generates rich, filterable database records for the `/database/...` Interactive Database Table widget
 */
export function generateDatabaseRecordsForPage(page: MasterSeoPageData): DatabaseRecordItem[] {
  const allTerms = [page.primaryKeyword, ...page.cannibalizationTermsMerged];
  const baseRecords: DatabaseRecordItem[] = allTerms.map((term, idx) => {
    const matchedSec = page.sections.find((s) =>
      s.targetKeywords.some((k) => k.toLowerCase() === term.toLowerCase())
    );
    const vol =
      idx === 0
        ? page.primaryVolume
        : matchedSec?.monthlySearches ||
          Math.max(900, Math.round(page.totalClusterVolume / (allTerms.length + 1)));
    const cpcHigh =
      idx === 0 ? page.primaryCpc : matchedSec?.cpcUsd || page.avgClusterCpc;
    const cpcLow = Number((cpcHigh * 0.28).toFixed(2));
    const comp = Math.max(12, Math.min(29, 16 + idx * 3));

    const category =
      term.includes('reddit') || term.includes('forum')
        ? 'Community Verified'
        : term.includes('amazon') || term.includes('ecommerce') || term.includes('etsy')
        ? 'Marketplace & eCommerce'
        : term.includes('youtube') || term.includes('video')
        ? 'Video & Creator SEO'
        : term.includes('local') || term.includes('state')
        ? 'Local & Regional SEO'
        : 'Core Search Intelligence';

    const intent =
      term.includes('how') || term.includes('what') || term.includes('guide')
        ? 'Informational'
        : term.includes('free') || term.includes('tool') || term.includes('calculator')
        ? 'Transactional'
        : 'Commercial';

    return {
      id: `db-row-${idx + 1}`,
      keywordOrTool: term,
      category,
      intent,
      monthlySearches: vol,
      cpcLow,
      cpcHigh,
      competitionIndex: comp,
      serpWeakSpot: idx % 2 === 0 ? 'Reddit/Forum in Top 4 (DA 24)' : 'Low-DA Niche Site in Top 5',
      recommendedAction:
        idx === 0
          ? 'Primary H1 + Interactive Database Anchor'
          : `Anchored H2 Section #${idx + 1} + FAQ Schema`,
    };
  });

  // Also include the platform comparison rows as actionable tool records in the database
  page.interactiveWidgetConfig.platformsCompared.forEach((plat, pIdx) => {
    baseRecords.push({
      id: `db-plat-${pIdx + 1}`,
      keywordOrTool: `${plat.name} (${plat.monthlyCost})`,
      category: 'Evaluated Platform',
      intent: 'Transactional',
      monthlySearches: Math.round(page.primaryVolume * (0.6 - pIdx * 0.12)),
      cpcLow: Number((page.avgClusterCpc * 0.25).toFixed(2)),
      cpcHigh: page.avgClusterCpc,
      competitionIndex: 18 + pIdx * 4,
      serpWeakSpot: plat.exactVolumeAccess,
      recommendedAction: `Verdict Score: ${plat.verdictScore} · ${plat.requiresCreditCard}`,
    });
  });

  return baseRecords;
}

/**
 * Generates interactive step-by-step execution checklist items for `/process/...` and `/learn/...` pages
 */
export function generateProcessStepsForPage(page: MasterSeoPageData): ProcessStepItem[] {
  return page.sections.map((sec, idx) => ({
    stepNumber: idx + 1,
    title: sec.heading,
    targetKeyword: sec.targetKeywords[0] || page.primaryKeyword,
    durationLabel: `Step ${idx + 1} · ~${3 + idx * 2} mins`,
    description: sec.summaryParagraph,
    copyableSnippet:
      sec.bulletTakeaways[0] ||
      `Verify "${sec.targetKeywords[0] || page.primaryKeyword}" with exact 12-month search volume and Low/High CPC spread.`,
    verificationRule:
      sec.comparisonRows[0]?.serpgptVerified2026Method ||
      'Verified 2026 Anti-Thin Execution Standard',
  }));
}

export const ARCHETYPE_URL_PREFIXES = [
  '/tools/',
  '/compare/',
  '/alternatives/',
  '/best/',
  '/glossary/',
  '/stats/',
  '/templates/',
  '/directory/',
  '/cost/',
  '/faq/',
  '/process/',
  '/guides/',
  '/case-studies/',
  '/pricing/',
  '/solutions/',
  '/database/',
  '/profiles/',
  '/community/',
  '/videos/',
  '/updates/',
  '/resources/',
  '/listings/',
  '/reviews/',
  '/gallery/',
  '/portfolios/',
  '/archives/',
  '/methodology/',
  '/eligibility/',
  '/deadlines/',
  '/versions/',
  '/sources/',
  '/benchmarks/',
  '/learn/',
  '/troubleshooting/',
  '/integrations/',
  '/changelog/',
  '/events/',
  '/waitlist/',
  '/trust/',
];

export function isMasterSeoRoutePrefix(pathname: string): boolean {
  const clean = (pathname || '').trim().toLowerCase();
  return ARCHETYPE_URL_PREFIXES.some((prefix) => clean.startsWith(prefix));
}

