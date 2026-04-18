import { useState, useEffect, useRef, useCallback } from 'react'
import { readIntelligence, writeIntelligence } from '../data/sharedIntelligence'

// ═══════════════════════════════════════════════════════════════════════════════
// localStorage KEYS
// ═══════════════════════════════════════════════════════════════════════════════

const QUEUE_STATE_KEY     = 'parkview_seo_queue_state'
const SELECTED_TASK_KEY   = 'parkview_seo_selected_task'
const CHECKLIST_STATE_KEY = 'parkview_seo_checklist_state'

// ═══════════════════════════════════════════════════════════════════════════════
// ═══ MOCK DATA ═══
// TODO: Replace each data source with its live API (keys noted per section)
// ═══════════════════════════════════════════════════════════════════════════════

// --- SEO Health Score ---
const MOCK_HEALTH_SCORE = 61

// --- Target Keywords ---
// TODO: Replace with Google Search Console API — VITE_GOOGLE_SEARCH_CONSOLE_KEY
const MOCK_KEYWORDS = [
  { id: 'k1',  kw: 'meat subscription NZ',          pos: 14, delta: +2,  vol: 880  },
  { id: 'k2',  kw: 'grass-fed beef Canterbury',     pos: 8,  delta: +5,  vol: 480  },
  { id: 'k3',  kw: 'premium meat box New Zealand',  pos: 22, delta: -1,  vol: 320  },
  { id: 'k4',  kw: 'paddock to plate NZ',           pos: 6,  delta: +8,  vol: 260  },
  { id: 'k5',  kw: 'Canterbury beef delivery',      pos: 11, delta: +3,  vol: 210  },
  { id: 'k6',  kw: 'grass-fed beef delivery NZ',    pos: 18, delta: 0,   vol: 390  },
  { id: 'k7',  kw: 'meat box subscription NZ',      pos: 31, delta: -4,  vol: 590  },
  { id: 'k8',  kw: 'Canterbury lamb delivery',      pos: 9,  delta: +2,  vol: 170  },
  { id: 'k9',  kw: 'premium beef subscription',     pos: 27, delta: +6,  vol: 720  },
  { id: 'k10', kw: 'farm direct meat NZ',           pos: 4,  delta: +1,  vol: 140  },
]

// Which keywords currently generate AI citations (mock)
const AI_CITED_KEYWORD_IDS = ['k4', 'k2', 'k10']

// --- Optimisation Queue ---
// TODO: Replace with Claude API call — model: claude-sonnet-4-20250514
// Inputs: Shopify pages via VITE_SHOPIFY_STORE_URL + VITE_SHOPIFY_API_KEY
// PageSpeed data via VITE_PAGESPEED_API_KEY
const MOCK_QUEUE_TASKS = [
  {
    id: 'q1',
    priority: 'Critical',
    type: 'Schema',
    page: 'parkviewmeats.co.nz/products/classic-box',
    title: 'Missing Product schema on Classic Box page',
    description: 'No structured data — Google cannot generate rich results for this product.',
    impact: 'High',
    currentState: {
      label: 'Classic Box page — Schema markup',
      content: `<!-- Classic Box product page head section -->
<!-- ❌ No JSON-LD structured data present -->
<!-- ❌ No Product schema -->
<!-- ❌ No Review aggregate markup -->
<!-- ❌ No Offer markup -->

<title>Classic Box | Parkview Meats Co.</title>
<meta name="description" content="Our Classic Box contains
premium Canterbury grass-fed beef and lamb. Fortnightly
or monthly subscription. Free delivery NZ-wide.">`,
    },
    proposal: {
      title: 'Add Product + Offer JSON-LD to Classic Box page',
      currentState: 'No structured data on Classic Box product page. Google is rendering a plain blue link with no rich results — no price, no rating, no availability.',
      proposedOptimisation: 'Add complete Product schema with Offer and AggregateRating. This enables rich results in SERPs showing price, rating stars, and availability directly under the listing.',
      seoRationale: 'Product schema with pricing and ratings consistently increases CTR by 20–35% in SERPs — the same result is clicked more often when it shows stars and price. This is the highest ROI technical fix available.',
      geoRationale: 'AI systems (Google SGE, ChatGPT) prioritise structured data when constructing answers about products. Without schema, Parkview is invisible to AI-generated product recommendations.',
      riskLevel: 'Low',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Parkview Classic Box",
  "description": "Canterbury grass-fed beef and lamb,
curated by our third-generation Hawarden farm.
Fortnightly or monthly subscription.",
  "brand": {
    "@type": "Brand",
    "name": "Parkview Meats Co."
  },
  "image": "https://parkviewmeats.co.nz/classic-box.jpg",
  "offers": {
    "@type": "Offer",
    "url": "https://parkviewmeats.co.nz/products/classic-box",
    "priceCurrency": "NZD",
    "price": "109.00",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Parkview Meats Co."
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "94"
  }
}
</script>`,
    },
  },
  {
    id: 'q2',
    priority: 'Critical',
    type: 'Technical',
    page: 'parkviewmeats.co.nz',
    title: 'Homepage meta title is 84 characters — truncated in SERPs',
    description: 'Current title exceeds 60-char limit. Google is truncating mid-word.',
    impact: 'High',
    currentState: {
      label: 'Homepage — <title> tag',
      content: `<!-- ❌ Current: 84 characters (Google truncates at ~60) -->
<title>Parkview Meats Co. | Premium Grass-Fed Beef, Lamb &
Pork Subscription Box New Zealand</title>

<!-- Google SERP preview: -->
"Parkview Meats Co. | Premium Grass-Fed Beef, Lamb & Pork S..."

<!-- Primary keyword "meat subscription NZ" not present -->
<!-- Brand name uses 20 chars before any keyword value -->`,
    },
    proposal: {
      title: 'Rewrite homepage meta title — keyword-first, under 60 characters',
      currentState: 'Current title "Parkview Meats Co. | Premium Grass-Fed Beef, Lamb & Pork Subscription Box New Zealand" is 84 characters. Google truncates at approximately 600px (~60 chars). The primary keyword "meat subscription NZ" is absent entirely.',
      proposedOptimisation: 'Rewrite to: "Grass-Fed Meat Subscription NZ | Parkview Meats Co." — 53 characters, primary keyword first, brand name retained, no truncation.',
      seoRationale: 'Keyword-first title tags signal direct relevance to Google\'s ranking algorithm. A non-truncated title also improves click-through rate — users see the complete value proposition. Moving "meat subscription NZ" to the front directly improves ranking potential for Parkview\'s highest-volume target keyword.',
      geoRationale: 'AI systems use page titles as the primary signal for what a page is about. A title containing "meat subscription NZ" makes the page eligible for inclusion in AI answers about meat subscriptions in New Zealand.',
      riskLevel: 'Low',
      code: `<!-- ✅ Proposed: 53 characters, keyword-first -->
<title>Grass-Fed Meat Subscription NZ | Parkview Meats Co.</title>

<!-- Secondary option if A/B testing: -->
<!-- <title>Canterbury Meat Subscription | Parkview Meats Co.</title> -->
<!-- 51 characters — geographic variant for local search strength -->

<!-- Also update: -->
<meta property="og:title"
  content="Grass-Fed Meat Subscription NZ | Parkview Meats Co." />`,
    },
  },
  {
    id: 'q3',
    priority: 'High',
    type: 'Content',
    page: 'parkviewmeats.co.nz',
    title: 'Homepage H1 does not contain primary keyword',
    description: 'Current H1: "Welcome to Parkview." Zero keyword value. High impact on ranking signal.',
    impact: 'High',
    currentState: {
      label: 'Homepage — H1 tag',
      content: `<!-- ❌ Current H1 — zero keyword value -->
<h1>Welcome to Parkview.</h1>

<!-- This wastes the strongest on-page ranking signal. -->
<!-- H1 should contain the primary keyword for the page. -->
<!-- Current H1 tells Google nothing about what the page is. -->

<!-- Context: Homepage targets "meat subscription NZ" -->
<!-- and "grass-fed beef Canterbury" as primary keywords -->`,
    },
    proposal: {
      title: 'Rewrite homepage H1 — include primary keyword and Canterbury provenance',
      currentState: 'H1 is "Welcome to Parkview." — a brand greeting with no keyword signal. The H1 is the single strongest on-page SEO element and it currently contributes nothing to ranking.',
      proposedOptimisation: 'Replace with: "Canterbury Grass-Fed Meat Subscription, Delivered NZ-Wide" — includes primary keyword cluster, geographic differentiator, and the subscription model in a single clean heading.',
      seoRationale: 'The H1 is Google\'s primary indicator of page topic. Including "grass-fed", "meat subscription", "Canterbury", and "NZ" in the H1 signals relevance for all four keyword clusters Parkview is targeting without keyword stuffing.',
      geoRationale: 'AI systems weight H1 tags heavily when determining what a page covers and whether to cite it in answers. An H1 containing the target topic verbatim significantly increases citation probability.',
      riskLevel: 'Low',
      code: `<!-- ✅ Proposed H1 -->
<h1>Canterbury Grass-Fed Meat Subscription, Delivered NZ-Wide</h1>

<!-- Subheading to follow (H2 or paragraph) -->
<p>Third-generation Hawarden farm. Grass-fed beef, lamb and pork
in curated fortnightly boxes — no supermarket, no compromise.</p>

<!-- Alternative H1 variants for A/B testing: -->
<!-- "Grass-Fed Meat Boxes from Canterbury, Delivered Fortnightly" -->
<!-- "Premium NZ Meat Subscription — Direct from Hawarden Farm" -->`,
    },
  },
  {
    id: 'q4',
    priority: 'High',
    type: 'Speed',
    page: 'parkviewmeats.co.nz',
    title: 'INP score 340ms on mobile — Core Web Vitals failing',
    description: 'Interaction to Next Paint above 200ms threshold. Affects ranking in mobile search.',
    impact: 'Medium',
    currentState: {
      label: 'Homepage — Core Web Vitals (mobile)',
      content: `Core Web Vitals — Homepage Mobile
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LCP  2.1s   ✅ Good (threshold: <2.5s)
INP  340ms  ❌ Needs Improvement (threshold: <200ms)
CLS  0.02   ✅ Good (threshold: <0.1)

INP breakdown (Chrome UX Report):
• Largest contributor: Mega-nav dropdown interaction
  Response time: 180ms JS execution
• Secondary: Add-to-cart button tap response
  Response time: 94ms
• Shopify theme app extension conflicts detected
  Estimated overhead: ~60ms

TODO: Fetch live via VITE_PAGESPEED_API_KEY
(PageSpeed Insights API — free, no billing required)`,
    },
    proposal: {
      title: 'Reduce homepage INP from 340ms to under 200ms on mobile',
      currentState: 'INP (Interaction to Next Paint) is 340ms on mobile — above Google\'s "needs improvement" threshold of 200ms. This is a confirmed ranking factor in mobile search. Root cause: heavy JavaScript execution on nav interactions and Shopify app extension conflicts.',
      proposedOptimisation: 'Three targeted fixes in order of impact: (1) Defer non-critical app extension scripts, (2) Optimise mega-nav dropdown with CSS transitions instead of JS, (3) Preload the add-to-cart mutation handler.',
      seoRationale: 'INP has been a Core Web Vitals ranking factor since March 2024, replacing FID. Google\'s data shows pages in the "good" INP range (<200ms) rank measurably higher in mobile search, particularly for commerce queries where users interact with product pages.',
      geoRationale: 'Core Web Vitals scores are a quality signal AI systems use to prioritise sources for answers. A slow, poorly-performing site is less likely to be cited in AI-generated responses.',
      riskLevel: 'Medium',
      code: `<!-- Fix 1: Defer non-critical Shopify app scripts -->
<!-- In theme.liquid, change app extension script loading: -->

<!-- ❌ Current (blocking) -->
<script src="{{ 'app-extension.js' | asset_url }}"></script>

<!-- ✅ Proposed (deferred) -->
<script defer src="{{ 'app-extension.js' | asset_url }}"></script>

<!-- Fix 2: Replace JS mega-nav with CSS transitions -->
/* In base.css — replace JS-driven nav with CSS */
.mega-nav-dropdown {
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 150ms ease, transform 150ms ease;
  pointer-events: none;
}
.mega-nav:hover .mega-nav-dropdown,
.mega-nav:focus-within .mega-nav-dropdown {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

<!-- Fix 3: In Shopify theme — preload critical interaction -->
document.addEventListener('DOMContentLoaded', () => {
  // Preload ATC handler during idle time
  requestIdleCallback(() => {
    import('./cart-handler.js').then(m => m.init())
  })
})`,
    },
  },
  {
    id: 'q5',
    priority: 'High',
    type: 'Content',
    page: 'parkviewmeats.co.nz/pages/faq',
    title: 'FAQ page has no Answer Blocks for featured snippet capture',
    description: '0 of 8 questions formatted for featured snippet. Competitor holds snippet for primary keyword.',
    impact: 'High',
    currentState: {
      label: 'FAQ page — current question format',
      content: `<!-- ❌ Current FAQ structure — not optimised for snippets -->

<div class="faq-item">
  <h3>Do you deliver to Wellington?</h3>
  <div class="faq-answer">
    <p>Yes, we deliver to Wellington and most of
    New Zealand. Delivery is free on all orders
    over $100. We use chilled overnight courier
    to ensure freshness.</p>
  </div>
</div>

<div class="faq-item">
  <h3>What is in the Classic Box?</h3>
  <div class="faq-answer">
    <p>The Classic Box contains a selection of
    our finest Canterbury grass-fed beef and
    lamb cuts, curated by our butcher team.</p>
  </div>
</div>

<!-- No Answer schema markup -->
<!-- No Question schema markup -->
<!-- Answer text does not begin with direct answer -->
<!-- Questions not using target keyword phrasing -->`,
    },
    proposal: {
      title: 'Restructure FAQ page for featured snippet capture and AI citation',
      currentState: 'FAQ page has 8 questions but none are formatted for snippet capture. Answers don\'t start with direct responses, questions don\'t use target keyword phrasing, and there is no FAQ schema markup. The Meat Box NZ currently holds the Featured Snippet for "meat subscription NZ" with their FAQ page.',
      proposedOptimisation: 'Restructure top 3 questions with Answer Block format (direct answer in first sentence, keyword in question, 40–60 words), add FAQ JSON-LD schema markup across all questions.',
      seoRationale: 'FAQ schema markup and Answer Block formatting are the two primary mechanisms for capturing featured snippets. The winning format for snippets is: question matches search query verbatim, answer opens with a direct 1-sentence response, total answer is 40–60 words. This exactly mirrors what The Meat Box NZ is doing to hold the current snippet.',
      geoRationale: 'AI systems directly harvest FAQ schema markup to answer conversational questions. Structured FAQ markup is one of the most reliable paths to AI citation — Google\'s SGE and ChatGPT both prioritise schema-marked-up FAQ content over unstructured prose.',
      riskLevel: 'Low',
      code: `<!-- ✅ Restructured FAQ with Answer Block format + Schema -->

<!-- Add to <head> of FAQ page: -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is included in a Parkview meat
subscription NZ box?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Parkview meat subscription NZ box
includes Canterbury grass-fed beef and lamb cuts
selected by our third-generation Hawarden butcher
team. The Classic Box ($109/fortnight) includes
4–6 cuts including mince, steak, and a roast,
delivered chilled to your door NZ-wide."
      }
    },
    {
      "@type": "Question",
      "name": "Is Parkview grass-fed beef Canterbury raised?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — Parkview's grass-fed beef is raised
on our Hawarden, Canterbury farm. Our cattle are
pasture-raised year-round on Canterbury's natural
grasslands with no grain finishing, producing beef
with higher omega-3 content and a distinctly clean
Canterbury flavour."
      }
    }
  ]
}
</script>

<!-- Updated question HTML: -->
<div itemscope itemprop="mainEntity"
  itemtype="https://schema.org/Question">
  <h3 itemprop="name">
    What is included in a Parkview meat
    subscription NZ box?
  </h3>
  <div itemscope itemprop="acceptedAnswer"
    itemtype="https://schema.org/Answer">
    <p itemprop="text">
      A Parkview meat subscription NZ box includes
      Canterbury grass-fed beef and lamb cuts selected
      by our third-generation Hawarden butcher team.
      The Classic Box ($109/fortnight) includes 4–6
      cuts including mince, steak, and a roast,
      delivered chilled to your door NZ-wide.
    </p>
  </div>
</div>`,
    },
  },
  {
    id: 'q6',
    priority: 'Medium',
    type: 'Schema',
    page: 'parkviewmeats.co.nz',
    title: 'Missing LocalBusiness schema — no Canterbury geographic signals',
    description: 'No LocalBusiness JSON-LD. Missing NZ/Canterbury geo signals for local search.',
    impact: 'Medium',
    currentState: {
      label: 'Homepage — LocalBusiness schema',
      content: `<!-- ❌ No LocalBusiness structured data present -->
<!-- Google has no structured signal that Parkview is: -->
<!--   • A New Zealand business -->
<!--   • Based in Canterbury/Hawarden -->
<!--   • A food producer / butcher / farm -->
<!--   • Operating in the NZ delivery market -->

<!-- Ourcow added LocalBusiness schema this week -->
<!-- They now appear with star ratings + address in SERPs -->
<!-- for Canterbury-specific queries -->`,
    },
    proposal: {
      title: 'Add LocalBusiness + FoodEstablishment JSON-LD to homepage',
      currentState: 'No LocalBusiness schema. Ourcow added LocalBusiness schema this week and is now appearing with geographic signals (star ratings, Canterbury address) in SERPs for Canterbury-specific queries. Parkview is invisible for geo-modified searches.',
      proposedOptimisation: 'Add LocalBusiness + FoodEstablishment JSON-LD to homepage with Hawarden address, Canterbury geographic area served, and NZ-wide delivery area.',
      seoRationale: 'LocalBusiness schema enables Google Knowledge Panel entries and triggers star ratings in SERPs for brand name searches. Geographic markup (areaServed, address) directly signals relevance for Canterbury-specific and NZ-wide searches — exactly the queries Parkview targets.',
      geoRationale: 'AI systems use LocalBusiness schema to determine geographic relevance. When someone asks an AI "where can I get grass-fed beef in Canterbury", a business with LocalBusiness schema marking Canterbury as its base will be prioritised over unstructured competitors.',
      riskLevel: 'Low',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "FoodEstablishment"],
  "name": "Parkview Meats Co.",
  "description": "Third-generation Canterbury grass-fed
beef, lamb and pork subscription boxes. Farm-direct
from Hawarden, delivered NZ-wide.",
  "url": "https://parkviewmeats.co.nz",
  "telephone": "+64-3-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Hawarden",
    "addressLocality": "Hawarden",
    "addressRegion": "Canterbury",
    "addressCountry": "NZ"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -42.9,
    "longitude": 172.5
  },
  "areaServed": {
    "@type": "Country",
    "name": "New Zealand"
  },
  "servesCuisine": ["Beef", "Lamb", "Pork"],
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "94"
  },
  "foundingDate": "1961",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 12
  }
}
</script>`,
    },
  },
  {
    id: 'q7',
    priority: 'Medium',
    type: 'Content',
    page: 'parkviewmeats.co.nz/blogs/farm-stories/hawarden-farm',
    title: '"Hawarden Farm" blog post is 340 words — below topical authority threshold',
    description: 'Below 800 word minimum. Thin content does not rank. Needs expansion.',
    impact: 'Medium',
    currentState: {
      label: 'Hawarden Farm blog post — current content',
      content: `Title: "Our Hawarden Farm Story"
Word count: 340 words (target: 800+)
Last updated: 4 months ago
Current impressions: down 23% over 90 days

Current content outline:
• Para 1: Brief intro to the farm (60 words)
• Para 2: Description of Canterbury landscape (80 words)
• Para 3: The boxes we offer (90 words)
• Para 4: Delivery information (50 words)
• Para 5: CTA to subscribe (60 words)

Missing topical signals:
❌ No mention of "Canterbury Home Kill"
❌ No farm history dates (founded 1961)
❌ No third-generation story (named farmer)
❌ No grass-fed methodology explanation
❌ No E-E-A-T signals (credentials, expertise)
❌ No internal links to product pages
❌ No FAQ schema on common questions`,
    },
    proposal: {
      title: 'Expand "Hawarden Farm" post to 1,000+ words with topical authority signals',
      currentState: '"Our Hawarden Farm Story" blog post is 340 words. Google\'s quality guidelines flag thin content as a negative ranking signal. The post is also 4 months old with no updates — impressions down 23%. It currently lacks the E-E-A-T signals, geographic specificity, and keyword depth needed to rank.',
      proposedOptimisation: 'Expand to 1,000+ words with five new sections covering: farm founding history (1961, three generations named), Canterbury Home Kill process and why it matters, grass-fed methodology vs. grain-finished explained, animal welfare standards, and a closing FAQ section with Answer Blocks for featured snippet capture.',
      seoRationale: 'This post targets "grass-fed beef Canterbury" and "paddock to plate NZ" — both keywords where Parkview is already ranking (positions 8 and 6). Expanding content depth with specific E-E-A-T signals will push these into the top 5. Google rewards content that demonstrates real expertise, not just mentions of keywords.',
      geoRationale: 'AI systems cite long-form content from established sources when answering questions about provenance and farming methods. A 1,000+ word piece with specific dates, named individuals, and verifiable claims (Canterbury Home Kill, Hawarden location) is far more likely to be cited than the current 340-word overview.',
      riskLevel: 'Low',
      code: `Proposed expanded content outline:

H1: The Hawarden Farm Story — Three Generations of
Canterbury Grass-Fed Beef

SECTION 1 — THE BEGINNING (target: 150 words)
H2: A Canterbury Farm Since 1961
[Establish founding year, original owner name,
land in Hawarden. Third-generation narrative.
Canterbury context — why this location matters
for grass-fed beef.]

SECTION 2 — CANTERBURY HOME KILL (target: 200 words)
H2: What Is Canterbury Home Kill — and Why It Matters
[Explain the Canterbury Home Kill process.
Distance from farm to kill (specific km).
How this differs from industrial processing.
What it means for flavour and welfare.
Direct provenance claim: "We know every animal."]

SECTION 3 — GRASS-FED METHODOLOGY (target: 200 words)
H2: Grass-Fed Year-Round — What That Actually Means
[Hawarden's natural pasture. No grain finish.
No feedlot periods. Omega-3 comparison data.
Seasonal variation in the grass and how it
affects flavour. Not just marketing language —
specific farming practice.]

SECTION 4 — ANIMAL WELFARE (target: 150 words)
H2: Standards We Hold Ourselves To
[Specific welfare standards followed.
Low-stress handling. Our relationship with the
Canterbury Home Kill facility. Named vet or
welfare advisor if available.]

SECTION 5 — ANSWER BLOCKS / FAQ (target: 200 words)
H2: Common Questions About Our Farm
Q: Is Parkview beef 100% grass-fed?
A: [40-60 word answer block, schema-marked]
Q: Where is Hawarden, Canterbury?
A: [40-60 word answer block, schema-marked]
Q: What does "paddock to plate" mean at Parkview?
A: [40-60 word answer block, schema-marked]

Internal links to add:
→ /products/classic-box (anchor: "Classic Box")
→ /products/premium-box (anchor: "Premium Box")
→ /pages/about (anchor: "about our farm")`,
    },
  },
  {
    id: 'q8',
    priority: 'Medium',
    type: 'Competitive',
    page: 'parkviewmeats.co.nz/pages/faq',
    title: 'The Meat Box NZ gained Featured Snippet for "meat subscription NZ"',
    description: 'Competitor holds snippet with FAQ structure Parkview does not have. New this week.',
    impact: 'High',
    currentState: {
      label: 'Competitor — Featured Snippet analysis',
      content: `SERP: "meat subscription NZ"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Featured Snippet (new this week):
Source: The Meat Box NZ — /pages/faq
Format: Definition box (~55 words)
Content: "A meat subscription NZ delivers curated
boxes of quality beef, lamb, and pork to your
door on a fortnightly or monthly cycle..."

Position 1 (after snippet):
• The Meat Box NZ — organic ranking

Parkview position: 14 (no snippet)

Snippet analysis:
✅ Question phrasing matches search query exactly
✅ Answer opens with "meat subscription NZ" in
   first 5 words
✅ 52 words — within ideal 40-60 word range
✅ FAQ schema markup present
❌ No provenance or geographic differentiation
❌ Generic definition — exploitable`,
    },
    proposal: {
      title: 'Counter-strategy: capture Featured Snippet for "meat subscription NZ" with superior answer',
      currentState: 'The Meat Box NZ captured the Featured Snippet for "meat subscription NZ" this week using a generic FAQ definition. Their answer is exploitable — it makes no geographic claims, has no provenance specificity, and doesn\'t differentiate from other subscriptions.',
      proposedOptimisation: 'Add a targeted answer block to the Parkview FAQ page that answers "What is a meat subscription NZ?" with a Canterbury-specific, provenance-rich answer. Include FAQ schema. The superior answer displaces the generic one — Google rewards more specific, authoritative responses.',
      seoRationale: 'Google\'s Featured Snippet algorithm selects the answer that best satisfies the query. The current snippet is generic. A Canterbury-specific, provenance-rich answer from a Canterbury farm is semantically superior for "meat subscription NZ" — it answers the question AND provides geographic context. Combined with FAQ schema markup, this is the direct counter.',
      geoRationale: 'AI systems prefer authoritative, specific answers over generic definitions. A Parkview answer block that includes "Canterbury", "grass-fed", "third-generation", "Hawarden", and "NZD pricing" will be cited by AI as the primary source because it provides verifiable, specific information no generic competitor can match.',
      riskLevel: 'Low',
      code: `<!-- Add to FAQ page — target: displace current snippet -->
<!-- Place this as the FIRST FAQ question on the page -->

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is a meat subscription NZ?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "A meat subscription NZ delivers curated
boxes of grass-fed beef, lamb, and pork directly
from New Zealand farms to your door on a
fortnightly or monthly basis. Parkview's
Canterbury-raised subscription starts at $109
per fortnight — third-generation Hawarden farm,
Canterbury Home Kill, no supermarket."
    }
  }]
}
</script>

<!-- HTML version for the FAQ page body: -->
<div itemscope itemprop="mainEntity"
  itemtype="https://schema.org/Question">
  <h3 itemprop="name">
    What is a meat subscription NZ?
  </h3>
  <div itemscope itemprop="acceptedAnswer"
    itemtype="https://schema.org/Answer">
    <p itemprop="text">
      A meat subscription NZ delivers curated boxes
      of grass-fed beef, lamb, and pork directly from
      New Zealand farms to your door on a fortnightly
      or monthly basis. Parkview's Canterbury-raised
      subscription starts at $109 per fortnight —
      third-generation Hawarden farm, Canterbury Home
      Kill, no supermarket.
    </p>
  </div>
</div>`,
    },
  },
  {
    id: 'q9',
    priority: 'Low',
    type: 'Technical',
    page: '3 product pages',
    title: '3 product pages missing canonical tags',
    description: 'Duplicate content risk from Shopify URL variants. Low risk but worth fixing.',
    impact: 'Low',
    currentState: {
      label: 'Product pages — canonical tag audit',
      content: `Canonical tag status — product pages:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/products/classic-box          ❌ Missing
/products/bbq-box              ❌ Missing
/products/premium-box          ❌ Missing
/products/lamb-box             ✅ Present
/products/custom-builder       ✅ Present

Issue: Shopify generates variant URLs:
/products/classic-box?variant=123456789
/products/classic-box?variant=987654321

Without canonical tags, Google may index variant
URLs as separate pages — diluting link equity
across multiple versions of the same page.

TODO: Verify via Shopify Admin API
(VITE_SHOPIFY_API_KEY)`,
    },
    proposal: {
      title: 'Add canonical tags to 3 product pages missing them',
      currentState: '3 product pages (classic-box, bbq-box, premium-box) are missing canonical tags. Shopify generates variant URLs (?variant=XXXXXX) that can be indexed as separate pages, diluting link equity. Low risk currently but grows as backlinks accumulate.',
      proposedOptimisation: 'Add rel="canonical" tags pointing to the clean product URL on all three pages. In Shopify, this is done in the product template liquid file.',
      seoRationale: 'Canonical tags consolidate link equity to the preferred URL, preventing dilution across variant URLs. For Shopify stores this is a standard fix — Shopify\'s default theme should handle this but custom themes sometimes lose it.',
      geoRationale: 'Minor direct impact on AI citations, but canonical consistency helps AI systems identify the definitive version of a page to reference.',
      riskLevel: 'Low',
      code: `<!-- In Shopify theme — product.liquid (or product.json) -->
<!-- Add to <head> section: -->

{% if canonical_url %}
  <link rel="canonical" href="{{ canonical_url }}" />
{% else %}
  <link rel="canonical"
    href="{{ shop.url }}{{ page.url }}" />
{% endif %}

<!-- This handles both:
     1. Clean product URLs → self-referencing canonical
     2. Variant URLs → canonical points to base URL

Verify after implementation:
1. Visit: parkviewmeats.co.nz/products/classic-box
2. View source → search for "canonical"
3. Should show:
   <link rel="canonical"
     href="https://parkviewmeats.co.nz/products/classic-box" />
4. Also test: /products/classic-box?variant=XXXXXX
   Should show same canonical URL (not variant URL) -->`,
    },
  },
  {
    id: 'q10',
    priority: 'Low',
    type: 'Content',
    page: 'parkviewmeats.co.nz/pages/about',
    title: 'About page has no E-E-A-T signals',
    description: 'No author credentials, farm history dates, or certifications. E-E-A-T score: 1.8/5.',
    impact: 'Low',
    currentState: {
      label: 'About page — current content',
      content: `Current About page content (excerpt):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Parkview Meats Co. is a family farm in Canterbury,
New Zealand. We believe in raising animals with
care and delivering quality meat directly to your
door. Our team is passionate about what we do."

E-E-A-T gaps identified:
❌ "Family farm" — no generation count or dates
❌ "Canterbury" — no specific location (Hawarden)
❌ "We believe" — opinion, no verifiable claims
❌ No farm establishment date
❌ No named founder or current owner
❌ No certifications or accreditations listed
❌ No animal welfare standards referenced
❌ No farmer photos or video
❌ No press mentions or awards
❌ Word count: 280 words (too thin)`,
    },
    proposal: {
      title: 'Rewrite About page with full E-E-A-T signals — from 1.8/5 to 4.0/5',
      currentState: 'About page E-E-A-T score: 1.8/5 — lowest on the site. Generic "family farm" language with no verifiable claims. No dates, no named individuals, no credentials. This page directly affects Google\'s assessment of Parkview\'s expertise and authority.',
      proposedOptimisation: 'Full rewrite with: founding year (1961), three generations named, Hawarden address, Canterbury Home Kill affiliation, specific welfare standards, grass-fed methodology, and a farmer bio section with name and photo placeholder.',
      seoRationale: 'Google\'s Helpful Content and E-E-A-T guidelines explicitly reward about pages that demonstrate real-world expertise with verifiable specifics. A generic about page is a trust negative — it signals that the business may not have genuine expertise. Specific dates, names, and credentials are the direct solution.',
      geoRationale: 'When AI systems evaluate whether to cite a source, they check for markers of real expertise. "Family farm in Canterbury" scores low. "Third-generation Hawarden farm, established 1961, Canterbury Home Kill-processed, [named farmer], [welfare standards]" scores high. AI systems reward the same specifics Google does.',
      riskLevel: 'Low',
      code: `Proposed About page content structure:

H1: Three Generations of Canterbury Grass-Fed Beef

Opening paragraph (E-E-A-T signals):
"Parkview Meats Co. has farmed in Hawarden,
Canterbury since 1961. [Founder name] bought the
original block in the Hurunui district — [current
owner] is the third generation to raise grass-fed
beef, lamb, and pork on the same Canterbury
pasture. We've never used a feedlot. We've never
grain-finished an animal."

Section: Our Farm
[Specific: Hawarden location, hectares if shareable,
pasture type, seasonal grazing rotation, water source]

Section: Canterbury Home Kill
[Specific: facility name, distance from farm in km,
why this matters for animal welfare and product
quality, processing standards]

Section: The Team
[Named individuals with titles and role descriptions.
Photo placeholders. Years of experience.]

Section: Certifications & Standards
[List actual certifications. If none formal, list
the specific welfare practices Parkview follows
and their basis — e.g., Five Freedoms framework]

Trust signals to add:
• NZ Business Number (NZBN)
• Farm address (full)
• Founding year as a badge/callout
• "As seen in" section if press mentions exist
• Verified review count with star rating`,
    },
  },
]

// --- Mock page content for Core Web Vitals ---
// TODO: Replace with PageSpeed Insights API — VITE_PAGESPEED_API_KEY
const MOCK_CWV = [
  { page: 'Homepage',    url: 'parkviewmeats.co.nz',                     lcp: { val: 2.1, status: 'good' },  inp: { val: 340, status: 'poor' },  cls: { val: 0.02, status: 'good' }, taskId: 'q4' },
  { page: 'Classic Box', url: 'parkviewmeats.co.nz/products/classic-box', lcp: { val: 3.4, status: 'poor' },  inp: { val: 180, status: 'good' },  cls: { val: 0.08, status: 'good' }, taskId: 'q4' },
  { page: 'BBQ Box',     url: 'parkviewmeats.co.nz/products/bbq-box',     lcp: { val: 2.8, status: 'good' },  inp: { val: 210, status: 'warn' },  cls: { val: 0.01, status: 'good' }, taskId: 'q4' },
]

// --- Competitor movements ---
// TODO: Replace with SEMrush/Ahrefs API or Claude API with web search tool
const MOCK_COMPETITOR_MOVES = [
  {
    id: 'cm1',
    competitor: 'The Meat Box NZ',
    observation: 'Gained Featured Snippet for "meat subscription NZ" — review their FAQ structure',
    severity: 'high',
    taskId: 'q8',
  },
  {
    id: 'cm2',
    competitor: 'Silver Fern Farms Direct',
    observation: 'Published a new 1,200-word guide on "grass-fed beef health benefits" — directly targeting Parkview\'s keyword cluster',
    severity: 'medium',
    taskId: 'q7',
  },
  {
    id: 'cm3',
    competitor: 'Ourcow',
    observation: 'Added LocalBusiness schema this week — now appearing with star ratings in SERPs for Canterbury searches',
    severity: 'medium',
    taskId: 'q6',
  },
]

// --- Content Decay Monitor ---
const MOCK_DECAY = [
  {
    id: 'd1',
    page: 'Hawarden Farm blog post',
    url: 'parkviewmeats.co.nz/blogs/farm-stories/hawarden-farm',
    lastUpdated: '4 months ago',
    impressionChange: '-23%',
    issue: 'Impressions down 23% over 90 days. Refresh recommended.',
    taskId: 'q7',
  },
  {
    id: 'd2',
    page: 'FAQ page',
    url: 'parkviewmeats.co.nz/pages/faq',
    lastUpdated: '6 months ago',
    impressionChange: '-11%',
    issue: '3 questions now have inaccurate shipping information.',
    taskId: 'q5',
  },
]

// --- E-E-A-T Scorecard ---
// TODO: Replace with Claude API call for automated E-E-A-T assessment
const MOCK_EEAT_PAGES = [
  {
    page: 'Homepage',
    url: 'parkviewmeats.co.nz',
    experience: 3,
    expertise: 3,
    authoritativeness: 3,
    trustworthiness: 2,
    overall: 2.8,
    action: 'Add farm founding date and third-generation story to hero section. Add review count and star rating.',
  },
  {
    page: 'Classic Box',
    url: '/products/classic-box',
    experience: 2,
    expertise: 3,
    authoritativeness: 3,
    trustworthiness: 2,
    overall: 2.5,
    action: 'Add butcher bio or "crafted by" attribution. Add specific grass-fed certification or standard used.',
  },
  {
    page: 'About',
    url: '/pages/about',
    experience: 1,
    expertise: 2,
    authoritativeness: 2,
    trustworthiness: 2,
    overall: 1.8,
    action: '⚠ Priority fix: Add founding year, named owner, Hawarden address, Canterbury Home Kill affiliation, and welfare certifications. Current page fails E-E-A-T on all four pillars.',
    flagged: true,
  },
  {
    page: 'FAQ',
    url: '/pages/faq',
    experience: 3,
    expertise: 3,
    authoritativeness: 3,
    trustworthiness: 3,
    overall: 3.0,
    action: 'Good foundation. Add author attribution ("Answered by [name], Parkview head butcher") to boost expertise signal.',
  },
  {
    page: 'Hawarden Farm Blog',
    url: '/blogs/farm-stories/hawarden-farm',
    experience: 4,
    expertise: 4,
    authoritativeness: 3,
    trustworthiness: 2,
    overall: 3.25,
    action: 'Add publication date, author bio with credentials, and last-updated date. Add external references to Canterbury farming standards.',
  },
]

const EEAT_QUICK_WINS = [
  'Add "Founded 1961" and "[Owner name], third-generation farmer" to the About page hero — this single change addresses the most critical E-E-A-T gap and takes 15 minutes.',
  'Add a review count badge ("94 five-star reviews") to the homepage hero and every product page. Google treats review count as a direct trustworthiness signal for commerce sites.',
  'Add an author byline to the Hawarden Farm blog post: "Written by [name], head butcher, Parkview Meats Co. — 18 years experience in Canterbury meat processing." This turns a thin blog post into an expert-attributed piece overnight.',
]

// --- Search Console mock data ---
// TODO: Replace with Google Search Console API — VITE_GOOGLE_SEARCH_CONSOLE_KEY
const MOCK_GSC = {
  impressions: { value: 2847, delta: '+12%', trend: 'up' },
  clicks: { value: 143, delta: '+8%', trend: 'up' },
  avgPosition: { value: 16.4, prev: 18.1, trend: 'up' },
  alert: 'Position for "paddock to plate NZ" dropped from 4 to 7 in the last 48 hours — investigate for algorithm update or competitor content change.',
  alertSeverity: 'warning',
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK GENERATORS — TODO: Replace with Claude API calls
// Model: claude-sonnet-4-20250514
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Replace with Claude API call — inputs: target keyword
// Returns a 40–60 word answer block formatted for featured snippet capture
function mockGenerateAnswerBlock(keyword) {
  const kw = keyword.toLowerCase().trim()
  if (kw.includes('grass-fed')) {
    return `Grass-fed beef comes from cattle raised exclusively on pasture and forage throughout their lives, never grain-finished or feedlot-housed. Parkview's Canterbury grass-fed beef is raised on Hawarden's natural pasture year-round, producing beef with higher omega-3 fatty acid content and a distinctly clean, mineral flavour. Third-generation farming ensures consistent animal welfare and grazing standards.`
  }
  if (kw.includes('subscription') || kw.includes('meat box')) {
    return `A meat subscription NZ delivers curated boxes of grass-fed beef, lamb, and pork from New Zealand farms directly to your door on a fortnightly or monthly basis. Parkview's Canterbury-raised subscription boxes start at $109 per fortnight, sourced from our third-generation Hawarden farm using Canterbury Home Kill processing — no supermarket, no cold storage delays.`
  }
  if (kw.includes('paddock') || kw.includes('plate')) {
    return `Paddock to plate describes a meat supply chain where the producer controls every step from farm raising to customer delivery, with no intermediaries or cold storage intermediaries. Parkview's paddock-to-plate model means Canterbury grass-fed beef travels 120km from our Hawarden farm to Canterbury Home Kill processing and directly into your subscription box — typically within 5 days of processing.`
  }
  if (kw.includes('canterbury')) {
    return `Canterbury beef is raised on the natural tussock and ryegrass pastures of the Canterbury Plains and hill country in New Zealand's South Island. Parkview's Canterbury beef is farmed in Hawarden, north Canterbury, where the high-country pasture and clean water produce consistently clean-flavoured, well-marbled grass-fed beef with no grain supplementation year-round.`
  }
  return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} at Parkview Meats Co. refers to our Canterbury-raised, grass-fed approach to premium meat production. Our third-generation Hawarden farm has been producing grass-fed beef, lamb, and pork since 1961 using Canterbury Home Kill processing — delivering directly to New Zealand subscribers fortnightly or monthly, starting from $109.`
}

// TODO: Replace with Claude API call
// Inputs: page URL, target keyword
// Returns a complete SEO brief for the page
function mockGenerateSEOBrief(pageUrl, targetKeyword) {
  const isHomepage = pageUrl.includes('parkviewmeats.co.nz') && !pageUrl.includes('/')
  const isProduct = pageUrl.includes('/products/')
  const kw = targetKeyword.trim()
  return {
    metaTitle: isHomepage
      ? `Grass-Fed Meat Subscription NZ | Parkview Meats Co.`
      : isProduct
      ? `Classic Box — Canterbury Grass-Fed Meat | Parkview Meats Co.`
      : `${kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | Parkview Meats Co.`,
    metaDesc: isHomepage
      ? `Canterbury grass-fed beef, lamb and pork subscription boxes from Hawarden farm. Fortnightly from $109. Third-generation farming, Canterbury Home Kill, delivered NZ-wide.`
      : `Canterbury grass-fed ${kw} direct from Parkview's third-generation Hawarden farm. Fortnightly from $109. Canterbury Home Kill processed, delivered NZ-wide.`,
    h1: isHomepage
      ? `Canterbury Grass-Fed Meat Subscription, Delivered NZ-Wide`
      : `${kw.charAt(0).toUpperCase() + kw.slice(1)} — Canterbury Raised, Delivered to Your Door`,
    h2Structure: [
      `What's Included in Your ${kw.includes('box') ? 'Box' : 'Subscription'}`,
      `Canterbury Grass-Fed — What That Actually Means`,
      `From Hawarden Farm to Your Door`,
      `How the Subscription Works`,
      `Common Questions About ${kw.split(' ').slice(0, 2).join(' ')}`,
    ],
    targetWordCount: isProduct ? 600 : 1000,
    internalLinks: [
      { anchor: 'Classic Box', url: '/products/classic-box' },
      { anchor: 'our Hawarden farm', url: '/blogs/farm-stories/hawarden-farm' },
      { anchor: 'Canterbury Home Kill', url: '/pages/about#canterbury-home-kill' },
    ],
    schemaType: isProduct ? 'Product + Offer + AggregateRating' : 'WebPage + FAQPage + BreadcrumbList',
    answerBlocks: [
      `What is ${kw}? ${kw.charAt(0).toUpperCase() + kw.slice(1)} at Parkview refers to our Canterbury grass-fed subscription model, delivering curated beef, lamb and pork boxes from Hawarden farm directly to your door fortnightly from $109.`,
      `Is Parkview ${kw.split(' ')[0]} certified? Parkview uses Canterbury Home Kill processing — a specific NZ designation for farm-direct, low-stress processing that maintains provenance integrity from paddock to box. Not a marketing claim: a verifiable standard.`,
      `How does Parkview's ${kw.split(' ')[0]} subscription work? Select your box (Classic, BBQ, Premium, or Lamb), choose fortnightly or monthly, and your Canterbury-raised meat ships chilled. Pause or skip any time. No minimum commitment.`,
    ],
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function kwStatusBadge(pos) {
  if (pos <= 3)  return { label: 'Top 3', cls: 'bg-brass/20 text-brass-dark border-brass/40' }
  if (pos <= 10) return { label: 'Page 1', cls: 'bg-green-100 text-green-800 border-green-200' }
  if (pos <= 20) return { label: 'Page 2', cls: 'bg-amber-100 text-amber-800 border-amber-200' }
  return           { label: 'Page 3+', cls: 'bg-red-100 text-red-800 border-red-200' }
}

function priorityCls(p) {
  if (p === 'Critical') return 'bg-red-100 text-red-800 border-red-200'
  if (p === 'High')     return 'bg-amber-100 text-amber-800 border-amber-200'
  if (p === 'Medium')   return 'bg-blue-100 text-blue-800 border-blue-200'
  return 'bg-near-black/5 text-near-black/50 border-near-black/10'
}

function cwvStatusCls(status) {
  if (status === 'good') return 'text-green-700'
  if (status === 'warn') return 'text-amber-600'
  return 'text-red-600'
}

function scoreCls(s) {
  if (s >= 4) return 'text-green-700'
  if (s >= 3) return 'text-amber-600'
  return 'text-red-600'
}

const MOCK_PAGE_URLS = [
  'parkviewmeats.co.nz',
  'parkviewmeats.co.nz/products/classic-box',
  'parkviewmeats.co.nz/products/bbq-box',
  'parkviewmeats.co.nz/blogs/farm-stories/hawarden-farm',
  'parkviewmeats.co.nz/pages/about',
  'parkviewmeats.co.nz/pages/faq',
]

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionHeader({ number, title, right }) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <div className="flex items-baseline gap-3">
        {number && (
          <span className="font-cormorant text-2xl font-light text-brass/40 leading-none flex-shrink-0">
            {number}
          </span>
        )}
        <h2 className="font-cormorant text-xl font-semibold text-near-black tracking-wide">{title}</h2>
      </div>
      {right}
    </div>
  )
}

function KeywordRow({ kw, cited }) {
  const badge = kwStatusBadge(kw.pos)
  const deltaUp   = kw.delta > 0
  const deltaDown = kw.delta < 0
  return (
    <div className="flex items-center gap-3 py-2 border-b border-brass/10 last:border-0">
      <span className={`inline-block px-1.5 py-0.5 text-xs font-medium border flex-shrink-0 ${badge.cls}`}>
        {badge.label}
      </span>
      <span className="flex-1 text-sm font-inter text-near-black">{kw.kw}</span>
      {cited && (
        <span className="text-xs bg-brass/15 text-brass-dark border border-brass/30 px-1.5 py-0.5 flex-shrink-0">
          AI cited
        </span>
      )}
      <span className="text-xs text-near-black/40 flex-shrink-0 w-8 text-right">{kw.vol.toLocaleString()}</span>
      <span className="w-12 text-right flex-shrink-0">
        <span className="font-cormorant text-base font-semibold text-near-black">#{kw.pos}</span>
      </span>
      <span className={`text-xs flex-shrink-0 w-10 text-right font-medium ${deltaUp ? 'text-green-600' : deltaDown ? 'text-red-500' : 'text-near-black/30'}`}>
        {deltaUp ? `↑${kw.delta}` : deltaDown ? `↓${Math.abs(kw.delta)}` : '—'}
      </span>
    </div>
  )
}

function QueueItem({ task, isSelected, isApproved, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left px-3 py-3 border-b border-brass/10 last:border-0 transition-colors group',
        isSelected ? 'bg-brass/10' : 'hover:bg-brass/5',
      ].join(' ')}
    >
      <div className="flex items-start gap-2 mb-1">
        <span className={`inline-block px-1.5 py-0.5 text-xs font-medium border flex-shrink-0 ${priorityCls(task.priority)}`}>
          {task.priority}
        </span>
        <span className="text-xs text-near-black/40 flex-shrink-0 pt-0.5">{task.type}</span>
        {isApproved && (
          <span className="ml-auto text-brass text-xs flex-shrink-0">✓ Staged</span>
        )}
      </div>
      <p className={`text-xs font-inter leading-snug ${isSelected ? 'text-near-black font-medium' : 'text-near-black/70'}`}>
        {task.title}
      </p>
      <p className="text-xs text-near-black/30 mt-1 truncate">{task.page}</p>
    </button>
  )
}

function CodeBlock({ content }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs text-near-black/30 hover:text-near-black/60 transition-colors bg-bone px-2 py-0.5 border border-brass/20"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="text-xs font-mono text-near-black/70 leading-relaxed whitespace-pre-wrap bg-near-black/3 border border-brass/10 p-4 overflow-x-auto max-h-[340px] overflow-y-auto">
        {content}
      </pre>
    </div>
  )
}

function WorkingSandbox({ task, isApproved, onApprove, onRequestEdit }) {
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState('')
  const [implPath, setImplPath] = useState('A')
  const [regenerating, setRegenerating] = useState(false)
  const [editedProposal, setEditedProposal] = useState(null)

  // Reset on task change
  useEffect(() => {
    setEditMode(false)
    setEditText('')
    setEditedProposal(null)
    setRegenerating(false)
  }, [task.id])

  const proposal = editedProposal || task.proposal

  function handleSubmitEdit() {
    if (!editText.trim()) return
    setRegenerating(true)
    // TODO: Replace with Claude API call incorporating editText feedback
    // Model: claude-sonnet-4-20250514
    // Inputs: task.proposal, editText
    setTimeout(() => {
      setEditedProposal({
        ...proposal,
        title: proposal.title + ' (revised)',
        seoRationale: proposal.seoRationale + ` [Revision applied: "${editText}"]`,
      })
      setRegenerating(false)
      setEditMode(false)
      setEditText('')
    }, 800)
  }

  const claudeCodeCmd = `claude "Apply the following SEO change to ${task.page}: ${task.proposal.proposedOptimisation}. Create a GitHub PR titled 'SEO: ${task.title}' for review."`

  return (
    <div className="flex flex-col h-full">
      {/* Split screen */}
      <div className="grid grid-cols-2 gap-0 flex-1 border border-brass/20 mb-4">
        {/* Left — Current State */}
        <div className="border-r border-brass/20 flex flex-col">
          <div className="px-3 py-2 border-b border-brass/15 bg-bone">
            <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider">Current State</p>
            <p className="text-xs text-near-black/50 mt-0.5 truncate">{task.currentState.label}</p>
          </div>
          <div className="p-3 flex-1 overflow-y-auto max-h-[320px]">
            <CodeBlock content={task.currentState.content} />
          </div>
        </div>

        {/* Right — Proposed Version */}
        <div className="flex flex-col">
          <div className="px-3 py-2 border-b border-brass/15 bg-brass/5">
            <p className="text-xs font-medium text-brass-dark uppercase tracking-wider">Proposed Version</p>
            <p className="text-xs text-near-black/50 mt-0.5">{proposal.title}</p>
          </div>
          <div className="p-3 flex-1 overflow-y-auto max-h-[320px]">
            <CodeBlock content={proposal.code} />
          </div>
        </div>
      </div>

      {/* Proposal detail */}
      <div className="border border-brass/20 bg-bone p-4 mb-4 text-xs space-y-3">
        <div>
          <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">Proposed Change</p>
          <p className="text-near-black/70 leading-relaxed">{proposal.proposedOptimisation}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">SEO Rationale</p>
            <p className="text-near-black/60 leading-relaxed">{proposal.seoRationale}</p>
          </div>
          <div>
            <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">GEO Rationale</p>
            <p className="text-near-black/60 leading-relaxed">{proposal.geoRationale}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-near-black/40 uppercase tracking-wider">Risk Level</p>
          <span className={`px-1.5 py-0.5 text-xs font-medium border ${
            proposal.riskLevel === 'Low' ? 'bg-green-50 text-green-700 border-green-200' :
            proposal.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>{proposal.riskLevel}</span>
        </div>
      </div>

      {/* Implementation Path */}
      <div className="border border-brass/15 p-3 mb-4 bg-bone text-xs">
        <p className="font-medium text-near-black/40 uppercase tracking-wider mb-2">Implementation Path</p>
        <div className="flex gap-3 mb-2">
          {['A', 'B'].map(opt => (
            <button
              key={opt}
              onClick={() => setImplPath(opt)}
              className={`px-3 py-1.5 border text-xs transition-colors ${
                implPath === opt ? 'bg-brass/20 border-brass/60 text-near-black' : 'border-brass/20 text-near-black/40 hover:border-brass/40'
              }`}
            >
              {opt === 'A' ? 'A — Copy & apply in Shopify' : 'B — Generate Claude Code command'}
            </button>
          ))}
        </div>
        {implPath === 'A' && (
          <p className="text-near-black/50 leading-relaxed">Copy the proposed code above and apply manually in Shopify Admin → Online Store → Themes → Edit code, or via Shopify's metafields for schema markup.</p>
        )}
        {implPath === 'B' && (
          <div>
            <p className="text-near-black/50 mb-2 leading-relaxed">Claude Code command — run this in your terminal to create a GitHub PR automatically:</p>
            <CodeBlock content={claudeCodeCmd} />
            <p className="text-near-black/30 mt-1 italic">Note: Requires Claude Code CLI installed and Shopify GitHub integration configured. TODO: Wire to live Shopify store via VITE_SHOPIFY_STORE_URL + VITE_SHOPIFY_API_KEY.</p>
          </div>
        )}
      </div>

      {/* Approval Portal */}
      {isApproved ? (
        <div className="flex items-center gap-3 p-3 bg-brass/10 border border-brass/30">
          <span className="text-brass text-base">✓</span>
          <div>
            <p className="text-xs font-medium text-near-black">Staged for implementation</p>
            <p className="text-xs text-near-black/50">Use Claude Code command above or apply manually in Shopify.</p>
          </div>
        </div>
      ) : (
        <div>
          {!editMode ? (
            <div className="flex gap-3">
              <button
                onClick={onApprove}
                className="btn-brass flex-1 text-sm py-2.5"
              >
                Approve &amp; Stage
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="btn-outline flex-1 text-sm py-2.5"
              >
                Request Edit
              </button>
            </div>
          ) : (
            <div className="border border-brass/20 p-3 bg-bone">
              <p className="text-xs font-medium text-near-black/40 mb-2">What would you like changed?</p>
              <textarea
                className="input-field text-xs mb-3 resize-none"
                rows={2}
                placeholder="e.g. 'Make the meta title more Canterbury-specific' or 'Include the subscription price in the schema markup'"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitEdit}
                  disabled={!editText.trim() || regenerating}
                  className="btn-brass text-xs px-4 py-1.5 disabled:opacity-40"
                >
                  {regenerating ? 'Regenerating...' : 'Regenerate Proposal'}
                </button>
                <button
                  onClick={() => { setEditMode(false); setEditText('') }}
                  className="text-xs text-near-black/40 hover:text-near-black/60 transition-colors px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CollapsibleCheckSection({ id, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-brass/20">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-brass/5 transition-colors"
      >
        <span className="text-sm font-inter font-medium text-near-black">{title}</span>
        <span className="text-near-black/30 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-brass/15 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SeoAssistant() {
  const lastAudited = new Date(Date.now() - 2 * 60 * 60 * 1000)

  // ─── Queue & approval state ────────────────────────────────────────────────
  const [approvedIds, setApprovedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(QUEUE_STATE_KEY) || '{}') } catch { return {} }
  })

  const [selectedTaskId, setSelectedTaskId] = useState(() => {
    return localStorage.getItem(SELECTED_TASK_KEY) || MOCK_QUEUE_TASKS[0].id
  })

  const [addedToQueueIds, setAddedToQueueIds] = useState({})

  // ─── Content Workshop state ───────────────────────────────────────────────
  const [answerInput, setAnswerInput] = useState('')
  const [answerOutput, setAnswerOutput] = useState(null)
  const [answerGenerating, setAnswerGenerating] = useState(false)

  const [briefUrl, setBriefUrl] = useState(MOCK_PAGE_URLS[0])
  const [briefKeyword, setBriefKeyword] = useState('')
  const [briefOutput, setBriefOutput] = useState(null)
  const [briefGenerating, setBriefGenerating] = useState(false)

  // ─── Audit state ──────────────────────────────────────────────────────────
  const [auditing, setAuditing] = useState(false)

  // ─── Persist selected task ────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(SELECTED_TASK_KEY, selectedTaskId)
  }, [selectedTaskId])

  const selectedTask = MOCK_QUEUE_TASKS.find(t => t.id === selectedTaskId) || MOCK_QUEUE_TASKS[0]

  // ─── Approve task ─────────────────────────────────────────────────────────
  function handleApprove(taskId) {
    const updated = { ...approvedIds, [taskId]: true }
    setApprovedIds(updated)
    localStorage.setItem(QUEUE_STATE_KEY, JSON.stringify(updated))

    // Write to shared intelligence so Marketing Brain is aware
    const intel = readIntelligence()
    const task = MOCK_QUEUE_TASKS.find(t => t.id === taskId)
    writeIntelligence({
      ...intel,
      creativePipeline: {
        ...intel.creativePipeline,
        incomingBriefs: [
          ...(intel.creativePipeline?.incomingBriefs || []),
          {
            source: 'seo',
            taskId,
            taskTitle: task?.title,
            page: task?.page,
            stagedAt: new Date().toISOString(),
          },
        ],
      },
    })
  }

  // ─── Add competitor/decay item to queue ───────────────────────────────────
  function handleAddToQueue(itemId, taskId) {
    setAddedToQueueIds(prev => ({ ...prev, [itemId]: true }))
    // Jump to the related task in the queue
    if (taskId) setSelectedTaskId(taskId)
  }

  // ─── Run full audit (mock) ────────────────────────────────────────────────
  function handleRunAudit() {
    if (auditing) return
    setAuditing(true)
    // TODO: Replace with Claude API call + PageSpeed Insights API + Search Console API
    setTimeout(() => setAuditing(false), 2200)
  }

  // ─── Answer Block Generator ───────────────────────────────────────────────
  function handleGenerateAnswerBlock() {
    if (!answerInput.trim() || answerGenerating) return
    setAnswerGenerating(true)
    // TODO: Replace with Claude API call — model: claude-sonnet-4-20250514
    setTimeout(() => {
      setAnswerOutput(mockGenerateAnswerBlock(answerInput))
      setAnswerGenerating(false)
    }, 700)
  }

  // ─── SEO Brief Generator ──────────────────────────────────────────────────
  function handleGenerateSEOBrief() {
    if (!briefKeyword.trim() || briefGenerating) return
    setBriefGenerating(true)
    // TODO: Replace with Claude API call — model: claude-sonnet-4-20250514
    setTimeout(() => {
      setBriefOutput(mockGenerateSEOBrief(briefUrl, briefKeyword))
      setBriefGenerating(false)
    }, 900)
  }

  // ─── Split queue into pending and approved ────────────────────────────────
  const pendingTasks  = MOCK_QUEUE_TASKS.filter(t => !approvedIds[t.id])
  const approvedTasks = MOCK_QUEUE_TASKS.filter(t => approvedIds[t.id])

  const healthCls = MOCK_HEALTH_SCORE >= 80 ? 'text-brass-dark' : MOCK_HEALTH_SCORE >= 60 ? 'text-amber-600' : MOCK_HEALTH_SCORE >= 40 ? 'text-orange-600' : 'text-red-700'

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div>

      {/* ─── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-bone border-b border-brass/20 -mx-8 px-8 py-3 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="font-cormorant text-lg font-semibold text-near-black tracking-wide">SEO Command Centre</span>
          <div className="flex items-center gap-2">
            <span className={`font-cormorant text-2xl font-semibold ${healthCls}`}>{MOCK_HEALTH_SCORE}</span>
            <span className="text-xs text-near-black/30">/100 health</span>
          </div>
          <span className="text-xs text-near-black/30">
            Last audited {lastAudited.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={auditing}
          className="btn-outline text-xs px-3 py-1.5 disabled:opacity-40"
        >
          {auditing ? 'Running audit...' : 'Run Full Audit'}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — CITATION SCORE HEADER
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="1" title="Keyword Rankings & Citation Score" />

      <div className="card-brass-top mb-8">
        {/* Keywords */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider">Target Keywords</p>
            <div className="flex items-center gap-4 text-xs text-near-black/30">
              <span>Vol / mo</span>
              <span className="w-12 text-right">Position</span>
              <span className="w-10 text-right">Change</span>
            </div>
          </div>
          {MOCK_KEYWORDS.map(kw => (
            <KeywordRow key={kw.id} kw={kw} cited={AI_CITED_KEYWORD_IDS.includes(kw.id)} />
          ))}
        </div>

        {/* AI Citation Tracker */}
        <div className="border-t border-brass/15 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1">
                AI Citation Tracker
              </p>
              <p className="text-sm text-near-black">
                <span className="font-cormorant text-2xl font-semibold text-brass-dark">3</span>
                <span className="text-near-black/50"> / 10 keywords currently generating AI citations</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {MOCK_KEYWORDS.filter(k => AI_CITED_KEYWORD_IDS.includes(k.id)).map(k => (
                  <span key={k.id} className="text-xs bg-brass/10 text-brass-dark border border-brass/30 px-2 py-0.5">
                    {k.kw}
                  </span>
                ))}
              </div>
              <p className="text-xs text-near-black/30 mt-2 leading-relaxed">
                Cited in Google SGE and ChatGPT responses for these queries. Connect to live Search Console for real-time citation tracking.
              </p>
            </div>
            <div className="text-xs text-near-black/30 border border-brass/15 px-3 py-2 bg-bone flex-shrink-0 max-w-xs text-right">
              TODO: Connect via<br />VITE_GOOGLE_SEARCH_CONSOLE_KEY
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — OPTIMISATION QUEUE + WORKING SANDBOX
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="2" title="Optimisation Queue" />

      <div className="flex gap-0 border border-brass/20 mb-8" style={{ minHeight: '600px' }}>

        {/* LEFT — Queue */}
        <div className="flex flex-col border-r border-brass/20" style={{ width: '35%', flexShrink: 0 }}>
          <div className="px-3 py-2.5 border-b border-brass/15 bg-bone-dark">
            <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider">
              Queue — {pendingTasks.length} pending
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pendingTasks.map(task => (
              <QueueItem
                key={task.id}
                task={task}
                isSelected={selectedTaskId === task.id}
                isApproved={false}
                onClick={() => setSelectedTaskId(task.id)}
              />
            ))}

            {approvedTasks.length > 0 && (
              <>
                <div className="px-3 py-2 border-t border-b border-brass/15 bg-brass/5">
                  <p className="text-xs font-medium text-brass-dark uppercase tracking-wider">
                    Approved — {approvedTasks.length} staged
                  </p>
                </div>
                {approvedTasks.map(task => (
                  <QueueItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    isApproved={true}
                    onClick={() => setSelectedTaskId(task.id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* RIGHT — Working Sandbox */}
        <div className="flex flex-col p-4 overflow-y-auto" style={{ width: '65%' }}>
          {selectedTask ? (
            <WorkingSandbox
              task={selectedTask}
              isApproved={!!approvedIds[selectedTask.id]}
              onApprove={() => handleApprove(selectedTask.id)}
              onRequestEdit={() => {}}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-near-black/30 text-sm">Select a task from the queue to review</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — DAILY HEALTH CHECKLIST
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="3" title="Daily Health Checklist" />

      <div className="space-y-1.5 mb-8">

        {/* Google Search Console */}
        <CollapsibleCheckSection title="Google Search Console Monitor" defaultOpen={true}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Impressions (7d)', value: MOCK_GSC.impressions.value.toLocaleString(), delta: MOCK_GSC.impressions.delta, up: true },
              { label: 'Clicks (7d)',      value: MOCK_GSC.clicks.value,      delta: MOCK_GSC.clicks.delta,      up: true },
              { label: 'Avg. Position',    value: MOCK_GSC.avgPosition.value, delta: `from ${MOCK_GSC.avgPosition.prev}`, up: true },
            ].map(stat => (
              <div key={stat.label} className="card py-3">
                <p className="text-xs text-near-black/40 mb-1">{stat.label}</p>
                <p className="font-cormorant text-2xl font-semibold text-near-black">{stat.value}</p>
                <p className={`text-xs mt-0.5 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>{stat.delta}</p>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/60 px-3 py-2.5">
            <span className="text-amber-600 flex-shrink-0 mt-0.5">⚠</span>
            <p className="text-xs text-amber-800 leading-relaxed">{MOCK_GSC.alert}</p>
          </div>
          <p className="text-xs text-near-black/25 mt-3">TODO: Connect via VITE_GOOGLE_SEARCH_CONSOLE_KEY</p>
        </CollapsibleCheckSection>

        {/* Core Web Vitals */}
        <CollapsibleCheckSection title="Core Web Vitals" defaultOpen={true}>
          <div className="space-y-0">
            <div className="grid grid-cols-4 gap-0 border-b border-brass/10 pb-1 mb-1">
              {['Page', 'LCP', 'INP', 'CLS'].map(h => (
                <p key={h} className="text-xs font-medium text-near-black/40 uppercase tracking-wider px-2">{h}</p>
              ))}
            </div>
            {MOCK_CWV.map(row => (
              <div key={row.page} className="grid grid-cols-4 gap-0 border-b border-brass/10 last:border-0">
                <div className="px-2 py-2">
                  <p className="text-xs font-medium text-near-black">{row.page}</p>
                  <p className="text-xs text-near-black/30 truncate">{row.url}</p>
                </div>
                <div className="px-2 py-2 flex items-center">
                  <span className={`text-xs font-medium ${cwvStatusCls(row.lcp.status)}`}>
                    {row.lcp.val}s {row.lcp.status === 'good' ? '✓' : '✗'}
                  </span>
                </div>
                <div className="px-2 py-2 flex items-center gap-1">
                  <span className={`text-xs font-medium ${cwvStatusCls(row.inp.status)}`}>
                    {row.inp.val}ms {row.inp.status === 'good' ? '✓' : row.inp.status === 'warn' ? '~' : '✗'}
                  </span>
                  {row.inp.status !== 'good' && (
                    <button
                      onClick={() => setSelectedTaskId(row.taskId)}
                      className="text-xs text-brass hover:text-brass-dark transition-colors"
                    >
                      Fix ↑
                    </button>
                  )}
                </div>
                <div className="px-2 py-2 flex items-center">
                  <span className={`text-xs font-medium ${cwvStatusCls(row.cls.status)}`}>
                    {row.cls.val} {row.cls.status === 'good' ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-near-black/25 mt-3">TODO: Connect via VITE_PAGESPEED_API_KEY (free, no billing required)</p>
        </CollapsibleCheckSection>

        {/* Content Decay Monitor */}
        <CollapsibleCheckSection title="Content Decay Monitor">
          <div className="space-y-3">
            {MOCK_DECAY.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-4 p-3 bg-bone border border-brass/15">
                <div className="flex-1">
                  <p className="text-xs font-medium text-near-black mb-0.5">{item.page}</p>
                  <p className="text-xs text-near-black/40">{item.url} — updated {item.lastUpdated}</p>
                  <p className="text-xs text-amber-700 mt-1">{item.issue}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-red-600 font-medium">{item.impressionChange}</span>
                  {!addedToQueueIds[item.id] ? (
                    <button
                      onClick={() => handleAddToQueue(item.id, item.taskId)}
                      className="btn-outline text-xs px-2 py-1"
                    >
                      Add to Queue
                    </button>
                  ) : (
                    <span className="text-xs text-brass">In queue ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleCheckSection>

        {/* Competitor Snapshot */}
        <CollapsibleCheckSection title="Competitor Snapshot">
          <div className="space-y-3">
            {MOCK_COMPETITOR_MOVES.map(move => {
              const sevCls = move.severity === 'high'
                ? 'border-red-200/60 bg-red-50/30'
                : 'border-amber-200/60 bg-amber-50/20'
              return (
                <div key={move.id} className={`flex items-start justify-between gap-4 p-3 border ${sevCls}`}>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-near-black mb-0.5">{move.competitor}</p>
                    <p className="text-xs text-near-black/60 leading-relaxed">{move.observation}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTaskId(move.taskId)}
                    className="btn-outline text-xs px-2 py-1 flex-shrink-0"
                  >
                    Counter this ↑
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-near-black/25 mt-3">TODO: Connect via SEMrush/Ahrefs API or Claude API with web search tool</p>
        </CollapsibleCheckSection>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — CONTENT WORKSHOP
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="4" title="Content Workshop" />

      <div className="grid grid-cols-2 gap-5 mb-8">

        {/* Answer Block Generator */}
        <div className="card-brass-top">
          <h3 className="font-cormorant text-lg font-semibold text-near-black mb-1">Answer Block Generator</h3>
          <p className="text-xs text-near-black/40 mb-4 leading-relaxed">
            Enter a keyword or question. Output: a 40–60 word Answer Block formatted for featured snippet capture and AI citation.
          </p>
          <input
            className="input-field mb-3"
            placeholder="e.g. grass-fed beef Canterbury, what is paddock to plate"
            value={answerInput}
            onChange={e => setAnswerInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateAnswerBlock()}
          />
          <button
            onClick={handleGenerateAnswerBlock}
            disabled={!answerInput.trim() || answerGenerating}
            className="btn-brass w-full disabled:opacity-40"
          >
            {answerGenerating ? 'Generating...' : 'Generate Answer Block'}
          </button>
          {/* TODO: Replace with Claude API call — model: claude-sonnet-4-20250514 */}

          {answerOutput && (
            <div className="mt-4 border-t border-brass/15 pt-4">
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">Answer Block</p>
              <div className="bg-bone border border-brass/20 p-3 mb-2">
                <p className="text-sm text-near-black/80 leading-relaxed">{answerOutput}</p>
                <p className="text-xs text-near-black/30 mt-2">
                  {answerOutput.split(' ').length} words — {answerOutput.split(' ').length <= 60 ? '✓ within 60-word target' : '⚠ slightly over — trim if needed'}
                </p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(answerOutput) }}
                className="btn-outline text-xs px-3 py-1.5 w-full"
              >
                Copy Answer Block
              </button>
            </div>
          )}
        </div>

        {/* Page SEO Brief Generator */}
        <div className="card-brass-top">
          <h3 className="font-cormorant text-lg font-semibold text-near-black mb-1">Page SEO Brief Generator</h3>
          <p className="text-xs text-near-black/40 mb-4 leading-relaxed">
            Select a page and enter a target keyword. Output: complete SEO brief with meta, H-structure, schema, and answer blocks.
          </p>
          <div className="relative mb-3">
            <select
              className="select-field"
              value={briefUrl}
              onChange={e => setBriefUrl(e.target.value)}
            >
              {MOCK_PAGE_URLS.map(url => (
                <option key={url} value={url}>{url}</option>
              ))}
            </select>
          </div>
          <input
            className="input-field mb-3"
            placeholder="Target keyword, e.g. meat subscription NZ"
            value={briefKeyword}
            onChange={e => setBriefKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateSEOBrief()}
          />
          <button
            onClick={handleGenerateSEOBrief}
            disabled={!briefKeyword.trim() || briefGenerating}
            className="btn-brass w-full disabled:opacity-40"
          >
            {briefGenerating ? 'Generating brief...' : 'Generate SEO Brief'}
          </button>
          {/* TODO: Replace with Claude API call — model: claude-sonnet-4-20250514 */}

          {briefOutput && (
            <div className="mt-4 border-t border-brass/15 pt-4 space-y-3 text-xs">
              {[
                { label: 'Meta Title', value: briefOutput.metaTitle, note: `${briefOutput.metaTitle.length} chars ${briefOutput.metaTitle.length <= 60 ? '✓' : '⚠'}` },
                { label: 'Meta Description', value: briefOutput.metaDesc, note: `${briefOutput.metaDesc.length} chars ${briefOutput.metaDesc.length <= 155 ? '✓' : '⚠'}` },
                { label: 'H1', value: briefOutput.h1 },
              ].map(field => (
                <div key={field.label}>
                  <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">{field.label}</p>
                  <p className="text-near-black/80 bg-bone border border-brass/15 px-2 py-1.5 leading-relaxed">{field.value}</p>
                  {field.note && <p className="text-near-black/30 mt-0.5">{field.note}</p>}
                </div>
              ))}
              <div>
                <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">H2 Structure</p>
                <ol className="space-y-1">
                  {briefOutput.h2Structure.map((h, i) => (
                    <li key={i} className="text-near-black/70 flex gap-2">
                      <span className="font-cormorant text-brass flex-shrink-0">{i + 1}.</span>
                      {h}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">Target Word Count</p>
                  <p className="text-near-black/70">{briefOutput.targetWordCount}+ words</p>
                </div>
                <div>
                  <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">Schema Type</p>
                  <p className="text-near-black/70">{briefOutput.schemaType}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-near-black/40 uppercase tracking-wider mb-1">Internal Links</p>
                <ul className="space-y-1">
                  {briefOutput.internalLinks.map((l, i) => (
                    <li key={i} className="text-near-black/60">
                      <span className="text-brass">→</span> "{l.anchor}" → {l.url}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — E-E-A-T SCORECARD
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="5" title="E-E-A-T Scorecard" />

      <div className="card-brass-top mb-5">
        {/* Table header */}
        <div className="grid grid-cols-7 gap-2 pb-2 border-b border-brass/15 mb-1">
          {['Page', 'Experience', 'Expertise', 'Authority', 'Trust', 'Overall', 'Action'].map((h, i) => (
            <p key={h} className={`text-xs font-medium text-near-black/40 uppercase tracking-wider ${i === 0 ? 'col-span-1' : i === 6 ? 'col-span-2' : ''}`}>{h}</p>
          ))}
        </div>

        {/* Table rows */}
        {MOCK_EEAT_PAGES.map(row => (
          <div
            key={row.page}
            className={`grid grid-cols-7 gap-2 py-3 border-b border-brass/10 last:border-0 ${row.flagged ? 'bg-red-50/30' : ''}`}
          >
            <div className="col-span-1">
              <p className="text-xs font-medium text-near-black">{row.page}</p>
              <p className="text-xs text-near-black/30 truncate">{row.url}</p>
            </div>
            {[row.experience, row.expertise, row.authoritativeness, row.trustworthiness].map((score, i) => (
              <div key={i} className="flex items-center">
                <span className={`text-sm font-cormorant font-semibold ${scoreCls(score)}`}>{score}/5</span>
              </div>
            ))}
            <div className="flex items-center">
              <span className={`font-cormorant text-base font-semibold ${scoreCls(row.overall)}`}>
                {row.overall}/5
                {row.flagged && <span className="text-red-500 ml-1">⚠</span>}
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="text-xs text-near-black/55 leading-relaxed">{row.action}</p>
            </div>
          </div>
        ))}
      </div>

      {/* E-E-A-T Quick Wins */}
      <div className="card mb-8">
        <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-3">E-E-A-T Quick Wins This Week</p>
        <ul className="space-y-3">
          {EEAT_QUICK_WINS.map((win, i) => (
            <li key={i} className="flex gap-3 text-xs text-near-black/70 leading-relaxed">
              <span className="font-cormorant font-semibold text-brass flex-shrink-0 text-sm">{i + 1}.</span>
              {win}
            </li>
          ))}
        </ul>
        <p className="text-xs text-near-black/25 mt-4">TODO: Replace with Claude API call — model: claude-sonnet-4-20250514 — inputs: page content audit via VITE_SHOPIFY_STORE_URL</p>
      </div>

      {/* Footer note */}
      <div className="border-t border-brass/10 pt-6 pb-2">
        <p className="text-xs text-near-black/25 font-inter leading-relaxed">
          [MOCK MODE] — All keyword rankings, CWV scores, GSC data, and AI-generated proposals are realistic mock outputs demonstrating the live system format. Environment variables required for live data: VITE_GOOGLE_SEARCH_CONSOLE_KEY, VITE_PAGESPEED_API_KEY, VITE_SHOPIFY_STORE_URL, VITE_SHOPIFY_API_KEY, VITE_ANTHROPIC_API_KEY.
        </p>
      </div>

    </div>
  )
}
