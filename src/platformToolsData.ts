import { PlatformType } from './types';

export interface PlatformToolMeta {
  id: PlatformType;
  slug: string;
  alternateSlugs: string[];
  name: string;
  badge: string;
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  heroPlaceholder: string;
  starterSeeds: string[];
  keyBenefits: string[];
  rankingFactors: Array<{ title: string; desc: string; icon: string }>;
  faqs: Array<{ question: string; answer: string }>;
  primaryCta: string;
  schemaType: string;
}

export const PLATFORM_TOOLS: Record<PlatformType, PlatformToolMeta> = {
  amazon: {
    id: 'amazon',
    slug: '/tools/amazon-keyword-tool',
    alternateSlugs: ['/tools/amazon-keywords', '/amazon-keyword-tool'],
    name: 'Free Amazon Keyword Tool',
    badge: 'A9 Algorithm Telemetry',
    h1: 'Free Amazon Keyword Tool & Buyer Search Autocomplete (2026)',
    tagline: 'Uncover high-converting Amazon product search queries, A9 buyer intent terms, and long-tail keywords with zero sign-up.',
    metaTitle: 'Free Amazon Keyword Tool – Live A9 Buyer Search Suggest & PPC (2026)',
    metaDescription: 'Extract live Amazon buyer search keywords directly from Amazon completion API. Find high-converting A9 product keywords, low competition terms, and PPC bid estimates free.',
    heroPlaceholder: 'e.g. wireless earbuds, posture corrector, coffee grinder, yoga mat...',
    starterSeeds: [
      'wireless earbuds',
      'portable charger',
      'ergonomic office chair',
      'protein powder',
      'phone stand desk',
      'air fryer accessories',
    ],
    keyBenefits: [
      'Live Amazon Search Completion API data (actual buyer queries, not guesses)',
      'A9 Buyer Intent Classification (Gift ideas, Bundles, Problem-solving)',
      'Estimated Amazon Sponsored Products CPC & Competition Index',
      '1-Click Export to Amazon Listing Backend Search Terms (249 bytes format)',
    ],
    rankingFactors: [
      {
        title: 'A9 Keyword Relevance',
        desc: 'Placing exact-match buyer terms in Title, Bullet Points, and Backend Search Terms directly triggers indexing.',
        icon: 'Tag',
      },
      {
        title: 'Sales Velocity & CTR',
        desc: 'Keywords that generate high clicks and conversions gain permanent ranking boosts in Amazon organic search.',
        icon: 'TrendingUp',
      },
      {
        title: 'Backend Search Terms',
        desc: 'Unused keyword synonyms in the 249-byte backend attribute maximize your indexing breadth without stuffing.',
        icon: 'Database',
      },
    ],
    faqs: [
      {
        question: 'Where does the Amazon keyword data come from?',
        answer: 'Our tool queries Amazon’s official live search completion endpoints (the exact same engine that auto-completes searches for hundreds of millions of shoppers on Amazon.com).',
      },
      {
        question: 'How do I use these keywords in my Amazon FBA listing?',
        answer: 'Place your highest-volume primary buyer keyword in your Product Title, secondary keywords in your 5 Bullet Points, and remaining long-tail synonyms in your Seller Central Backend Search Terms.',
      },
      {
        question: 'Is this Amazon Keyword Tool completely free?',
        answer: 'Yes, 100% free with unlimited searches and no credit card or account registration required.',
      },
    ],
    primaryCta: 'Find Amazon Buyer Keywords',
    schemaType: 'WebApplication',
  },

  tiktok: {
    id: 'tiktok',
    slug: '/tools/tiktok-keyword-tool',
    alternateSlugs: ['/tools/tiktok-keywords', '/tiktok-keyword-tool'],
    name: 'Free TikTok Keyword & Trend Tool',
    badge: 'FYP Algorithm Signals',
    h1: 'Free TikTok Keyword & Viral Trend Finder (2026)',
    tagline: 'Discover trending TikTok search queries, hashtag clusters, and high-retention video search topics used by top creators.',
    metaTitle: 'Free TikTok Keyword Tool – Trending Search Queries & Hashtags (2026)',
    metaDescription: 'Find live TikTok search suggestions, trending video hashtags, and viral search terms. Free TikTok SEO tool to get your videos ranked on the For You page.',
    heroPlaceholder: 'e.g. workout routine, skincare hacks, easy recipes, productivity...',
    starterSeeds: [
      'workout routine',
      'skincare routine glass skin',
      'easy dinner recipes',
      'outfit ideas aesthetic',
      'side hustle for teens',
      'hair growth oil',
    ],
    keyBenefits: [
      'Live TikTok Search Autosuggest Query Extraction',
      'TikTok SEO Categorization (Hacks, Aesthetics, Routines, Tutorials, Reviews)',
      'Viral Content Hook Angles & Creator Search Intent Matrix',
      '1-Click Copy all hashtags (#tag format) for captions and descriptions',
    ],
    rankingFactors: [
      {
        title: 'Text Overlay & Spoken Words',
        desc: 'TikTok transcribe-scans both on-screen text and spoken audio to match queries in the TikTok search bar.',
        icon: 'Video',
      },
      {
        title: 'Caption Keywords & Hashtags',
        desc: 'Using exact-match search terms in the first 2 lines of your caption signals high topical relevance to the TikTok algorithm.',
        icon: 'Hash',
      },
      {
        title: 'Search Bar Persistence',
        desc: 'When your video triggers the highlighted blue search term above comments, it continues receiving organic search views for months.',
        icon: 'Search',
      },
    ],
    faqs: [
      {
        question: 'What is TikTok SEO and why does it matter?',
        answer: 'Over 40% of Gen Z users now use TikTok as their primary search engine for product reviews, how-to guides, and local recommendations. Optimizing for TikTok search generates continuous, long-term views beyond the initial 24-hour FYP burst.',
      },
      {
        question: 'How do I optimize my video for TikTok search?',
        answer: 'Speak the target keyword in the first 3 seconds, display it on screen with native text overlay, include it in your caption, and add 3 to 5 relevant hashtags extracted with this tool.',
      },
      {
        question: 'Can I export the keywords and hashtags?',
        answer: 'Yes! You can copy all generated hashtags with one click or download the full keyword analysis as a CSV file.',
      },
    ],
    primaryCta: 'Explore TikTok Viral Keywords',
    schemaType: 'WebApplication',
  },

  etsy: {
    id: 'etsy',
    slug: '/tools/etsy-keyword-tool',
    alternateSlugs: ['/tools/etsy-keywords', '/etsy-keyword-tool'],
    name: 'Free Etsy Keyword & Tag Tool',
    badge: 'Etsy Rank & Tag Optimizer',
    h1: 'Free Etsy Keyword Tool & 13-Tag Generator (2026)',
    tagline: 'Discover high-intent Etsy buyer searches, gift idea queries, and 13-tag combinations to rank your handmade and digital listings.',
    metaTitle: 'Free Etsy Keyword Tool – Live Buyer Search & 13 Tags Generator (2026)',
    metaDescription: 'Extract real Etsy shopper keywords and generate high-traffic 13-tag combinations for your Etsy listings. 100% free with live buyer search volume signals.',
    heroPlaceholder: 'e.g. bridesmaid gift, digital planner, ceramic mug, leather wallet...',
    starterSeeds: [
      'bridesmaid gift personalized',
      'digital planner goodnotes',
      'linen dress summer',
      'crochet pattern beginner',
      'custom pet portrait',
      'wall art printable boho',
    ],
    keyBenefits: [
      'Live Etsy Buyer Search Autocomplete & Commercial queries',
      '13-Tag Validator ensuring tags meet Etsy character count limits (20 chars max)',
      'Shopper Intent Breakdown (Gift for her, Personalized, Printable, Vintage)',
      'Instant Copy 13 Tags formatted for Etsy Listing Manager',
    ],
    rankingFactors: [
      {
        title: 'Exact Title & Tag Match',
        desc: 'Etsy gives the highest search boost when a phrase in your title exactly matches one of your 13 listing tags.',
        icon: 'Award',
      },
      {
        title: 'All 13 Tags Utilized',
        desc: 'Every unused tag is a wasted opportunity. Using multi-word phrases (e.g. "boho wall decor") maximizes indexing coverage.',
        icon: 'CheckSquare',
      },
      {
        title: 'Listing Quality Score',
        desc: 'High click-through rates, favorites, and completed orders continuously elevate your shop in Etsy search results.',
        icon: 'Sparkles',
      },
    ],
    faqs: [
      {
        question: 'How many tags should I use on my Etsy listing?',
        answer: 'Always use all 13 tags available on Etsy. Never leave tags blank. Multi-word phrases (up to 20 characters) outperform single words.',
      },
      {
        question: 'Should I repeat words across my 13 Etsy tags?',
        answer: 'No. Etsy’s search algorithm automatically combines words across your tags and title. Focus each tag on a unique shopper descriptor or gift recipient.',
      },
      {
        question: 'Does this tool find low-competition Etsy keywords?',
        answer: 'Yes. Our tool flags long-tail buyer phrases with low seller competition, giving new shops the fastest route to first-page rankings.',
      },
    ],
    primaryCta: 'Generate Etsy Buyer Tags',
    schemaType: 'WebApplication',
  },

  local: {
    id: 'local',
    slug: '/tools/local-seo-keywords',
    alternateSlugs: ['/tools/local-keyword-generator', '/local-seo-keywords'],
    name: 'Free Local SEO Keyword Generator',
    badge: 'Google Map Pack & Geo Matrix',
    h1: 'Free Local SEO Keyword Generator & "Near Me" Matrix (2026)',
    tagline: 'Generate hyper-targeted local service keywords, "near me" search terms, and city landing page modifier matrices for local businesses.',
    metaTitle: 'Free Local SEO Keyword Generator – "Near Me" & Geo Modifiers (2026)',
    metaDescription: 'Generate hundreds of local SEO keywords, emergency queries, and Google Business Profile search terms across US, UK, CA, and AU cities. 100% free.',
    heroPlaceholder: 'e.g. plumber, roof repair, cosmetic dentist, criminal lawyer, hvac...',
    starterSeeds: [
      'emergency plumber',
      'roof repair contractor',
      'personal injury lawyer',
      'hvac installation',
      'cosmetic dentist',
      'tree removal service',
    ],
    keyBenefits: [
      'Multi-Geo Modifier Engine (Near Me, Emergency, 24/7, In [City], Cost/Quotes)',
      'Google Map Pack & Local Service Ads (LSA) Keyword Prioritization',
      'Localized Landing Page Architecture Outline & Schema.org LocalBusiness generator',
      '1-Click Export to CSV and Google Sheets',
    ],
    rankingFactors: [
      {
        title: 'Google Business Profile Relevance',
        desc: 'Matching primary service categories and review keywords directly influences Google 3-Pack rankings.',
        icon: 'MapPin',
      },
      {
        title: 'Localized City Landing Pages',
        desc: 'Building dedicated location pages targeting "[service] in [city/suburb]" drives high-converting organic calls.',
        icon: 'Globe',
      },
      {
        title: 'Local Schema & Citations',
        desc: 'Consistent NAP (Name, Address, Phone) citations and LocalBusiness JSON-LD schema reinforce geographical authority.',
        icon: 'ShieldCheck',
      },
    ],
    faqs: [
      {
        question: 'What is a "near me" keyword and how do I rank for it?',
        answer: 'Google determines "near me" results primarily through the searcher’s physical GPS/IP location, Google Business Profile prominence, and localized landing pages with address schema.',
      },
      {
        question: 'How do I use these local keywords for my service business?',
        answer: 'Use the primary service keyword in your Google Business Profile services list, and create dedicated landing pages for each surrounding city or neighborhood using the generated geo-matrix.',
      },
      {
        question: 'Does this generator support international cities?',
        answer: 'Yes! It generates localized modifier variations for major metropolitan regions across the United States, United Kingdom, Canada, and Australia.',
      },
    ],
    primaryCta: 'Generate Local Service Keywords',
    schemaType: 'WebApplication',
  },

  youtube: {
    id: 'youtube',
    slug: '/tools/youtube-keyword-tool',
    alternateSlugs: ['/youtube-keyword-tool', '/tools/youtube-keywords'],
    name: 'Free YouTube Keyword Tool',
    badge: 'YouTube SERP & Outlier Engine',
    h1: 'Free YouTube Keyword Tool & Video Outlier Finder (2026)',
    tagline: 'Scan live YouTube search suggestions, analyze competitor video tags, and spot small channels with viral view-to-subscriber ratios.',
    metaTitle: 'Free YouTube Keyword Tool – Video Outliers, Tags & RPM (2026)',
    metaDescription: 'Extract live YouTube autocomplete keywords, video tags, RPM estimates, and small-channel outlier videos. 100% free YouTube SEO tool with zero sign-up.',
    heroPlaceholder: 'e.g. gaming pc build, how to trade crypto, python tutorial...',
    starterSeeds: [
      'gaming pc build budget',
      'how to trade crypto beginner',
      'python tutorial for beginners',
      'side hustles that pay daily',
      'home gym workout routine',
      'ai tools to make money',
    ],
    keyBenefits: [
      'Live YouTube Autocomplete (ds=yt) Search Query Harvesting',
      'Outlier Multiplier metric (finds small channels getting 10x+ their subscriber count)',
      'Estimated Creator AdSense RPM ($) & YouTube Ads CPC ($)',
      '1-Click Copy all optimized video tags and chapter outline',
    ],
    rankingFactors: [
      {
        title: 'Click-Through Rate (CTR)',
        desc: 'High thumbnail and title click rates tell YouTube that viewers are eager to watch your video.',
        icon: 'Play',
      },
      {
        title: 'Average View Duration (AVD)',
        desc: 'Videos that retain viewers for a high percentage of their total runtime receive massive recommendation surges.',
        icon: 'Clock',
      },
      {
        title: 'Search Title & Chapter Tags',
        desc: 'Targeted keywords in titles, descriptions, and timestamp chapters rank videos in Google and YouTube Search.',
        icon: 'Tag',
      },
    ],
    faqs: [
      {
        question: 'How does the YouTube Outlier Multiplier work?',
        answer: 'The Outlier Multiplier measures how many views a video has earned relative to the channel’s subscriber count. A video with 50,000 views on a channel with 2,000 subscribers has a 25x outlier score, indicating high viewer interest in the topic.',
      },
      {
        question: 'Are YouTube video tags still important?',
        answer: 'While titles and thumbnails matter most for CTR, video tags help YouTube understand misspelled searches and semantic context, especially for new channels.',
      },
      {
        question: 'Is this YouTube Keyword Tool free?',
        answer: 'Yes! Completely free, unlimited queries, and no registration required.',
      },
    ],
    primaryCta: 'Find YouTube Video Keywords',
    schemaType: 'WebApplication',
  },

  google: {
    id: 'google',
    slug: '/free-keyword-search',
    alternateSlugs: ['/tools/google-keywords', '/'],
    name: 'Free Google Keyword Planner',
    badge: 'Google Search & Autocomplete',
    h1: 'Free Google Keyword Planner & Search Arbitrage Tool (2026)',
    tagline: 'Instant Google keyword discovery with monthly search volume, competition score, CPC bids, and SERP weak spot analysis.',
    metaTitle: 'Free Google Keyword Planner – Search Volume & Low Competition (2026)',
    metaDescription: 'Find high-volume, low-competition keywords from Google Ads and live search autocomplete. 100% free with no account or credit card required.',
    heroPlaceholder: 'e.g. ai resume builder, crm for small business, accounting software...',
    starterSeeds: [
      'ai resume builder free',
      'best crm for real estate',
      'email marketing software',
      'invoice generator free',
      'project management tools',
    ],
    keyBenefits: [
      'Live Google Search Autocomplete and Ads Keyword Planner estimates',
      'SERP Weak-Spot X-Ray (identifies forums, low-DA sites, thin pages in top 5)',
      'Arbitrage & Traffic Value scoring',
      '1-Click CSV and Excel export',
    ],
    rankingFactors: [
      {
        title: 'Topical Authority',
        desc: 'Comprehensive coverage of core themes and related subtopics establishes high domain trust with Google.',
        icon: 'Award',
      },
      {
        title: 'Information Gain',
        desc: 'Original research, data points, or unique tools provide value that AI search summaries cannot replicate.',
        icon: 'Sparkles',
      },
      {
        title: 'Helpful Content & E-E-A-T',
        desc: 'Fast page speed, clean layout, and direct answers satisfy user intent and prevent bounce back to Google.',
        icon: 'ShieldCheck',
      },
    ],
    faqs: [
      {
        question: 'How is this different from Google Keyword Planner in Google Ads?',
        answer: 'Unlike Google Ads, which hides search volumes behind active ad spend thresholds and requires a credit card, SERPgpt provides instant keyword data and competitor gaps completely free with no login.',
      },
      {
        question: 'Can I export the keyword data?',
        answer: 'Yes! You can export all keywords, volume, CPC, and competition scores to CSV with a single click.',
      },
    ],
    primaryCta: 'Search Google Keywords',
    schemaType: 'WebApplication',
  },
};

export function findPlatformToolByPath(rawPath: string): PlatformToolMeta | null {
  const clean = (rawPath || '/').split('?')[0].replace(/\/+$/, '').toLowerCase() || '/';
  for (const tool of Object.values(PLATFORM_TOOLS)) {
    if (tool.slug.toLowerCase() === clean) return tool;
    if (tool.alternateSlugs.some((s) => s.toLowerCase() === clean)) return tool;
  }
  return null;
}
