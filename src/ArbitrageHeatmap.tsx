import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { KeywordOpportunity } from './types';
import { ArrowUpRight, Crosshair, Download, Eye, EyeOff, FileText } from 'lucide-react';
import { exportKeywordsCsv, exportSingleKeywordCardMd, slugify, triggerFileDownload } from './exportUtils';

interface ArbitrageHeatmapProps {
  keywords: KeywordOpportunity[];
  geo: string;
  maxCompetitionCap: number;
  onSelectKeywordForXray: (keyword: string) => void;
}

type HeatMetric = 'arbitrage' | 'cpc' | 'trafficValue';

export default function ArbitrageHeatmap({
  keywords,
  geo,
  maxCompetitionCap,
  onSelectKeywordForXray,
}: ArbitrageHeatmapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [heatMetric, setHeatMetric] = useState<HeatMetric>('arbitrage');
  const [hoveredKeyword, setHoveredKeyword] = useState<KeywordOpportunity | null>(null);
  const [selectedBinFilter, setSelectedBinFilter] = useState<{
    compMin: number;
    compMax: number;
    volMin: number;
    volMax: number;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    if (!isExpanded || !svgRef.current || keywords.length === 0) return;

    const svgEl = svgRef.current;
    const width = containerRef.current?.clientWidth || 960;
    const height = 340;
    const margin = { top: 28, right: 32, bottom: 44, left: 68 };
    const innerWidth = Math.max(300, width - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales: X = Competition Index (0 to 100), Y = Monthly Search Volume
    const maxVol = Math.max(d3.max(keywords, (d) => d.avgMonthlySearches) || 50000, 15000) * 1.12;
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, maxVol]).range([innerHeight, 0]);

    // 2D Heatmap Grid (10 columns across Competition 0-100, 5 rows across Volume)
    const xBins = 10;
    const yBins = 5;
    const cellWidth = innerWidth / xBins;
    const cellHeight = innerHeight / yBins;

    interface GridCell {
      col: number;
      row: number;
      compMin: number;
      compMax: number;
      volMin: number;
      volMax: number;
      items: KeywordOpportunity[];
      intensity: number;
    }

    const cells: GridCell[] = [];
    for (let c = 0; c < xBins; c++) {
      for (let r = 0; r < yBins; r++) {
        const compMin = c * (100 / xBins);
        const compMax = (c + 1) * (100 / xBins);
        const volMin = r * (maxVol / yBins);
        const volMax = (r + 1) * (maxVol / yBins);

        const inCell = keywords.filter(
          (k) =>
            k.competitionIndex >= compMin &&
            (c === xBins - 1 ? k.competitionIndex <= compMax : k.competitionIndex < compMax) &&
            k.avgMonthlySearches >= volMin &&
            (r === yBins - 1 ? k.avgMonthlySearches <= volMax : k.avgMonthlySearches < volMax)
        );

        let intensity = 0;
        if (inCell.length > 0) {
          if (heatMetric === 'arbitrage') {
            intensity = d3.mean(inCell, (d) => d.arbitrageScore) || 0;
          } else if (heatMetric === 'cpc') {
            intensity = d3.max(inCell, (d) => d.highTopOfPageBid) || 0;
          } else {
            intensity = d3.sum(inCell, (d) => d.trafficValueMonthly) || 0;
          }
        } else {
          // Base theoretical arbitrage potential background gradient (High Volume + Low Comp = Goldmine Zone)
          const normVol = (r + 0.5) / yBins;
          const normLowComp = 1 - (c + 0.5) / xBins;
          intensity = normVol * normLowComp * (heatMetric === 'arbitrage' ? 45 : heatMetric === 'cpc' ? 8 : 25000);
        }

        cells.push({ col: c, row: r, compMin, compMax, volMin, volMax, items: inCell, intensity });
      }
    }

    const maxIntensity = Math.max(d3.max(cells, (c) => c.intensity) || 1, 1);

    // Color scale for 2D heatmap cells
    const colorScale = d3
      .scaleSequential<string>()
      .domain([0, maxIntensity])
      .interpolator(d3.interpolateRgbBasis(['#090d16', '#0f172a', '#1e1b4b', '#064e3b', '#059669']));

    // Render 2D Heatmap Cells
    g.selectAll('rect.heat-cell')
      .data(cells)
      .enter()
      .append('rect')
      .attr('class', 'heat-cell')
      .attr('x', (d) => xScale(d.compMin))
      .attr('y', (d) => yScale(d.volMax))
      .attr('width', Math.max(1, cellWidth - 1.5))
      .attr('height', Math.max(1, cellHeight - 1.5))
      .attr('rx', 4)
      .attr('fill', (d) => (d.items.length > 0 ? colorScale(d.intensity) : colorScale(d.intensity * 0.45)))
      .attr('stroke', (d) =>
        d.items.length > 0 && d.compMax <= 30
          ? 'rgba(16, 185, 129, 0.35)'
          : 'rgba(30, 41, 59, 0.7)'
      )
      .attr('stroke-width', 1)
      .style('cursor', (d) => (d.items.length > 0 ? 'pointer' : 'default'))
      .on('click', (_event, d) => {
        if (d.items.length > 0) {
          setSelectedBinFilter((prev) =>
            prev && prev.compMin === d.compMin && prev.volMin === d.volMin
              ? null
              : { compMin: d.compMin, compMax: d.compMax, volMin: d.volMin, volMax: d.volMax }
          );
          setHoveredKeyword(d.items[0]);
        }
      });

    // Goldmine Target Zone Boundary Box (Comp 0-30, Top 60% Volume)
    const goldmineWidth = xScale(Math.min(30, maxCompetitionCap));
    const goldmineHeight = innerHeight * 0.65;
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', goldmineWidth)
      .attr('height', goldmineHeight)
      .attr('rx', 6)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.25)
      .attr('stroke-dasharray', '5,4')
      .attr('pointer-events', 'none');

    g.append('text')
      .attr('x', 8)
      .attr('y', 16)
      .attr('fill', '#34d399')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .text(`OUTLIER GOLDMINE ZONE (Comp ≤ ${Math.min(30, maxCompetitionCap)})`);

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat((d) => `${d}`);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => d3.format('~s')(Number(d)));

    const gx = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    gx.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px');
    gx.selectAll('line, path').attr('stroke', '#334155');

    const gy = g.append('g').call(yAxis);
    gy.selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px');
    gy.selectAll('line, path').attr('stroke', '#334155');

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .text('Google Ads Competition Index (0 = Untapped · 100 = Saturated)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -48)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .text('Monthly Search Volume');

    // Radius scale by High Top-of-Page CPC Bid
    const maxCpc = Math.max(d3.max(keywords, (d) => d.highTopOfPageBid) || 25, 5);
    const rScale = d3.scaleSqrt().domain([0, maxCpc]).range([5, 14]);

    // Plot Keyword Outlier Nodes on top of the heatmap
    const nodes = g
      .selectAll('g.kw-node')
      .data(keywords)
      .enter()
      .append('g')
      .attr('class', 'kw-node')
      .attr('transform', (d) => `translate(${xScale(d.competitionIndex)},${yScale(d.avgMonthlySearches)})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (_event, d) => {
        setHoveredKeyword(d);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setHoveredKeyword(d);
      });

    // Outer Halo for High-Arbitrage Outliers (Arbitrage >= 90 & Comp <= 25)
    nodes
      .filter((d) => d.arbitrageScore >= 90 && d.competitionIndex <= 25)
      .append('circle')
      .attr('r', (d) => rScale(d.highTopOfPageBid) + 4)
      .attr('fill', 'none')
      .attr('stroke', '#34d399')
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.65);

    // Primary Keyword Circle
    nodes
      .append('circle')
      .attr('r', (d) => rScale(d.highTopOfPageBid))
      .attr('fill', (d) => {
        if (d.competitionIndex <= 25 && d.arbitrageScore >= 88) return '#10b981'; // Emerald outlier
        if (d.weakSpot.hasWeakSpot) return '#6366f1'; // Indigo weak-spot
        return '#f43f5e'; // Rose high-comp / AI cannibalized
      })
      .attr('fill-opacity', 0.88)
      .attr('stroke', '#090d16')
      .attr('stroke-width', 1.5);

    // Direct Callout Labels for Top 4 Outliers by Arbitrage * Volume
    const topOutliers = [...keywords]
      .sort((a, b) => b.avgMonthlySearches * b.arbitrageScore - a.avgMonthlySearches * a.arbitrageScore)
      .slice(0, 4);

    const topIds = new Set(topOutliers.map((k) => k.id));

    nodes
      .filter((d) => topIds.has(d.id))
      .append('text')
      .attr('x', (d) => (d.competitionIndex > 70 ? -rScale(d.highTopOfPageBid) - 6 : rScale(d.highTopOfPageBid) + 6))
      .attr('y', 3)
      .attr('text-anchor', (d) => (d.competitionIndex > 70 ? 'end' : 'start'))
      .attr('fill', '#e2e8f0')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '500')
      .text((d) => {
        const short = d.keyword.length > 26 ? `${d.keyword.slice(0, 26)}…` : d.keyword;
        return `${short} ($${d.highTopOfPageBid.toFixed(0)})`;
      });
  }, [keywords, heatMetric, isExpanded, maxCompetitionCap]);

  const activeOutlier = hoveredKeyword || keywords[0] || null;

  const handleDownloadHeatmapSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    triggerFileDownload(source, `serpgpt-arbitrage-heatmap-${slugify(geo)}.svg`, 'image/svg+xml;charset=utf-8;');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mb-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-0.5">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>D3.js 2D Density Heatmap · Volume vs. Competition Index ({geo})</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Keyword Outlier &amp; CPC Arbitrage Distribution Matrix
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Heat Metric Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            {(
              [
                { id: 'arbitrage', label: 'Heat: Arbitrage Score' },
                { id: 'cpc', label: 'Heat: Max CPC ($)' },
                { id: 'trafficValue', label: 'Heat: Traffic Value' },
              ] as { id: HeatMetric; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setHeatMetric(m.id)}
                className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  heatMetric === m.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDownloadHeatmapSvg}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Download D3 Heatmap Chart as SVG"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Chart SVG</span>
          </button>

          <button
            type="button"
            onClick={() => exportKeywordsCsv(keywords, 'heatmap-outliers', geo)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Export Heatmap Outliers as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Outliers CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Chart</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Show Heatmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 items-center">
          {/* Left 8 Cols: D3 SVG Canvas */}
          <div ref={containerRef} className="lg:col-span-8 w-full overflow-hidden">
            <svg ref={svgRef} className="w-full h-[340px] select-none" />
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 px-2 font-mono">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Prime Outlier (Comp ≤ 25 &amp; Score ≥ 88)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                  <span>SERP Weak Spot</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>High Saturation / AI Risk</span>
                </span>
              </div>
              <span>Bubble Size = High Top-of-Page CPC Bid ($)</span>
            </div>
          </div>

          {/* Right 4 Cols: Hovered / Selected Outlier Inspector Card */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            {activeOutlier ? (
              <>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">
                    Outlier Score: {activeOutlier.arbitrageScore}/99
                  </span>
                  <span className="text-slate-400">{activeOutlier.intent}</span>
                </div>

                <div className="text-sm font-bold text-white leading-snug">
                  {activeOutlier.keyword}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs tabular-nums">
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400">Monthly Volume</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {activeOutlier.avgMonthlySearches.toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400">Ads Competition</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {activeOutlier.competitionIndex}/100
                    </div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400">CPC Bid Spread</div>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">
                      ${activeOutlier.lowTopOfPageBid.toFixed(2)}–${activeOutlier.highTopOfPageBid.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400">3M Velocity</div>
                    <div
                      className={`text-sm font-bold mt-0.5 ${
                        activeOutlier.velocity3m >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {activeOutlier.velocity3m >= 0 ? `+${activeOutlier.velocity3m}%` : `${activeOutlier.velocity3m}%`}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/70 border border-slate-800/80 rounded-lg p-2.5 leading-relaxed">
                  <strong className="text-emerald-400">{activeOutlier.weakSpot.type}:</strong>{' '}
                  {activeOutlier.weakSpot.opportunityNote}
                </div>

                {selectedBinFilter && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-indigo-300 bg-indigo-950/50 border border-indigo-800/50 rounded px-2.5 py-1">
                    <span>
                      Cell: Comp {Math.round(selectedBinFilter.compMin)}–{Math.round(selectedBinFilter.compMax)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBinFilter(null)}
                      className="underline hover:text-white cursor-pointer"
                    >
                      Clear Cell
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectKeywordForXray(activeOutlier.keyword)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>SERP X-Ray</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => exportSingleKeywordCardMd(activeOutlier, geo)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    title="Export this Outlier Card as Markdown"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Card</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 py-8 text-center">
                Hover over any bubble or heatmap cell to inspect keyword outlier metrics.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
