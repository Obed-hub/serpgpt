export interface SitemapBlueprintSection {
  level: 'H2' | 'H3';
  heading: string;
  targets: string[];
  volume?: string;
  cpc?: string;
  description: string;
  editorialContent: string[];
  keyTakeaways: string[];
}

export interface SitemapKeywordRole {
  role: 'PRIMARY' | 'SECONDARY' | 'H2_SUBHEADING' | 'FAQ_QUERY' | 'SEMANTIC_VARIATION';
  keyword: string;
  monthlyVolume: number;
  cpc: number;
  mappedSection: string;
}

export interface SitemapMasterPageBlueprint {
  id: string;
  rank: number;
  slug: string;
  title: string;
  pageArchetype: string;
  h1: string;
  primaryKeyword: string;
  totalClusterVolume: number;
  avgCpc: number;
  schemaType: 'TechArticle' | 'Article' | 'Table' | 'Dataset' | 'WebPage';
  targetWordCount: number;
  cannibalizationTermsMerged: string[];
  antiThinWarning: string;
  informationGainHook: string;
  defaultToolTab: 'extractor' | 'csv-excel' | 'compare' | 'python' | 'visual-tree' | 'video-image';
  sections: SitemapBlueprintSection[];
  keywordRoles: SitemapKeywordRole[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ArchetypeAuditLogEntry {
  id: number;
  name: string;
  routePrefix: string;
  status: 'ACTIVATED' | 'OMITTED';
  matchedCount: number;
  reason: string;
}

export const SITEMAP_EXTRACTOR_SUMMARY = {
  targetDomain: 'serpgpt.pro',
  niche: 'Site map extractor',
  totalKeywordsClustered: 25,
  consolidatedMasterPages: 9,
  thinPagesPrevented: 16,
  activeArchetypesMatched: 7,
  totalArchetypesCatalog: 38,
  totalMonthlySearchVolume: 50350,
};

export const SITEMAP_MASTER_BLUEPRINTS: SitemapMasterPageBlueprint[] = [
  {
    id: 'sitemap-bp-1',
    rank: 1,
    slug: '/sources/site-map-extractor',
    title: 'Site Map Extractor (2026 Complete Official Source Guide)',
    pageArchetype: 'Official Source / Citation Page (/sources/...)',
    h1: 'Site Map Extractor: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'site map extractor',
    totalClusterVolume: 16000,
    avgCpc: 6.31,
    schemaType: 'TechArticle',
    targetWordCount: 1900,
    cannibalizationTermsMerged: [
      'extract urls from sitemap online',
      'xml sitemap url extractor',
      'website map extractor',
      'sitemap page extractor',
    ],
    antiThinWarning:
      'CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish 5 separate URLs for ["site map extractor", "extract urls from sitemap online", "xml sitemap url extractor", "website map extractor", "sitemap page extractor"]. Google\'s SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google\'s Scaled Content Abuse / Doorway Page filter. Consolidate all 5 terms into /sources/site-map-extractor.',
    informationGainHook:
      'Translate dense sitemaps.org protocol specifications into plain-English action tables with live recursive XML parsing and instant URL extraction.',
    defaultToolTab: 'extractor',
    sections: [
      {
        level: 'H2',
        heading: 'Site Map Extractor: Overview & Key Benchmarks',
        targets: ['site map extractor', 'extract urls from sitemap online'],
        volume: '4,400/mo',
        cpc: '$6.40',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'A Site Map Extractor parses XML sitemaps (<urlset>) and nested sitemap index files (<sitemapindex>) to output a clean, structured inventory of every canonical URL published on a domain. Technical SEO teams, content strategists, and migration engineers use a site map extractor to audit indexation coverage, detect orphan pages, and benchmark competitor publishing velocity.',
          'Under the official sitemaps.org 0.9 protocol supported by Google, Bing, and Yahoo, a single XML sitemap file can contain up to 50,000 URLs or 50MB uncompressed. Large websites split their inventory across child sitemaps (such as post-sitemap.xml, page-sitemap.xml, and product-sitemap.xml). Our interactive extractor automatically follows child sitemap indexes and consolidates every URL into a unified table.',
        ],
        keyTakeaways: [
          'Supports standard <urlset>, recursive <sitemapindex>, robots.txt Sitemap discovery, and raw XML input.',
          'Extracts <loc>, <lastmod>, <changefreq>, <priority>, <image:image>, and <video:video> metadata in one pass.',
        ],
      },
      {
        level: 'H2',
        heading: 'Extract Urls From Sitemap Online: Step-by-Step Guide',
        targets: ['extract urls from sitemap online'],
        volume: '3,600/mo',
        cpc: '$7.30',
        description: 'Covers "extract urls from sitemap online" (3,600/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'To extract URLs from a sitemap online without installing desktop crawlers, enter either the full XML sitemap URL (e.g., https://example.com/sitemap.xml) or the root domain into the extractor above. If you only know the root domain, the extractor probes /robots.txt, /sitemap.xml, /sitemap_index.xml, and /wp-sitemap.xml automatically.',
          'Once parsed, every URL is categorized by its top-level directory path (such as /blog/, /products/, /guides/, or /compare/), allowing you to isolate specific content silos before exporting to CSV or plain text.',
        ],
        keyTakeaways: [
          'Zero browser memory crashes even on multi-thousand URL sitemaps.',
          'Instant subfolder grouping reveals competitors’ programmatic SEO route structures.',
        ],
      },
      {
        level: 'H2',
        heading: 'Xml Sitemap Url Extractor: Comparison & Best Practices',
        targets: ['xml sitemap url extractor'],
        volume: '3,200/mo',
        cpc: '$6.80',
        description: 'Covers "xml sitemap url extractor" (3,200/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'An enterprise XML sitemap URL extractor must handle namespace prefixes (xmlns:xhtml, xmlns:image, xmlns:video), CDATA blocks, and relative-to-canonical URL normalization. Basic regex scrapers often break when encountering <image:loc> tags inside a <url> node, accidentally merging image asset URLs with canonical page URLs.',
          'Our parser strictly separates primary <url><loc> entries from nested media nodes so your page count and CSV exports remain 100% accurate.',
        ],
        keyTakeaways: [
          'Strictly distinguishes primary <url><loc> tags from nested <image:loc> and <video:loc> tags.',
          'Preserves ISO-8601 <lastmod> timestamps so you can sort pages by freshness.',
        ],
      },
      {
        level: 'H2',
        heading: 'Website Map Extractor: Step-by-Step Guide',
        targets: ['website map extractor'],
        volume: '2,900/mo',
        cpc: '$5.85',
        description: 'Covers "website map extractor" (2,900/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'When auditing a site migration or preparing a redirect map, use the Website Map Extractor to capture a baseline snapshot of all live URLs before changing CMS permalink structures. Compare the pre-migration URL list against your staging sitemap to guarantee zero 404 broken links on launch day.',
        ],
        keyTakeaways: [
          'Ideal for pre-migration 301 redirect mapping and canonical URL audits.',
          'Filter by URL depth (1-click, 2-click, 3-click path segments) to flatten site architecture.',
        ],
      },
      {
        level: 'H3',
        heading: 'Sitemap Page Extractor: Comparison & Best Practices',
        targets: ['sitemap page extractor'],
        volume: '1,900/mo',
        cpc: '$5.20',
        description: 'Covers "sitemap page extractor" (1,900/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Use the Sitemap Page Extractor to audit whether thin tag pages, author archives, or paginated parameter URLs have accidentally leaked into your public XML sitemap—protecting your domain from crawl budget waste.',
        ],
        keyTakeaways: [
          'Spot unwanted /tag/, /page/2/, or staging URLs inside your XML sitemap immediately.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'site map extractor',
        monthlyVolume: 4400,
        cpc: 6.4,
        mappedSection: 'H1 + Interactive Tool',
      },
      {
        role: 'SECONDARY',
        keyword: 'extract urls from sitemap online',
        monthlyVolume: 3600,
        cpc: 7.3,
        mappedSection: 'Extract Urls From Sitemap Online: Step-by-Step Guide',
      },
      {
        role: 'H2_SUBHEADING',
        keyword: 'xml sitemap url extractor',
        monthlyVolume: 3200,
        cpc: 6.8,
        mappedSection: 'Xml Sitemap Url Extractor: Comparison & Best Practices',
      },
      {
        role: 'FAQ_QUERY',
        keyword: 'website map extractor',
        monthlyVolume: 2900,
        cpc: 5.85,
        mappedSection: 'Website Map Extractor: Step-by-Step Guide',
      },
      {
        role: 'SEMANTIC_VARIATION',
        keyword: 'sitemap page extractor',
        monthlyVolume: 1900,
        cpc: 5.2,
        mappedSection: 'Sitemap Page Extractor: Comparison & Best Practices',
      },
    ],
    faqs: [
      {
        question: 'How do I extract all URLs from a website sitemap online for free?',
        answer:
          'Paste the website domain or XML sitemap URL (such as https://example.com/sitemap.xml) into the Site Map Extractor above and click "Extract Sitemap URLs". The tool automatically parses nested sitemap indexes and lets you copy all URLs or export to CSV/Excel.',
      },
      {
        question: 'Does the XML Sitemap Extractor support Sitemap Index files (<sitemapindex>)?',
        answer:
          'Yes. When you enter a parent sitemap index (like Yoast SEO or Shopify sitemap.xml), our server-side extractor fetches the child sitemaps and merges the extracted URLs alongside their source sitemap badge.',
      },
      {
        question: 'Why are all 5 sitemap extractor keywords consolidated into /sources/site-map-extractor?',
        answer:
          'Queries like "site map extractor", "extract urls from sitemap online", and "xml sitemap url extractor" share an 82%+ Google SERP overlap. Consolidating them into one comprehensive tool and guide prevents keyword cannibalization and thin doorway pages.',
      },
    ],
  },
  {
    id: 'sitemap-bp-2',
    rank: 2,
    slug: '/guides/free-sitemap-scraper-tool',
    title: 'Free Sitemap Scraper Tool (2026 Complete Pillar Guide)',
    pageArchetype: 'Pillar / Hub / Topic Cluster Pages (/guides/...)',
    h1: 'Free Sitemap Scraper Tool: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'free sitemap scraper tool',
    totalClusterVolume: 10600,
    avgCpc: 5.58,
    schemaType: 'Article',
    targetWordCount: 2800,
    cannibalizationTermsMerged: [
      'sitemap to excel converter online',
      'convert xml sitemap to list',
      'sitemap link grabber online',
      'google sitemap url reader online',
    ],
    antiThinWarning:
      'CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish 5 separate URLs for ["free sitemap scraper tool", "sitemap to excel converter online", "convert xml sitemap to list", "sitemap link grabber online", "google sitemap url reader online"]. Google\'s SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google\'s Scaled Content Abuse / Doorway Page filter. Consolidate all 5 terms into /guides/free-sitemap-scraper-tool.',
    informationGainHook:
      'Act as the canonical parent hub linking out to specialized calculators, directories, and spreadsheet export matrices.',
    defaultToolTab: 'csv-excel',
    sections: [
      {
        level: 'H2',
        heading: 'Free Sitemap Scraper Tool: Overview & Key Benchmarks',
        targets: ['free sitemap scraper tool', 'sitemap to excel converter online'],
        volume: '2,700/mo',
        cpc: '$5.60',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'A Free Sitemap Scraper Tool harvests every public URL from an XML sitemap and formats the output into spreadsheet-ready rows with URL slug, subfolder category, last modified date, priority score, and media count.',
        ],
        keyTakeaways: [
          'Scrapes standard XML sitemaps, RSS feeds, and plain-text sitemaps without rate-limit lockouts.',
          'Exports directly to Excel-compatible UTF-8 CSV and TSV formats.',
        ],
      },
      {
        level: 'H2',
        heading: 'Sitemap To Excel Converter Online: Step-by-Step Guide',
        targets: ['sitemap to excel converter online'],
        volume: '2,400/mo',
        cpc: '$5.90',
        description: 'Covers "sitemap to excel converter online" (2,400/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Opening a raw .xml sitemap directly in Microsoft Excel or Google Sheets often creates messy, unparseable XML schema warnings. Using the Sitemap to Excel Converter tab above flattens hierarchical XML nodes into clean tabular columns (URL, Subfolder, LastModified, ChangeFreq, Priority, Images) ready for VLOOKUP or pivot table analysis.',
        ],
        keyTakeaways: [
          'One-click CSV/Excel download with pre-parsed subfolder and URL depth columns.',
        ],
      },
      {
        level: 'H2',
        heading: 'Convert Xml Sitemap To List: Comparison & Best Practices',
        targets: ['convert xml sitemap to list'],
        volume: '2,300/mo',
        cpc: '$5.50',
        description: 'Covers "convert xml sitemap to list" (2,300/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'When feeding URLs into Screaming Frog, Sitebulb, or bulk PageSpeed Insights audits, you need a clean newline-separated URL list stripped of XML tags. Click "Copy Plain URL List" in the tool above to copy raw canonical URLs to your clipboard.',
        ],
        keyTakeaways: [
          'Strips all XML markup and outputs 1 canonical URL per line.',
        ],
      },
      {
        level: 'H2',
        heading: 'Sitemap Link Grabber Online: Step-by-Step Guide',
        targets: ['sitemap link grabber online'],
        volume: '1,700/mo',
        cpc: '$5.10',
        description: 'Covers "sitemap link grabber online" (1,700/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Use the Sitemap Link Grabber filter bar to isolate specific URL patterns—such as /blog/, /compare/, or /products/—and grab only the links matching your target subfolder.',
        ],
        keyTakeaways: [
          'Instant regex and substring filtering over thousands of extracted sitemap links.',
        ],
      },
      {
        level: 'H3',
        heading: 'Google Sitemap Url Reader Online: Comparison & Best Practices',
        targets: ['google sitemap url reader online'],
        volume: '1,500/mo',
        cpc: '$5.80',
        description: 'Covers "google sitemap url reader online" (1,500/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Validate that Googlebot can read your sitemap cleanly by verifying HTTP 200 status, valid XML entity escaping (&amp;), and accurate <lastmod> dates.',
        ],
        keyTakeaways: [
          'Detects malformed XML entities before you submit to Google Search Console.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'free sitemap scraper tool',
        monthlyVolume: 2700,
        cpc: 5.6,
        mappedSection: 'H1 + Interactive Tool',
      },
      {
        role: 'SECONDARY',
        keyword: 'sitemap to excel converter online',
        monthlyVolume: 2400,
        cpc: 5.9,
        mappedSection: 'Sitemap To Excel Converter Online: Step-by-Step Guide',
      },
      {
        role: 'H2_SUBHEADING',
        keyword: 'convert xml sitemap to list',
        monthlyVolume: 2300,
        cpc: 5.5,
        mappedSection: 'Convert Xml Sitemap To List: Comparison & Best Practices',
      },
      {
        role: 'FAQ_QUERY',
        keyword: 'sitemap link grabber online',
        monthlyVolume: 1700,
        cpc: 5.1,
        mappedSection: 'Sitemap Link Grabber Online: Step-by-Step Guide',
      },
      {
        role: 'SEMANTIC_VARIATION',
        keyword: 'google sitemap url reader online',
        monthlyVolume: 1500,
        cpc: 5.8,
        mappedSection: 'Google Sitemap Url Reader Online: Comparison & Best Practices',
      },
    ],
    faqs: [
      {
        question: 'How do I convert an XML sitemap to Excel or Google Sheets?',
        answer:
          'Enter your sitemap URL in the tool above and click "Export CSV / Excel". The file opens directly in Excel or Google Sheets with clean columns for URL, Subfolder, Last Modified Date, Priority, and Change Frequency.',
      },
    ],
  },
  {
    id: 'sitemap-bp-3',
    rank: 3,
    slug: '/compare/sitemap-url-list-generator-free',
    title: 'Sitemap Url List Generator Free (2026 Complete Comparison Guide)',
    pageArchetype: 'Comparison / VS Pages (/compare/...)',
    h1: 'Sitemap Url List Generator Free: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'sitemap url list generator free',
    totalClusterVolume: 6300,
    avgCpc: 6.5,
    schemaType: 'Table',
    targetWordCount: 2100,
    cannibalizationTermsMerged: [
      'export wordpress sitemap to csv',
      'export yoast sitemap to excel',
    ],
    antiThinWarning:
      'CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish 3 separate URLs for ["sitemap url list generator free", "export wordpress sitemap to csv", "export yoast sitemap to excel"]. Google\'s SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google\'s Scaled Content Abuse / Doorway Page filter. Consolidate all 3 terms into /compare/sitemap-url-list-generator-free.',
    informationGainHook:
      'Include a side-by-side weighted scoring matrix comparing WordPress Core, Yoast SEO, RankMath, and Shopify sitemap structures.',
    defaultToolTab: 'compare',
    sections: [
      {
        level: 'H2',
        heading: 'Sitemap Url List Generator Free: Overview & Key Benchmarks',
        targets: ['sitemap url list generator free', 'export wordpress sitemap to csv'],
        volume: '2,500/mo',
        cpc: '$5.30',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'Different CMS platforms generate drastically different XML sitemap hierarchies. WordPress 5.5+ core uses /wp-sitemap.xml, Yoast SEO and RankMath use /sitemap_index.xml split by post type, and Shopify automatically generates /sitemap.xml with child sitemaps for products, collections, pages, and blogs.',
        ],
        keyTakeaways: [
          'Compare CMS sitemap patterns side by side and extract any WordPress, Yoast, or Shopify sitemap in one click.',
        ],
      },
      {
        level: 'H2',
        heading: 'Export Wordpress Sitemap To Csv: Step-by-Step Guide',
        targets: ['export wordpress sitemap to csv'],
        volume: '2,200/mo',
        cpc: '$7.50',
        description: 'Covers "export wordpress sitemap to csv" (2,200/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'To export a WordPress sitemap to CSV without installing a heavy database plugin, enter https://yourdomain.com/wp-sitemap.xml (or /sitemap_index.xml) into our extractor. It automatically traverses wp-sitemap-posts-post-1.xml and wp-sitemap-posts-page-1.xml and merges all published URLs into a single CSV.',
        ],
        keyTakeaways: [
          'Works on any WordPress site externally without requiring wp-admin credentials.',
        ],
      },
      {
        level: 'H2',
        heading: 'Export Yoast Sitemap To Excel: Comparison & Best Practices',
        targets: ['export yoast sitemap to excel'],
        volume: '1,600/mo',
        cpc: '$6.70',
        description: 'Covers "export yoast sitemap to excel" (1,600/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Yoast SEO wraps its XML sitemaps in an XSL stylesheet (/main-sitemap.xsl) for human viewing, which often confuses spreadsheet Web Queries. Our extractor reads the underlying XML directly and exports both post URLs and Yoast <image:image> counts into Excel.',
        ],
        keyTakeaways: [
          'Bypasses Yoast XSL stylesheet rendering issues and extracts raw <loc> and <lastmod> tags.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'sitemap url list generator free',
        monthlyVolume: 2500,
        cpc: 5.3,
        mappedSection: 'H1 + Interactive Tool',
      },
      {
        role: 'SECONDARY',
        keyword: 'export wordpress sitemap to csv',
        monthlyVolume: 2200,
        cpc: 7.5,
        mappedSection: 'Export Wordpress Sitemap To Csv: Step-by-Step Guide',
      },
      {
        role: 'H2_SUBHEADING',
        keyword: 'export yoast sitemap to excel',
        monthlyVolume: 1600,
        cpc: 6.7,
        mappedSection: 'Export Yoast Sitemap To Excel: Comparison & Best Practices',
      },
    ],
    faqs: [
      {
        question: 'How do I export a Yoast SEO or WordPress sitemap to CSV without a plugin?',
        answer:
          'Enter your site’s /sitemap_index.xml or /wp-sitemap.xml URL into the extractor above. It recursively fetches post-sitemap.xml and page-sitemap.xml and lets you download the combined CSV immediately.',
      },
    ],
  },
  {
    id: 'sitemap-bp-4',
    rank: 4,
    slug: '/sources/python-sitemap-url-extractor-script',
    title: 'Python Sitemap Url Extractor Script (2026 Complete Official Source Guide)',
    pageArchetype: 'Official Source / Citation Page (/sources/...)',
    h1: 'Python Sitemap Url Extractor Script: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'python sitemap url extractor script',
    totalClusterVolume: 5800,
    avgCpc: 7.75,
    schemaType: 'TechArticle',
    targetWordCount: 1900,
    cannibalizationTermsMerged: [
      'shopify sitemap product url extractor',
      'extract image urls from sitemap',
      'fast xml sitemap link extractor',
    ],
    antiThinWarning:
      'CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish 4 separate URLs for ["python sitemap url extractor script", "shopify sitemap product url extractor", "extract image urls from sitemap", "fast xml sitemap link extractor"]. Google\'s SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google\'s Scaled Content Abuse / Doorway Page filter. Consolidate all 4 terms into /sources/python-sitemap-url-extractor-script.',
    informationGainHook:
      'Provide copy-ready Python (lxml + asyncio) and Node.js scripts alongside the live web extractor for Shopify and image sitemaps.',
    defaultToolTab: 'python',
    sections: [
      {
        level: 'H2',
        heading: 'Python Sitemap Url Extractor Script: Overview & Key Benchmarks',
        targets: ['python sitemap url extractor script', 'shopify sitemap product url extractor'],
        volume: '1,800/mo',
        cpc: '$6.20',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'When automating weekly SEO audits across millions of URLs or gzipped sitemaps (.xml.gz), Python with requests and xml.etree.ElementTree (or lxml) is the industry standard. Use our interactive web tool for instant extraction, or copy the production-ready Python script above to run scheduled extractions in CI/CD.',
        ],
        keyTakeaways: [
          'Includes copyable Python 3 script supporting recursive <sitemapindex>, .xml.gz decompression, and CSV export.',
        ],
      },
      {
        level: 'H2',
        heading: 'Shopify Sitemap Product Url Extractor: Step-by-Step Guide',
        targets: ['shopify sitemap product url extractor'],
        volume: '1,600/mo',
        cpc: '$9.40',
        description: 'Covers "shopify sitemap product url extractor" (1,600/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Every Shopify store publishes a root /sitemap.xml that links to /sitemap_products_1.xml, /sitemap_collections_1.xml, and /sitemap_blogs_1.xml. Our extractor and Python script automatically filter for /products/ URLs and extract product image URLs and titles.',
        ],
        keyTakeaways: [
          'Isolates Shopify /products/ and /collections/ URLs alongside product <image:loc> tags.',
        ],
      },
      {
        level: 'H2',
        heading: 'Extract Image Urls From Sitemap: Comparison & Best Practices',
        targets: ['extract image urls from sitemap'],
        volume: '1,300/mo',
        cpc: '$8.20',
        description: 'Covers "extract image urls from sitemap" (1,300/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Google Image Sitemaps use the xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" namespace. Our parser extracts every <image:loc> associated with each canonical page URL so you can audit missing product photos or CDN migration URLs.',
        ],
        keyTakeaways: [
          'Maps every <image:loc> to its parent <url><loc> page.',
        ],
      },
      {
        level: 'H2',
        heading: 'Fast Xml Sitemap Link Extractor: Step-by-Step Guide',
        targets: ['fast xml sitemap link extractor'],
        volume: '1,100/mo',
        cpc: '$7.20',
        description: 'Covers "fast xml sitemap link extractor" (1,100/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Streaming XML parsers process 50,000 URLs in under 400ms by avoiding heavy DOM tree construction.',
        ],
        keyTakeaways: [
          'Sub-second extraction for large e-commerce and programmatic sitemaps.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'python sitemap url extractor script',
        monthlyVolume: 1800,
        cpc: 6.2,
        mappedSection: 'H1 + Interactive Tool',
      },
      {
        role: 'SECONDARY',
        keyword: 'shopify sitemap product url extractor',
        monthlyVolume: 1600,
        cpc: 9.4,
        mappedSection: 'Shopify Sitemap Product Url Extractor: Step-by-Step Guide',
      },
      {
        role: 'H2_SUBHEADING',
        keyword: 'extract image urls from sitemap',
        monthlyVolume: 1300,
        cpc: 8.2,
        mappedSection: 'Extract Image Urls From Sitemap: Comparison & Best Practices',
      },
      {
        role: 'FAQ_QUERY',
        keyword: 'fast xml sitemap link extractor',
        monthlyVolume: 1100,
        cpc: 7.2,
        mappedSection: 'Fast Xml Sitemap Link Extractor: Step-by-Step Guide',
      },
    ],
    faqs: [
      {
        question: 'Can I extract Shopify product URLs and images from sitemap_products_1.xml?',
        answer:
          'Yes. Enter the Shopify store root URL or /sitemap.xml above, or use the included Python script to extract all /products/ URLs and their nested <image:loc> image links.',
      },
    ],
  },
  {
    id: 'sitemap-bp-5',
    rank: 5,
    slug: '/database/extract-all-links-from-sitemap-xml',
    title: 'Extract All Links From Sitemap Xml (2026 Complete Searchable Database Guide)',
    pageArchetype: 'Searchable Database / Record Pages (/database/...)',
    h1: 'Extract All Links From Sitemap Xml: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'extract all links from sitemap xml',
    totalClusterVolume: 3600,
    avgCpc: 6.15,
    schemaType: 'Dataset',
    targetWordCount: 2100,
    cannibalizationTermsMerged: ['parse sitemap index to urls'],
    antiThinWarning:
      'CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish 2 separate URLs for ["extract all links from sitemap xml", "parse sitemap index to urls"]. Google\'s SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google\'s Scaled Content Abuse / Doorway Page filter. Consolidate all 2 terms into /database/extract-all-links-from-sitemap-xml.',
    informationGainHook:
      'Provide instant multi-column filtering, subfolder facet pills, sorting, and CSV export over structured sitemap records.',
    defaultToolTab: 'extractor',
    sections: [
      {
        level: 'H2',
        heading: 'Extract All Links From Sitemap Xml: Overview & Key Benchmarks',
        targets: ['extract all links from sitemap xml', 'parse sitemap index to urls'],
        volume: '2,100/mo',
        cpc: '$5.40',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'Use the searchable database table above to extract all links from any sitemap.xml file and interactively filter by subfolder, URL depth, priority, or last modified date.',
        ],
        keyTakeaways: [
          'Instant multi-column sorting and subfolder facet filtering over extracted sitemap URLs.',
        ],
      },
      {
        level: 'H2',
        heading: 'Parse Sitemap Index To Urls: Step-by-Step Guide',
        targets: ['parse sitemap index to urls'],
        volume: '1,500/mo',
        cpc: '$6.90',
        description: 'Covers "parse sitemap index to urls" (1,500/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'When a site uses a <sitemapindex> file pointing to multiple child sitemaps, our recursive resolver fetches each child sitemap and tags every extracted URL with its parent sitemap source.',
        ],
        keyTakeaways: [
          'Automatically resolves child sitemaps from <sitemapindex> files.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'extract all links from sitemap xml',
        monthlyVolume: 2100,
        cpc: 5.4,
        mappedSection: 'H1 + Interactive Tool',
      },
      {
        role: 'SECONDARY',
        keyword: 'parse sitemap index to urls',
        monthlyVolume: 1500,
        cpc: 6.9,
        mappedSection: 'Parse Sitemap Index To Urls: Step-by-Step Guide',
      },
    ],
    faqs: [
      {
        question: 'How does recursive sitemap index parsing work?',
        answer:
          'If the XML root node is <sitemapindex>, the extractor reads each <sitemap><loc> child URL, fetches the child XML files in parallel, and aggregates all <url><loc> entries into one searchable table.',
      },
    ],
  },
  {
    id: 'sitemap-bp-6',
    rank: 6,
    slug: '/resources/download-urls-from-sitemap-csv',
    title: 'Download Urls From Sitemap Csv (2026 Complete Resource Library Guide)',
    pageArchetype: 'Resource Library / Download Pages (/resources/...)',
    h1: 'Download Urls From Sitemap Csv: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'download urls from sitemap csv',
    totalClusterVolume: 3400,
    avgCpc: 6.95,
    schemaType: 'WebPage',
    targetWordCount: 1650,
    cannibalizationTermsMerged: ['bulk sitemap url downloader'],
    antiThinWarning:
      'CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish 2 separate URLs for ["download urls from sitemap csv", "bulk sitemap url downloader"]. Google\'s SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google\'s Scaled Content Abuse / Doorway Page filter. Consolidate all 2 terms into /resources/download-urls-from-sitemap-csv.',
    informationGainHook:
      'Offer zero-gate preview tables plus instant CSV, JSON, and Plain-Text URL kit downloads.',
    defaultToolTab: 'csv-excel',
    sections: [
      {
        level: 'H2',
        heading: 'Download Urls From Sitemap Csv: Overview & Key Benchmarks',
        targets: ['download urls from sitemap csv', 'bulk sitemap url downloader'],
        volume: '1,800/mo',
        cpc: '$6.10',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'Download extracted sitemap URLs directly as a clean CSV, JSON array, or newline-delimited TXT file with zero email gate or signup required.',
        ],
        keyTakeaways: [
          'Includes URL, Subfolder, Path Depth, LastMod, ChangeFreq, Priority, and Media Counts in every CSV download.',
        ],
      },
      {
        level: 'H2',
        heading: 'Bulk Sitemap Url Downloader: Step-by-Step Guide',
        targets: ['bulk sitemap url downloader'],
        volume: '1,600/mo',
        cpc: '$7.80',
        description: 'Covers "bulk sitemap url downloader" (1,600/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Use the Bulk Sitemap URL Downloader to process multi-sitemap indexes and export filtered subfolder slices in seconds.',
        ],
        keyTakeaways: [
          'Download all URLs or filter to a specific subfolder before exporting.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'download urls from sitemap csv',
        monthlyVolume: 1800,
        cpc: 6.1,
        mappedSection: 'H1 + Interactive Tool',
      },
      {
        role: 'SECONDARY',
        keyword: 'bulk sitemap url downloader',
        monthlyVolume: 1600,
        cpc: 7.8,
        mappedSection: 'Bulk Sitemap Url Downloader: Step-by-Step Guide',
      },
    ],
    faqs: [
      {
        question: 'What columns are included when I download URLs from a sitemap CSV?',
        answer:
          'Every exported CSV includes: URL, Subfolder Category, URL Path Depth, Last Modified Timestamp, Change Frequency, Priority Score, Image Count, Video Count, and Source Sitemap.',
      },
    ],
  },
  {
    id: 'sitemap-bp-7',
    rank: 7,
    slug: '/guides/sitemap-parser-to-text',
    title: 'Sitemap Parser To Text (2026 Complete Pillar Guide)',
    pageArchetype: 'Pillar / Hub / Topic Cluster Pages (/guides/...)',
    h1: 'Sitemap Parser To Text: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'sitemap parser to text',
    totalClusterVolume: 2500,
    avgCpc: 6.6,
    schemaType: 'Article',
    targetWordCount: 2800,
    cannibalizationTermsMerged: ['sitemap url harvest tool'],
    antiThinWarning:
      'CRITICAL ANTI-CANNIBALIZATION RULE: Do NOT publish 2 separate URLs for ["sitemap parser to text", "sitemap url harvest tool"]. Google\'s SERP similarity score for these queries exceeds 82%. Publishing separate pages splits link equity and triggers Google\'s Scaled Content Abuse / Doorway Page filter. Consolidate all 2 terms into /guides/sitemap-parser-to-text.',
    informationGainHook:
      'Convert complex nested XML sitemaps into clean newline-separated .txt lists for CLI crawlers, wget, and LLM knowledge ingestion.',
    defaultToolTab: 'csv-excel',
    sections: [
      {
        level: 'H2',
        heading: 'Sitemap Parser To Text: Overview & Key Benchmarks',
        targets: ['sitemap parser to text', 'sitemap url harvest tool'],
        volume: '1,400/mo',
        cpc: '$4.70',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'Converting an XML sitemap to plain text (.txt) is essential when piping URLs into CLI tools like curl, wget, Screaming Frog List Mode, or AI RAG documentation indexers.',
        ],
        keyTakeaways: [
          'One-click copy or .txt download of raw canonical URLs.',
        ],
      },
      {
        level: 'H2',
        heading: 'Sitemap Url Harvest Tool: Step-by-Step Guide',
        targets: ['sitemap url harvest tool'],
        volume: '1,100/mo',
        cpc: '$8.50',
        description: 'Covers "sitemap url harvest tool" (1,100/mo) in depth with practical criteria and benchmarks.',
        editorialContent: [
          'Harvest all canonical URLs from any public sitemap or pasted XML snippet and strip out query parameters or duplicate trailing slashes automatically.',
        ],
        keyTakeaways: [
          'Deduplicates URLs and normalizes trailing slashes automatically.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'sitemap parser to text',
        monthlyVolume: 1400,
        cpc: 4.7,
        mappedSection: 'H1 + Interactive Tool',
      },
      {
        role: 'SECONDARY',
        keyword: 'sitemap url harvest tool',
        monthlyVolume: 1100,
        cpc: 8.5,
        mappedSection: 'Sitemap Url Harvest Tool: Step-by-Step Guide',
      },
    ],
    faqs: [
      {
        question: 'Can Google Search Console accept a plain text (.txt) sitemap?',
        answer:
          'Yes! Google Search Console officially supports plain-text sitemaps formatted with one UTF-8 encoded URL per line, up to 50,000 lines per file.',
      },
    ],
  },
  {
    id: 'sitemap-bp-8',
    rank: 8,
    slug: '/gallery/visual-sitemap-link-exporter',
    title: 'Visual Sitemap Link Exporter (2026 Complete Image Gallery Guide)',
    pageArchetype: 'Image Gallery / Visual Reference Pages (/gallery/...)',
    h1: 'Visual Sitemap Link Exporter: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'visual sitemap link exporter',
    totalClusterVolume: 1200,
    avgCpc: 9.1,
    schemaType: 'WebPage',
    targetWordCount: 1400,
    cannibalizationTermsMerged: [
      'visual sitemap link exporter 2026',
      'visual sitemap link exporter requirements',
    ],
    antiThinWarning:
      'CONSOLIDATION RULE: Fulfill "visual sitemap link exporter" and its 2026 eligibility/requirement variations on a single canonical /gallery/visual-sitemap-link-exporter hub with an interactive visual architecture tree.',
    informationGainHook:
      'Provide an interactive visual directory tree diagram grouping extracted sitemap URLs by subfolder and click depth.',
    defaultToolTab: 'visual-tree',
    sections: [
      {
        level: 'H2',
        heading: 'Visual Sitemap Link Exporter: Overview & Key Benchmarks',
        targets: ['visual sitemap link exporter'],
        volume: '1,200/mo',
        cpc: '$9.10',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'The Visual Sitemap Link Exporter transforms a flat XML sitemap into an interactive hierarchical tree diagram grouped by top-level directory (/sources/, /guides/, /compare/, /database/, /blog/). Information architects and UX teams use this visual view to spot unbalanced content silos and deep orphan folders.',
        ],
        keyTakeaways: [
          'Interactive visual tree groups URLs by directory folder and shows exact page counts and percentages per hub.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'visual sitemap link exporter',
        monthlyVolume: 1200,
        cpc: 9.1,
        mappedSection: 'H1 + Interactive Tool',
      },
    ],
    faqs: [
      {
        question: 'How does the Visual Sitemap Link Exporter organize URLs?',
        answer:
          'It parses every URL pathname into folder segments (Root -> Level 1 Directory -> Level 2 Slug) and renders a visual architecture map showing how your pages are distributed across topic hubs.',
      },
    ],
  },
  {
    id: 'sitemap-bp-9',
    rank: 9,
    slug: '/videos/extract-video-urls-from-sitemap',
    title: 'Extract Video Urls From Sitemap (2026 Complete Video Guide)',
    pageArchetype: 'Video / Webinar / Transcript Pages (/videos/...)',
    h1: 'Extract Video Urls From Sitemap: 2026 Complete Guide & Interactive Tool',
    primaryKeyword: 'extract video urls from sitemap',
    totalClusterVolume: 950,
    avgCpc: 8.9,
    schemaType: 'Article',
    targetWordCount: 1600,
    cannibalizationTermsMerged: [
      'extract video urls from sitemap 2026',
      'extract video urls from sitemap requirements',
    ],
    antiThinWarning:
      'CONSOLIDATION RULE: Fulfill "extract video urls from sitemap" and its 2026 eligibility/requirement variations on a single canonical /videos/extract-video-urls-from-sitemap hub with an interactive media extractor.',
    informationGainHook:
      'Extract <video:video>, <video:content_loc>, <video:player_loc>, <video:thumbnail_loc>, and <image:loc> tags from rich media XML sitemaps.',
    defaultToolTab: 'video-image',
    sections: [
      {
        level: 'H2',
        heading: 'Extract Video Urls From Sitemap: Overview & Key Benchmarks',
        targets: ['extract video urls from sitemap'],
        volume: '950/mo',
        cpc: '$8.90',
        description: 'Core overview and structured comparison fulfilling primary search intent.',
        editorialContent: [
          'Google Video Sitemaps use the xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" extension to declare <video:content_loc>, <video:player_loc>, <video:thumbnail_loc>, and <video:title>. Our media extractor isolates every video and image asset embedded inside your XML sitemap so you can verify video indexation eligibility.',
        ],
        keyTakeaways: [
          'Extracts <video:content_loc>, <video:player_loc>, <video:title>, and <image:loc> nodes automatically.',
        ],
      },
    ],
    keywordRoles: [
      {
        role: 'PRIMARY',
        keyword: 'extract video urls from sitemap',
        monthlyVolume: 950,
        cpc: 8.9,
        mappedSection: 'H1 + Interactive Tool',
      },
    ],
    faqs: [
      {
        question: 'What XML tags are required in a Google Video Sitemap?',
        answer:
          'Every <video:video> node inside a <url> entry must include <video:thumbnail_loc>, <video:title>, <video:description>, and either <video:content_loc> (direct media file) or <video:player_loc> (embed player URL).',
      },
    ],
  },
];

export const SITEMAP_ARCHETYPE_AUDIT_LOG: ArchetypeAuditLogEntry[] = [
  {
    id: 1,
    name: 'Comparison / VS Pages',
    routePrefix: '/compare/...',
    status: 'ACTIVATED',
    matchedCount: 3,
    reason:
      'Activated: Matched 3 keywords ("sitemap url list generator free", "export wordpress sitemap to csv") sharing Comparison / VS Pages SERP intent.',
  },
  {
    id: 2,
    name: 'Alternatives Pages',
    routePrefix: '/alternatives/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No competitor switching or "alternatives to" modifiers present in keyword list.',
  },
  {
    id: 3,
    name: 'Best / Top / Ranking / Listicle Pages',
    routePrefix: '/best/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No superlative ranking modifiers ("best", "top", "highest") found in current keyword set.',
  },
  {
    id: 4,
    name: 'Glossary / Definition / What Is Pages',
    routePrefix: '/glossary/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No definitional or "what is / meaning" queries present; standalone glossary pages would be thin.',
  },
  {
    id: 5,
    name: 'Statistics / Report / Data Study Pages',
    routePrefix: '/stats/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No statistical or benchmark trend queries found in the keyword sample.',
  },
  {
    id: 6,
    name: 'Templates / Checklists / Cheat Sheets',
    routePrefix: '/templates/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No downloadable template, worksheet, or checklist modifiers detected in keyword set.',
  },
  {
    id: 7,
    name: 'Directory / Location / By State Pages',
    routePrefix: '/directory/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No geographic, state-level, or directory modifiers present in keyword list.',
  },
  {
    id: 8,
    name: 'Cost / Pricing / Salary Breakdown Pages',
    routePrefix: '/cost/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No financial cost, rebate, tax credit, or calculator modifiers matched in keyword list.',
  },
  {
    id: 9,
    name: 'FAQ / Q&A / People Also Ask Pages',
    routePrefix: '/faq/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No question-prefix modifiers ("how", "who", "can I", "when") found in keyword set.',
  },
  {
    id: 10,
    name: 'Timeline / Process / How It Works Pages',
    routePrefix: '/process/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No procedural "how to", "apply", or "step-by-step" action terms matched.',
  },
  {
    id: 11,
    name: 'Pillar / Hub / Topic Cluster Pages',
    routePrefix: '/guides/...',
    status: 'ACTIVATED',
    matchedCount: 7,
    reason:
      'Activated: Matched 7 keywords ("free sitemap scraper tool", "sitemap to excel converter online") sharing Pillar / Hub / Topic Cluster Pages SERP intent.',
  },
  {
    id: 12,
    name: 'Case Studies / Examples / Success Stories',
    routePrefix: '/case-studies/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No "examples", "case study", or "past winners" modifiers present in keyword list.',
  },
  {
    id: 13,
    name: 'Pricing / Plans Pages',
    routePrefix: '/pricing/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No SaaS/service tier pricing modifiers ("plans", "subscription", "tiers") in keyword list.',
  },
  {
    id: 14,
    name: 'Landing Pages / Service Pages',
    routePrefix: '/solutions/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No audience-segment ("for [persona]") or commercial solution modifiers detected.',
  },
  {
    id: 15,
    name: 'Searchable Database / Record Pages',
    routePrefix: '/database/...',
    status: 'ACTIVATED',
    matchedCount: 2,
    reason:
      'Activated: Matched 2 keywords ("extract all links from sitemap xml", "parse sitemap index to urls") sharing Searchable Database / Record Pages SERP intent.',
  },
  {
    id: 16,
    name: 'Product / Entity / Organization Profile Pages',
    routePrefix: '/profiles/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No specific agency, institution, or vendor entity names detected in keyword set.',
  },
  {
    id: 17,
    name: 'Community / Forum / Discussion Pages',
    routePrefix: '/community/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No community discussion or forum-intent modifiers present.',
  },
  {
    id: 18,
    name: 'Video / Webinar / Transcript Pages',
    routePrefix: '/videos/...',
    status: 'ACTIVATED',
    matchedCount: 1,
    reason:
      'Activated: Matched 1 keyword ("extract video urls from sitemap") sharing Video / Webinar / Transcript Pages SERP intent.',
  },
  {
    id: 19,
    name: 'News / Updates / Changelog Pages',
    routePrefix: '/updates/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No legislative change or announcement modifiers matched.',
  },
  {
    id: 20,
    name: 'Resource Library / Download Pages',
    routePrefix: '/resources/...',
    status: 'ACTIVATED',
    matchedCount: 2,
    reason:
      'Activated: Matched 2 keywords ("download urls from sitemap csv", "bulk sitemap url downloader") sharing Resource Library / Download Pages SERP intent.',
  },
  {
    id: 21,
    name: 'Individual Opportunity / Listing Pages',
    routePrefix: '/listings/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No specific named opportunity or program listing tokens matched.',
  },
  {
    id: 22,
    name: 'Review / Evaluation / Audit Pages',
    routePrefix: '/reviews/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No evaluation, audit, or review intent modifiers present in keyword list.',
  },
  {
    id: 23,
    name: 'Image Gallery / Visual Reference Pages',
    routePrefix: '/gallery/...',
    status: 'ACTIVATED',
    matchedCount: 1,
    reason:
      'Activated: Matched 1 keyword ("visual sitemap link exporter") sharing Image Gallery / Visual Reference Pages SERP intent.',
  },
  {
    id: 24,
    name: 'User Profile / Portfolio Pages',
    routePrefix: '/portfolios/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No advisor, specialist, or consultant directory modifiers matched.',
  },
  {
    id: 25,
    name: 'Archive / Historical Record Pages',
    routePrefix: '/archives/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No historical archive or prior-year lookup modifiers found.',
  },
  {
    id: 26,
    name: 'Methodology / Sources / Data Provenance Pages',
    routePrefix: '/methodology/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No scoring methodology or formula provenance queries in keyword list.',
  },
  {
    id: 27,
    name: 'Eligibility Rules Page',
    routePrefix: '/eligibility/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No eligibility, qualification, or requirement modifiers matched.',
  },
  {
    id: 28,
    name: 'Application Status / Deadline Page',
    routePrefix: '/deadlines/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No application deadline, window, or schedule tokens detected.',
  },
  {
    id: 29,
    name: 'Version History Page',
    routePrefix: '/versions/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No software/policy version revision modifiers present in keyword list.',
  },
  {
    id: 30,
    name: 'Official Source / Citation Page',
    routePrefix: '/sources/...',
    status: 'ACTIVATED',
    matchedCount: 9,
    reason:
      'Activated: Matched 9 keywords ("site map extractor", "extract urls from sitemap online") sharing Official Source / Citation Page SERP intent.',
  },
  {
    id: 31,
    name: 'Data Comparison Table',
    routePrefix: '/benchmarks/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No matrix, benchmark rate, or tabular comparison tokens detected.',
  },
  {
    id: 32,
    name: 'Learning Pathway Page',
    routePrefix: '/learn/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No exam prep, certification roadmap, or learning pathway modifiers detected.',
  },
  {
    id: 33,
    name: 'Troubleshooting Page',
    routePrefix: '/troubleshooting/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No rejection recovery, appeal, or troubleshooting modifiers matched.',
  },
  {
    id: 34,
    name: 'Integration / Compatibility Page',
    routePrefix: '/integrations/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No integration, API connector, or compatibility stack modifiers present.',
  },
  {
    id: 35,
    name: 'Changelog / Correction Notice',
    routePrefix: '/changelog/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No amendment, errata, or changelog tokens detected.',
  },
  {
    id: 36,
    name: 'Event / Webinar Page',
    routePrefix: '/events/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No workshop, summit, or cohort event modifiers present in keyword list.',
  },
  {
    id: 37,
    name: 'Waitlist / Registration Page',
    routePrefix: '/waitlist/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No portal registration, intake, or enrollment modifiers matched.',
  },
  {
    id: 38,
    name: 'Trust / Verification Page',
    routePrefix: '/trust/...',
    status: 'OMITTED',
    matchedCount: 0,
    reason: 'No verification, accreditation, or anti-scam trust modifiers present.',
  },
];

export function findSitemapBlueprintByPath(pathname: string): SitemapMasterPageBlueprint | null {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  if (clean === '/sitemap-extractor') {
    return SITEMAP_MASTER_BLUEPRINTS[0];
  }
  return SITEMAP_MASTER_BLUEPRINTS.find((b) => b.slug.toLowerCase() === clean) || null;
}
