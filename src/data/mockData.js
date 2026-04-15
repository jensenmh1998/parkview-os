// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// All values below are PLACEHOLDER / MOCK data.
// Values marked [MOCK] are hardcoded — connect a real integration to replace them.
// Values marked [LIVE-READY] will auto-populate once the relevant integration is added.

export const dashboardMetrics = [
  {
    id: 'subscribers',
    label: 'Active Subscribers',
    value: '0',           // [LIVE-READY] Connect Recharge
    note: 'Connect Recharge to populate',
    icon: 'users',
    live: false,
  },
  {
    id: 'revenue',
    label: 'Monthly Revenue',
    value: '$0',          // [LIVE-READY] Connect Shopify
    note: 'Connect Shopify to populate',
    icon: 'dollar',
    live: false,
  },
  {
    id: 'seo',
    label: 'SEO Score',
    value: '62',          // [MOCK] Placeholder score
    note: 'Placeholder — run SEO audit',
    icon: 'search',
    live: false,
  },
  {
    id: 'ads',
    label: 'Ads Running',
    value: '3',           // [MOCK] Placeholder ad count
    note: 'Placeholder — connect Meta Ads',
    icon: 'trending',
    live: false,
  },
]

export const toolShortcuts = [
  {
    path: '/creative',
    label: 'Creative Strategist',
    description: 'Generate Meta ad copy, campaign concepts & audience strategy',
    icon: 'edit',
  },
  {
    path: '/seo',
    label: 'SEO Assistant',
    description: 'Audit your site, find keyword gaps & get optimisation tips',
    icon: 'search',
  },
  {
    path: '/ads',
    label: 'Meta Ads Optimiser',
    description: 'Analyse ad performance and get daily spend recommendations',
    icon: 'trending',
  },
  {
    path: '/calendar',
    label: 'Content Calendar',
    description: 'Plan and brief content across Instagram, TikTok and email',
    icon: 'calendar',
  },
]

// ─── PLACEHOLDER OUTPUT TEMPLATES ─────────────────────────────────────────────
// These are example outputs shown as UI placeholders. They are NOT real AI output.

export const creativePlaceholder = {
  campaignConcept: `[MOCK OUTPUT] "From Paddock to Plate" — a direct-response campaign
anchored in provenance. Showcase the farm-to-table story of Parkview Meats,
emphasising ethical sourcing, Canterbury heritage and the ritual of a quality cut.`,
  adAngles: [
    '[MOCK] Angle 1: The Premium Ritual — position a Parkview cut as the centrepiece of a meaningful meal',
    '[MOCK] Angle 2: Behind the Product — farm footage, butcher craft, honest sourcing story',
    '[MOCK] Angle 3: Social Proof — subscriber testimonials and repeat-order loyalty',
  ],
  recommendedCopy: `[MOCK] Headline: "Not every cut earns the Parkview name."
Body: Grass-fed, Canterbury-raised, butchered by hand. Delivered to your door before the weekend.
CTA: "Start your subscription →"`,
  audienceNotes: `[MOCK] Primary: NZ homeowners 28–50, household income $80k+, interest in premium grocery,
cooking and local produce. Secondary: Gift buyers searching for gourmet food hampers.`,
}

export const seoPlaceholder = {
  score: 62,
  issuesFound: [
    { severity: 'critical', text: '[MOCK] Missing meta descriptions on 8 product pages' },
    { severity: 'critical', text: '[MOCK] Core Web Vitals failing on mobile (LCP 4.2s)' },
    { severity: 'warning', text: '[MOCK] 14 images missing alt text' },
    { severity: 'warning', text: '[MOCK] No structured data (schema.org) on product pages' },
    { severity: 'good', text: '[MOCK] HTTPS enabled across all pages' },
    { severity: 'good', text: '[MOCK] Sitemap.xml present and indexed' },
  ],
  opportunities: [
    '[MOCK] Target long-tail: "grass-fed beef subscription NZ" — low competition, high intent',
    '[MOCK] Blog content gap: recipes and cooking guides driving organic traffic for competitors',
    '[MOCK] Local SEO: Google Business Profile incomplete — missing hours and product categories',
  ],
  recommendedActions: [
    '[MOCK] Write unique meta descriptions for all product pages (priority: high)',
    '[MOCK] Optimise hero images — compress to WebP and add descriptive alt text',
    '[MOCK] Add FAQ schema to subscription page to capture featured snippets',
  ],
}

export const adsPlaceholder = {
  performanceSummary: '[MOCK] Week-on-week ROAS down 12% across cold audiences. Warm retargeting holding at 4.1x. Top performer: "Butcher Story" video — CTR 3.8%. Spend pacing on track at 94% of weekly budget.',
  recommendations: [
    { type: 'scale', label: 'Scale', ad: '[MOCK] "Butcher Story" Video Ad', reason: 'CTR 3.8%, ROAS 5.2x — increase daily budget by 30%' },
    { type: 'scale', label: 'Scale', ad: '[MOCK] Retargeting — Cart Abandoners', reason: 'ROAS 6.1x, low frequency (1.4) — room to spend more' },
    { type: 'pause', label: 'Pause', ad: '[MOCK] "Summer BBQ" Static Image', reason: 'CTR 0.4%, CPC $4.20 — below break-even threshold' },
    { type: 'watch', label: 'Watch', ad: '[MOCK] Lookalike 2% — Subscribers', reason: 'ROAS 2.8x, trending down 3 days — monitor for another 48h' },
    { type: 'refresh', label: 'Refresh Creative', ad: '[MOCK] "Premium Cut" Carousel', reason: 'Frequency 4.7 — creative fatigue detected, swap assets' },
  ],
}

export const calendarPlatformColours = {
  Instagram: 'bg-pink-100 text-pink-800 border-pink-200',
  TikTok: 'bg-slate-100 text-slate-800 border-slate-200',
  Email: 'bg-amber-100 text-amber-800 border-amber-200',
  'Meta Ads': 'bg-blue-100 text-blue-800 border-blue-200',
}
