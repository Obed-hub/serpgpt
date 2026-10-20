import React, { useState, useEffect, useMemo } from 'react';
import {
  KeywordOpportunity,
  KeywordArchitectureTreeResponse,
  ArchitecturePageBlueprint,
} from './types';
import {
  buildKeywordArchitectureTree,
  convertOpportunitiesToPlannerInput,
  slugifyText,
} from './architectureEngine';
import { triggerFileDownload } from './exportUtils';
import {
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Code2,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Database,
  ArrowUpRight,
} from 'lucide-react';
import { SEO_MASTER_PAGES, findMasterSeoPageByPath } from './seoMasterPagesData';

interface AntiThinArchitectureViewProps {
  keywords: KeywordOpportunity[];
  industry: string;
  defaultDomain?: string;
  onOpenLiveMasterPage?: (slug: string) => void;
  onExpandClusterKeyword?: (seedKeyword: string) => void;
}

export default function AntiThinArchitectureView({
  keywords,
  industry,
  defaultDomain = 'serpgpt.pro',
  onOpenLiveMasterPage,
  onExpandClusterKeyword,
}: AntiThinArchitectureViewProps) {
  const [domainInput, setDomainInput] = useState<string>(defaultDomain);
  const [treeData, setTreeData] = useState<KeywordArchitectureTreeResponse>(() =>
    buildKeywordArchitectureTree(
      convertOpportunitiesToPlannerInput(keywords),
      defaultDomain,
      industry
    )
  );
  const [isSyncingApi, setIsSyncingApi] = useState<boolean>(false);
  const [showArchetypeDrawer, setShowArchetypeDrawer] = useState<boolean>(false);
  const [archetypeFilter, setArchetypeFilter] = useState<'all' | 'activated' | 'omitted'>('all');
  const [expandedBlueprintIds, setExpandedBlueprintIds] = useState<Set<string>>(() => {
    const initial = buildKeywordArchitectureTree(
      convertOpportunitiesToPlannerInput(keywords),
      defaultDomain,
      industry
    );
    return new Set(initial.masterBlueprints.slice(0, 2).map((b) => b.id));
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Automatically re-cluster whenever the user's Google Keyword Planner list changes
  useEffect(() => {
    const plannerItems = convertOpportunitiesToPlannerInput(keywords);
    const updated = buildKeywordArchitectureTree(plannerItems, domainInput, industry);
    setTreeData(updated);
    if (updated.masterBlueprints.length > 0) {
      setExpandedBlueprintIds(new Set(updated.masterBlueprints.slice(0, 2).map((b) => b.id)));
    }
  }, [keywords, industry]);

  const handleRunLiveArchitectureApi = async () => {
    setIsSyncingApi(true);
    try {
      const plannerItems = convertOpportunitiesToPlannerInput(keywords);
      const res = await fetch('/api/keywords/architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: plannerItems,
          domain: domainInput,
          industry,
        }),
      });
      if (res.ok) {
        const json: KeywordArchitectureTreeResponse = await res.json();
        setTreeData(json);
        if (json.masterBlueprints?.length > 0) {
          setExpandedBlueprintIds(new Set(json.masterBlueprints.slice(0, 2).map((b) => b.id)));
        }
      }
    } catch {
      // Deterministic engine is already active in state
    } finally {
      setIsSyncingApi(false);
    }
  };

  const toggleBlueprintExpand = (id: string) => {
    setExpandedBlueprintIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredArchetypes = useMemo(() => {
    return treeData.archetypeAuditCatalog.filter((item) => {
      if (archetypeFilter === 'activated') return item.status === 'activated';
      if (archetypeFilter === 'omitted') return item.status === 'omitted';
      return true;
    });
  }, [treeData.archetypeAuditCatalog, archetypeFilter]);

  // Export entire Architecture Tree to Markdown
  const handleExportArchitectureMarkdown = () => {
    const lines = [
      `# Anti-Thin Page Architecture & Cannibalization Prevention Blueprint`,
      `- **Target Domain:** ${treeData.domain}`,
      `- **Niche / Industry:** ${treeData.industry}`,
      `- **Total Google Keyword Planner Keywords Clustered:** ${treeData.totalKeywordsClustered}`,
      `- **Consolidated Master Pages Recommended:** ${treeData.totalDistinctPagesRecommended}`,
      `- **Thin / Cannibalizing Pages Prevented:** ${treeData.thinPagesPreventedCount}`,
      `- **Active SEO Page Archetypes Matched:** ${treeData.activeArchetypesCount} / 38`,
      ``,
      `---`,
      `## 1. Master Page Blueprints (Consolidated URLs)`,
      ...treeData.masterBlueprints.flatMap((bp, idx) => [
        `### ${idx + 1}. ${bp.pageTitle}`,
        `- **Canonical URL Slug:** \`${bp.urlSlug}\``,
        `- **Page Archetype:** ${bp.pageArchetype}`,
        `- **H1 Heading:** ${bp.h1}`,
        `- **Primary Keyword:** "${bp.primaryKeyword}"`,
        `- **Total Consolidated Cluster Volume:** ${bp.totalMonthlyVolume.toLocaleString()}/mo · Avg CPC: $${bp.avgCpc.toFixed(2)}`,
        `- **Schema.org Markup:** \`${bp.editorialDirectives.schemaMarkupType}\` · Target Depth: ${bp.editorialDirectives.targetWordCount} words`,
        `- **Cannibalization Terms Merged into This URL (${bp.cannibalizationTermsMerged.length}):** ${bp.cannibalizationTermsMerged.map((t) => `"${t}"`).join(', ')}`,
        `- **Anti-Thin Warning:** ${bp.antiThinContentWarning}`,
        `- **Information Gain Hook:** ${bp.editorialDirectives.informationGainHook}`,
        ``,
        `#### On-Page H2/H3 Outline Hierarchy:`,
        ...bp.subheadingsHierarchy.map(
          (sh) =>
            `  - **[${sh.level.toUpperCase()}] ${sh.heading}** (Targets: ${sh.targetKeywords.map((t) => `"${t}"`).join(', ')}) — *${sh.contentPurpose}*`
        ),
        ``,
        `#### Keyword Role Assignment Tree:`,
        ...bp.keywordTree.map(
          (kt) =>
            `  - \`[${kt.role.toUpperCase()}]\` **${kt.keyword}** (${kt.monthlySearches.toLocaleString()}/mo · $${kt.averageCpc.toFixed(2)} CPC) → ${kt.mappedSectionHeading}`
        ),
        ``,
      ]),
      `---`,
      `## 2. 38-Archetype Coverage Audit Log`,
      ...treeData.archetypeAuditCatalog.map(
        (a) =>
          `- **[${a.status.toUpperCase()}] #${a.id} ${a.archetypeName} (${a.urlPrefix})** — ${a.reason}`
      ),
    ];

    triggerFileDownload(
      lines.join('\n'),
      `anti-thin-page-architecture-${slugifyText(treeData.industry)}.md`,
      'text/markdown;charset=utf-8;'
    );
  };

  // Export entire Architecture Tree to CSV
  const handleExportArchitectureCsv = () => {
    const headers = [
      'Pillar Category',
      'Master Page URL Slug',
      'Page Archetype (of 38)',
      'Page Title',
      'H1 Heading',
      'Primary Keyword',
      'Total Cluster Monthly Volume',
      'Average CPC (USD)',
      'Merged Cannibalization Keywords',
      'Target Word Count',
      'Schema.org Type',
      'Information Gain Hook',
      'Anti-Thin Content Warning',
    ];

    const rows = treeData.masterBlueprints.map((bp: ArchitecturePageBlueprint) => [
      `"${bp.pillarCategory.replace(/"/g, '""')}"`,
      `"${bp.urlSlug}"`,
      `"${bp.pageArchetype.replace(/"/g, '""')}"`,
      `"${bp.pageTitle.replace(/"/g, '""')}"`,
      `"${bp.h1.replace(/"/g, '""')}"`,
      `"${bp.primaryKeyword.replace(/"/g, '""')}"`,
      bp.totalMonthlyVolume,
      bp.avgCpc.toFixed(2),
      `"${bp.cannibalizationTermsMerged.join(' | ').replace(/"/g, '""')}"`,
      bp.editorialDirectives.targetWordCount,
      bp.editorialDirectives.schemaMarkupType,
      `"${bp.editorialDirectives.informationGainHook.replace(/"/g, '""')}"`,
      `"${bp.antiThinContentWarning.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerFileDownload(
      csv,
      `anti-thin-architecture-tree-${slugifyText(treeData.industry)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const roleBadgeClass = (role: string) => {
    switch (role) {
      case 'primary':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-700/70';
      case 'secondary':
        return 'bg-indigo-950/90 text-indigo-300 border-indigo-700/70';
      case 'h2_subheading':
        return 'bg-sky-950/90 text-sky-300 border-sky-700/70';
      case 'faq_query':
        return 'bg-amber-950/90 text-amber-300 border-amber-700/70';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP CONTROL & EXPORT BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-emerald-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>
                Connected to Live Keyword Explorer Table · 38 SEO Page Archetype Evaluator
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Anti-Thin Page Architecture &amp; Cannibalization Prevention Tree
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Consolidates close synonyms, plurals, question variants, and modifier overlapping queries from your active keyword list into non-cannibalizing Master Page Blueprints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-500 mr-2 font-mono">Domain:</span>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                aria-label="Target Website Domain"
                className="bg-transparent text-slate-200 font-mono focus:outline-none w-32"
              />
            </div>

            <button
              type="button"
              onClick={handleRunLiveArchitectureApi}
              disabled={isSyncingApi}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingApi ? 'animate-spin' : ''}`} />
              <span>{isSyncingApi ? 'Auditing 38 Archetypes...' : 'Re-Cluster with AI'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportArchitectureMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Tree (.md)</span>
            </button>

            <button
              type="button"
              onClick={handleExportArchitectureCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4-METRIC SUMMARY KPI BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Total Keywords Clustered</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {treeData.totalKeywordsClustered}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Live from Keyword Explorer table
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400">Consolidated Master Pages Recommended</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono tabular-nums mt-1">
              {treeData.totalDistinctPagesRecommended}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              100% distinct SERP intent URLs
            </div>
          </div>

          <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-4">
            <div className="text-xs text-emerald-300 font-medium">
              Thin / Cannibalizing Pages Prevented
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
              {treeData.thinPagesPreventedCount} Prevented
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Merged into H2s, FAQs &amp; interactive tabs
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400">Active Archetypes Matched</div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                {treeData.activeArchetypesCount}{' '}
                <span className="text-sm font-normal text-slate-500">/ 38 Archetypes</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowArchetypeDrawer((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              <span>
                {showArchetypeDrawer
                  ? 'Hide 38-Archetype Coverage Audit'
                  : 'Inspect All 38 SEO Archetypes Audit'}
              </span>
              {showArchetypeDrawer ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* PUBLISHED TOPIC GUIDES FOR THIS KEYWORD CLUSTER */}
        {onOpenLiveMasterPage && (
          <div className="mt-5 bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Complete Topic Guides ({treeData.masterBlueprints.length} Consolidated Hubs)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any topic guide below to view the full interactive page, comparison tables, and step-by-step playbook.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {treeData.masterBlueprints.map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => onOpenLiveMasterPage(bp.urlSlug)}
                  className="text-left p-3.5 rounded-xl bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500 transition-colors flex flex-col justify-between gap-2.5 cursor-pointer group"
                >
                  <div className="w-full space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white line-clamp-2 group-hover:text-indigo-200 leading-snug">
                        {bp.pageTitle}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="text-emerald-400">{bp.totalMonthlyVolume.toLocaleString()}/mo</span>
                    <span>{bp.cannibalizationTermsMerged.length + 1} sub-topics</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TOGGLEABLE 38-ARCHETYPE COVERAGE AUDIT DRAWER */}
        {showArchetypeDrawer && (
          <div className="mt-5 pt-5 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  38 SEO Page Archetypes Coverage Audit Catalog
                </h3>
                <p className="text-xs text-slate-400">
                  Only archetypes matching your live keywords are activated; non-matching archetypes are omitted to prevent empty doorway templates.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {(
                  [
                    { id: 'all', label: `All (38)` },
                    {
                      id: 'activated',
                      label: `Activated (${treeData.activeArchetypesCount})`,
                    },
                    {
                      id: 'omitted',
                      label: `Omitted (${38 - treeData.activeArchetypesCount})`,
                    },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setArchetypeFilter(t.id)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                      archetypeFilter === t.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredArchetypes.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg p-3 border text-xs ${
                    item.status === 'activated'
                      ? 'bg-emerald-950/20 border-emerald-800/60'
                      : 'bg-slate-950/70 border-slate-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-100">
                      #{item.id}. {item.archetypeName}
                    </span>
                    {item.status === 'activated' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono text-[10px] shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active ({item.matchedKeywordsCount})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono text-[10px] shrink-0">
                        <XCircle className="w-3 h-3" />
                        <span>Omitted</span>
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-indigo-400 mb-1">
                    Route: {item.urlPrefix} · Schema: {item.defaultSchema}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PILLAR CLUSTER CARDS & EXPANDABLE MASTER PAGE BLUEPRINTS */}
      <div className="space-y-6">
        {treeData.pillars.map((pillar) => (
          <div
            key={pillar.pillarName}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4"
          >
            {/* Pillar Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Pillar Category · {pillar.pillarSlug}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{pillar.pillarName}</h3>
                <p className="text-xs text-slate-400">{pillar.pillarDescription}</p>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 tabular-nums">
                  Cluster Vol: <strong className="text-white">{pillar.totalVolume.toLocaleString()}</strong>/mo
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 tabular-nums">
                  {pillar.totalKeywordsMerged} Keywords → {pillar.masterPages.length} Master URL
                  {pillar.masterPages.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Master Page Blueprints inside this Pillar */}
            <div className="space-y-4">
              {pillar.masterPages.map((bp) => {
                const isExpanded = expandedBlueprintIds.has(bp.id);
                return (
                  <div
                    key={bp.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-colors"
                  >
                    {/* Blueprint Summary Row (Click to Expand) */}
                    <div
                      onClick={() => toggleBlueprintExpand(bp.id)}
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-700 font-medium">
                            {bp.pageArchetype.split('(')[0].trim()}
                          </span>
                          {onExpandClusterKeyword && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onExpandClusterKeyword(bp.primaryKeyword);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/90 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-700/60 font-semibold transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Suggest Related (24)</span>
                            </button>
                          )}
                          {onOpenLiveMasterPage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenLiveMasterPage(bp.urlSlug);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
                            >
                              <span>Open Guide</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white">{bp.pageTitle}</h4>
                        <div className="text-xs text-slate-400">
                          Primary Keyword:{' '}
                          <strong className="text-slate-200 font-mono">&ldquo;{bp.primaryKeyword}&rdquo;</strong> ·
                          Absorbs{' '}
                          <strong className="text-emerald-400">
                            {bp.cannibalizationTermsMerged.length} cannibalizing variations
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right font-mono tabular-nums">
                          <div className="text-sm font-bold text-white">
                            {bp.totalMonthlyVolume.toLocaleString()}{' '}
                            <span className="text-xs font-normal text-slate-500">searches/mo</span>
                          </div>
                          <div className="text-xs text-emerald-400">
                            Avg CPC: ${bp.avgCpc.toFixed(2)} · Comp: {bp.avgCompetitionIndex}/100
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBlueprintExpand(bp.id);
                          }}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                          aria-label="Toggle Master Page Blueprint details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED BLUEPRINT DETAILS */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-800/90 space-y-5 bg-slate-950/90">
                        {/* 1. Anti-Thin & Cannibalization Alert Box */}
                        <div className="bg-amber-950/25 border border-amber-800/60 rounded-xl p-4">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                                Anti-Thin &amp; Cannibalization Alert · Merged Keywords ({bp.cannibalizationTermsMerged.length})
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed">
                                {bp.antiThinContentWarning}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] text-amber-200/80 font-mono mr-1">
                                  Merged into {bp.urlSlug}:
                                </span>
                                {bp.cannibalizationTermsMerged.map((term, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="px-2 py-0.5 text-[11px] font-mono bg-amber-950/70 text-amber-200 border border-amber-700/50 rounded"
                                  >
                                    {term}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2-Column Grid: On-Page H2/H3 Outline Hierarchy + Keyword Role Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* On-Page H2/H3 Outline Hierarchy */}
                          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                <span>On-Page H1 / H2 / H3 Outline Hierarchy</span>
                              </h5>
                              <button
                                type="button"
                                onClick={() =>
                                  copySnippet(
                                    `# ${bp.h1}\n\n` +
                                      bp.subheadingsHierarchy
                                        .map(
                                          (s) =>
                                            `${s.level === 'h2' ? '##' : '###'} ${s.heading}\n<!-- Targets: ${s.targetKeywords.join(', ')} | ${s.contentPurpose} -->`
                                        )
                                        .join('\n\n'),
                                    `outline-${bp.id}`
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer"
                              >
                                {copiedId === `outline-${bp.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied Outline</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Markdown Outline</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 mr-2">
                                H1
                              </span>
                              <span className="font-bold text-white">{bp.h1}</span>
                            </div>

                            <div className="space-y-2">
                              {bp.subheadingsHierarchy.map((sh, sIdx) => (
                                <div
                                  key={sIdx}
                                  className={`bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs ${
                                    sh.level === 'h3' ? 'ml-4 border-l-2 border-l-indigo-500' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold text-slate-100">
                                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 mr-1.5 uppercase">
                                        {sh.level}
                                      </span>
                                      {sh.heading}
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1">{sh.contentPurpose}</p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                    <span className="text-[10px] font-mono text-slate-500">
                                      Target Keywords:
                                    </span>
                                    {sh.targetKeywords.map((tk, kIdx) => (
                                      <span
                                        key={kIdx}
                                        className="text-[10px] font-mono text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                                      >
                                        {tk}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Keyword Role Breakdown Tree */}
                          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Keyword Role Breakdown ({bp.keywordTree.length} Terms Mapped)</span>
                            </h5>
                            <div className="space-y-2">
                              {bp.keywordTree.map((node, nIdx) => (
                                <div
                                  key={nIdx}
                                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded border ${roleBadgeClass(
                                          node.role
                                        )}`}
                                      >
                                        {node.role.replace('_', ' ')}
                                      </span>
                                      <span className="font-bold text-white">{node.keyword}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      Mapped to: <span className="text-slate-300">{node.mappedSectionHeading}</span>
                                    </div>
                                  </div>
                                  <div className="text-right font-mono tabular-nums shrink-0">
                                    <div className="text-slate-200 font-semibold">
                                      {node.monthlySearches.toLocaleString()}/mo
                                    </div>
                                    <div className="text-[11px] text-emerald-400">
                                      ${node.averageCpc.toFixed(2)} CPC · Comp {node.competitionIndex}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 3. Editorial & Information Gain Directives + Free APIs to Enrich Page */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Editorial &amp; Information Gain Directives</span>
                              </span>
                              <span className="font-mono text-emerald-400">
                                Target Depth: {bp.editorialDirectives.targetWordCount.toLocaleString()} words +{' '}
                                {bp.editorialDirectives.schemaMarkupType} Schema
                              </span>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200">
                              <strong className="text-indigo-300">Information Gain Hook:</strong>{' '}
                              {bp.editorialDirectives.informationGainHook}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div>
                                <div className="font-semibold text-slate-300 mb-1">
                                  Depth Differentiators to Include:
                                </div>
                                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                                  {bp.depthDifferentiators.map((d, dIdx) => (
                                    <li key={dIdx}>{d}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-300 mb-1">
                                  Anti-Cannibalization Editorial Checklist:
                                </div>
                                <ul className="space-y-1 text-slate-400 list-disc list-inside">
                                  {bp.editorialDirectives.editorialChecklist.map((c, cIdx) => (
                                    <li key={cIdx}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Recommended Zero-Auth Free APIs for Live Data Enrichment */}
                          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
                            <div className="font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Recommended Free Data APIs</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Enrich this page with live external data so Google never classifies it as static thin text:
                            </p>
                            <div className="space-y-2">
                              {bp.recommendedFreeApis.map((api, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-slate-200">{api.name}</span>
                                    <span className="text-[10px] font-mono text-emerald-400">
                                      {api.authType}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-indigo-300 truncate">
                                    {api.endpointPattern}
                                  </div>
                                  <div className="text-[11px] text-slate-400">{api.enrichmentUseCase}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
