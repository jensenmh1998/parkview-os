import { useState, useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const HISTORY_KEY = 'parkview_creative_v2_history'
const BRIEF_CACHE_KEY = 'parkview_daily_brief_v2'

const OUTCOME_CARDS = [
  {
    id: 'meta-ad',
    title: 'New Meta Ad',
    description: 'Hook variants, copy, visual direction & A/B test plan',
    badge: 'Paid',
    badgeCls: 'badge-scale',
  },
  {
    id: 'reel-hook',
    title: 'Reel / TikTok Hook',
    description: '5 scroll-stopping hooks, full script, caption & performance notes',
    badge: 'Organic',
    badgeCls: 'badge-watch',
  },
  {
    id: 'email',
    title: 'Email Campaign',
    description: 'Subject lines, body copy in Parkview voice, CTA & send strategy',
    badge: 'Email',
    badgeCls: 'badge-refresh',
  },
  {
    id: 'ugc-script',
    title: 'UGC Creator Script',
    description: 'Word-for-word script, camera direction, coaching notes & B-roll list',
    badge: 'UGC',
    badgeCls: 'badge-pause',
  },
  {
    id: 'seasonal',
    title: 'Seasonal Campaign',
    description: 'Full concept, channel briefs, content calendar & KPIs',
    badge: 'Campaign',
    badgeCls: 'badge-scale',
  },
  {
    id: 'ab-test',
    title: 'A/B Test Variant',
    description: 'Hypothesis, variant brief, setup guide & decision framework',
    badge: 'Testing',
    badgeCls: 'badge-watch',
  },
]

const FORM_DEFAULTS = {
  'meta-ad': {
    box: 'Classic',
    audience: 'Families',
    objective: 'New subscriber acquisition',
    keyMessage: '',
    performanceContext: '',
  },
  'reel-hook': {
    productMoment: '',
    emotion: 'Curiosity',
    platform: 'Instagram Reels',
    length: '30s',
    tone: 'Raw and authentic',
  },
  email: {
    trigger: 'New subscriber welcome',
    segment: 'New subscribers under 30 days',
    hasOffer: false,
    offerDetail: '',
    desiredAction: 'Stay subscribed',
  },
  'ugc-script': {
    creatorType: 'Customer/real subscriber',
    productMoment: '',
    proofPoint: 'Taste and quality',
    platform: 'Instagram Reels',
    hookStyle: 'Testimony',
  },
  seasonal: {
    season: 'Summer BBQ',
    product: '',
    offerStructure: '',
    length: '2 weeks',
    channels: 'All Channels',
  },
  'ab-test': {
    existingAd: '',
    testing: 'Hook/opening',
    currentPerformance: '',
    hypothesis: '',
    duration: '7 days',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK GENERATORS
// TODO: Replace each function body with a Claude API call
// Model: claude-sonnet-4-20250514
// System prompt: Define Creative Strategist role + full Parkview brand context
//   (third-generation Hawarden farm, Canterbury grass-fed, Canterbury Home Kill,
//    Big Chill logistics, Shopify/Recharge/Klaviyo stack, premium DTC positioning)
// User message: Inject competitor data + structured form inputs
// ═══════════════════════════════════════════════════════════════════════════════

function mockGenerateDailyBrief() {
  // TODO: Replace with Claude API call — pass competitor names, ask Claude to
  // synthesise ad library data into intelligence report for Parkview
  return {
    competitorPulse: {
      nz: [
        {
          name: 'Silver Fern Farms Direct',
          activeAds: 8,
          newThisWeek: 4,
          formats: ['Video', 'Collection', 'Carousel'],
          hooks: [
            "New Zealand's most trusted beef, delivered.",
            'Farm-fresh quality without the supermarket markup.',
            'Premium NZ grass-fed — straight to your door.',
            'Real farms. Real people. Real flavour.',
          ],
          alert:
            'Most active competitor this week. 4 new ads suggest a product push. Heavy Collection format investment.',
        },
        {
          name: 'The Meat Box NZ',
          activeAds: 6,
          newThisWeek: 3,
          formats: ['Video', 'Carousel', 'Image'],
          hooks: [
            'Skip the supermarket. Never look back.',
            'Quality you can actually taste.',
            'Your weekly shop, sorted.',
          ],
          alert:
            "3 new ads all using 'skip the supermarket' framing — repositioning against Pak'nSave pricing.",
        },
        {
          name: 'Ourcow',
          activeAds: 4,
          newThisWeek: 2,
          formats: ['Video', 'Image'],
          hooks: [
            'You know this cow. You know this farm.',
            "Canterbury's freshest beef, farm to door in 48 hours.",
          ],
          alert: 'Two new provenance ads with direct Canterbury geographic overlap. Monitor closely.',
        },
        {
          name: 'Neat Meat NZ',
          activeAds: 3,
          newThisWeek: 1,
          formats: ['Video', 'Image'],
          hooks: ['No nasties. Just honest meat.', 'Clean eating starts with clean sourcing.'],
          alert: null,
        },
        {
          name: 'Green Meadows Beef',
          activeAds: 2,
          newThisWeek: 0,
          formats: ['Image'],
          hooks: ['Grass-fed, free-range, always.'],
          alert: null,
        },
        {
          name: 'Greenlea Butcher NZ',
          activeAds: 1,
          newThisWeek: 0,
          formats: ['Image'],
          hooks: ['Master butchers since 1981.'],
          alert: null,
        },
      ],
      international: [
        {
          name: 'Butcher Crowd',
          activeAds: 7,
          newThisWeek: 3,
          formats: ['Video', 'UGC Video', 'Carousel'],
          hooks: [
            'Meet the farmer behind your meat.',
            "This is Tom. His cattle have never seen a feedlot.",
            'We drove 6 hours to meet this farmer. Worth every kilometre.',
          ],
          alert:
            "3 new 'meet the farmer' videos in 7 days. Format gaining traction — brief a Parkview version before saturation.",
        },
        {
          name: 'Butcher Box',
          activeAds: 12,
          newThisWeek: 5,
          formats: ['Video', 'UGC Video', 'Static Image', 'Collection'],
          hooks: [
            "The best meat you've ever cooked. Guaranteed.",
            "Your family deserves better than the freezer section.",
            'This is what real beef looks like.',
          ],
          alert: 'Most aggressive tester in category. 5 simultaneous variants, heavy UGC investment.',
        },
        {
          name: 'Crowd Cow',
          activeAds: 9,
          newThisWeek: 2,
          formats: ['Video', 'Carousel', 'Image'],
          hooks: [
            "Not all grass-fed is equal. Here's the difference.",
            "The wagyu you've been mispronouncing.",
          ],
          alert:
            "Educational 'not all X is equal' hook structure appearing consistently — high CTR signals.",
        },
      ],
    },
    fatigueAlerts: [
      {
        adName: 'Classic Box — Spring Launch',
        severity: 'critical',
        metrics: { frequency: 4.2, ctr: '1.3%', daysRunning: 14 },
        reason:
          'CTR declined from 2.1% to 1.3% over 14 days. Frequency at 4.2 — your audience has seen this ad too many times.',
        action: 'Brief a new hook variant immediately using Outcome Card 1.',
      },
      {
        adName: '"Farm to Door" Video',
        severity: 'warning',
        metrics: { hookRate: '14%', daysRunning: 9 },
        reason:
          "Hook rate dropped to 14% (down from 22% at launch). Opening shot isn't stopping the scroll in current feed environment.",
        action: 'Test a new hook opening — close-up of the cut before the farm reveal.',
      },
      {
        adName: 'BBQ Box — Summer Carousel',
        severity: 'watch',
        metrics: { roas: '2.7x', trend: 'declining', daysRunning: 6 },
        reason: 'ROAS trending down 3 days in a row: 3.8x → 3.1x → 2.7x. Not critical yet.',
        action: 'Pull current frequency. If above 3.0, begin briefing a replacement.',
      },
    ],
    trends: [
      {
        title: '"Meet the farmer" format taking hold across AU/NZ',
        detail:
          "Butcher Crowd launched 3 farmer-led videos this week. Ourcow has 2 provenance ads running. This format builds the trust that converts premium-priced subscriptions — but it has a 3–4 week saturation window before it feels expected.",
        relevance:
          "Parkview has a stronger farm story than any of these competitors. Hawarden, third generation, Canterbury Home Kill — this format is yours to own. Brief it before someone else defines it.",
      },
      {
        title: 'Educational "not all X is equal" hooks converting well',
        detail:
          "Crowd Cow's educational framing is consistent across multiple formats. Teaching audiences the difference between grass-fed and grain-finished is converting in the premium tier.",
        relevance:
          "A Parkview version: 'Not all grass-fed beef is Canterbury grass-fed beef.' Your geographic specificity is the differentiator. Lean into it.",
      },
      {
        title: "'Skip the supermarket' positioning intensifying",
        detail:
          "The Meat Box NZ has gone all-in with 3 new anti-supermarket ads this week. Price comparison is becoming a consumer trigger in NZ's cost-of-living environment.",
        relevance:
          "Don't compete here. Parkview is premium — counter-position as 'not an alternative to the supermarket, a different category entirely.'",
      },
    ],
    actions: [
      {
        priority: 1,
        action: "Brief a 'Meet the Farmer' video ad featuring the Hawarden property",
        rationale:
          "Butcher Crowd has 3 running. Ourcow has 2. Your farm story — third generation, Hawarden, Canterbury Home Kill — is more authentic than either. Brief it today before the format saturates in 3–4 weeks.",
        cardId: 'meta-ad',
      },
      {
        priority: 2,
        action: 'Replace the Classic Box — Spring Launch ad immediately',
        rationale:
          'Frequency 4.2, CTR declining. Every day it runs without replacement, CPA rises. Use Outcome Card 1 — set objective to Retargeting warm audience given current frequency level.',
        cardId: 'meta-ad',
      },
      {
        priority: 3,
        action: "Counter-position against Silver Fern's broad NZ provenance push",
        rationale:
          "Silver Fern launched 4 new ads this week — their highest weekly activity. Their hooks are generic NZ provenance. Parkview's Canterbury-specificity is a direct advantage. Brief: 'We know the exact paddock.'",
        cardId: 'meta-ad',
      },
    ],
    inspiration: [
      {
        brand: 'Patagonia',
        reference: '"Don\'t Buy This Jacket" — 2011 Black Friday campaign',
        principle: 'Radical honesty as a scroll-stopper',
        application:
          "Parkview version: 'We're more expensive than the supermarket. Here's exactly why.' Leading with the objection and answering it builds more trust than avoiding the price conversation. Subverts expectations — high hook rate, high quality audience.",
      },
      {
        brand: 'Athletic Greens (AG1)',
        reference: 'Daily ritual framing across all channels',
        principle: 'Subscription as identity, not transaction',
        application:
          "AG1 never sells a supplement — they sell 'the person who takes care of themselves every morning.' Apply to Parkview: you're not selling a meat box, you're selling the person who knows where their food comes from. The fortnightly delivery becomes a ritual, not a purchase. This framing commands premium pricing and reduces churn.",
      },
    ],
  }
}

function mockGenerateMetaAd(inputs) {
  // TODO: Replace with Claude API call
  const boxContext = {
    Classic: 'the everyday staple — mince, sausages, a roasting cut, something for the grill',
    BBQ: 'the entertainer — built for the grill, summer occasions, show-stopping cuts',
    Premium: 'the connoisseur — the cuts that make people ask "where did you get this?"',
    Lamb: 'the Canterbury original — spring lamb, slow-cook cuts, a more considered choice',
    'Custom Builder':
      'complete autonomy — they built it themselves, which means they already know what they want',
    'Subscription General':
      'the subscription concept itself — the habit, the ritual, the relationship with provenance',
  }[inputs.box] || 'the Parkview subscription'

  return {
    strategicAngle: `The ${inputs.box} Box occupies a specific emotional territory for ${inputs.audience}: it's not a grocery purchase, it's a statement about what kind of household they run. This campaign leans into ${inputs.objective.toLowerCase()} by anchoring the provenance story — Hawarden, Canterbury, third generation — as the rational proof point. The emotional trigger is ${inputs.audience === 'Gift Buyers' ? 'giving something worth explaining' : inputs.audience === 'Health-Conscious Professionals' ? "knowing exactly what you're eating" : 'pride of sourcing'}.\n\nThe ${inputs.box} Box is ${boxContext}. Write to that.${inputs.keyMessage ? `\n\nClient direction: "${inputs.keyMessage}" — honour this in the hooks and copy.` : ''}${inputs.performanceContext ? `\n\nPerformance context: ${inputs.performanceContext} — factor into hook selection.` : ''}`,
    hooks: [
      {
        text: '"This paddock is 40 minutes from Christchurch. The beef in your box comes from right here."',
        note: "Geographic specificity as credibility. Forces a pause — they've never had this connection with their supermarket meat. Best for cold audiences unfamiliar with Parkview.",
        hookRateTarget: '22–28%',
      },
      {
        text: "\"Most people don't know where their beef came from. You're about to.\"",
        note: "Identity-based hook. Creates curiosity and positions the viewer as someone who cares more than average. Lower scroll-stop but higher quality engagement — attracts the right buyer.",
        hookRateTarget: '18–22%',
      },
      {
        text: '"We process everything through Canterbury Home Kill. Ask your supermarket who processed theirs."',
        note: 'Bold provenance challenge. High scroll-stop due to confrontational tone. Best for cold audiences already in a premium food or health-conscious mindset.',
        hookRateTarget: '25–32%',
      },
    ],
    bodyCopy:
      'HOOK (0–3s): Lead with the strongest hook above based on audience temperature.\n\nAGITATION (3–8s):\n"You already know supermarket meat doesn\'t cut it. You\'ve tasted the difference — the colour, the texture, the way it cooks."\n\nPROOF (8–15s):\n"Third-generation farm. Hawarden, Canterbury. Grass-fed on Canterbury pasture year-round. Processed locally through Canterbury Home Kill. Delivered via Big Chill — in your fridge within 48 hours of processing."\n\nOFFER BRIDGE (15–20s):\n"Starting from [price]. Fortnightly or monthly. Pause or skip anytime."\n\nCTA (final 3s):\n"Build your first box."',
    cta: '"Build your first box" — active, personalised, lower friction than "Subscribe now." Pairs with a landing page showing the box builder UI. If gifting objective: "Give the box" — not "Buy a gift."',
    audienceInsight: `${inputs.audience} respond to proof of sourcing, not claims of quality. Every premium food brand claims "quality" — it means nothing. Specific details (paddock location, processing facility, farm generation) bypass the scepticism filter. The psychological trigger is verification — they want to be able to tell someone exactly where their meat came from.`,
    visualDirection:
      'OPENING: Aerial or wide paddock shot, Hawarden landscape, golden hour light. Do not open on a person.\n\nCUT TO: Close-up of the cut on a preparation board — show texture and marbling before cooking.\n\nBUTCHER SEQUENCE: Hands, not faces. The craft. Canterbury Home Kill, not a factory floor.\n\nBOX REVEAL: The Parkview box arriving at a real door — not staged, not a studio. Real context.\n\nPRODUCT CLOSE: A final cooked shot, minimal styling, real meal context. Cast iron or oven-blackened tray.\n\nCOLOUR GRADE: Warm, slightly desaturated, never oversaturated. Parkview bone/near-black palette throughout. Avoid studio white.',
    abTestSuggestion:
      'Run Hook 1 ("This paddock is 40 minutes") against Hook 3 (Canterbury Home Kill challenge) to the same cold audience. All other elements identical — same body, same CTA, 50/50 budget split. Primary metric: hook rate at 72 hours. Run minimum 5 days before calling. If Hook 3 converts lower volume but higher ROAS, allocate 70% to Hook 3.',
  }
}

function mockGenerateReelHook(inputs) {
  // TODO: Replace with Claude API call
  return {
    hooks: [
      {
        text: '"This is what $18 of Countdown beef looks like. And this is what $18 of Parkview beef looks like. Spot the difference."',
        note: 'Comparison hook. Visual-dependent — the colour and texture difference does the work. Strong on Reels where visual contrast dominates the first frame.',
      },
      {
        text: "\"I used to think I didn't like cooking. Then I realised the problem was the meat.\"",
        note: 'Relatable problem-solution. First-person UGC tone. No brand mention in first 3 seconds — algorithm-friendly. Works for any product moment.',
      },
      {
        text: '"Canterbury grass-fed beef. 48 hours from paddock to your fridge. Watch."',
        note: 'Credibility-first. Direct and confident. Best for warm audiences who already know the category. "Watch." creates obligation to continue.',
      },
      {
        text: '"POV: your partner asks where the beef came from and you actually know the answer."',
        note: 'Identity and social currency. Light humour, shareable. Lower conversion intent but high share rate builds organic reach.',
      },
      {
        text: `"The ${inputs.productMoment || 'box'} arrived this morning. Let me show you what's inside."`,
        note: "Anticipation hook. Simple, authentic, works best for unboxing-first UGC. Algorithm rewards the dwell time from unboxing reveals — hold rate typically strong.",
      },
    ],
    openingShot:
      "Start on the product — the cut of meat on a board or still inside the box, before any movement. Do not open on a face or a wide shot. Let the product earn the first second. Movement begins on cut 2. The auto-play thumbnail frame should be your highest-contrast product shot.",
    audioDirection: `${inputs.platform === 'TikTok' || inputs.platform === 'Both' ? "TikTok: if using trending audio, select from agricultural/country-adjacent trends. For brand safety, lo-fi instrumental is safer than trending audio (licensing risk).\n\n" : ''}Reels: lo-fi instrumental — warm, slightly rough, not polished. Avoid over-produced tracks that read as "brand video." Voiceover should be natural, slightly slower than you think — scripts read faster in your head than on screen.${inputs.tone === 'Raw and authentic' ? '\n\nDo not correct every breath or pause in the edit — the imperfection signals authenticity.' : inputs.tone === 'Polished and premium' ? '\n\nClean audio, no background noise. Consider professional voiceover if creator audio quality is not broadcast-level.' : ''}`,
    fullScript: `HOOK (0–3s)\n"${inputs.productMoment ? `The Parkview ${inputs.productMoment} just arrived. Let me show you what's inside.` : "Canterbury grass-fed beef. 48 hours from paddock to your fridge. Watch."}"\n\nBODY (3–${inputs.length === '15s' ? '12' : inputs.length === '30s' ? '25' : '50'}s)\n"[Show ${inputs.productMoment || 'box'} — product first, context second]\nSo we've got the ribeye — look at that marbling — and the mince, the lamb shoulder for slow-cooking Sunday, and the sausages.\n[Hold up one cut to camera]\nAll Canterbury-raised. All grass-fed. All processed through Canterbury Home Kill — butchered the old way, not on a factory line.\n[Show colour of the cut]\nThis is what the difference looks like before it even hits the pan."\n\nCTA (final 3–5s)\n"First box link in bio. Build your own or choose a curated box — fortnightly or monthly."`,
    captionCopy:
      'Got our Parkview box today 🥩 Canterbury grass-fed, straight from a third-generation Hawarden farm. The ribeye is going on the cast iron tonight.\n\nFirst box link in bio — build your own or choose a curated box. Fortnightly or monthly.\n\n#ParkviewMeats #FarmToFork #NZBeef #CanterburyBeef #GrassFed #MeatSubscription #NZFood #PaddockToPlate',
    performanceNote:
      "Watch hook rate at 24 and 72 hours.\n\n— Below 15%: opening isn't stopping the scroll. Test a new first frame before adjusting anything else.\n— Strong hook but sharp drop at 8–10s: the transition from opening to explanation is losing people. Tighten the middle.\n— Good hold but poor conversion: CTA isn't landing. Test 'Build your first box' vs 'Start your subscription' on the link-in-bio page.\n— Strong on Reels, weak on TikTok: brief a separate native TikTok version — the tone/format isn't translating.",
  }
}

function mockGenerateEmail(inputs) {
  // TODO: Replace with Claude API call
  const triggerNote = {
    'New subscriber welcome':
      "This is someone who just made a meaningful decision. The job of this email is to confirm that decision was right.",
    'Post-purchase':
      "They bought. Now make them feel the full weight of what that means — the farm, the provenance, the care.",
    'Win-back lapsed':
      "They left. This email doesn't beg. It reminds them of what they were enjoying and removes the friction to return.",
    'Referral push':
      "High LTV subscribers who refer others are your most valuable asset. Treat them as insiders, not recipients.",
    'Box reveal/delivery':
      "They're about to receive something. Build the anticipation. Make the box feel like an event.",
    'Seasonal/campaign':
      "There's a moment in time — lean into it. This email is timely, specific, and limited.",
  }[inputs.trigger] || ''

  return {
    subjectLines: [
      {
        line:
          inputs.trigger === 'New subscriber welcome'
            ? "Welcome to Parkview. Here's what you just signed up for."
            : inputs.trigger === 'Win-back lapsed'
              ? "We missed you. The farm didn't stop."
              : inputs.trigger === 'Box reveal/delivery'
                ? "Your box is on its way from Hawarden"
                : "Something worth knowing about your next box",
        note: 'Direct, confidence-forward. No question marks, no exclamation points. Premium brands inform — they don\'t ask. Highest open rate for engaged subscribers.',
      },
      {
        line:
          inputs.trigger === 'New subscriber welcome'
            ? "Third-generation farming. One subscription. Here's how this works."
            : inputs.trigger === 'Win-back lapsed'
              ? "The paddock's still there. So is your box."
              : "Not every cut earns the Parkview name. Yours did.",
        note: "Curiosity + identity. Opens a loop that only the email closes. Works for subscribers with 2+ purchases who have brand familiarity.",
      },
      {
        line:
          inputs.trigger === 'New subscriber welcome'
            ? "The honest reason we're more expensive than Countdown"
            : inputs.trigger === 'Win-back lapsed'
              ? "A genuine note from the farm — not a discount code"
              : "What Canterbury looks like right now",
        note: "Radical honesty framing. Subverts expectations — most brands avoid the price conversation. This one leans in. Best for cold or re-engagement sends.",
      },
    ],
    previewText:
      "Third-generation farming, Canterbury-raised, straight to your door. Here's what that actually means.",
    bodyContent: `Hi [First Name],\n\n${triggerNote}\n\n${
      inputs.trigger === 'New subscriber welcome'
        ? "Your first box is being prepared on the Hawarden farm right now.\n\nHere's what to expect:\n\n— Your cuts are grass-fed on Canterbury pasture year-round. The farm has been in the family for three generations. They've never used feedlots.\n— Everything is processed through Canterbury Home Kill — butchered the old way, not on a factory line. The difference shows up in texture and colour when you open the box.\n— Delivery is via Big Chill Distribution. Your box ships cold and arrives cold.\n\nWhat to cook first: start with the [featured cut]. Cook it simply — this meat doesn't need much help.\n\nTill next delivery,\nMatt and the Parkview team\n\nP.S. If you ever want to adjust your box, swap cuts, or change your cadence — you can do it all in your subscriber portal."
        : inputs.trigger === 'Win-back lapsed'
          ? "It's been [X days] since your last box. We haven't changed anything — same farm, same Hawarden paddocks, same Canterbury Home Kill processing.\n\nIf something felt off about the last box, we'd genuinely like to know.\n\nYour subscription is paused, not cancelled. One click to restart:\n\n[Restart my subscription →]\n\nEither way,\nMatt and the Parkview team"
          : "Your box ships from Hawarden [date]. Estimated delivery: [date].\n\nWhat's inside this one:\n[Box contents from Recharge]\n\nFeatured cut this fortnight: [cut name]\n[One paragraph on what makes this cut special right now.]\n\nTill next delivery,\nMatt and the Parkview team"
    }`,
    ctaText:
      inputs.trigger === 'New subscriber welcome'
        ? 'Meet the farm →'
        : inputs.trigger === 'Win-back lapsed'
          ? 'Restart my subscription →'
          : inputs.desiredAction === 'Refer a friend'
            ? 'Share Parkview with a friend →'
            : 'View your account →',
    sendTime:
      inputs.trigger === 'Box reveal/delivery'
        ? '2–4 hours before scheduled delivery window. Highest open rates for delivery-triggered emails are 8–10am NZST.'
        : inputs.trigger === 'New subscriber welcome'
          ? 'Send immediately on signup confirmation. Welcome emails have a 70%+ open rate in the first hour — it drops sharply after 24 hours.'
          : 'Tuesday or Wednesday, 8am NZST. Avoid Monday (high inbox competition) and Thursday–Friday (pre-weekend distraction).',
    followUp: `If no open within 24 hours: resend with Subject Line 3 (radical honesty framing) to non-openers. Change preview text to: "It's not what you think — read this." Wait 3 days before any further contact to avoid unsubscribe pressure.`,
  }
}

function mockGenerateUGCScript(inputs) {
  // TODO: Replace with Claude API call
  return {
    script: `HOOK (0–3 seconds)\n[Creator holds up raw cut — tight close-up]\nCREATOR: "Ok I need to talk about this beef. Because I've been a subscriber for [X] months and I still get excited when the box arrives."\n\nBODY (3–35 seconds)\n[Cut to box on kitchen bench]\nCREATOR: "So this is the Parkview box — third-generation farm in Hawarden, Canterbury. Everything in here is grass-fed and processed through Canterbury Home Kill, which basically means it's butchered the old way, not on a factory line."\n\n[Pick out the ${inputs.productMoment || '[featured cut]'}]\nCREATOR: "This is the ${inputs.productMoment || '[cut name]'} — [observation: colour, marbling, texture]. Before I found Parkview I thought [common assumption]. Turns out that's not what it's supposed to look like."\n\n[Cook sequence — fast cut, show the sear]\n\n[Reaction shot — genuine first bite]\nCREATOR: "Ok. That. Right there. That's what a proper Sunday cook is supposed to taste like."\n\nCTA (35–45 seconds)\nCREATOR: "First box link in my bio. Build your own or pick a curated box. Fortnightly or monthly — I'm monthly. It's one of those subscriptions I genuinely couldn't cancel."`,
    cameraDirection:
      "SHOT 1 (Hook): Tight close-up on the raw cut. Hold focus for 2 full seconds before creator speaks. Handheld, slightly imperfect — this is not a brand shoot.\n\nSHOT 2 (Box open): Overhead or 45-degree angle on bench. Real kitchen, not staged. A dish in the background is fine — it builds credibility.\n\nSHOT 3 (Cut reveal): Back to tight close-up. Give the product its moment.\n\nSHOT 4 (Cook sequence): 3–4 fast cuts. Cast iron preferred. Include the sear sound — it's an emotional trigger. Do not cut the audio over the sizzle.\n\nSHOT 5 (Reaction): Medium close-up, natural light. No forced smile. Let the food do the work.",
    creatorNotes:
      "This script is a framework, not a word-for-word read. Memorise the beats, then say it in your own voice. The goal: someone who knows you watches this and thinks 'yes, that's exactly how [name] talks.'\n\nDO NOT:\n— Read off a screen or teleprompter\n— Use 'I partnered with' language in the video (disclose in caption per ASA guidelines)\n— Over-style the food — cook it how you'd actually cook it\n— Add background music in your edit — Parkview handles audio in post\n— Force enthusiasm — if the food is good, that shows naturally\n\nDO:\n— Film in a real kitchen\n— Use your actual reaction to the food\n— Say 'Hawarden, Canterbury' at least once — this is the brand differentiator\n— Leave in one natural pause — it reads as genuine",
    bRoll: [
      'Tight shot: raw cut on board (texture, marbling, colour visible)',
      'Tight shot: box contents laid out on bench — overhead, unstyled but intentional',
      'Medium shot: hand opening the Parkview box (show lid and packaging)',
      'Tight shot: the sear in cast iron — show colour development (keep audio)',
      'Tight shot: cross-section or plated final dish',
      'Wide shot: kitchen table meal context — real meal, real people if available',
    ],
    captionCopy: `Honestly didn't expect to be this invested in where my beef comes from, and yet here we are 😅\n\nParkview Meats — third-gen farm in Hawarden, Canterbury. Everything grass-fed, processed locally. ${inputs.productMoment || '[Featured cut]'} tonight.\n\nFirst box link in bio. #ParkviewMeats #ad #NZFood #GrassFedBeef #CanterburyBeef #FarmToFork`,
  }
}

function mockGenerateSeasonalCampaign(inputs) {
  // TODO: Replace with Claude API call
  const seasonMeta = {
    'Spring Lamb Launch': { emotion: 'renewal and anticipation', urgency: 'seasonal window' },
    'Summer BBQ': { emotion: 'celebration and gathering', urgency: 'peak grill season' },
    'Autumn Slow Cook': { emotion: 'comfort and ritual', urgency: 'the return to the kitchen' },
    'Mid-Winter Special': { emotion: 'warmth and nourishment', urgency: 'mid-year moment' },
    "Father's Day": { emotion: 'appreciation and recognition', urgency: '3-week date-driven window' },
    'Christmas Gifting': { emotion: 'generosity and the premium gift', urgency: 'competitive window — start early' },
    'New Year Health Push': { emotion: 'resolution and optimism', urgency: 'capture before the resolution fades' },
  }[inputs.season] || { emotion: 'seasonal relevance', urgency: 'timely opportunity' }

  return {
    concept: `"${inputs.season}" is a window, not a moment. This campaign runs ${inputs.length} and centres on the proposition that seasonal food is better when it comes from somewhere specific. For Parkview, that specificity is Canterbury.\n\nEmotional territory: ${seasonMeta.emotion}. The urgency is genuine — ${seasonMeta.urgency}.${inputs.offerStructure ? `\n\nOffer structure: ${inputs.offerStructure}. Use this as a conversion tool, not a headline — lead with the story, offer as the CTA.` : ''}\n\nThe campaign doesn't sell a discount. It sells a time to try it.`,
    name: inputs.season.includes('BBQ')
      ? 'The Canterbury Grill Season'
      : inputs.season.includes("Father's")
        ? 'For the One Who Cooks'
        : inputs.season.includes('Spring Lamb')
          ? 'The First Lamb of Spring'
          : inputs.season.includes('Christmas')
            ? 'The Parkview Gift Box'
            : 'Canterbury. In Season.',
    tagline: inputs.season.includes('BBQ')
      ? 'The best BBQ starts at the paddock.'
      : inputs.season.includes("Father's")
        ? 'He knows good meat. Give him great.'
        : inputs.season.includes('Spring Lamb')
          ? 'Canterbury spring lamb. One season. Worth it.'
          : 'This season. This provenance.',
    metaAdBriefs: [
      {
        angle: 'Provenance + Season',
        brief: `Open on Canterbury landscape in season. Cut to the box. "This season, you know where it came from." Target: cold NZ audience, homeowners 28–50. Hook rate target: 22%+.`,
      },
      {
        angle: inputs.season.includes("Father's") || inputs.season.includes('Christmas') ? 'Gift occasion' : 'Subscription ritual',
        brief:
          inputs.season.includes("Father's") || inputs.season.includes('Christmas')
            ? `Position the box as the gift that's different. Show a real unboxing — reaction first. "The gift they'll actually use. Every month." Retargeting angle for past site visitors.`
            : `Show the subscriber habit in this season. "The routine that makes [season] better." Best for warm audience retargeting.`,
      },
      {
        angle: 'Social proof',
        brief: `Subscriber testimonial with seasonal context. "I've been with Parkview for three years and this is my favourite time of year for the box." UGC feel, warm audience. Run at 30% of total budget alongside the provenance ad.`,
      },
    ],
    emailSequence: [
      {
        timing: 'Campaign launch (Day 1)',
        subject: `The ${inputs.season} box is here`,
        preview: `Canterbury-raised and in-season. Here's what's inside this one.`,
      },
      {
        timing: 'Mid-campaign',
        subject: `Still haven't tried the ${inputs.season} box?`,
        preview: `Here's what you're missing — and why it matters right now.`,
      },
      {
        timing: 'Campaign close (2 days before end)',
        subject: `Last chance — the ${inputs.season} box closes [date]`,
        preview: `This one's seasonal. Once it's gone, it's gone.`,
      },
    ],
    organicThemes: [
      `Farm footage: what's happening on the Hawarden property right now`,
      `Behind the scenes: seasonal cut selection — what the butcher is choosing and why`,
      `Recipe content: 3 recipes specific to the seasonal box — simple, real, Parkview kitchen`,
      `Subscriber reshares: repost real unboxings and cook photos from this campaign period`,
    ],
    kpis: [
      { metric: 'New subscriber acquisitions', target: 'Baseline + 15% lift vs prior equivalent period', reviewAt: 'Day 7' },
      { metric: 'Campaign ROAS (Meta)', target: '3.0x minimum, 4.0x target', reviewAt: 'Day 5' },
      { metric: 'Email open rate', target: '32%+ subscribers, 18%+ lapsed', reviewAt: 'Day 3 post-send' },
      { metric: 'Video hook rate', target: '20%+ — if below, brief new opening shot immediately', reviewAt: '72h post-launch' },
    ],
    reviewNote: `Day 5 review: if Meta ROAS below 2.5x, pause lowest performer and redistribute budget. If email open rate below 20%, resend with Subject Line 3 variant to non-openers. If organic is generating saves, brief more of that format — algorithm signal worth chasing.`,
  }
}

function mockGenerateABTest(inputs) {
  // TODO: Replace with Claude API call
  const primaryMetric = {
    'Hook/opening': 'Hook rate (3-second video plays ÷ impressions)',
    Headline: 'CTR (link clicks ÷ impressions)',
    'CTA text': 'CTR combined with click-to-conversion rate',
    'Visual format': 'CPM + CTR together (reach efficiency vs engagement)',
    'Audience targeting': 'Cost per result (CPA)',
    'Offer or price point': 'Conversion rate + CPA',
  }[inputs.testing] || 'Cost per acquisition'

  return {
    hypothesis: `We believe that changing the ${inputs.testing.toLowerCase()} will improve ${primaryMetric.split(' (')[0].toLowerCase()} because ${inputs.hypothesis || '[hypothesis not provided — define what human behaviour you expect to change and why]'}.\n\nCurrent performance: ${inputs.currentPerformance || '[not provided — pull from Ads Manager before setting up]'}.\n\nSuccess threshold: >15% lift in ${primaryMetric.split(' (')[0].toLowerCase()} with 95% statistical confidence, sustained over ${inputs.duration || '7 days'}.`,
    variantBrief: `CONTROL (A):\n${inputs.existingAd || '[Describe the current control ad — paste creative details, headline, hook, CTA here]'}\n\nVARIANT (B):\nChange only: ${inputs.testing}\n\n${
      inputs.testing === 'Hook/opening'
        ? 'Variant hook: [Write a new opening 3 seconds — see Outcome Card 2 for hook frameworks]. First frame, first motion, and first spoken/written words all change. Body copy, CTA, and targeting are identical to Control.'
        : inputs.testing === 'CTA text'
          ? 'Test one alternative CTA. If current is "Subscribe now" → test "Build your first box." If "Shop now" → test "Start your subscription." Change only the button text and the spoken end-card CTA.'
          : `Variant: [Define the specific change to ${inputs.testing.toLowerCase()}]. All other elements remain identical to Control.]`
    }`,
    setupInstructions: `IN META ADS MANAGER:\n1. Duplicate the existing ad set\n2. Name Control: "[Ad Name] — A CONTROL — [today's date]"\n3. Name Variant: "[Ad Name] — B ${inputs.testing.toUpperCase()} TEST — [today's date]"\n4. Use Meta's native A/B test feature — split traffic 50/50. Do NOT do this manually.\n5. Set end date: ${inputs.duration || '7 days'} from today\n6. Primary metric in reporting: ${primaryMetric}\n7. DO NOT manually optimise, pause, or adjust budget during the test — you will contaminate the results\n8. DO NOT run other campaigns to the same audience during this window`,
    primaryMetric,
    sampleSize: `Minimum 50 conversion events per variant before making a decision. At typical DTC food CPMs in NZ, this takes ${inputs.duration || '5–7 days'} on a $50–100/day budget per variant.\n\nDo not call the test early based on ROAS alone — statistical noise at low sample sizes mimics real signals. The most common mistake is pausing a winning variant because it looks worse in the first 48 hours.`,
    decisionFramework: `VARIANT (B) WINS:\n${primaryMetric.split(' (')[0]} improvement >15% with 95% confidence → Scale variant, pause control, document learnings.\n\nCONTROL (A) WINS:\nControl outperforms at test end → Document what didn't work and why the hypothesis was incorrect.\n\nINCONCLUSIVE (<10% difference):\nAccept as equivalent or extend by ${inputs.duration || '7 days'} with doubled budget. Consider a more dramatic variant change — small iterations rarely move the needle enough to measure.\n\nEARLY STOP RULE:\nIf one variant is >40% worse at 48 hours, pause it to protect budget. Do NOT pause early for positive performance — the algorithm needs time to optimise delivery.`,
  }
}

const GENERATORS = {
  'meta-ad': mockGenerateMetaAd,
  'reel-hook': mockGenerateReelHook,
  email: mockGenerateEmail,
  'ugc-script': mockGenerateUGCScript,
  seasonal: mockGenerateSeasonalCampaign,
  'ab-test': mockGenerateABTest,
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ChevronIcon({ open, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function CopyButton({ getText, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const text = getText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="btn-outline text-xs px-3 py-1">
      {copied ? 'Copied!' : label}
    </button>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select className="select-field" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, hint, rows }) {
  return (
    <div>
      <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-1.5">
        {label}
        {hint && <span className="ml-1 font-normal normal-case text-near-black/30">— {hint}</span>}
      </label>
      {rows ? (
        <textarea
          className="input-field resize-none"
          style={{ height: `${rows * 1.75}rem` }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

// Brief output section block
function BriefBlock({ title, content, mono = false }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">{title}</p>
      {typeof content === 'string' ? (
        <p className={`text-sm text-near-black/80 leading-relaxed whitespace-pre-line ${mono ? 'font-mono text-xs' : ''}`}>
          {content}
        </p>
      ) : (
        content
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY BRIEF — SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function CollapsibleSection({ title, number, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-brass/15">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left py-4 group"
      >
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 flex items-center justify-center border border-brass/30 text-xs font-cormorant font-semibold text-brass flex-shrink-0">
            {number}
          </span>
          <span className="font-cormorant text-lg font-semibold text-near-black group-hover:text-brass-dark transition-colors">
            {title}
          </span>
        </div>
        <span className="text-near-black/30">
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  )
}

function CompetitorCard({ competitor }) {
  return (
    <div className="bg-bone border border-brass/15 p-3 mb-2">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-near-black">{competitor.name}</span>
          {competitor.newThisWeek > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-brass/15 border border-brass/30 text-brass-dark font-medium">
              {competitor.newThisWeek} NEW
            </span>
          )}
        </div>
        <span className="text-xs text-near-black/40 flex-shrink-0 ml-2">
          {competitor.activeAds} active
        </span>
      </div>
      <div className="flex gap-1 flex-wrap mb-2">
        {competitor.formats.map((f) => (
          <span key={f} className="text-xs px-1.5 py-0.5 border border-brass/20 text-near-black/50 bg-bone">
            {f}
          </span>
        ))}
      </div>
      <div className="space-y-1 mb-2">
        {competitor.hooks.map((h, i) => (
          <p key={i} className="text-xs text-near-black/60 italic pl-2 border-l border-brass/20">
            "{h}"
          </p>
        ))}
      </div>
      {competitor.alert && (
        <p className="text-xs text-brass-dark bg-brass/8 border border-brass/20 px-2 py-1.5 mt-2">
          ↗ {competitor.alert}
        </p>
      )}
    </div>
  )
}

function CompetitorPulse({ data, hasToken }) {
  return (
    <div>
      {!hasToken && (
        <div className="bg-bone border border-brass/30 border-l-2 border-l-brass p-4 mb-4">
          <p className="text-sm font-medium text-near-black mb-1">Connect Meta Ad Library</p>
          <p className="text-xs text-near-black/55 mb-2">
            Add your Facebook User Access Token to see live competitor ad data. The rest of the brief works without it.
          </p>
          <p className="text-xs font-mono text-near-black/40">
            Add VITE_META_AD_LIBRARY_TOKEN to your .env file
          </p>
          <p className="text-xs text-near-black/35 mt-2">
            Below is a realistic mock showing what this section will look like when connected.
          </p>
        </div>
      )}
      <div className="mb-5">
        <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-3">
          NZ Competitors
        </p>
        {data.nz.map((c) => (
          <CompetitorCard key={c.name} competitor={c} />
        ))}
      </div>
      <div>
        <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-3">
          International Benchmarks
        </p>
        {data.international.map((c) => (
          <CompetitorCard key={c.name} competitor={c} />
        ))}
      </div>
    </div>
  )
}

function FatigueAlerts({ alerts }) {
  const severityConfig = {
    critical: { cls: 'badge-pause', label: 'Critical', border: 'border-l-red-400' },
    warning: { cls: 'badge-watch', label: 'Warning', border: 'border-l-amber-400' },
    watch: { cls: 'badge-refresh', label: 'Watch', border: 'border-l-blue-400' },
  }
  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity]
        return (
          <div key={alert.adName} className={`bg-bone border border-brass/15 border-l-2 ${config.border} p-4`}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-near-black">{alert.adName}</span>
              <span className={config.cls}>{config.label}</span>
            </div>
            <div className="flex gap-4 mb-2">
              {alert.metrics.frequency && (
                <span className="text-xs text-near-black/50">Frequency: <strong>{alert.metrics.frequency}</strong></span>
              )}
              {alert.metrics.ctr && (
                <span className="text-xs text-near-black/50">CTR: <strong>{alert.metrics.ctr}</strong></span>
              )}
              {alert.metrics.hookRate && (
                <span className="text-xs text-near-black/50">Hook rate: <strong>{alert.metrics.hookRate}</strong></span>
              )}
              {alert.metrics.roas && (
                <span className="text-xs text-near-black/50">ROAS: <strong className="text-red-600">{alert.metrics.roas}</strong></span>
              )}
              {alert.metrics.daysRunning && (
                <span className="text-xs text-near-black/50">Running: <strong>{alert.metrics.daysRunning} days</strong></span>
              )}
            </div>
            <p className="text-xs text-near-black/65 mb-2">{alert.reason}</p>
            <p className="text-xs text-brass-dark font-medium">→ {alert.action}</p>
          </div>
        )
      })}
    </div>
  )
}

function TrendObservations({ trends }) {
  return (
    <div className="space-y-4">
      {trends.map((trend, i) => (
        <div key={i} className="bg-bone border border-brass/15 p-4">
          <p className="text-sm font-medium text-near-black mb-2">{trend.title}</p>
          <p className="text-xs text-near-black/60 leading-relaxed mb-3">{trend.detail}</p>
          <p className="text-xs text-brass-dark font-medium border-t border-brass/15 pt-2 mt-2">
            Parkview relevance: {trend.relevance}
          </p>
        </div>
      ))}
    </div>
  )
}

function RecommendedActions({ actions, onCardSelect }) {
  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <div key={action.priority} className="bg-bone border border-brass/15 p-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 flex-shrink-0 border border-brass/40 flex items-center justify-center text-xs font-cormorant font-semibold text-brass mt-0.5">
              {action.priority}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-near-black mb-1">{action.action}</p>
              <p className="text-xs text-near-black/55 leading-relaxed mb-3">{action.rationale}</p>
              <button
                onClick={() => onCardSelect(action.cardId)}
                className="text-xs text-brass font-medium flex items-center gap-1.5 hover:text-brass-dark transition-colors"
              >
                Open Outcome Card
                <ArrowIcon />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function InspirationSwipe({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="bg-bone border border-brass/15 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-cormorant text-base font-semibold text-near-black">{item.brand}</span>
            <span className="text-near-black/25">·</span>
            <span className="text-xs text-near-black/40 italic">{item.reference}</span>
          </div>
          <p className="text-xs font-medium text-brass-dark uppercase tracking-wider mb-2">
            Principle: {item.principle}
          </p>
          <p className="text-xs text-near-black/65 leading-relaxed">{item.application}</p>
        </div>
      ))}
    </div>
  )
}

// ─── DAILY BRIEF (main) ───────────────────────────────────────────────────────

function DailyBrief({ brief, loading, onRefresh, lastRefreshed, onCardSelect }) {
  const hasToken = Boolean(import.meta.env.VITE_META_AD_LIBRARY_TOKEN)

  return (
    <div className="card-brass-top mb-8">
      {/* Brief header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="font-cormorant text-2xl font-semibold text-near-black">Daily Standing Brief</h2>
          <p className="text-xs text-near-black/40 mt-0.5">
            Your morning orientation. Read it in 5 minutes. Know what to work on today.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {lastRefreshed && (
            <span className="text-xs text-near-black/30">
              Updated {lastRefreshed.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-outline text-xs px-3 py-1.5"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <p className="text-sm text-near-black/35">Generating brief...</p>
        </div>
      )}

      {!loading && brief && (
        <div className="mt-5">
          <CollapsibleSection number="1" title="Competitor Pulse">
            <CompetitorPulse data={brief.competitorPulse} hasToken={hasToken} />
          </CollapsibleSection>

          <CollapsibleSection number="2" title="Creative Fatigue Alerts">
            <FatigueAlerts alerts={brief.fatigueAlerts} />
          </CollapsibleSection>

          <CollapsibleSection number="3" title="Trend Observations">
            <TrendObservations trends={brief.trends} />
          </CollapsibleSection>

          <CollapsibleSection number="4" title="Today's Recommended Actions">
            <RecommendedActions actions={brief.actions} onCardSelect={onCardSelect} />
          </CollapsibleSection>

          <CollapsibleSection number="5" title="Inspiration Swipe">
            <InspirationSwipe items={brief.inspiration} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// OUTCOME CARD FORMS
// ═══════════════════════════════════════════════════════════════════════════════

function MetaAdForm({ inputs, onChange }) {
  const set = (k) => (v) => onChange({ ...inputs, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Box" value={inputs.box} onChange={set('box')}
        options={['Classic', 'BBQ', 'Premium', 'Lamb', 'Custom Builder', 'Subscription General']} />
      <SelectField label="Target Audience" value={inputs.audience} onChange={set('audience')}
        options={['Families', 'BBQ Enthusiasts', 'Health-Conscious Professionals', 'Gift Buyers', 'Rural/Farming Community', 'General NZ']} />
      <div className="col-span-2">
        <SelectField label="Campaign Objective" value={inputs.objective} onChange={set('objective')}
          options={['New subscriber acquisition', 'Retargeting warm audience', 'Reactivating lapsed subscribers', 'Gifting push']} />
      </div>
      <div className="col-span-2">
        <TextField label="Key Message or Angle" hint="optional" value={inputs.keyMessage} onChange={set('keyMessage')}
          placeholder="What do you want people to feel or believe?" />
      </div>
      <div className="col-span-2">
        <TextField label="Performance Context" hint="optional" value={inputs.performanceContext} onChange={set('performanceContext')}
          placeholder="e.g. last ad had strong hook rate but low conversion" />
      </div>
    </div>
  )
}

function ReelHookForm({ inputs, onChange }) {
  const set = (k) => (v) => onChange({ ...inputs, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <TextField label="Product or Story Moment" value={inputs.productMoment} onChange={set('productMoment')}
          placeholder="e.g. unboxing, cooking a ribeye, farm footage, fortnightly delivery" />
      </div>
      <SelectField label="Target Emotion" value={inputs.emotion} onChange={set('emotion')}
        options={['Curiosity', 'Hunger/craving', 'FOMO', 'Trust/credibility', 'Pride/identity', 'Humour']} />
      <SelectField label="Platform" value={inputs.platform} onChange={set('platform')}
        options={['Instagram Reels', 'TikTok', 'Both']} />
      <SelectField label="Desired Length" value={inputs.length} onChange={set('length')}
        options={['15s', '30s', '60s']} />
      <SelectField label="Tone" value={inputs.tone} onChange={set('tone')}
        options={['Raw and authentic', 'Polished and premium', 'Educational', 'Behind the scenes', 'Fast-paced and energetic']} />
    </div>
  )
}

function EmailForm({ inputs, onChange }) {
  const set = (k) => (v) => onChange({ ...inputs, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Campaign Trigger" value={inputs.trigger} onChange={set('trigger')}
        options={['New subscriber welcome', 'Post-purchase', 'Seasonal/campaign', 'Win-back lapsed', 'Referral push', 'Box reveal/delivery']} />
      <SelectField label="Subscriber Segment" value={inputs.segment} onChange={set('segment')}
        options={['All subscribers', 'New subscribers under 30 days', 'Lapsed over 60 days', 'High LTV subscribers', 'Gift purchasers']} />
      <div className="col-span-2">
        <SelectField label="Desired Action" value={inputs.desiredAction} onChange={set('desiredAction')}
          options={['Stay subscribed', 'Upgrade box', 'Refer a friend', 'Re-subscribe', 'Visit website']} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">
          Is there an offer?
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={!inputs.hasOffer} onChange={() => onChange({ ...inputs, hasOffer: false })}
              className="accent-brass" />
            <span className="text-sm text-near-black/70">No offer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={inputs.hasOffer} onChange={() => onChange({ ...inputs, hasOffer: true })}
              className="accent-brass" />
            <span className="text-sm text-near-black/70">Yes, include an offer</span>
          </label>
        </div>
        {inputs.hasOffer && (
          <div className="mt-3">
            <TextField label="Offer Detail" value={inputs.offerDetail} onChange={set('offerDetail')}
              placeholder="e.g. first box 20% off, free shipping, bonus add-on" />
          </div>
        )}
      </div>
    </div>
  )
}

function UGCScriptForm({ inputs, onChange }) {
  const set = (k) => (v) => onChange({ ...inputs, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Creator Type" value={inputs.creatorType} onChange={set('creatorType')}
        options={['Customer/real subscriber', 'Farmer/producer', 'Chef/cook', 'Fitness/health influencer', 'Family/lifestyle']} />
      <SelectField label="Platform" value={inputs.platform} onChange={set('platform')}
        options={['Instagram Reels', 'TikTok', 'YouTube Shorts']} />
      <div className="col-span-2">
        <TextField label="Product or Moment Being Featured" value={inputs.productMoment} onChange={set('productMoment')}
          placeholder="e.g. unboxing the Classic Box, cooking a ribeye, fortnightly delivery routine" />
      </div>
      <SelectField label="Key Proof Point to Land" value={inputs.proofPoint} onChange={set('proofPoint')}
        options={['Taste and quality', 'Farm provenance and ethics', 'Convenience and routine', 'Value vs supermarket', 'Unboxing experience']} />
      <SelectField label="Hook Style" value={inputs.hookStyle} onChange={set('hookStyle')}
        options={['Testimony', 'Problem-solution', 'Reaction/surprise', 'Day-in-the-life', 'Educational']} />
    </div>
  )
}

function SeasonalCampaignForm({ inputs, onChange }) {
  const set = (k) => (v) => onChange({ ...inputs, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectField label="Season or Moment" value={inputs.season} onChange={set('season')}
        options={['Spring Lamb Launch', 'Summer BBQ', 'Autumn Slow Cook', 'Mid-Winter Special', "Father's Day", 'Christmas Gifting', 'New Year Health Push']} />
      <SelectField label="Campaign Length" value={inputs.length} onChange={set('length')}
        options={['1 week', '2 weeks', '4 weeks']} />
      <div className="col-span-2">
        <TextField label="Box or Product Being Featured" hint="optional" value={inputs.product} onChange={set('product')}
          placeholder="e.g. Classic Box, BBQ Box, lamb shoulder focus" />
      </div>
      <div className="col-span-2">
        <TextField label="Offer Structure" hint="optional" value={inputs.offerStructure} onChange={set('offerStructure')}
          placeholder="e.g. first box 20% off, free shipping, bonus sausages" />
      </div>
      <div className="col-span-2">
        <SelectField label="Primary Channel Focus" value={inputs.channels} onChange={set('channels')}
          options={['All Channels', 'Meta Ads', 'Email', 'Organic Social']} />
      </div>
    </div>
  )
}

function ABTestForm({ inputs, onChange }) {
  const set = (k) => (v) => onChange({ ...inputs, [k]: v })
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <TextField label="Existing Ad" value={inputs.existingAd} onChange={set('existingAd')}
          placeholder="Describe or paste the current ad — hook, headline, CTA, format" rows={3} />
      </div>
      <SelectField label="What Are You Testing?" value={inputs.testing} onChange={set('testing')}
        options={['Hook/opening', 'Headline', 'CTA text', 'Visual format', 'Audience targeting', 'Offer or price point']} />
      <SelectField label="Test Duration" value={inputs.duration} onChange={set('duration')}
        options={['5 days', '7 days', '10 days', '14 days']} />
      <div className="col-span-2">
        <TextField label="Current Performance" hint="optional" value={inputs.currentPerformance} onChange={set('currentPerformance')}
          placeholder="e.g. 2.1% CTR, 1.8x ROAS, frequency 2.4" />
      </div>
      <div className="col-span-2">
        <TextField label="Your Hypothesis" value={inputs.hypothesis} onChange={set('hypothesis')}
          placeholder="What do you think will improve and why?" rows={2} />
      </div>
    </div>
  )
}

const FORM_COMPONENTS = {
  'meta-ad': MetaAdForm,
  'reel-hook': ReelHookForm,
  email: EmailForm,
  'ugc-script': UGCScriptForm,
  seasonal: SeasonalCampaignForm,
  'ab-test': ABTestForm,
}

// ═══════════════════════════════════════════════════════════════════════════════
// OUTPUT RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

function HookList({ hooks, showTarget = false }) {
  return (
    <div className="space-y-2">
      {hooks.map((hook, i) => (
        <div key={i} className="flex gap-3 bg-bone border border-brass/20 p-3">
          <span className="w-6 h-6 flex-shrink-0 border border-brass/30 flex items-center justify-center text-xs font-cormorant font-semibold text-brass">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-near-black font-medium italic mb-1">{hook.text}</p>
            {hook.note && <p className="text-xs text-near-black/55 mb-1">{hook.note}</p>}
            {showTarget && hook.hookRateTarget && (
              <p className="text-xs text-brass font-medium">Target hook rate: {hook.hookRateTarget}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function MetaAdOutput({ output }) {
  const copyText = [
    `STRATEGIC ANGLE\n${output.strategicAngle}`,
    `\nHOOKS\n${output.hooks.map((h, i) => `${i + 1}. ${h.text}\n   Note: ${h.note}\n   Target: ${h.hookRateTarget}`).join('\n\n')}`,
    `\nBODY COPY\n${output.bodyCopy}`,
    `\nCTA\n${output.cta}`,
    `\nAUDIENCE INSIGHT\n${output.audienceInsight}`,
    `\nVISUAL DIRECTION\n${output.visualDirection}`,
    `\nA/B TEST SUGGESTION\n${output.abTestSuggestion}`,
  ].join('')

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CopyButton getText={() => copyText} label="Copy brief" />
      </div>
      <BriefBlock title="Strategic Angle" content={output.strategicAngle} />
      <BriefBlock title="Hook Variants" content={<HookList hooks={output.hooks} showTarget />} />
      <BriefBlock title="Body Copy Structure" content={output.bodyCopy} mono />
      <BriefBlock title="CTA Recommendation" content={output.cta} />
      <BriefBlock title="Audience Insight" content={output.audienceInsight} />
      <BriefBlock title="Visual Direction" content={output.visualDirection} />
      <BriefBlock title="A/B Test Suggestion" content={output.abTestSuggestion} />
    </div>
  )
}

function ReelHookOutput({ output }) {
  const copyText = [
    `HOOKS\n${output.hooks.map((h, i) => `${i + 1}. ${h.text}\n   ${h.note}`).join('\n\n')}`,
    `\nOPENING SHOT\n${output.openingShot}`,
    `\nAUDIO DIRECTION\n${output.audioDirection}`,
    `\nFULL SCRIPT\n${output.fullScript}`,
    `\nCAPTION\n${output.captionCopy}`,
    `\nPERFORMANCE NOTES\n${output.performanceNote}`,
  ].join('')

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CopyButton getText={() => copyText} label="Copy brief" />
      </div>
      <BriefBlock title="Hook Options (First 3 Seconds)" content={<HookList hooks={output.hooks} />} />
      <BriefBlock title="Opening Shot" content={output.openingShot} />
      <BriefBlock title="Audio Direction" content={output.audioDirection} />
      <BriefBlock title="Full Script" content={output.fullScript} mono />
      <BriefBlock title="Caption Copy" content={output.captionCopy} />
      <BriefBlock title="Performance Notes" content={output.performanceNote} />
    </div>
  )
}

function EmailOutput({ output }) {
  const copyText = [
    `SUBJECT LINES\n${output.subjectLines.map((s, i) => `${i + 1}. ${s.line}\n   ${s.note}`).join('\n\n')}`,
    `\nPREVIEW TEXT\n${output.previewText}`,
    `\nBODY CONTENT\n${output.bodyContent}`,
    `\nCTA\n${output.ctaText}`,
    `\nSEND TIME\n${output.sendTime}`,
    `\nFOLLOW-UP STRATEGY\n${output.followUp}`,
  ].join('')

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CopyButton getText={() => copyText} label="Copy brief" />
      </div>
      <BriefBlock
        title="Subject Lines"
        content={
          <div className="space-y-3">
            {output.subjectLines.map((s, i) => (
              <div key={i} className="bg-bone border border-brass/20 p-3">
                <p className="text-sm font-medium text-near-black mb-1">{s.line}</p>
                <p className="text-xs text-near-black/50">{s.note}</p>
              </div>
            ))}
          </div>
        }
      />
      <BriefBlock title="Preview Text" content={output.previewText} />
      <BriefBlock title="Body Content" content={output.bodyContent} mono />
      <BriefBlock title="CTA Button Text" content={output.ctaText} />
      <BriefBlock title="Send Time Recommendation" content={output.sendTime} />
      <BriefBlock title="Follow-up Strategy" content={output.followUp} />
    </div>
  )
}

function UGCOutput({ output }) {
  const copyText = [
    `SCRIPT\n${output.script}`,
    `\nCAMERA DIRECTION\n${output.cameraDirection}`,
    `\nCREATOR COACHING NOTES\n${output.creatorNotes}`,
    `\nB-ROLL LIST\n${output.bRoll.map((b, i) => `${i + 1}. ${b}`).join('\n')}`,
    `\nCAPTION\n${output.captionCopy}`,
  ].join('')

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CopyButton getText={() => copyText} label="Copy brief" />
      </div>
      <BriefBlock title="Full Script" content={output.script} mono />
      <BriefBlock title="Camera Direction" content={output.cameraDirection} />
      <BriefBlock title="Creator Coaching Notes" content={output.creatorNotes} />
      <BriefBlock
        title="B-Roll Shot List"
        content={
          <ul className="space-y-1.5">
            {output.bRoll.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-near-black/75">
                <span className="w-4 h-4 flex-shrink-0 border border-brass/30 flex items-center justify-center text-xs text-brass mt-0.5">
                  {i + 1}
                </span>
                {b}
              </li>
            ))}
          </ul>
        }
      />
      <BriefBlock title="Caption Copy" content={output.captionCopy} />
    </div>
  )
}

function SeasonalOutput({ output }) {
  const copyText = [
    `CAMPAIGN CONCEPT\n${output.concept}`,
    `\nCAMPAIGN NAME: ${output.name}`,
    `TAGLINE: ${output.tagline}`,
    `\nMETA AD BRIEFS\n${output.metaAdBriefs.map((b) => `${b.angle}\n${b.brief}`).join('\n\n')}`,
    `\nEMAIL SEQUENCE\n${output.emailSequence.map((e) => `${e.timing}\nSubject: ${e.subject}\nPreview: ${e.preview}`).join('\n\n')}`,
    `\nORGANIC THEMES\n${output.organicThemes.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
    `\nKPIs\n${output.kpis.map((k) => `${k.metric}: ${k.target} (review at ${k.reviewAt})`).join('\n')}`,
    `\nREVIEW NOTE\n${output.reviewNote}`,
  ].join('')

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CopyButton getText={() => copyText} label="Copy brief" />
      </div>
      <div className="bg-bone border border-brass/20 p-4 mb-5">
        <p className="font-cormorant text-xl font-semibold text-near-black mb-0.5">{output.name}</p>
        <p className="text-sm text-brass-dark italic">"{output.tagline}"</p>
      </div>
      <BriefBlock title="Campaign Concept" content={output.concept} />
      <BriefBlock
        title="Meta Ad Briefs"
        content={
          <div className="space-y-3">
            {output.metaAdBriefs.map((b, i) => (
              <div key={i} className="bg-bone border border-brass/20 p-3">
                <p className="text-xs font-medium text-brass-dark uppercase tracking-wider mb-1">{b.angle}</p>
                <p className="text-sm text-near-black/75 leading-relaxed">{b.brief}</p>
              </div>
            ))}
          </div>
        }
      />
      <BriefBlock
        title="Email Sequence"
        content={
          <div className="space-y-2">
            {output.emailSequence.map((e, i) => (
              <div key={i} className="bg-bone border border-brass/20 p-3">
                <p className="text-xs text-near-black/40 mb-1">{e.timing}</p>
                <p className="text-sm font-medium text-near-black">{e.subject}</p>
                <p className="text-xs text-near-black/50 italic mt-0.5">{e.preview}</p>
              </div>
            ))}
          </div>
        }
      />
      <BriefBlock
        title="Organic Content Themes"
        content={
          <ul className="space-y-1.5">
            {output.organicThemes.map((t, i) => (
              <li key={i} className="text-sm text-near-black/75 flex items-start gap-2">
                <span className="text-brass mt-0.5">→</span> {t}
              </li>
            ))}
          </ul>
        }
      />
      <BriefBlock
        title="KPIs"
        content={
          <div className="space-y-2">
            {output.kpis.map((k, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-xs">
                <span className="text-near-black/70 font-medium">{k.metric}</span>
                <div className="text-right">
                  <span className="text-near-black/55 block">{k.target}</span>
                  <span className="text-near-black/35">Review at: {k.reviewAt}</span>
                </div>
              </div>
            ))}
          </div>
        }
      />
      <BriefBlock title="Review Note" content={output.reviewNote} />
    </div>
  )
}

function ABTestOutput({ output }) {
  const copyText = [
    `HYPOTHESIS\n${output.hypothesis}`,
    `\nVARIANT BRIEF\n${output.variantBrief}`,
    `\nSETUP INSTRUCTIONS\n${output.setupInstructions}`,
    `\nPRIMARY METRIC\n${output.primaryMetric}`,
    `\nSAMPLE SIZE NOTE\n${output.sampleSize}`,
    `\nDECISION FRAMEWORK\n${output.decisionFramework}`,
  ].join('')

  return (
    <div>
      <div className="flex justify-end mb-4">
        <CopyButton getText={() => copyText} label="Copy brief" />
      </div>
      <BriefBlock title="Hypothesis" content={output.hypothesis} />
      <BriefBlock title="Variant Brief" content={output.variantBrief} mono />
      <BriefBlock title="Setup Instructions" content={output.setupInstructions} mono />
      <BriefBlock
        title="Primary Success Metric"
        content={
          <p className="text-sm font-medium text-brass-dark">{output.primaryMetric}</p>
        }
      />
      <BriefBlock title="Sample Size Note" content={output.sampleSize} />
      <BriefBlock title="Decision Framework" content={output.decisionFramework} />
    </div>
  )
}

const OUTPUT_RENDERERS = {
  'meta-ad': MetaAdOutput,
  'reel-hook': ReelHookOutput,
  email: EmailOutput,
  'ugc-script': UGCOutput,
  seasonal: SeasonalOutput,
  'ab-test': ABTestOutput,
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function HistoryPanel({ history, onUseAsStartingPoint, onClear }) {
  const [expandedIds, setExpandedIds] = useState(new Set())

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getOutputText = (item) => JSON.stringify(item.output, null, 2)

  const card = (id) => OUTCOME_CARDS.find((c) => c.id === id)

  if (history.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-cormorant text-xl font-medium text-near-black/60 tracking-wide">
          Brief History
        </h2>
        <button
          onClick={onClear}
          className="text-xs text-near-black/35 hover:text-near-black/60 transition-colors"
        >
          Clear history
        </button>
      </div>
      <div className="space-y-3">
        {history.map((item) => {
          const isOpen = expandedIds.has(item.id)
          const OutputRenderer = OUTPUT_RENDERERS[item.cardType]
          const cardDef = card(item.cardType)

          return (
            <div key={item.id} className="card border-l-2 border-l-brass/40">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  <span className={cardDef?.badgeCls || 'badge-watch'}>{cardDef?.badge}</span>
                  <span className="text-sm font-medium text-near-black truncate">{item.cardTitle}</span>
                  <span className="text-near-black/25 flex-shrink-0">·</span>
                  <span className="text-xs text-near-black/35 flex-shrink-0">
                    {new Date(item.timestamp).toLocaleString('en-NZ', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span className="text-near-black/30 flex-shrink-0 ml-auto">
                    <ChevronIcon open={isOpen} />
                  </span>
                </button>
              </div>

              {isOpen && OutputRenderer && (
                <div className="mt-5 pt-5 border-t border-brass/15">
                  {/* Inputs summary */}
                  <div className="bg-bone border border-brass/15 p-3 mb-5">
                    <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">
                      Brief inputs
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {Object.entries(item.inputs)
                        .filter(([, v]) => v !== '' && v !== false)
                        .map(([k, v]) => (
                          <span key={k} className="text-xs text-near-black/55">
                            <span className="text-near-black/35">{k}:</span> {String(v)}
                          </span>
                        ))}
                    </div>
                  </div>

                  <OutputRenderer output={item.output} />

                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-brass/15">
                    <CopyButton getText={() => getOutputText(item)} label="Copy output" />
                    <button
                      onClick={() => onUseAsStartingPoint(item)}
                      className="btn-brass text-xs px-3 py-1.5"
                    >
                      Use as starting point
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CreativeStrategist() {
  // ─── Brief state ───────────────────────────────────────────────────────────
  const [brief, setBrief] = useState(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  // ─── Card state ────────────────────────────────────────────────────────────
  const [activeCard, setActiveCard] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [cardOutputs, setCardOutputs] = useState({})
  const [generating, setGenerating] = useState(false)

  // ─── History state ─────────────────────────────────────────────────────────
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // ─── Refs ──────────────────────────────────────────────────────────────────
  const cardFormRef = useRef(null)
  const historyRef = useRef(null)

  // ─── Load daily brief on mount (cached) ───────────────────────────────────
  useEffect(() => {
    const cached = localStorage.getItem(BRIEF_CACHE_KEY)
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        setBrief(data)
        setLastRefreshed(new Date(timestamp))
        return
      } catch {
        // fall through to generate
      }
    }
    loadBrief()
  }, [])

  function loadBrief() {
    setBriefLoading(true)
    // Simulate brief generation delay
    // TODO: Replace with real Meta Ad Library API fetch + Claude API synthesis
    setTimeout(() => {
      const data = mockGenerateDailyBrief()
      const now = new Date()
      setBrief(data)
      setLastRefreshed(now)
      setBriefLoading(false)
      try {
        localStorage.setItem(BRIEF_CACHE_KEY, JSON.stringify({ data, timestamp: now.toISOString() }))
      } catch {
        // localStorage full
      }
    }, 800)
  }

  // ─── Get current form values for a card ───────────────────────────────────
  function getFormValues(cardId) {
    return formValues[cardId] ?? { ...FORM_DEFAULTS[cardId] }
  }

  // ─── Handle card selection ─────────────────────────────────────────────────
  function selectCard(cardId) {
    setActiveCard((prev) => (prev === cardId ? null : cardId))
    // Clear output when switching cards
    if (activeCard !== cardId) {
      setCardOutputs((prev) => ({ ...prev, [cardId]: null }))
    }
    // Scroll to form panel
    setTimeout(() => {
      cardFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  // ─── Handle generate ──────────────────────────────────────────────────────
  function handleGenerate() {
    if (!activeCard || generating) return
    const inputs = getFormValues(activeCard)
    setGenerating(true)
    // Simulate generation delay
    // TODO: Replace with Claude API call
    setTimeout(() => {
      const generator = GENERATORS[activeCard]
      const output = generator(inputs)
      setCardOutputs((prev) => ({ ...prev, [activeCard]: output }))

      // Save to history
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        cardType: activeCard,
        cardTitle: OUTCOME_CARDS.find((c) => c.id === activeCard)?.title || activeCard,
        inputs: { ...inputs },
        output,
      }
      const updated = [entry, ...history]
      setHistory(updated)
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      } catch {
        // localStorage full
      }
      setGenerating(false)
    }, 1000)
  }

  // ─── Use as starting point ────────────────────────────────────────────────
  function handleUseAsStartingPoint(item) {
    setActiveCard(item.cardType)
    setFormValues((prev) => ({ ...prev, [item.cardType]: { ...item.inputs } }))
    setCardOutputs((prev) => ({ ...prev, [item.cardType]: null }))
    setTimeout(() => {
      cardFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  // ─── Clear history ────────────────────────────────────────────────────────
  function clearHistory() {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  const activeCardDef = OUTCOME_CARDS.find((c) => c.id === activeCard)
  const currentOutput = activeCard ? cardOutputs[activeCard] : null
  const OutputRenderer = activeCard ? OUTPUT_RENDERERS[activeCard] : null
  const FormComponent = activeCard ? FORM_COMPONENTS[activeCard] : null
  const currentFormValues = activeCard ? getFormValues(activeCard) : {}

  return (
    <div>
      {/* ─── Page header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="section-title">Creative Strategist</h1>
        <p className="page-description">
          The bridge between analytical "why" and imaginative "how." Insights, briefs, trends, and
          testing — in one place.
        </p>
        <p className="text-xs text-near-black/30 mt-1">
          [MOCK MODE] — outputs are placeholder briefs, not live AI responses
        </p>
      </div>

      {/* ─── Layer 1: Daily Standing Brief ───────────────────────────── */}
      <DailyBrief
        brief={brief}
        loading={briefLoading}
        onRefresh={loadBrief}
        lastRefreshed={lastRefreshed}
        onCardSelect={(cardId) => {
          selectCard(cardId)
        }}
      />

      <div className="brass-divider" />

      {/* ─── Layer 2: Outcome Cards ───────────────────────────────────── */}
      <div>
        <div className="mb-5">
          <h2 className="font-cormorant text-xl font-medium text-near-black/60 tracking-wide">
            Outcome Cards
          </h2>
          <p className="text-xs text-near-black/40 mt-1">
            Select a card to open its brief builder. Each form does the strategic thinking — you fill in what you know.
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {OUTCOME_CARDS.map((card) => {
            const isActive = activeCard === card.id
            return (
              <button
                key={card.id}
                onClick={() => selectCard(card.id)}
                className={[
                  'text-left p-4 border transition-colors duration-150 group',
                  isActive
                    ? 'bg-bone-dark border-brass border-t-2 border-t-brass'
                    : 'bg-bone-dark border-brass/20 hover:border-brass/50',
                ].join(' ')}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={card.badgeCls}>{card.badge}</span>
                  <span className={`text-near-black/20 group-hover:text-brass/60 transition-colors ${isActive ? 'text-brass/60' : ''}`}>
                    <ArrowIcon />
                  </span>
                </div>
                <p
                  className={`font-cormorant text-lg font-semibold mb-1 transition-colors ${isActive ? 'text-brass-dark' : 'text-near-black group-hover:text-brass-dark'}`}
                >
                  {card.title}
                </p>
                <p className="text-xs text-near-black/50 leading-relaxed">{card.description}</p>
              </button>
            )
          })}
        </div>

        {/* Card form + output panel */}
        {activeCard && (
          <div ref={cardFormRef} className="card-brass-top mb-6">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className={activeCardDef?.badgeCls}>{activeCardDef?.badge}</span>
                <h3 className="font-cormorant text-2xl font-semibold text-near-black mt-1">
                  {activeCardDef?.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveCard(null)}
                className="text-near-black/30 hover:text-near-black/60 transition-colors text-xs"
              >
                Close
              </button>
            </div>

            {/* Form */}
            {FormComponent && (
              <FormComponent
                inputs={currentFormValues}
                onChange={(updated) =>
                  setFormValues((prev) => ({ ...prev, [activeCard]: updated }))
                }
              />
            )}

            {/* Generate button */}
            <div className="flex justify-end mt-5 pt-4 border-t border-brass/15">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-brass"
              >
                {generating ? 'Generating brief...' : 'Generate Brief'}
              </button>
            </div>

            {/* Output */}
            {currentOutput && OutputRenderer && (
              <div className="mt-6 pt-6 border-t border-brass/20">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-px flex-1 bg-brass/20" />
                  <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider px-3">
                    North Star Brief
                  </p>
                  <div className="h-px flex-1 bg-brass/20" />
                </div>
                <OutputRenderer output={currentOutput} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="brass-divider" />

      {/* ─── History ────────────────────────────────────────────────────── */}
      <div ref={historyRef}>
        <HistoryPanel
          history={history}
          onUseAsStartingPoint={handleUseAsStartingPoint}
          onClear={clearHistory}
        />
        {history.length === 0 && (
          <div className="card text-center py-10">
            <p className="text-near-black/30 text-sm">
              No briefs yet — select an Outcome Card above and click Generate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
