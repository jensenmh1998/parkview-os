// ─── Shared Intelligence Store ────────────────────────────────────────────────
// Both the Meta Ads Optimiser and Creative Strategist read from and write to
// this shared localStorage store so they can operate as a coordinated team.
// Key: parkview_shared_intelligence

export const SHARED_INTEL_KEY = 'parkview_shared_intelligence'

export function getDefaultIntelligence() {
  return {
    lastUpdated: new Date().toISOString(),
    adPerformance: { activeAds: [], fatiguedAds: [], winningAds: [], pausedAds: [] },
    creativePipeline: { incomingBriefs: [], approvedForLaunch: [], inProduction: [] },
    accountHealth: { score: 0, lastScored: null, criticalIssues: [], warnings: [], opportunities: [] },
    teamMessages: [],
    pendingHandoff: null,
  }
}

export function readIntelligence() {
  try {
    const raw = localStorage.getItem(SHARED_INTEL_KEY)
    if (!raw) return getDefaultIntelligence()
    return { ...getDefaultIntelligence(), ...JSON.parse(raw) }
  } catch {
    return getDefaultIntelligence()
  }
}

export function writeIntelligence(data) {
  try {
    const payload = { ...data, lastUpdated: new Date().toISOString() }
    localStorage.setItem(SHARED_INTEL_KEY, JSON.stringify(payload))
    // Notify same-tab listeners (storage events only fire in other tabs)
    window.dispatchEvent(new CustomEvent('sharedIntelligenceUpdate', { detail: payload }))
  } catch {
    // localStorage unavailable or full
  }
}

// Returns count of unread messages sent FROM a given role
export function countUnreadFrom(role) {
  const intel = readIntelligence()
  return intel.teamMessages.filter((m) => m.from === role && !m.read).length
}

// Seed messages for first-time load (called by MetaAdsOptimiser on init)
export const SEED_TEAM_MESSAGES = [
  {
    id: 'msg_001',
    from: 'optimiser',
    to: 'creative',
    type: 'fatigue_alert',
    message:
      'Classic Box — "Farm to Door" video has reached frequency 3.1 with CTR declining from 2.1% to 1.3% over 14 days. Fatigue score: 72/100. Replacement hook brief pre-filled and waiting in Creative Strategist.',
    adName: '"Farm to Door" Video',
    cardId: 'meta-ad',
    inputs: {
      box: 'Classic',
      audience: 'Families',
      objective: 'Retargeting warm audience',
      performanceContext: 'Frequency 3.1, CTR declined from 2.1% to 1.3% over 14 days, hook rate 14%',
      keyMessage: '',
    },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
    actioned: false,
  },
  {
    id: 'msg_002',
    from: 'creative',
    to: 'optimiser',
    type: 'brief_incoming',
    message:
      'New Meta Ad brief generated for Classic Box — Families, retargeting objective. Three hook variants ready including Canterbury Home Kill challenge angle and geographic specificity hook. Ready for review and launch.',
    adName: '"Farm to Door" Replacement',
    cardId: 'meta-ad',
    inputs: {},
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    read: true,
    actioned: false,
  },
  {
    id: 'msg_003',
    from: 'optimiser',
    to: 'creative',
    type: 'winner_found',
    message:
      '"Canterbury Home Kill" hook outperforming at 28% hook rate and 4.2x ROAS at day 5. This angle has legs. Brief 2 more variants — one targeting Gift Buyers, one targeting Health-Conscious Professionals. Pre-filled and ready.',
    adName: '"Canterbury Home Kill" Video',
    cardId: 'meta-ad',
    inputs: {
      box: 'Classic',
      audience: 'Gift Buyers',
      objective: 'New subscriber acquisition',
      keyMessage:
        'Lead with the Canterbury Home Kill provenance challenge — directly contrast with supermarket processing',
      performanceContext: 'Original Canterbury Home Kill hook: 28% hook rate, 4.2x ROAS at day 5',
    },
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    read: false,
    actioned: false,
  },
  {
    id: 'msg_004',
    from: 'optimiser',
    to: 'creative',
    type: 'scale_opportunity',
    message:
      'BBQ Box Retargeting hitting 3.8x ROAS for 4 consecutive days. Scaling budget 20% today ($103/day → $124/day). Brief a second creative to support the increased spend before frequency climbs.',
    adName: 'BBQ Box — Website Visitors 30 Days',
    cardId: 'meta-ad',
    inputs: {
      box: 'BBQ',
      audience: 'BBQ Enthusiasts',
      objective: 'Retargeting warm audience',
      keyMessage: '',
      performanceContext: 'ROAS 3.8x for 4 consecutive days, frequency 1.4, hook rate 24%',
    },
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
    actioned: false,
  },
  {
    id: 'msg_005',
    from: 'creative',
    to: 'optimiser',
    type: 'brief_incoming',
    message:
      'BBQ Box Grill Season brief generated. Hook variants: visual comparison (supermarket vs Parkview ribeye), seasonal anticipation, and subscriber social proof. Visual direction and A/B test plan included.',
    adName: 'BBQ Box — Grill Season',
    cardId: 'meta-ad',
    inputs: {},
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
    actioned: false,
  },
]
