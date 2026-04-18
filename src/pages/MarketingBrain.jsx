import { useState, useEffect, useRef, useCallback } from 'react'
import { readIntelligence, writeIntelligence, SEED_TEAM_MESSAGES } from '../data/sharedIntelligence'

// ═══════════════════════════════════════════════════════════════════════════════
// localStorage KEYS
// ═══════════════════════════════════════════════════════════════════════════════

const BRAIN_CACHE_KEY      = 'parkview_brain_cache'
const CHECKLIST_STATE_KEY  = 'parkview_checklist_state'
const INTEL_LOG_KEY        = 'parkview_intelligence_log'
const LOG_SEEN_KEY         = 'parkview_brain_log_seen'
const CACHE_TTL_MS         = 4 * 60 * 60 * 1000  // 4 hours

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_COMPETITORS_NZ = [
  {
    id: 'sff',
    name: 'Silver Fern Farms Direct',
    activeAds: 8,
    newThisWeek: 4,
    formats: ['Video', 'Collection', 'Carousel'],
    hooks: [
      "New Zealand's most trusted beef, delivered.",
      'Farm-fresh quality without the supermarket markup.',
      'Real farms. Real people. Real flavour.',
    ],
    observation: 'Most active competitor. 4 new ads suggest a product push — heavy Collection format investment signals they\'re pushing bundles.',
  },
  {
    id: 'tmb',
    name: 'The Meat Box NZ',
    activeAds: 6,
    newThisWeek: 3,
    formats: ['Video', 'Carousel', 'Image'],
    hooks: [
      'Skip the supermarket. Never look back.',
      'Quality you can actually taste.',
      'Your weekly shop, sorted.',
    ],
    observation: "All 3 new ads use 'skip the supermarket' framing — repositioning against Pak'nSave pricing.",
  },
  {
    id: 'ourcow',
    name: 'Ourcow',
    activeAds: 4,
    newThisWeek: 2,
    formats: ['Video', 'Image'],
    hooks: [
      'You know this cow. You know this farm.',
      "Canterbury's freshest beef, farm to door in 48 hours.",
    ],
    observation: 'Two new provenance ads with direct Canterbury geographic overlap. This is Parkview\'s strongest brand territory — respond.',
  },
  {
    id: 'neatmeat',
    name: 'Neat Meat NZ',
    activeAds: 3,
    newThisWeek: 1,
    formats: ['Video', 'Image'],
    hooks: ['No nasties. Just honest meat.', 'Clean eating starts with clean sourcing.'],
    observation: 'Single new ad, clean-eating angle — not overlapping with Parkview\'s premium positioning.',
  },
]

const MOCK_COMPETITORS_INTL = [
  {
    id: 'butchercrowd',
    name: 'Butcher Crowd (AU)',
    activeAds: 7,
    newThisWeek: 3,
    formats: ['Video', 'UGC Video', 'Carousel'],
    hooks: [
      'Meet the farmer behind your meat.',
      "This is Tom. His cattle have never seen a feedlot.",
      'We drove 6 hours to meet this farmer. Worth every kilometre.',
    ],
    observation: "3 new 'meet the farmer' UGC videos in 7 days. Format gaining traction — brief a Parkview version before AU/NZ saturation in 3–4 weeks.",
  },
  {
    id: 'butcherbox',
    name: 'Butcher Box (US)',
    activeAds: 12,
    newThisWeek: 5,
    formats: ['Video', 'UGC', 'Static', 'Collection'],
    hooks: [
      "The best meat you've ever cooked. Guaranteed.",
      "Your family deserves better than the freezer section.",
    ],
    observation: 'Most aggressive tester in category — 5 simultaneous variants, heavy UGC investment. Monitor UGC performance signals.',
  },
  {
    id: 'crowdcow',
    name: 'Crowd Cow (US)',
    activeAds: 9,
    newThisWeek: 2,
    formats: ['Video', 'Carousel', 'Image'],
    hooks: [
      "Not all grass-fed is equal. Here's the difference.",
      "The wagyu you've been mispronouncing.",
    ],
    observation: "'Not all X is equal' educational hook structure appearing consistently — high CTR signal. Direct Parkview application: 'Not all Canterbury beef is equal.'",
  },
]

const MOCK_TRENDS = [
  {
    title: '"Meet the farmer" format taking hold across AU/NZ',
    driver: 'Butcher Crowd launched 3 farmer-led UGC videos in one week. Ourcow has 2 provenance ads running. Consumer trust in supply chains is at a multi-year low — faces behind the food are converting at 2–3x brand ads.',
    parkviewApplication: 'Brief a single "meet the farmer" video from the Hawarden property before this format saturates the AU/NZ feed. Lead with the third-generation story — this is a legitimate differentiator Butcher Crowd cannot copy.',
  },
  {
    title: 'Subscription fatigue is real — emphasis on flexibility is winning',
    driver: 'HelloFresh and Marley Spoon are both running "pause anytime" messaging in 70%+ of new ads. Consumer search data shows "cancel subscription" rising 18% YoY. Flexibility messaging is outperforming product quality messaging.',
    parkviewApplication: "Add a 'pause or skip, always in control' line to all retargeting copy. Recharge handles it — write it into the next email flow. This reduces churn anxiety, which matters more for LTV than nCAC.",
  },
  {
    title: 'Lo-fi audio / authentic video outperforming polished production 3:1',
    driver: "Meta's algorithm has been deprioritising high-production-value video in favour of content that matches organic Reels behaviour. Handheld iPhone-style footage with natural audio is getting 3x the hook rate of studio-grade ads across food brands.",
    parkviewApplication: 'Next creative should be shot on iPhone, on the farm or in a home kitchen. Natural sound. No music bed on the hook. This is a cost reduction AND a performance improvement — brief the production note accordingly.',
  },
]

const MOCK_PLATFORM_SHIFT = 'Reels with lo-fi audio are outperforming polished video 3:1 across food brands this month. Meta\'s Feed placement is seeing declining CPMs while Reels placement costs are rising — shift 60% of budget to Reels placements if not already done. Static image CTR has also recovered in the last 30 days, likely due to feed saturation with video — worth testing a text-heavy static variant.'

const MOCK_KPIS = {
  mer:      { value: '2.8x', label: 'MER',       sublabel: 'Marketing Efficiency Ratio', status: 'healthy',  delta: '+0.3x vs last month' },
  ncac:     { value: '$38',  label: 'nCAC',      sublabel: 'New Customer Acq. Cost',     status: 'watch',    delta: '+$6 vs target ($32)' },
  hookRate: { value: '19%',  label: 'Hook Rate', sublabel: '3-second video views',       status: 'watch',    delta: '-3% vs benchmark (22%)' },
  holdRate: { value: '31%',  label: 'Hold Rate', sublabel: '15-second video views',      status: 'healthy',  delta: '+2% vs last week' },
  roas:     { value: '3.2x', label: 'ROAS',      sublabel: 'Return on Ad Spend',         status: 'healthy',  delta: 'Stable, 4-week avg' },
}

const MOCK_CAMPAIGNS = [
  {
    id: 'c1',
    name: 'Classic Box — Acquisition (NZ Broad)',
    status: 'watch',
    keyMetric: 'nCAC $44 (target $32)',
    summary: 'Spending efficiently but acquisition cost crept up. Frequency at 2.1 — not yet fatigued but watch creative.',
    ads: [
      { name: '"Farm to Door" Video',   fatigueScore: 72, metric: 'CTR 1.3% (was 2.1%), Freq 3.1', status: 'critical' },
      { name: '"Canterbury Provenance"', fatigueScore: 31, metric: 'CTR 1.9%, Hook 22%', status: 'healthy' },
    ],
  },
  {
    id: 'c2',
    name: 'Canterbury Home Kill — Acquisition (Lookalike)',
    status: 'healthy',
    keyMetric: 'ROAS 4.2x, Hook 28%',
    summary: 'Best performing campaign. Canterbury Home Kill hook is outperforming. Scale budget now.',
    ads: [
      { name: '"Canterbury Home Kill" Hook', fatigueScore: 18, metric: 'Hook 28%, ROAS 4.2x', status: 'healthy' },
    ],
  },
  {
    id: 'c3',
    name: 'BBQ Box — Retargeting (Website Visitors 30d)',
    status: 'healthy',
    keyMetric: 'ROAS 3.8x, Freq 1.4',
    summary: '3.8x ROAS for 4 consecutive days. Budget scaled 20% yesterday. Watch frequency.',
    ads: [
      { name: 'BBQ Box — Retargeting Static', fatigueScore: 22, metric: 'ROAS 3.8x, Freq 1.4', status: 'healthy' },
    ],
  },
  {
    id: 'c4',
    name: 'Classic Box — Summer Carousel',
    status: 'critical',
    keyMetric: 'ROAS 2.7x (declining)',
    summary: 'ROAS trending down 3 days in a row: 3.8x → 3.1x → 2.7x. Frequency 3.9. Brief replacement.',
    ads: [
      { name: 'Summer Carousel — 3 cards', fatigueScore: 81, metric: 'ROAS 2.7x, Freq 3.9', status: 'critical' },
    ],
  },
]

const MOCK_WINNERS = [
  {
    name: '"Canterbury Home Kill" Hook Video',
    metrics: 'Hook rate 28% · ROAS 4.2x · Day 5',
    whatIsWorking: 'The hook names the specific kill process rather than using generic provenance language. "Canterbury Home Kill" is three words that do what "farm-fresh" can\'t — it makes the claim specific, verifiable, and local.',
    driver: 'Hook specificity + geographic authenticity',
    action: 'Brief 2 more variants targeting Gift Buyers and Health-Conscious Professionals. Use identical hook structure with audience-specific body copy.',
  },
  {
    name: 'BBQ Box — Retargeting Static',
    metrics: 'ROAS 3.8x · 4 consecutive days · Freq 1.4',
    whatIsWorking: 'Single product shot, no overlay text, product price visible. Warm audience already knows Parkview — no need to sell the brand. The ad sells the box directly.',
    driver: 'Audience match + minimal friction',
    action: 'Use this format (clean product, price visible) as the default retargeting template for all boxes.',
  },
]

const MOCK_PATTERNS = [
  {
    observation: 'Geographic specificity in hooks is outperforming generic quality claims 3:1 across all active ads.',
    application: 'Canterbury Home Kill outperforms "grass-fed beef" because it\'s specific and verifiable. Apply geographic specificity to every new hook brief — name the district, the process, the distance.',
  },
  {
    observation: 'Retargeting ads with visible pricing are converting warm audiences at 2x the rate of ads without pricing.',
    application: 'Add the box price ($X per fortnight) to all retargeting static images. Remove the barrier — warm audiences have already decided they\'re interested, price is what closes them.',
  },
]

const MOCK_FATIGUE_SUMMARY = 'Your "Farm to Door" video is losing people in the first 3 seconds because the opening is a wide landscape shot — people are scrolling past before seeing the product or hearing a hook. It opened at 22% hook rate, it\'s now at 14%. The creative hasn\'t changed; the feed environment has. Your Summer Carousel is dying for a different reason: frequency 3.9 means your retargeting audience has seen it 4 times and they\'re still not buying. Either the offer isn\'t right for this audience or the creative hasn\'t earned enough trust — the fatigue score of 81 means pause it today.'

const SEED_INTELLIGENCE_LOG = [
  {
    id: 'log_001',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    observed: '"Canterbury Home Kill" hook video launched — 28% hook rate, 4.2x ROAS at day 5',
    learned: 'Geographic processing specificity (naming the kill method and region) outperforms generic provenance claims. Specific = credible = converting.',
    applying: 'Canterbury Home Kill angle is now the default hook direction for all Classic and Premium box acquisition campaigns.',
  },
  {
    id: 'log_002',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    observed: 'Spring Lamb Launch email — 38% open rate vs 24% list average',
    learned: 'Seasonal specificity in subject lines significantly outperforms evergreen copy for Parkview\'s audience. "Spring lamb has arrived from Hawarden" vs "New box available" — the seasonal version wins by 14 points.',
    applying: 'All future campaign emails lead with a seasonal or event-specific hook in the subject line. No more generic "available now" framing.',
  },
  {
    id: 'log_003',
    date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    observed: 'Butcher Crowd (AU) launched 3 "meet the farmer" videos in one week — all performing above their category benchmark',
    learned: '"Meet the farmer" format has a 3–4 week saturation window in the AU/NZ premium food market before it feels expected and stops converting. Format window is open now.',
    applying: 'Flagged for urgent Parkview brief before format saturates. Third-generation Hawarden farm story is a legitimate differentiator — this is Parkview\'s version to own.',
  },
  {
    id: 'log_004',
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    observed: '"Farm to Door" video hook rate declined from 22% to 14% over 9 days — opening is a wide landscape shot',
    learned: 'Wide establishing shots are failing as hooks across food brands. Audience is already in scroll mode — they need to see the product or hear a specific claim in the first 1.5 seconds. Landscape beauty shots are losing to close-up product or process shots.',
    applying: 'All new video briefs specify: hook must open on close-up product, hands, or specific verbal claim. No wide shots before 5 seconds.',
  },
  {
    id: 'log_005',
    date: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    observed: 'Retargeting static with visible box price ($109/fortnight) converted 2.1x vs retargeting static without price',
    learned: 'Warm audiences (website visitors 30d) have already cleared the brand trust hurdle. The price objection is the only remaining friction — making it visible removes it rather than creating it.',
    applying: 'Default retargeting static template now includes visible price. Applied to BBQ Box retargeting. Roll out to all box retargeting campaigns.',
  },
]

const MOCK_CHECKLIST_TASKS = [
  {
    id: 'task_001',
    priority: 1,
    type: 'Creative',
    typeCls: 'badge-pause',
    title: 'Brief replacement for "Farm to Door" video — hook is dying',
    summary: 'Hook rate dropped from 22% to 14% over 9 days. Wide landscape opening is losing the scroll before the product appears. Brief a new hook today.',
    detail: {
      context: '"Farm to Door" video — Classic Box Acquisition campaign. Frequency 3.1, CTR declined 2.1% → 1.3% over 14 days. Hook rate 14% (benchmark 22%). Opening 3 seconds is a wide Canterbury landscape shot with no verbal hook.',
      hooks: [
        {
          label: 'Hook A — Product Close-Up',
          script: '[OPEN on extreme close-up of raw sirloin being placed on a butcher block — hands only, no face yet]\nVO: "This is what Canterbury grass-fed looks like before it hits your pan."\n[CUT to box being opened, product visible]\nVO: "Parkview Meats. Fortnightly from Hawarden."',
          note: 'Start mid-action. No establishing shot. Product in frame within 0.5 seconds.',
        },
        {
          label: 'Hook B — Provenance Challenge',
          script: '[OPEN on face, direct to camera, outdoor on farm]\nVO: "Name the last farm your supermarket steak came from."\n[PAUSE — 1 second]\nVO: "I can. It\'s ours. Third generation, Hawarden Canterbury."\n[CUT to product, box, delivery]',
          note: 'Direct challenge format. Pause is intentional — creates cognitive gap that keeps attention.',
        },
        {
          label: 'Hook C — Canterbury Home Kill',
          script: '[OPEN on hands working, Canterbury Home Kill facility, no wide shots]\nVO: "Most beef travels 800km before it reaches your plate. Ours travels 120."\n[CUT to farm → box → door]\nVO: "Canterbury Home Kill. Parkview Meats."',
          note: 'Specific distance claim beats generic "local" framing. If distance is accurate, use it.',
        },
      ],
      visualDirection: 'iPhone, handheld. Natural light — golden hour on farm or bright indoor kitchen. No studio lighting. No music on hook — natural sound only (butcher block, sizzle, ambient farm). Product must be in frame within first 1.5 seconds. Total length: 20–30 seconds.',
      productionNote: 'Video, vertical 9:16 for Reels. Shoot 3 separate openings, identical body copy. A/B test all three openings in one campaign. Budget $30/day per variant for 7 days.',
      targetCard: 'meta-ad',
    },
  },
  {
    id: 'task_002',
    priority: 1,
    type: 'Campaign',
    typeCls: 'badge-scale',
    title: 'Scale Canterbury Home Kill budget — 4.2x ROAS at day 5',
    summary: 'Canterbury Home Kill hook is performing above all benchmarks. Budget is $80/day. Scale to $120/day today while frequency is still low (1.2).',
    detail: {
      context: 'Canterbury Home Kill — Acquisition (Lookalike 1–3%). Hook rate 28%, ROAS 4.2x, day 5. Frequency 1.2. CPM stable. This is performing at Parkview\'s best-ever ROAS for a new ad at day 5.',
      steps: [
        'Go to Meta Ads Manager → Canterbury Home Kill campaign',
        'Select the Lookalike 1–3% ad set',
        'Edit → Budget → Change from $80/day to $120/day (20% increase is safe; 50% is the maximum Meta recommends without resetting the learning phase)',
        'Do not change audience, placements, or creative — change nothing else',
        'Set a spend cap alert at $140/day so you\'re notified if delivery spikes',
        'Check again at day 7 — if ROAS holds above 3.5x at $120/day, scale to $160/day',
      ],
      expectedOutcome: 'At 4.2x ROAS and $120/day, you\'re spending $120 to return $504 in revenue per day. The risk is that scaling disrupts the learning phase — a 50% increase at this stage is justified given the strong signal.',
      watchFor: 'If hook rate drops below 20% within 48 hours of scaling, reduce back to $80 — frequency may be climbing faster than the data shows at this stage.',
    },
  },
  {
    id: 'task_003',
    priority: 1,
    type: 'Campaign',
    typeCls: 'badge-pause',
    title: 'Pause Summer Carousel — ROAS 2.7x and declining, frequency 3.9',
    summary: 'Summer Carousel has been in decline for 3 consecutive days: 3.8x → 3.1x → 2.7x. Frequency 3.9 means this audience has seen this ad nearly 4 times. It is not converting. Pause it today.',
    detail: {
      context: 'Classic Box Summer Carousel — Retargeting (Website Visitors 30d). ROAS 2.7x, Frequency 3.9, fatigue score 81/100. Spend is $103/day.',
      steps: [
        'Go to Meta Ads Manager → Classic Box — Summer Carousel campaign',
        'Toggle the campaign OFF (pause, not delete)',
        'Leave the BBQ Box Retargeting Static running — that ad set is healthy at 3.8x',
        'Do not create a replacement retargeting ad today — let the audience reset over 7–10 days',
        'Return in 10 days and launch a new retargeting creative (brief will be in next week\'s checklist)',
      ],
      expectedOutcome: 'Pausing stops $103/day in spend returning sub-2x ROAS. The audience will partially reset within 7–10 days — retargeting will work again with fresh creative.',
      watchFor: 'Don\'t replace with the same product angle. The audience has rejected this offer 4 times. The next retargeting ad should lead with social proof or the subscription flexibility message, not product quality.',
    },
  },
  {
    id: 'task_004',
    priority: 2,
    type: 'Creative',
    typeCls: 'badge-refresh',
    title: 'Brief a "meet the farmer" video before format saturates',
    summary: 'Butcher Crowd launched 3 farmer-led videos this week. Format is converting 2–3x brand ads in AU/NZ. Parkview\'s third-generation Hawarden story is a direct answer — brief it before the format window closes in 3–4 weeks.',
    detail: {
      context: 'Butcher Crowd (AU) — 3 new "meet the farmer" videos in 7 days, all above benchmark. Format gaining traction across AU/NZ premium food category. Ourcow has provenance ads with Canterbury geographic overlap. Parkview\'s third-generation farm story is a legitimate differentiator that Butcher Crowd cannot copy.',
      hooks: [
        {
          label: 'Hook A — Third Generation',
          script: '[OPEN: Matt on farm, direct to camera, handheld iPhone, natural light]\n"My grandfather bought this land in Hawarden in 1961. My father ran it for 30 years. I\'m running it now."\n[PAUSE]\n"The supermarket doesn\'t know who raised your beef. I do. It was me."\n[CUT to product, box, delivery — text overlay: Parkview Meats. Canterbury, NZ.]',
          note: 'Specific family history beats "family farm" generic. Years, names, places.',
        },
        {
          label: 'Hook B — The Drive',
          script: '[OPEN: driving shot, Canterbury plains out the window]\nVO: "This is the drive our meat makes every fortnight before it reaches your door. It\'s 120km. Not 800."\n[CUT to farm → butcher → box → door in fast sequence]\nVO: "Parkview. Canterbury grass-fed. Directly to you."',
          note: 'Distance specificity. 120km vs 800km is a provenance claim no supermarket can match.',
        },
        {
          label: 'Hook C — The Question',
          script: '[OPEN: Matt at kitchen table, holding up a raw steak]\n"People always ask me why Parkview beef tastes different. I say — what does your supermarket steak eat?"\n[SMILES]\n"Ours eats Canterbury grass. All of it. No grain finish. Just grass and time."\n[CUT to product shot, box price overlay: From $109/fortnight]',
          note: 'Question hook format — creates curiosity gap. Closes on specific differentiator (no grain finish) and price.',
        },
      ],
      visualDirection: 'iPhone, handheld. Hawarden property — paddocks, the house, real environment. Matt or family member on camera. No script cards, no teleprompter — real conversation. Golden hour. Natural sound throughout. Vertical 9:16.',
      productionNote: 'One shoot day, 3 separate hook openings. Identical body copy and CTA on all three. Test as 3 variants in one acquisition campaign. This is the highest-priority creative brief — if Butcher Crowd saturates this format, Parkview loses the window.',
      targetCard: 'meta-ad',
    },
  },
  {
    id: 'task_005',
    priority: 2,
    type: 'Strategy',
    typeCls: 'badge-watch',
    title: 'Set up subscription flexibility A/B test in Klaviyo welcome flow',
    summary: 'HelloFresh and Marley Spoon are running "pause anytime" messaging in 70%+ of new ads — a direct response to rising subscription fatigue. Add a flexibility reassurance line to the Parkview welcome flow email and test it for 30 days.',
    detail: {
      context: 'Consumer search data shows "cancel subscription" rising 18% YoY. Flexibility messaging is outperforming product quality messaging in acquisition AND retention. Parkview\'s Recharge integration already supports pause/skip — the product capability exists, it\'s just not being communicated.',
      recommendation: 'Add a single sentence to the Day 3 welcome email: "You\'re always in control — skip, pause, or change your box size any time from your account." A/B test against the current version (no flexibility mention) for 30 days.',
      rationale: 'This is a retention play disguised as acquisition messaging. Subscribers who know they can pause are 23% less likely to cancel than subscribers who feel locked in (Recharge platform data, 2024). The cost is one sentence. The upside is LTV.',
      successLooks: 'After 30 days: compare 30-day churn rate between variant A (current) and variant B (flexibility mention). If variant B shows even 5% reduction in 30-day churn, roll it out permanently and add it to all acquisition ad copy.',
      steps: [
        'Go to Klaviyo → Flows → Welcome Series',
        'Open Day 3 email → Clone to create variant B',
        'In variant B: add "You\'re always in control — skip, pause, or change your box size any time from your account." as a standalone line after the product intro paragraph',
        'Set A/B test split 50/50',
        'Set a 30-day evaluation window',
        'Set the winning metric as: 30-day click rate on the "manage subscription" link (proxy for engaged subscribers who know where to go)',
      ],
    },
  },
  {
    id: 'task_006',
    priority: 3,
    type: 'Technical',
    typeCls: 'badge-watch',
    title: 'Add UTM parameters to all Recharge transactional emails',
    summary: 'Recharge renewal and upcoming box emails have no UTM tracking. This means all traffic from subscription management is appearing as "direct" in GA4, making it impossible to measure email-driven subscription changes.',
    detail: {
      context: 'GA4 is showing 18% of sessions as "direct" with no source. A significant portion of this is likely Recharge transactional email traffic (renewal reminders, upcoming box notifications, payment failure emails). Without UTMs, you can\'t measure the impact of transactional email on box changes, upsells, or churn prevention.',
      steps: [
        'Go to Recharge → Notifications → Email templates',
        'For each template (Upcoming Order, Order Processed, Payment Failed, Subscription Pause Confirmation): add UTM parameters to all links',
        'Use: utm_source=recharge&utm_medium=email&utm_campaign=[template-name]',
        'Example for Upcoming Order: ?utm_source=recharge&utm_medium=email&utm_campaign=upcoming_order',
        'Do NOT add UTMs to the unsubscribe link',
        'Test by sending a preview email and clicking the links — verify they appear correctly in GA4 Real-Time',
      ],
      whyItMatters: 'Once tracking is in place, you\'ll be able to see how many subscription changes, box upsells, and cancellations come from transactional emails. This is typically 8–12% of total subscription changes — currently invisible.',
    },
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK GENERATORS — TODO: Replace each with Claude API call
// Model: claude-sonnet-4-20250514
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Replace with Claude API call
// Inputs: adPerformance, competitorData, trends, checklistTasks
// Returns: { score, headline, urgent[], watching[], healthy[], delta[] }
function mockGeneratePriorityScore({ campaigns, competitors }) {
  const criticals = campaigns.filter(c => c.status === 'critical')
  const hasCompetitorThreat = competitors.some(c => c.newThisWeek >= 3)
  const score = criticals.length > 0 ? 58 : hasCompetitorThreat ? 71 : 82
  return {
    score,
    headline: criticals.length > 0
      ? `Your "${criticals[0].name.split('—')[0].trim()}" campaign is fatiguing and Ourcow just launched Canterbury provenance ads — respond today.`
      : 'Account is healthy. One scaling opportunity and one competitor pattern to action this week.',
    urgent: [
      '"Farm to Door" video hook rate 14% — creative fatigue, brief replacement today',
      'Summer Carousel paused (ROAS 2.7x, frequency 3.9)',
      'Ourcow launching Canterbury geographic ads — Parkview territory at risk',
    ],
    watching: [
      'nCAC crept to $44 (target $32) — monitor acquisition efficiency',
      '"Meet the farmer" format gaining traction in AU/NZ — 3–4 week window',
      'BBQ Box retargeting frequency approaching 2.0 — watch this week',
    ],
    healthy: [
      'Canterbury Home Kill campaign — 4.2x ROAS, scale budget today',
      'MER 2.8x — account-wide marketing efficiency is strong',
      'Spring Lamb email performance — 38% open rate, seasonal framing validated',
    ],
    delta: [
      'Ourcow launched 2 new Canterbury provenance ads yesterday — direct overlap with Parkview\'s geographic positioning',
      'Summer Carousel ROAS dropped below 3x for the third consecutive day — fatigue score now 81/100',
      'Canterbury Home Kill hit 4.2x ROAS at day 5 — strongest new ad in Parkview history',
    ],
  }
}

// TODO: Replace with Claude API call
// Returns 3 competitive intelligence observations synthesised across all competitor data
function mockGenerateCompetitorSummary() {
  return [
    '"Meet the farmer" UGC format is running across 4 separate competitors this week (Butcher Crowd, Ourcow, Silver Fern, The Meat Box). This is no longer an emerging trend — it\'s a category behaviour. Parkview needs to brief this format within 2 weeks or cede the authenticity narrative.',
    "The 'skip the supermarket' hook has become the default acquisition angle across NZ competitors. It is no longer differentiated — The Meat Box NZ has 3 new ads with this framing this week alone. Parkview should actively avoid this hook structure and own the geographic specificity angle instead.",
    'Collection format is being invested in heavily by Silver Fern Farms Direct (4 new ads). This signals a push toward bundle/gift purchasing for the colder months. Consider a gift-focused campaign brief for the Classic or Premium box ahead of Matariki and Father\'s Day.',
  ]
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatTimeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
}

function isCacheValid(cache) {
  if (!cache?.generatedAt) return false
  return Date.now() - new Date(cache.generatedAt).getTime() < CACHE_TTL_MS
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-baseline gap-4 mb-6">
      <span className="font-cormorant text-3xl font-light text-brass/40 leading-none flex-shrink-0 w-6 text-right">
        {number}
      </span>
      <h2 className="font-cormorant text-2xl font-semibold text-near-black tracking-wide leading-tight">
        {title}
      </h2>
    </div>
  )
}

function SectionDivider() {
  return <div className="border-t border-brass/20 my-8" />
}

function FadeIn({ children, delay = 0, show }) {
  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(6px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function SectionSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-brass/10 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  )
}

function KpiCard({ kpi }) {
  const statusCls = kpi.status === 'healthy'
    ? 'border-green-300 bg-green-50/40'
    : kpi.status === 'watch'
    ? 'border-amber-300 bg-amber-50/40'
    : 'border-red-300 bg-red-50/40'
  const deltaColor = kpi.status === 'healthy' ? 'text-green-700' : kpi.status === 'watch' ? 'text-amber-700' : 'text-red-700'
  return (
    <div className={`border p-4 ${statusCls}`}>
      <p className="text-xs font-inter text-near-black/40 uppercase tracking-wider mb-1">{kpi.label}</p>
      <p className="font-cormorant text-3xl font-semibold text-near-black leading-none mb-1">{kpi.value}</p>
      <p className={`text-xs font-inter ${deltaColor}`}>{kpi.delta}</p>
    </div>
  )
}

function CampaignRow({ campaign }) {
  const [expanded, setExpanded] = useState(false)
  const statusBadge = campaign.status === 'healthy'
    ? <span className="badge-scale">Healthy</span>
    : campaign.status === 'watch'
    ? <span className="badge-watch">Watching</span>
    : <span className="badge-pause">Critical</span>

  return (
    <div className="border border-brass/20">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-brass/5 transition-colors"
      >
        <span className="flex-shrink-0">{statusBadge}</span>
        <span className="flex-1 text-sm font-inter text-near-black font-medium">{campaign.name}</span>
        <span className="text-xs text-near-black/40 font-inter flex-shrink-0">{campaign.keyMetric}</span>
        <span className="text-near-black/30 text-xs ml-2">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-brass/10 pt-3">
          <p className="text-xs text-near-black/60 mb-3">{campaign.summary}</p>
          <div className="space-y-2">
            {campaign.ads.map((ad) => {
              const adCls = ad.status === 'healthy' ? 'border-green-200' : ad.status === 'watch' ? 'border-amber-200' : 'border-red-200'
              const scoreCls = ad.fatigueScore >= 70 ? 'text-red-700' : ad.fatigueScore >= 40 ? 'text-amber-700' : 'text-green-700'
              return (
                <div key={ad.name} className={`flex items-center gap-3 px-3 py-2 bg-bone border ${adCls}`}>
                  <span className="flex-1 text-xs font-inter text-near-black">{ad.name}</span>
                  <span className="text-xs text-near-black/50">{ad.metric}</span>
                  <span className={`text-xs font-medium ${scoreCls} ml-2`}>Fatigue {ad.fatigueScore}/100</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ChecklistItem({ task, isCompleted, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const detail = task.detail

  const priorityColor = task.priority === 1
    ? 'text-red-700 bg-red-50 border-red-200'
    : task.priority === 2
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-near-black/50 bg-bone border-brass/20'

  if (isCompleted) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border border-brass/10 bg-bone opacity-50">
        <span className="w-4 h-4 rounded-full bg-brass/40 flex items-center justify-center flex-shrink-0">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-near-black"/></svg>
        </span>
        <span className="flex-1 text-sm font-inter text-near-black line-through">{task.title}</span>
        <span className="text-xs text-near-black/30">Completed</span>
      </div>
    )
  }

  return (
    <div className="border border-brass/20 bg-bone-dark">
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className="w-5 h-5 mt-0.5 border-2 border-brass/40 hover:border-brass flex-shrink-0 flex items-center justify-center transition-colors group"
          aria-label="Mark complete"
        >
          <span className="w-2.5 h-2.5 bg-brass opacity-0 group-hover:opacity-30 transition-opacity" />
        </button>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-block px-1.5 py-0.5 text-xs font-medium border ${priorityColor}`}>
              P{task.priority}
            </span>
            <span className={task.typeCls}>{task.type}</span>
          </div>
          <p className="text-sm font-inter font-medium text-near-black leading-snug">{task.title}</p>
          <p className="text-xs text-near-black/50 mt-1 leading-relaxed">{task.summary}</p>
        </div>
        {/* Expand */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-brass hover:text-brass-dark transition-colors flex-shrink-0 mt-1 font-medium"
        >
          {expanded ? 'Hide' : 'View detail'}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-brass/15 px-4 pb-4 pt-4 space-y-4">
          {/* Context */}
          {detail.context && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1.5">Context</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.context}</p>
            </div>
          )}

          {/* Hook variants (creative tasks) */}
          {detail.hooks && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">Hook Variants</p>
              <div className="space-y-3">
                {detail.hooks.map((hook) => (
                  <div key={hook.label} className="bg-bone border border-brass/15 p-3">
                    <p className="text-xs font-semibold text-brass-dark mb-2">{hook.label}</p>
                    <pre className="text-xs text-near-black/70 leading-relaxed whitespace-pre-wrap font-inter">{hook.script}</pre>
                    {hook.note && (
                      <p className="text-xs text-near-black/40 mt-2 italic border-t border-brass/10 pt-2">{hook.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual direction */}
          {detail.visualDirection && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1.5">Visual Direction</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.visualDirection}</p>
            </div>
          )}

          {/* Production note */}
          {detail.productionNote && (
            <div className="bg-brass/5 border border-brass/20 p-3">
              <p className="text-xs font-medium text-brass-dark mb-1">Production Note</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.productionNote}</p>
            </div>
          )}

          {/* Steps (campaign/technical tasks) */}
          {detail.steps && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">Steps</p>
              <ol className="space-y-2">
                {detail.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-near-black/70">
                    <span className="font-cormorant font-semibold text-brass flex-shrink-0 w-4">{i + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Expected outcome */}
          {detail.expectedOutcome && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1.5">Expected Outcome</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.expectedOutcome}</p>
            </div>
          )}

          {/* Watch for */}
          {detail.watchFor && (
            <div className="bg-amber-50/50 border border-amber-200/50 p-3">
              <p className="text-xs font-medium text-amber-800 mb-1">Watch For</p>
              <p className="text-xs text-amber-900/70 leading-relaxed">{detail.watchFor}</p>
            </div>
          )}

          {/* Recommendation (strategy tasks) */}
          {detail.recommendation && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1.5">Recommendation</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.recommendation}</p>
            </div>
          )}
          {detail.rationale && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1.5">Rationale</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.rationale}</p>
            </div>
          )}
          {detail.successLooks && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1.5">What Success Looks Like</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.successLooks}</p>
            </div>
          )}

          {/* Why it matters (technical tasks) */}
          {detail.whyItMatters && (
            <div>
              <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-1.5">Why It Matters</p>
              <p className="text-xs text-near-black/70 leading-relaxed">{detail.whyItMatters}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function MarketingBrain() {
  // ─── Section loaded flags (for staggered fade-in) ─────────────────────────
  const [ready, setReady] = useState({
    s1: false, s2: false, s3: false, s4: false, s5: false, s6: false, s7: false,
  })

  // ─── Page data state ───────────────────────────────────────────────────────
  const [generatedAt, setGeneratedAt] = useState(null)
  const [priorityData, setPriorityData] = useState(null)
  const [competitorSummary, setCompetitorSummary] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // ─── Checklist state ───────────────────────────────────────────────────────
  const [completedTaskIds, setCompletedTaskIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHECKLIST_STATE_KEY) || '{}')
      // Clear if it's from a different day
      if (saved.date && !isSameDay(saved.date, new Date().toISOString())) return {}
      return saved.ids || {}
    } catch { return {} }
  })

  // ─── Intelligence log state ────────────────────────────────────────────────
  const [intelligenceLog, setIntelligenceLog] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(INTEL_LOG_KEY) || 'null')
      return saved && saved.length > 0 ? saved : SEED_INTELLIGENCE_LOG
    } catch { return SEED_INTELLIGENCE_LOG }
  })

  // ─── Self-learning log collapsed state ────────────────────────────────────
  const [logCollapsed, setLogCollapsed] = useState(() => {
    return localStorage.getItem(LOG_SEEN_KEY) === 'true'
  })

  // ─── Refs for scrolling ────────────────────────────────────────────────────
  const checklistRef = useRef(null)

  // ─── Load sequence ─────────────────────────────────────────────────────────
  const runLoadSequence = useCallback((fromCache = false) => {
    if (!fromCache) {
      setReady({ s1: false, s2: false, s3: false, s4: false, s5: false, s6: false, s7: false })
    }

    const delays = fromCache
      ? [0, 50, 100, 150, 200, 250, 300]
      : [200, 500, 750, 1000, 1300, 1550, 1850]

    const keys = ['s1', 's2', 's3', 's4', 's5', 's6', 's7']
    const timers = keys.map((key, i) =>
      setTimeout(() => setReady(prev => ({ ...prev, [key]: true })), delays[i])
    )

    // Generate data
    const pData = mockGeneratePriorityScore({ campaigns: MOCK_CAMPAIGNS, competitors: MOCK_COMPETITORS_NZ })
    const cSummary = mockGenerateCompetitorSummary()

    const scheduleData = setTimeout(() => {
      setPriorityData(pData)
      setCompetitorSummary(cSummary)
      const now = new Date().toISOString()
      setGeneratedAt(now)
      // Cache
      try {
        localStorage.setItem(BRAIN_CACHE_KEY, JSON.stringify({ generatedAt: now, priorityData: pData, competitorSummary: cSummary }))
      } catch {}
    }, fromCache ? 0 : 250)

    return () => { timers.forEach(clearTimeout); clearTimeout(scheduleData) }
  }, [])

  // ─── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Seed shared intelligence if empty (previously done by MetaAdsOptimiser)
    const intel = readIntelligence()
    if (intel.teamMessages.length === 0) {
      writeIntelligence({ ...intel, teamMessages: SEED_TEAM_MESSAGES })
    }

    // Try cache first
    try {
      const cached = JSON.parse(localStorage.getItem(BRAIN_CACHE_KEY) || 'null')
      if (isCacheValid(cached)) {
        setPriorityData(cached.priorityData)
        setCompetitorSummary(cached.competitorSummary)
        setGeneratedAt(cached.generatedAt)
        runLoadSequence(true)
        return
      }
    } catch {}
    runLoadSequence(false)
  }, [runLoadSequence])

  // ─── Refresh handler ───────────────────────────────────────────────────────
  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    setPriorityData(null)
    setCompetitorSummary(null)
    try { localStorage.removeItem(BRAIN_CACHE_KEY) } catch {}
    const cleanup = runLoadSequence(false)
    setTimeout(() => setRefreshing(false), 2000)
    return cleanup
  }

  // ─── Mark checklist task complete ──────────────────────────────────────────
  function handleToggleTask(taskId) {
    const updated = { ...completedTaskIds, [taskId]: true }
    setCompletedTaskIds(updated)
    try {
      localStorage.setItem(CHECKLIST_STATE_KEY, JSON.stringify({ date: new Date().toISOString(), ids: updated }))
    } catch {}

    // Write completion to intelligence log
    const task = MOCK_CHECKLIST_TASKS.find(t => t.id === taskId)
    if (task) {
      const logEntry = {
        id: `log_${Date.now()}`,
        date: new Date().toISOString(),
        observed: `Task completed: "${task.title}"`,
        learned: `${task.type} task actioned by Matt — ${task.summary}`,
        applying: 'Completion logged. Will influence next session\'s checklist generation.',
      }
      const updatedLog = [logEntry, ...intelligenceLog]
      setIntelligenceLog(updatedLog)
      try {
        localStorage.setItem(INTEL_LOG_KEY, JSON.stringify(updatedLog))
      } catch {}

      // Write to shared intelligence
      const intel = readIntelligence()
      writeIntelligence({
        ...intel,
        creativePipeline: task.detail.targetCard
          ? {
              ...intel.creativePipeline,
              incomingBriefs: [
                ...(intel.creativePipeline?.incomingBriefs || []),
                { taskId, taskTitle: task.title, completedAt: new Date().toISOString() },
              ],
            }
          : intel.creativePipeline,
      })
    }
  }

  // ─── Mark log as seen (collapse after first view) ──────────────────────────
  function handleToggleLog() {
    const next = !logCollapsed
    setLogCollapsed(next)
    if (next) {
      localStorage.setItem(LOG_SEEN_KEY, 'true')
    }
  }

  const pendingTasks    = MOCK_CHECKLIST_TASKS.filter(t => !completedTaskIds[t.id])
  const completedTasks  = MOCK_CHECKLIST_TASKS.filter(t => completedTaskIds[t.id])

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="relative">

      {/* ─── Sticky header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-bone border-b border-brass/20 -mx-8 px-8 py-3 flex items-center justify-between mb-8">
        <div>
          <span className="font-cormorant text-lg font-semibold text-near-black tracking-wide">
            Marketing Brain
          </span>
          {generatedAt && (
            <span className="text-xs text-near-black/30 ml-3 font-inter">
              Last updated {formatTimeAgo(generatedAt)}
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-outline text-xs px-3 py-1.5 disabled:opacity-40"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — TODAY'S PRIORITY SCORE
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="1" title="Today's Priority Score" />

      <FadeIn show={ready.s1}>
        {!priorityData ? (
          <SectionSkeleton lines={4} />
        ) : (
          <div>
            {/* Score */}
            <div className="flex items-end gap-6 mb-5">
              <div>
                <span
                  className={`font-cormorant text-8xl font-semibold leading-none ${
                    priorityData.score >= 70 ? 'text-green-700' : priorityData.score >= 50 ? 'text-amber-600' : 'text-red-700'
                  }`}
                >
                  {priorityData.score}
                </span>
                <span className="font-cormorant text-2xl text-near-black/30 ml-1">/100</span>
              </div>
              <p className="text-sm font-inter text-near-black/70 leading-relaxed max-w-xl pb-2">
                {priorityData.headline}
              </p>
            </div>

            {/* Three columns */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Urgent', items: priorityData.urgent, cls: 'border-red-200 bg-red-50/30', labelCls: 'text-red-700', dotCls: 'bg-red-500' },
                { label: 'Watching', items: priorityData.watching, cls: 'border-amber-200 bg-amber-50/30', labelCls: 'text-amber-700', dotCls: 'bg-amber-400' },
                { label: 'Healthy', items: priorityData.healthy, cls: 'border-green-200 bg-green-50/30', labelCls: 'text-green-700', dotCls: 'bg-green-500' },
              ].map(col => (
                <div key={col.label} className={`border p-4 ${col.cls}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${col.labelCls}`}>{col.label}</p>
                  <ul className="space-y-2">
                    {col.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-near-black/70 leading-relaxed">
                        <span className={`w-1.5 h-1.5 rounded-full ${col.dotCls} flex-shrink-0 mt-1`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Delta */}
            <div className="border border-brass/20 bg-bone p-4">
              <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">
                What changed since yesterday
              </p>
              <ul className="space-y-2">
                {priorityData.delta.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-near-black/70 leading-relaxed">
                    <span className="text-brass mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </FadeIn>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — COMPETITOR PULSE
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="2" title="Competitor Pulse" />

      <FadeIn show={ready.s2} delay={50}>
        <div>
          {/* NZ Competitors */}
          <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">NZ Competitors</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {MOCK_COMPETITORS_NZ.map(c => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-cormorant text-base font-semibold text-near-black leading-snug">{c.name}</p>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs text-near-black/40">{c.activeAds} active</p>
                    {c.newThisWeek > 0 && (
                      <span className="badge-scale text-xs">+{c.newThisWeek} new</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {c.formats.map(f => (
                    <span key={f} className="text-xs px-1.5 py-0.5 bg-bone border border-brass/20 text-near-black/50">{f}</span>
                  ))}
                </div>
                <div className="space-y-1 mb-3">
                  {c.hooks.map((hook, i) => (
                    <p key={i} className="text-xs text-near-black/60 italic leading-relaxed">"{hook}"</p>
                  ))}
                </div>
                <p className="text-xs text-near-black/50 border-t border-brass/10 pt-2 leading-relaxed">
                  {c.observation}
                </p>
              </div>
            ))}
          </div>

          {/* International */}
          <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">International Benchmarks</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {MOCK_COMPETITORS_INTL.map(c => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-cormorant text-base font-semibold text-near-black leading-snug">{c.name}</p>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs text-near-black/40">{c.activeAds} active</p>
                    {c.newThisWeek > 0 && <span className="badge-scale text-xs">+{c.newThisWeek} new</span>}
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {c.hooks.slice(0, 2).map((hook, i) => (
                    <p key={i} className="text-xs text-near-black/60 italic leading-relaxed">"{hook}"</p>
                  ))}
                </div>
                <p className="text-xs text-near-black/50 border-t border-brass/10 pt-2 leading-relaxed">
                  {c.observation}
                </p>
              </div>
            ))}
          </div>

          {/* Competitive Intelligence Summary */}
          {competitorSummary ? (
            <div className="card-brass-top">
              <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">
                Competitive Intelligence Summary
              </p>
              <ul className="space-y-3">
                {competitorSummary.map((obs, i) => (
                  <li key={i} className="flex gap-3 text-xs text-near-black/70 leading-relaxed">
                    <span className="font-cormorant text-brass font-semibold flex-shrink-0 text-sm">{i + 1}.</span>
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          ) : <SectionSkeleton lines={3} />}
        </div>
      </FadeIn>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — AD PERFORMANCE
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="3" title="Ad Performance" />

      <FadeIn show={ready.s3} delay={75}>
        <div>
          {/* KPI cards */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {Object.values(MOCK_KPIS).map(kpi => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          {/* Campaign Health Summary */}
          <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">
            Campaign Health
          </p>
          <div className="space-y-1.5 mb-6">
            {MOCK_CAMPAIGNS.map(c => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>

          {/* Fatigue Watch */}
          <div className="card-brass-top">
            <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">Fatigue Watch</p>
            <div className="space-y-3">
              {MOCK_CAMPAIGNS.flatMap(c => c.ads)
                .filter(ad => ad.fatigueScore >= 50)
                .sort((a, b) => b.fatigueScore - a.fatigueScore)
                .map(ad => {
                  const scoreCls = ad.fatigueScore >= 70 ? 'text-red-700 bg-red-50 border-red-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                  return (
                    <div key={ad.name} className="flex items-center gap-4">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium border ${scoreCls} flex-shrink-0`}>
                        {ad.fatigueScore}/100
                      </span>
                      <span className="flex-1 text-xs font-inter text-near-black">{ad.name}</span>
                      <span className="text-xs text-near-black/40">{ad.metric}</span>
                      <button
                        onClick={() => checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-xs text-brass hover:text-brass-dark transition-colors flex-shrink-0"
                      >
                        See task ↓
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </FadeIn>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — MARKET TRENDS
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="4" title="Market Trends" />

      <FadeIn show={ready.s4} delay={100}>
        <div>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {MOCK_TRENDS.map((trend, i) => (
              <div key={i} className="card">
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="font-cormorant text-xl font-light text-brass/40 flex-shrink-0">{i + 1}.</span>
                  <h3 className="font-cormorant text-lg font-semibold text-near-black leading-snug">{trend.title}</h3>
                </div>
                <p className="text-xs text-near-black/60 leading-relaxed mb-3">{trend.driver}</p>
                <div className="border-t border-brass/15 pt-3">
                  <p className="text-xs font-semibold text-brass-dark mb-1">Parkview Application</p>
                  <p className="text-xs text-near-black/70 leading-relaxed">{trend.parkviewApplication}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Shift */}
          <div className="bg-near-black/3 border border-near-black/10 p-4">
            <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-2">Platform Shift</p>
            <p className="text-xs text-near-black/70 leading-relaxed">{MOCK_PLATFORM_SHIFT}</p>
          </div>
        </div>
      </FadeIn>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — CREATIVE INTELLIGENCE
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionHeader number="5" title="Creative Intelligence" />

      <FadeIn show={ready.s5} delay={125}>
        <div className="space-y-6">
          {/* Winners */}
          <div>
            <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">Winners This Week</p>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_WINNERS.map((w, i) => (
                <div key={i} className="card border-l-2 border-l-green-400">
                  <p className="font-cormorant text-base font-semibold text-near-black mb-1">{w.name}</p>
                  <p className="text-xs text-green-700 mb-3">{w.metrics}</p>
                  <p className="text-xs text-near-black/60 leading-relaxed mb-2">{w.whatIsWorking}</p>
                  <p className="text-xs text-near-black/40 mb-3">
                    <span className="font-medium text-near-black/60">Driver: </span>{w.driver}
                  </p>
                  <div className="border-t border-brass/15 pt-2">
                    <p className="text-xs font-medium text-brass-dark mb-1">Action</p>
                    <p className="text-xs text-near-black/60 leading-relaxed">{w.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pattern Recognition */}
          <div>
            <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">Pattern Recognition</p>
            <div className="space-y-3">
              {MOCK_PATTERNS.map((p, i) => (
                <div key={i} className="card">
                  <p className="text-xs text-near-black/70 leading-relaxed mb-2">{p.observation}</p>
                  <p className="text-xs text-brass-dark font-medium">
                    Parkview:{' '}
                    <span className="text-near-black/60 font-normal">{p.application}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Creative Fatigue Summary */}
          <div>
            <p className="text-xs font-semibold text-near-black/40 uppercase tracking-wider mb-3">Creative Fatigue Summary</p>
            <div className="card border-l-2 border-l-amber-400">
              <p className="text-xs text-near-black/70 leading-relaxed">{MOCK_FATIGUE_SUMMARY}</p>
            </div>
          </div>
        </div>
      </FadeIn>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6 — SELF-LEARNING INTELLIGENCE LOG
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-4">
          <span className="font-cormorant text-3xl font-light text-brass/40 leading-none w-6 text-right">6</span>
          <h2 className="font-cormorant text-2xl font-semibold text-near-black tracking-wide">
            Self-Learning Intelligence Log
          </h2>
        </div>
        <button
          onClick={handleToggleLog}
          className="text-xs text-near-black/40 hover:text-near-black/60 transition-colors"
        >
          {logCollapsed ? 'Show log' : 'Collapse'}
        </button>
      </div>

      <FadeIn show={ready.s6} delay={150}>
        {!logCollapsed && (
          <div className="bg-[#F2ECD9] border border-brass/20 p-5">
            <p className="text-xs text-near-black/40 mb-5 leading-relaxed">
              A running record of what the brain has learned about Parkview's marketing. Each entry reflects an observation, the principle extracted from it, and how it's being applied going forward.
            </p>
            <div className="space-y-0">
              {intelligenceLog.map((entry, i) => (
                <div key={entry.id} className="relative pl-6">
                  {/* Timeline line */}
                  {i < intelligenceLog.length - 1 && (
                    <div className="absolute left-2 top-4 bottom-0 w-px bg-brass/20" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-brass/30 bg-[#F2ECD9] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-brass/50" />
                  </div>
                  <div className="pb-6">
                    <p className="text-xs text-near-black/30 font-inter mb-1">{formatDate(entry.date)}</p>
                    <p className="text-xs font-inter font-medium text-near-black/70 mb-1.5 leading-relaxed">{entry.observed}</p>
                    <p className="text-xs text-near-black/50 leading-relaxed mb-1.5">
                      <span className="font-medium text-near-black/60">Learned: </span>{entry.learned}
                    </p>
                    <p className="text-xs text-near-black/40 leading-relaxed">
                      <span className="font-medium text-near-black/50">Applying: </span>{entry.applying}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {logCollapsed && (
          <div className="bg-[#F2ECD9] border border-brass/20 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-near-black/40">{intelligenceLog.length} entries — {formatDate(intelligenceLog[0]?.date)} to {formatDate(intelligenceLog[intelligenceLog.length - 1]?.date)}</p>
            <button onClick={handleToggleLog} className="text-xs text-brass hover:text-brass-dark transition-colors">Show log</button>
          </div>
        )}
      </FadeIn>

      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7 — THE DAILY CHECKLIST
      ═══════════════════════════════════════════════════════════════════ */}
      <div ref={checklistRef}>
        <SectionHeader number="7" title="The Daily Checklist" />
      </div>

      <FadeIn show={ready.s7} delay={200}>
        <div>
          <p className="text-xs text-near-black/40 mb-5 leading-relaxed">
            Everything above distilled into what to actually do today. Each task has the full creative or campaign detail inside — no need to go anywhere else.
          </p>

          {/* Pending tasks */}
          <div className="space-y-2 mb-8">
            {pendingTasks.length === 0 ? (
              <div className="card text-center py-8">
                <p className="font-cormorant text-xl text-near-black/40">All tasks complete.</p>
                <p className="text-xs text-near-black/30 mt-1">Refresh tomorrow for a new briefing.</p>
              </div>
            ) : (
              pendingTasks.map(task => (
                <ChecklistItem
                  key={task.id}
                  task={task}
                  isCompleted={false}
                  onToggle={handleToggleTask}
                />
              ))
            )}
          </div>

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-near-black/30 uppercase tracking-wider mb-2">
                Completed today
              </p>
              <div className="space-y-1">
                {completedTasks.map(task => (
                  <ChecklistItem
                    key={task.id}
                    task={task}
                    isCompleted={true}
                    onToggle={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-brass/10">
            <p className="text-xs text-near-black/25 font-inter leading-relaxed">
              [MOCK MODE] — Priority score, competitor data, and all AI-generated analysis are placeholder outputs demonstrating the live briefing format. Each section marked TODO: Replace with Claude API call using model claude-sonnet-4-20250514.
            </p>
          </div>
        </div>
      </FadeIn>

    </div>
  )
}
