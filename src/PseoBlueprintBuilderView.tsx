import React, { useState, useEffect } from 'react';
import {
  KeywordOpportunity,
  PseoArchitectureResponse,
  PseoPatternBlueprint,
} from './types';
import {
  buildPseoArchitectureBlueprints,
  convertOpportunitiesToPlannerInput,
  slugifyText,
} from './architectureEngine';
import { triggerFileDownload } from './exportUtils';
import {
  Layers,
  Database,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Download,
  RefreshCw,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface PseoBlueprintBuilderViewProps {
  keywords: KeywordOpportunity[];
  industry: string;
  defaultDomain?: string;
}

type CodeSnippetTab = 'nextjsAppRouter' | 'astroPage' | 'csvDataset' | 'xmlSitemap' | 'bulkAiPrompt';

export default function PseoBlueprintBuilderView({
  keywords,
  industry,
  defaultDomain = 'serpgpt.pro',
}: PseoBlueprintBuilderViewProps) {
  const [domainInput, setDomainInput] = useState<string>(defaultDomain);
  const [pseoData, setPseoData] = useState<PseoArchitectureResponse>(() =>
    buildPseoArchitectureBlueprints(
      convertOpportunitiesToPlannerInput(keywords),
      defaultDomain,
      industry
    )
  );
  const [activeCodeTabByPattern, setActiveCodeTabByPattern] = useState<
    Record<string, CodeSnippetTab>
  >({});
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const plannerItems = convertOpportunitiesToPlannerInput(keywords);
    const updated = buildPseoArchitectureBlueprints(plannerItems, domainInput, industry);
    setPseoData(updated);
  }, [keywords, industry]);

  const handleRefreshPseoApi = async () => {
    setIsSyncing(true);
    try {
      const plannerItems = convertOpportunitiesToPlannerInput(keywords);
      const res = await fetch('/api/keywords/pseo-architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: plannerItems,
          domain: domainInput,
          industry,
        }),
      });
      if (res.ok) {
        const json: PseoArchitectureResponse = await res.json();
        setPseoData(json);
      }
    } catch {
      // Local blueprint generator is already active
    } finally {
      setIsSyncing(false);
    }
  };

  const copyCode = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getActiveCodeTab = (patternId: string): CodeSnippetTab => {
    return activeCodeTabByPattern[patternId] || 'nextjsAppRouter';
  };

  const setPatternCodeTab = (patternId: string, tab: CodeSnippetTab) => {
    setActiveCodeTabByPattern((prev) => ({ ...prev, [patternId]: tab }));
  };

  const handleExportAllPseoBlueprintsMd = () => {
    const lines = [
      `# Programmatic SEO (pSEO) Blueprint & Code Architecture: ${pseoData.industry}`,
      `- **Target Domain:** ${pseoData.domain}`,
      `- **Source Google Keyword Planner Terms:** ${pseoData.totalSourceKeywords}`,
      `- **Scalable Pattern Blueprints:** ${pseoData.totalPatternsGenerated}`,
      ``,
      ...pseoData.patterns.flatMap((p, idx) => [
        `---`,
        `## ${idx + 1}. ${p.patternName} (\`${p.patternCategory.toUpperCase()}\`)`,
        `- **URL Route Pattern:** \`${p.urlPattern}\``,
        `- **H1 Template:** \`${p.h1Template}\``,
        `- **Title Tag Template:** \`${p.titleTagTemplate}\``,
        `- **Meta Description Template:** \`${p.metaDescriptionTemplate}\``,
        `- **Variables:** Primary \`${p.primaryModifierVariable}\` × Secondary \`${p.secondaryModifierVariable}\``,
        `- **Schema.org Type:** \`${p.guardrailSummary.schemaOrgType}\``,
        `- **Min Unique Data Points / URL:** ${p.guardrailSummary.minimumUniqueDataPointsPerUrl}`,
        `- **Cannibalization Rule:** ${p.guardrailSummary.cannibalizationPreventionRule}`,
        ``,
        `### Database Schema Fields:`,
        ...p.databaseSchemaFields.map(
          (f) => `- \`${f.fieldName}\` (${f.type}) — Sample: \`${f.sampleValue}\` — ${f.description}`
        ),
        ``,
        `### Next.js App Router Template (\`page.tsx\`):`,
        '```tsx',
        p.codeSnippets.nextjsAppRouter,
        '```',
        ``,
      ]),
    ];

    triggerFileDownload(
      lines.join('\n'),
      `pseo-architecture-blueprints-${slugifyText(pseoData.industry)}.md`,
      'text/markdown;charset=utf-8;'
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-indigo-400 mb-1 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>
                Programmatic SEO (pSEO) Blueprint Builder &amp; Full-Stack Code Generator
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              pSEO Architecture, Database Schemas &amp; Code Generator ({pseoData.industry})
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Transforms scalable modifier patterns from your active keyword list into database-backed route templates, anti-thin quality guardrails, and copyable Next.js, Astro, CSV, and XML Sitemap code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-500 mr-2 font-mono">Domain:</span>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                aria-label="Target Domain for pSEO Code"
                className="bg-transparent text-slate-200 font-mono focus:outline-none w-32"
              />
            </div>

            <button
              type="button"
              onClick={handleRefreshPseoApi}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing pSEO Blueprints...' : 'Regenerate pSEO Blueprints'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportAllPseoBlueprintsMd}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export All Blueprints (.md)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PATTERN BLUEPRINT CARDS */}
      <div className="space-y-6">
        {pseoData.patterns.map((pattern: PseoPatternBlueprint) => {
          const activeCodeTab = getActiveCodeTab(pattern.id);
          const currentSnippet = pattern.codeSnippets[activeCodeTab];

          return (
            <div
              key={pattern.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5"
            >
              {/* Pattern Top Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/70 uppercase font-semibold">
                      Pattern: {pattern.patternCategory}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-semibold">
                      {pattern.urlPattern}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      Schema: {pattern.guardrailSummary.schemaOrgType}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{pattern.patternName}</h3>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-right tabular-nums">
                    <div className="text-white font-bold">
                      {pattern.totalClusterVolume.toLocaleString()} searches/mo
                    </div>
                    <div className="text-emerald-400 text-[11px]">
                      Avg CPC: ${pattern.avgCpc.toFixed(2)} · Min {pattern.guardrailSummary.minimumUniqueDataPointsPerUrl} Data Points/URL
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Templates & Variables Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono">
                  <div>
                    <span className="text-slate-500">URL Route Template: </span>
                    <span className="text-indigo-300 font-semibold">{pattern.urlPattern}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">H1 Heading Template: </span>
                    <span className="text-white">{pattern.h1Template}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Title Tag Template: </span>
                    <span className="text-emerald-300">{pattern.titleTagTemplate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Meta Description: </span>
                    <span className="text-slate-300">{pattern.metaDescriptionTemplate}</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      Variables: <code className="text-indigo-300">{pattern.primaryModifierVariable}</code> ×{' '}
                      <code className="text-emerald-300">{pattern.secondaryModifierVariable}</code>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Sample Matrix Combinations:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.modifierSampleValues.map((sv, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 text-slate-200 border border-slate-800 rounded"
                      >
                        {sv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Database Schema Table Definitions */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Required Database Schema Columns (Prevents Thin &ldquo;Find-and-Replace&rdquo; Pages)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {pattern.databaseSchemaFields.length} typed fields per record
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-950">
                        <th className="py-2.5 px-4">Field Name</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Sample Value</th>
                        <th className="py-2.5 px-4">Anti-Thin Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {pattern.databaseSchemaFields.map((field, fIdx) => (
                        <tr key={fIdx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-4 font-mono font-semibold text-indigo-300">
                            {field.fieldName}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-emerald-400">{field.type}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-300 max-w-xs truncate">
                            {field.sampleValue}
                          </td>
                          <td className="py-2.5 px-4 text-slate-400">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Content Sections & Quality Guardrails Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                {/* Dynamic H2 Content Sections */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Data-Bound H2 Content Sections</span>
                  </div>
                  {pattern.contentSections.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1.5"
                    >
                      <div className="font-bold text-white">H2: {sec.heading}</div>
                      <div className="text-[11px] font-mono text-indigo-300">
                        Bound DB Fields: {sec.dataBindingField}
                      </div>
                      <p className="text-slate-300">{sec.informationGainDirective}</p>
                      <div className="text-[11px] text-amber-300/90 font-mono">
                        Guardrail: {sec.antiThinRules}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Anti-Thin Quality Guardrails */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Anti-Thin &amp; Cannibalization Guardrails</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2 text-slate-300">
                    <div>
                      <strong className="text-white">Cannibalization Prevention Rule:</strong>{' '}
                      {pattern.guardrailSummary.cannibalizationPreventionRule}
                    </div>
                    <div>
                      <strong className="text-amber-300">Automated Noindex Threshold:</strong>{' '}
                      {pattern.guardrailSummary.thinContentWarning}
                    </div>
                    <div>
                      <strong className="text-indigo-300">Hub-and-Spoke Internal Linking:</strong>{' '}
                      {pattern.guardrailSummary.internalLinkingStrategy}
                    </div>
                  </div>
                </div>
              </div>

              {/* COPYABLE CODE GENERATOR TABS (Next.js App Router / Astro / CSV Dataset / XML Sitemap / AI Prompt) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                    {(
                      [
                        { id: 'nextjsAppRouter', label: 'Next.js App Router (page.tsx)' },
                        { id: 'astroPage', label: 'Astro ([slug].astro)' },
                        { id: 'csvDataset', label: 'CSV Dataset Sample' },
                        { id: 'xmlSitemap', label: 'XML Sitemap' },
                        { id: 'bulkAiPrompt', label: 'Bulk AI Content Prompt' },
                      ] as { id: CodeSnippetTab; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPatternCodeTab(pattern.id, tab.id)}
                        className={`px-2.5 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                          activeCodeTab === tab.id
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyCode(currentSnippet, `${pattern.id}-${activeCodeTab}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === `${pattern.id}-${activeCodeTab}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Code!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
                  {currentSnippet}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
