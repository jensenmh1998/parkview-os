import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  readIntelligence,
  writeIntelligence,
  SEED_TEAM_MESSAGES,
} from '../data/sharedIntelligence'

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — Replace with live Meta Ads API calls + Claude API calls
// ═══════════════════════════════════════════════════════════════════════════════

// TODO: Replace with Meta Ads API call — GET /act_{ad_account_id}/insights
const MOCK_KPIS = {
  mer:      { value: 3.2,  prev: 2.96, unit: 'x', prefix: '',  target: 4.0,  lowerIsBetter: false, label: 'MER',       sublabel: 'Total Rev / Total Spend' },
  ncac:     { value: 47,   prev: 53.4, unit: '',  prefix: '$', target: 55,   lowerIsBetter: true,  label: 'nCAC',      sublabel: 'New customer only' },
  hookRate: { value: 19,   prev: 19.6, unit: '%', prefix: '',  target: 22,   lowerIsBetter: false, label: 'Hook Rate', sublabel: '3s views / impressions' },
  holdRate: { value: 34,   prev: 33.3, unit: '%', prefix: '',  target: 30,   lowerIsBetter: false, label: 'Hold Rate', sublabel: 'ThruPlays / 3s views' },
  roas:     { value: 2.8,  prev: 2.67, unit: 'x', prefix: '',  target: 3.5,  lowerIsBetter: false, label: 'ROAS',      sublabel: 'Return on ad spend' },
}

// TODO: Replace with Meta Ads API call — campaign/adset/ad hierarchy
const MOCK_CAMPAIGNS = [
  {
    id: 'camp_001',
    name: 'Classic Box — Acquisition',
    status: 'active',
    objective: 'New subscriber acquisition',
    spend: 1840,
    revenue: 5152,
    roas: 2.8,
    merContribution: 31,
    hookRate: 16,
    holdRate: 32,
    frequency: 2.4,
    cpa: 52,
    daysRunning: 18,
    health: 'warning',
    adSets: [
      {
        id: 'adset_001',
        name: 'Lookalike 1% — NZ Purchasers',
        status: 'learning',
        conversions: 23,
        targetConversions: 50,
        spend: 1120,
        roas: 2.4,
        frequency: 2.1,
        cpa: 56,
        ads: [
          { id: 'ad_001', name: '"Farm to Door" Video',      status: 'active', spend: 640, roas: 2.1, hookRate: 14, holdRate: 29, frequency: 3.1, cpa: 62, daysRunning: 18, fatigueScore: 72 },
          { id: 'ad_002', name: '"Canterbury Heritage" Static', status: 'active', spend: 480, roas: 2.8, hookRate: 11, holdRate: 0,  frequency: 2.4, cpa: 51, daysRunning: 14, fatigueScore: 45 },
        ],
      },
      {
        id: 'adset_002',
        name: 'Broad — Canterbury 25–55',
        status: 'active',
        conversions: 31,
        targetConversions: null,
        spend: 720,
        roas: 3.4,
        frequency: 2.8,
        cpa: 46,
        ads: [
          { id: 'ad_003', name: '"Canterbury Home Kill" Video', status: 'active', spend: 420, roas: 4.2, hookRate: 28, holdRate: 41, frequency: 1.9, cpa: 38, daysRunning: 5,  fatigueScore: 12 },
          { id: 'ad_004', name: '"Paddock to Plate" Carousel',  status: 'active', spend: 300, roas: 2.3, hookRate: 18, holdRate: 33, frequency: 3.8, cpa: 57, daysRunning: 21, fatigueScore: 58 },
        ],
      },
    ],
  },
  {
    id: 'camp_002',
    name: 'BBQ Box — Retargeting',
    status: 'active',
    objective: 'Retargeting warm audience',
    spend: 620,
    revenue: 2356,
    roas: 3.8,
    merContribution: 22,
    hookRate: 24,
    holdRate: 38,
    frequency: 1.4,
    cpa: 38,
    daysRunning: 6,
    health: 'good',
    adSets: [
      {
        id: 'adset_003',
        name: 'Website Visitors — 30 Days',
        status: 'active',
        conversions: 16,
        targetConversions: null,
        spend: 620,
        roas: 3.8,
        frequency: 1.4,
        cpa: 38,
        ads: [
          { id: 'ad_005', name: '"Grill Season" Video',   status: 'active', spend: 380, roas: 4.1, hookRate: 26, holdRate: 40, frequency: 1.3, cpa: 34, daysRunning: 6, fatigueScore: 8  },
          { id: 'ad_006', name: '"Summer BBQ" Carousel',  status: 'active', spend: 240, roas: 3.2, hookRate: 22, holdRate: 35, frequency: 1.5, cpa: 44, daysRunning: 6, fatigueScore: 11 },
        ],
      },
    ],
  },
  {
    id: 'camp_003',
    name: 'Brand Awareness — Canterbury',
    status: 'active',
    objective: 'Brand building',
    spend: 340,
    revenue: 408,
    roas: 1.2,
    merContribution: 8,
    hookRate: 22,
    holdRate: 41,
    frequency: 1.8,
    cpa: null,
    daysRunning: 12,
    health: 'watch',
    adSets: [
      {
        id: 'adset_004',
        name: 'Broad — NZ 25–65',
        status: 'active',
        conversions: 4,
        targetConversions: null,
        spend: 340,
        roas: 1.2,
        frequency: 1.8,
        cpa: null,
        ads: [
          { id: 'ad_007', name: '"Hawarden Farm Story" Video', status: 'active', spend: 340, roas: 1.2, hookRate: 22, holdRate: 41, frequency: 1.8, cpa: null, daysRunning: 12, fatigueScore: 22 },
        ],
      },
    ],
  },
]

// TODO: Replace with Meta Ads API call — audience insights + frequency data
const MOCK_AUDIENCES = [
  { id: 'aud_001', name: 'Past Subscribers — All Time',       frequency: 3.8, threshold: 3.5, estimatedDaysToSaturation: 0,  action: 'Refresh creative immediately or exclude from retargeting' },
  { id: 'aud_002', name: 'Website Visitors — 30 Days',        frequency: 3.2, threshold: 3.5, estimatedDaysToSaturation: 4,  action: 'Brief a new creative variant within 3 days' },
  { id: 'aud_003', name: 'Canterbury Lookalike 1%',            frequency: 2.1, threshold: 3.5, estimatedDaysToSaturation: 21, action: 'Monitor — consider expanding to 2% lookalike' },
  { id: 'aud_004', name: 'Canterbury Lookalike 2%',            frequency: 1.4, threshold: 3.5, estimatedDaysToSaturation: 48, action: 'Healthy — no action needed' },
]

// TODO: Replace with budget management API + Claude API call for recommendations
const MOCK_BUDGET_PACING = {
  monthlyBudget: 12000,
  daysElapsed: 17,
  daysInMonth: 30,
  actualSpend: 2800,
  expectedSpend: 6800,
  projectedMonthEnd: 4941,
  dailyAverage: 164.7,
  recommendedDaily: 310,
  status: 'under',
  detail: 'Spend pacing 59% of expected. At current rate, month-end spend will be $4,941 — $7,059 under monthly budget. Unused budget means missed impressions and slower learning phase exit.',
  adjustments: [
    { campaign: 'Classic Box — Acquisition', action: 'increase', amount: 80, reason: 'Highest volume campaign — absorb most of the increased budget' },
    { campaign: 'BBQ Box — Retargeting',    action: 'increase', amount: 45, reason: 'Already scaling well at 3.8x ROAS — additional budget efficiently deployed' },
  ],
}

// TODO: Replace with Claude API call for health score calculation
function calculateMockAccountHealth() {
  return {
    score: 67,
    lastScored: new Date().toISOString(),
    breakdown: {
      dataIntegrity:       { score: 10, max: 25, label: 'Data Integrity' },
      campaignArchitecture:{ score: 14, max: 20, label: 'Campaign Architecture' },
      creativeHealth:      { score: 17, max: 25, label: 'Creative Health' },
      budgetEfficiency:    { score: 18, max: 20, label: 'Budget Efficiency' },
      funnelBalance:       { score: 8,  max: 10, label: 'Funnel Balance' },
    },
    criticalIssues: [
      {
        id: 'ci_001',
        title: 'Pixel not firing on Subscribe event',
        detail: "Pixel records Add to Cart and Initiate Checkout but is missing the Subscribe conversion. Recharge subscription completions aren't being passed to Meta — the algorithm is optimising for checkout initiations, not actual subscribers.",
        section: 'data-integrity',
        fixAction: 'Install server-side Conversions API through Recharge → Meta integration or manually trigger a Subscribe pixel event on Recharge confirmation page.',
      },
      {
        id: 'ci_002',
        title: 'Event Match Quality: 4.2/10',
        detail: "Low match rate between pixel events and Meta user profiles. Primary cause: customer emails aren't being hashed and sent with events. Algorithm cannot match purchases to audience segments efficiently — ad delivery is less targeted than it should be.",
        section: 'data-integrity',
        fixAction: 'Enable Advanced Matching in Meta Pixel settings. Pass hashed email, phone number, and first/last name with every pixel event.',
      },
    ],
    warnings: [
      {
        id: 'w_001',
        title: 'Classic Box in Learning Phase — 23/50 conversions',
        detail: 'Lookalike 1% NZ Purchasers ad set has 23 of the 50 optimisation events needed to exit learning phase. At current pace (~1.3 conversions/day), estimated exit in 21 days.',
        section: 'learning-phase',
      },
      {
        id: 'w_002',
        title: 'BBQ Box frequency at 3.1 — approaching threshold',
        detail: 'BBQ Box Retargeting ad set frequency is 3.1 across the Website Visitors 30-day audience. Approaching the 3.5 fatigue threshold. Monitor daily.',
        section: 'fatigue',
      },
    ],
    opportunities: [
      {
        id: 'opp_001',
        title: 'Canterbury Home Kill hook: 28% hook rate — brief 2 variants',
        detail: '"Canterbury Home Kill" video is outperforming at 28% hook rate and 4.2x ROAS at day 5. Brief 2 more variants of this angle before the audience saturates.',
        cardId: 'meta-ad',
        inputs: {
          box: 'Classic',
          audience: 'Gift Buyers',
          objective: 'New subscriber acquisition',
          keyMessage: 'Lead with the Canterbury Home Kill provenance challenge — directly contrast with supermarket processing standards',
          performanceContext: 'Original Canterbury Home Kill hook: 28% hook rate, 4.2x ROAS at day 5',
        },
      },
      {
        id: 'opp_002',
        title: 'Lookalike 1% converting at 2.1x — expand to 2%',
        detail: 'Canterbury Purchasers Lookalike 1% is your most efficient cold audience. Expanding to 2% could capture a larger audience at similar efficiency with minimal risk.',
        cardId: 'meta-ad',
        inputs: {
          box: 'Classic',
          audience: 'General NZ',
          objective: 'New subscriber acquisition',
          keyMessage: '',
          performanceContext: 'Testing 2% lookalike expansion from 1% base audience at 2.1x ROAS',
        },
      },
    ],
  }
}

const MOCK_FUNNEL = {
  prospecting: { current: 72, recommended: 80, spend: 2020 },
  retargeting: { current: 28, recommended: 20, spend: 780 },
  note: "You're running slightly more retargeting than recommended for Parkview's current stage. As a growing subscription brand, prospecting should take the larger share to drive new subscriber volume. Consider shifting 8% ($180) from retargeting to acquisition campaigns.",
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function pct(value, prev, lowerIsBetter = false) {
  if (!prev || prev === 0) return null
  const change = ((value - prev) / Math.abs(prev)) * 100
  const isPositive = lowerIsBetter ? change < 0 : change > 0
  return { change: Math.abs(change).toFixed(1), isPositive, raw: change }
}

function kpiStatus(kpi) {
  const { value, target, lowerIsBetter } = kpi
  if (lowerIsBetter) {
    if (value <= target * 0.85) return 'good'
    if (value <= target) return 'good'
    if (value <= target * 1.15) return 'watch'
    return 'critical'
  } else {
    if (value >= target) return 'good'
    if (value >= target * 0.85) return 'watch'
    return 'critical'
  }
}

function fmtCurrency(n) {
  if (n == null) return '—'
  return `$${n.toLocaleString('en-NZ')}`
}

function fmtPct(n) {
  if (n == null) return '—'
  return `${n}%`
}

function fmtMult(n) {
  if (n == null) return '—'
  return `${n}x`
}

function fatigueLabel(score) {
  if (score >= 70) return { label: 'Critical', cls: 'badge-pause' }
  if (score >= 50) return { label: 'Warning', cls: 'badge-watch' }
  if (score >= 30) return { label: 'Watch', cls: 'badge-refresh' }
  return { label: 'Healthy', cls: 'badge-scale' }
}

function healthBadge(h) {
  if (h === 'good')    return <span className="badge-scale">Good</span>
  if (h === 'warning') return <span className="badge-watch">Warning</span>
  if (h === 'critical')return <span className="badge-pause">Critical</span>
  return <span className="badge-refresh">Watch</span>
}

function statusBadge(s) {
  if (s === 'active')   return <span className="badge-scale">Active</span>
  if (s === 'learning') return <span className="badge-watch">Learning</span>
  if (s === 'paused')   return <span className="badge-pause">Paused</span>
  return <span className="badge-refresh">{s}</span>
}

const MSG_TYPE_CONFIG = {
  fatigue_alert:   { label: 'Fatigue Alert',   cls: 'badge-pause',   icon: '⚠' },
  brief_incoming:  { label: 'Brief Ready',      cls: 'badge-scale',   icon: '✓' },
  winner_found:    { label: 'Winner Found',     cls: 'badge-scale',   icon: '↑' },
  scale_opportunity:{ label: 'Scale Signal',   cls: 'badge-refresh', icon: '↗' },
  handoff_request: { label: 'Handoff',          cls: 'badge-watch',   icon: '→' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ChevronIcon({ open, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SortIcon({ active, direction }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      className={`inline ml-1 ${active ? 'text-brass' : 'text-near-black/20'}`}>
      {direction === 'asc' || !active
        ? <polyline points="18 15 12 9 6 15" />
        : <polyline points="6 9 12 15 18 9" />}
    </svg>
  )
}

function TrendArrow({ isPositive, change }) {
  if (change == null) return null
  return (
    <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
      {isPositive ? '↑' : '↓'} {change}%
    </span>
  )
}

function AlertSection({ title, number, count, severity, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const clr = severity === 'critical' ? 'text-red-600' : severity === 'warning' ? 'text-amber-500' : 'text-near-black/50'
  return (
    <div className="border-t border-brass/15">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-left py-4 group">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border border-brass/30 flex items-center justify-center text-xs font-cormorant font-semibold text-brass flex-shrink-0">
            {number}
          </span>
          <span className="font-cormorant text-lg font-semibold text-near-black group-hover:text-brass-dark transition-colors">
            {title}
          </span>
          {count > 0 && (
            <span className={`text-xs font-medium ${clr}`}>
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <span className="text-near-black/30"><ChevronIcon open={open} /></span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — ACCOUNT HEALTH SCORE
// ═══════════════════════════════════════════════════════════════════════════════

function AccountHealthScore({ health, onRecalculate, onBriefOpportunity, recalculating }) {
  const { score, breakdown, criticalIssues, warnings, opportunities } = health

  const scoreConfig =
    score >= 80 ? { color: 'text-brass', border: 'border-brass/60', bg: 'bg-brass/8', label: 'Healthy' }
    : score >= 60 ? { color: 'text-amber-500', border: 'border-amber-400/60', bg: 'bg-amber-50/50', label: 'Attention needed' }
    : score >= 40 ? { color: 'text-orange-500', border: 'border-orange-400/60', bg: 'bg-orange-50/50', label: 'Action required' }
    : { color: 'text-red-500', border: 'border-red-400/60', bg: 'bg-red-50/50', label: 'Critical' }

  return (
    <div className="card-brass-top mb-6">
      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-cormorant text-2xl font-semibold text-near-black">Account Health Score</h2>
          <p className="text-xs text-near-black/40 mt-0.5">
            Weighted across data integrity, architecture, creative health, budget efficiency, and funnel balance.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {health.lastScored && (
            <span className="text-xs text-near-black/30">
              Scored {new Date(health.lastScored).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={onRecalculate} disabled={recalculating} className="btn-outline text-xs px-3 py-1.5">
            {recalculating ? 'Recalculating...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {/* Score + breakdown */}
      <div className="flex items-start gap-8 mb-6">
        {/* Score badge */}
        <div className={`border-2 ${scoreConfig.border} ${scoreConfig.bg} w-28 h-28 flex-shrink-0 flex flex-col items-center justify-center`}>
          <span className={`font-cormorant text-5xl font-semibold leading-none ${scoreConfig.color}`}>{score}</span>
          <span className={`text-xs font-medium mt-1 ${scoreConfig.color}`}>{scoreConfig.label}</span>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 grid grid-cols-5 gap-3">
          {Object.values(breakdown).map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-near-black/50 truncate">{item.label}</span>
                <span className="text-near-black/60 font-medium ml-1 flex-shrink-0">{item.score}/{item.max}</span>
              </div>
              <div className="h-1.5 bg-bone border border-brass/20 w-full">
                <div
                  className={`h-full ${item.score / item.max >= 0.8 ? 'bg-brass/70' : item.score / item.max >= 0.6 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues / Warnings / Opportunities */}
      <div className="grid grid-cols-3 gap-4">
        {/* Critical Issues */}
        <div>
          <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-2">
            Critical Issues — {criticalIssues.length}
          </p>
          <div className="space-y-2">
            {criticalIssues.length === 0 && (
              <p className="text-xs text-near-black/30 italic">None — good health in this area.</p>
            )}
            {criticalIssues.map((issue) => (
              <div key={issue.id} className="bg-bone border border-red-200 border-l-2 border-l-red-400 p-3">
                <p className="text-xs font-medium text-near-black mb-1">{issue.title}</p>
                <p className="text-xs text-near-black/55 leading-relaxed mb-2">{issue.detail}</p>
                <p className="text-xs text-red-600 font-medium">→ {issue.fixAction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        <div>
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-2">
            Warnings — {warnings.length}
          </p>
          <div className="space-y-2">
            {warnings.length === 0 && (
              <p className="text-xs text-near-black/30 italic">No active warnings.</p>
            )}
            {warnings.map((w) => (
              <div key={w.id} className="bg-bone border border-amber-200 border-l-2 border-l-amber-400 p-3">
                <p className="text-xs font-medium text-near-black mb-1">{w.title}</p>
                <p className="text-xs text-near-black/55 leading-relaxed">{w.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div>
          <p className="text-xs font-medium text-brass-dark uppercase tracking-wider mb-2">
            Opportunities — {opportunities.length}
          </p>
          <div className="space-y-2">
            {opportunities.length === 0 && (
              <p className="text-xs text-near-black/30 italic">No flagged opportunities.</p>
            )}
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-bone border border-brass/20 border-l-2 border-l-brass/60 p-3">
                <p className="text-xs font-medium text-near-black mb-1">{opp.title}</p>
                <p className="text-xs text-near-black/55 leading-relaxed mb-2">{opp.detail}</p>
                <button
                  onClick={() => onBriefOpportunity(opp)}
                  className="text-xs text-brass font-medium hover:text-brass-dark transition-colors"
                >
                  Brief This →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — PERFORMANCE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function KPICards({ kpis }) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {Object.values(kpis).map((kpi) => {
        const trend = pct(kpi.value, kpi.prev, kpi.lowerIsBetter)
        const status = kpiStatus(kpi)
        const statusCfg =
          status === 'good'     ? { dot: 'bg-green-500',  label: 'On target' }
          : status === 'watch'  ? { dot: 'bg-amber-400',  label: 'Watch' }
          : { dot: 'bg-red-500', label: 'Critical' }
        return (
          <div key={kpi.label} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xs text-near-black/30 mt-0.5">{kpi.sublabel}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                <span className="text-xs text-near-black/40">{statusCfg.label}</span>
              </div>
            </div>
            <div className="font-cormorant text-3xl font-semibold text-near-black leading-none mb-2">
              {kpi.prefix}{kpi.value}{kpi.unit}
            </div>
            <div className="flex items-center justify-between">
              <TrendArrow isPositive={trend?.isPositive} change={trend?.change} />
              <span className="text-xs text-near-black/30">Target: {kpi.prefix}{kpi.target}{kpi.unit}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CampaignRow({ campaign, onBriefReplacement, onScale, briefSentIds }) {
  const [expanded, setExpanded] = useState(false)
  const [scaleConfirm, setScaleConfirm] = useState(null)

  const handleScale = (adSet) => {
    const currentBudget = adSet.spend / campaign.daysRunning
    const increase = currentBudget * 0.2
    setScaleConfirm({ adSetId: adSet.id, adSetName: adSet.name, currentBudget: currentBudget.toFixed(2), increase: increase.toFixed(2), newBudget: (currentBudget + increase).toFixed(2) })
  }

  return (
    <>
      <tr className="border-t border-brass/10 hover:bg-brass/3 transition-colors">
        <td className="py-3 px-3">
          <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-2 text-left w-full">
            <span className="text-near-black/30"><ChevronIcon open={expanded} size={12} /></span>
            <span className="text-sm font-medium text-near-black">{campaign.name}</span>
          </button>
        </td>
        <td className="py-3 px-3">{statusBadge(campaign.status)}</td>
        <td className="py-3 px-3 text-sm text-near-black/70">{fmtCurrency(campaign.spend)}</td>
        <td className="py-3 px-3">
          <span className={`text-sm font-medium ${campaign.roas >= 3.5 ? 'text-green-600' : campaign.roas >= 2.5 ? 'text-amber-600' : 'text-red-500'}`}>
            {fmtMult(campaign.roas)}
          </span>
        </td>
        <td className="py-3 px-3 text-sm text-near-black/70">{campaign.merContribution}%</td>
        <td className="py-3 px-3">
          <span className={`text-sm font-medium ${campaign.hookRate >= 22 ? 'text-green-600' : campaign.hookRate >= 15 ? 'text-amber-600' : 'text-red-500'}`}>
            {fmtPct(campaign.hookRate)}
          </span>
        </td>
        <td className="py-3 px-3 text-sm text-near-black/70">{fmtPct(campaign.holdRate)}</td>
        <td className="py-3 px-3">
          <span className={`text-sm font-medium ${campaign.frequency >= 3.5 ? 'text-red-500' : campaign.frequency >= 2.5 ? 'text-amber-600' : 'text-near-black/70'}`}>
            {campaign.frequency}
          </span>
        </td>
        <td className="py-3 px-3 text-sm text-near-black/70">{fmtCurrency(campaign.cpa)}</td>
        <td className="py-3 px-3 text-sm text-near-black/50">{campaign.daysRunning}d</td>
        <td className="py-3 px-3">{healthBadge(campaign.health)}</td>
        <td className="py-3 px-3" />
      </tr>

      {expanded && campaign.adSets.map((adSet) => (
        <>
          {/* Ad Set row */}
          <tr key={adSet.id} className="bg-bone/50 border-t border-brass/8">
            <td className="py-2 px-3 pl-8" colSpan={2}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-near-black/40">↳</span>
                <span className="text-xs font-medium text-near-black/70">{adSet.name}</span>
                {adSet.status === 'learning' && (
                  <span className="badge-watch text-xs">{adSet.conversions}/{adSet.targetConversions} conv.</span>
                )}
              </div>
            </td>
            <td className="py-2 px-3 text-xs text-near-black/50">{fmtCurrency(adSet.spend)}</td>
            <td className="py-2 px-3 text-xs text-near-black/50">{fmtMult(adSet.roas)}</td>
            <td className="py-2 px-3" />
            <td className="py-2 px-3" />
            <td className="py-2 px-3" />
            <td className="py-2 px-3 text-xs text-near-black/50">{adSet.frequency}</td>
            <td className="py-2 px-3 text-xs text-near-black/50">{fmtCurrency(adSet.cpa)}</td>
            <td className="py-2 px-3" />
            <td className="py-2 px-3" />
            <td className="py-2 px-3">
              {adSet.roas >= 3.5 && adSet.frequency < 2.0 && (
                <button
                  onClick={() => handleScale(adSet)}
                  className="text-xs text-green-600 font-medium hover:text-green-700 transition-colors"
                >
                  Scale ↑
                </button>
              )}
            </td>
          </tr>

          {/* Scale confirmation */}
          {scaleConfirm?.adSetId === adSet.id && (
            <tr key={`scale-${adSet.id}`} className="bg-green-50 border-t border-green-200">
              <td colSpan={12} className="py-3 px-8">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-near-black/70">
                    <span className="font-medium text-green-700">20% Rule check passed.</span>{' '}
                    Increase ${scaleConfirm.currentBudget}/day → ${scaleConfirm.newBudget}/day (+${scaleConfirm.increase}). This is within the safe threshold and will not reset the learning phase.
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setScaleConfirm(null)}
                      className="text-xs text-near-black/40 hover:text-near-black/70 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { onScale(adSet, scaleConfirm); setScaleConfirm(null) }}
                      className="btn-brass text-xs px-3 py-1"
                    >
                      Confirm Scale
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {/* Ad rows */}
          {adSet.ads.map((ad) => {
            const fatigue = fatigueLabel(ad.fatigueScore)
            const alreadyBriefed = briefSentIds.has(ad.id)
            return (
              <tr key={ad.id} className="border-t border-brass/6 hover:bg-brass/2 transition-colors">
                <td className="py-2 px-3 pl-14" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-near-black/25">↳</span>
                    <span className="text-xs text-near-black/65">{ad.name}</span>
                    {ad.fatigueScore >= 30 && (
                      <span className={fatigue.cls}>{fatigue.label} {ad.fatigueScore}</span>
                    )}
                    {ad.hookRate >= 25 && (
                      <span className="badge-scale">Winner</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3 text-xs text-near-black/50">{fmtCurrency(ad.spend)}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs font-medium ${ad.roas >= 3.5 ? 'text-green-600' : ad.roas >= 2.5 ? 'text-amber-600' : 'text-red-500'}`}>
                    {fmtMult(ad.roas)}
                  </span>
                </td>
                <td className="py-2 px-3" />
                <td className="py-2 px-3">
                  <span className={`text-xs font-medium ${ad.hookRate >= 22 ? 'text-green-600' : ad.hookRate >= 15 ? 'text-amber-600' : 'text-red-500'}`}>
                    {fmtPct(ad.hookRate)}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs text-near-black/50">{fmtPct(ad.holdRate)}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs font-medium ${ad.frequency >= 3.5 ? 'text-red-500' : ad.frequency >= 2.5 ? 'text-amber-600' : 'text-near-black/50'}`}>
                    {ad.frequency}
                  </span>
                </td>
                <td className="py-2 px-3 text-xs text-near-black/50">{fmtCurrency(ad.cpa)}</td>
                <td className="py-2 px-3 text-xs text-near-black/40">{ad.daysRunning}d</td>
                <td className="py-2 px-3" />
                <td className="py-2 px-3">
                  {ad.fatigueScore >= 50 && (
                    alreadyBriefed
                      ? <span className="text-xs text-near-black/40 italic">Brief sent ✓</span>
                      : <button
                          onClick={() => onBriefReplacement(ad, campaign)}
                          className="text-xs text-brass font-medium hover:text-brass-dark transition-colors whitespace-nowrap"
                        >
                          Brief Replacement
                        </button>
                  )}
                </td>
              </tr>
            )
          })}
        </>
      ))}
    </>
  )
}

function CampaignTable({ campaigns, onBriefReplacement, onScale, briefSentIds }) {
  const [sortKey, setSortKey] = useState('spend')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...campaigns].sort((a, b) => {
    const aVal = a[sortKey] ?? -1
    const bVal = b[sortKey] ?? -1
    return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
  })

  const cols = [
    { key: 'name',           label: 'Campaign',         sortable: false },
    { key: 'status',         label: 'Status',           sortable: false },
    { key: 'spend',          label: 'Spend',            sortable: true  },
    { key: 'roas',           label: 'ROAS',             sortable: true  },
    { key: 'merContribution',label: 'MER %',            sortable: true  },
    { key: 'hookRate',       label: 'Hook',             sortable: true  },
    { key: 'holdRate',       label: 'Hold',             sortable: true  },
    { key: 'frequency',      label: 'Freq',             sortable: true  },
    { key: 'cpa',            label: 'CPA',              sortable: true  },
    { key: 'daysRunning',    label: 'Days',             sortable: true  },
    { key: 'health',         label: 'Health',           sortable: false },
    { key: 'actions',        label: '',                 sortable: false },
  ]

  return (
    <div className="card mb-5 overflow-x-auto">
      <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-4">
        Campaign Performance
      </p>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr>
            {cols.map((col) => (
              <th key={col.key} className="text-left py-2 px-3 text-xs font-medium text-near-black/40 uppercase tracking-wider whitespace-nowrap">
                {col.sortable
                  ? <button onClick={() => handleSort(col.key)} className="hover:text-near-black/70 transition-colors">
                      {col.label}<SortIcon active={sortKey === col.key} direction={sortDir} />
                    </button>
                  : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((campaign) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              onBriefReplacement={onBriefReplacement}
              onScale={onScale}
              briefSentIds={briefSentIds}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FunnelHealth({ data }) {
  const { prospecting, retargeting, note } = data
  const barColor = (current, recommended) =>
    Math.abs(current - recommended) <= 5 ? 'bg-brass/70' : current > recommended ? 'bg-amber-400' : 'bg-blue-400'

  return (
    <div className="card">
      <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-4">Funnel Balance</p>
      <div className="grid grid-cols-2 gap-6 mb-4">
        {[
          { label: 'Prospecting', ...prospecting },
          { label: 'Retargeting', ...retargeting },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-near-black/70">{item.label}</span>
              <div className="flex gap-3">
                <span className="text-near-black/50">{fmtCurrency(item.spend)}</span>
                <span className="font-medium text-near-black">{item.current}%</span>
              </div>
            </div>
            <div className="h-2 bg-bone border border-brass/20 w-full mb-1">
              <div className={`h-full ${barColor(item.current, item.recommended)}`} style={{ width: `${item.current}%` }} />
            </div>
            <div className="flex justify-between text-xs text-near-black/35">
              <span>Current: {item.current}%</span>
              <span>Recommended: {item.recommended}%</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-near-black/55 leading-relaxed border-t border-brass/15 pt-3">{note}</p>
    </div>
  )
}

function PerformanceDashboard({ campaigns, kpis, funnelData, onBriefReplacement, onScale, briefSentIds }) {
  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="font-cormorant text-xl font-medium text-near-black/60 tracking-wide">Performance Dashboard</h2>
      </div>
      <KPICards kpis={kpis} />
      <CampaignTable
        campaigns={campaigns}
        onBriefReplacement={onBriefReplacement}
        onScale={onScale}
        briefSentIds={briefSentIds}
      />
      <FunnelHealth data={funnelData} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 3 — PROACTIVE ALERT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

function CreativeFatigueAlerts({ campaigns, onBriefReplacement, briefSentIds, intel }) {
  const fatiguedAds = campaigns.flatMap((c) =>
    c.adSets.flatMap((s) =>
      s.ads
        .filter((a) => a.fatigueScore >= 30)
        .map((a) => ({ ...a, campaignName: c.name, adSetName: s.name, campaign: c }))
    )
  ).sort((a, b) => b.fatigueScore - a.fatigueScore)

  const hasExistingBrief = (adId) =>
    briefSentIds.has(adId) ||
    intel.teamMessages.some((m) => m.from === 'optimiser' && !m.actioned && m.inputs?.adId === adId)

  return (
    <div className="space-y-3">
      {fatiguedAds.length === 0 && (
        <p className="text-xs text-near-black/30 italic">No ads currently showing fatigue signals.</p>
      )}
      {fatiguedAds.map((ad) => {
        const { label, cls } = fatigueLabel(ad.fatigueScore)
        const briefed = hasExistingBrief(ad.id)
        return (
          <div key={ad.id} className="bg-bone border border-brass/15 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cls}>{label}</span>
                  <span className="text-sm font-medium text-near-black">{ad.name}</span>
                </div>
                <p className="text-xs text-near-black/40">{ad.campaignName} → {ad.adSetName}</p>
              </div>
              <div className="font-cormorant text-2xl font-semibold text-near-black/30 flex-shrink-0 ml-3">
                {ad.fatigueScore}<span className="text-sm font-inter">/100</span>
              </div>
            </div>
            <div className="flex gap-4 mb-2 flex-wrap">
              {ad.frequency && <span className="text-xs text-near-black/50">Frequency: <strong className={ad.frequency >= 3.5 ? 'text-red-500' : ad.frequency >= 2.5 ? 'text-amber-600' : ''}>{ad.frequency}</strong></span>}
              {ad.hookRate && <span className="text-xs text-near-black/50">Hook rate: <strong className={ad.hookRate < 15 ? 'text-red-500' : ad.hookRate < 20 ? 'text-amber-600' : 'text-green-600'}>{fmtPct(ad.hookRate)}</strong></span>}
              {ad.roas && <span className="text-xs text-near-black/50">ROAS: <strong>{fmtMult(ad.roas)}</strong></span>}
              {ad.daysRunning && <span className="text-xs text-near-black/50">Running: <strong>{ad.daysRunning} days</strong></span>}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-near-black/50">
                {ad.fatigueScore >= 70
                  ? 'Replace immediately — fatigue is active and costing efficiency.'
                  : ad.fatigueScore >= 50
                    ? `Estimated ${Math.round((70 - ad.fatigueScore) / 2)} days before critical threshold at current trend.`
                    : 'Monitor — not yet requiring action.'}
              </p>
              {ad.fatigueScore >= 50 && (
                briefed
                  ? <span className="text-xs text-green-600 font-medium">Brief in progress ✓</span>
                  : <button onClick={() => onBriefReplacement(ad, ad.campaign)} className="btn-brass text-xs px-3 py-1.5 flex-shrink-0 ml-3">
                      Brief Replacement
                    </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScalingOpportunities({ campaigns, onScale, briefSentIds }) {
  // Ads with ROAS >= 3.5x, frequency < 2.0, hookRate >= 20%, running 3+ days
  const candidates = campaigns.flatMap((c) =>
    c.adSets.flatMap((s) =>
      s.ads
        .filter((a) => a.roas >= 3.5 && a.frequency < 2.0 && a.hookRate >= 20 && a.daysRunning >= 3)
        .map((a) => {
          const dailyBudget = a.spend / a.daysRunning
          const increase = dailyBudget * 0.2
          return { ...a, campaignName: c.name, adSetName: s.name, adSet: s, campaign: c, dailyBudget, increase, newBudget: dailyBudget + increase }
        })
    )
  )

  if (candidates.length === 0) {
    return <p className="text-xs text-near-black/30 italic">No ads currently meeting scaling criteria (ROAS ≥3.5x, frequency &lt;2.0, hook rate ≥20%, 3+ days running).</p>
  }

  return (
    <div className="space-y-3">
      {candidates.map((ad) => (
        <div key={ad.id} className="bg-bone border border-green-200 border-l-2 border-l-green-500 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-scale">Scaling Candidate</span>
                <span className="text-sm font-medium text-near-black">{ad.name}</span>
              </div>
              <p className="text-xs text-near-black/40">{ad.campaignName} → {ad.adSetName}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xs text-near-black/40 mb-0.5">ROAS</p>
              <p className="font-cormorant text-xl font-semibold text-green-600">{fmtMult(ad.roas)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-near-black/40 mb-0.5">Hook Rate</p>
              <p className="font-cormorant text-xl font-semibold text-green-600">{fmtPct(ad.hookRate)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-near-black/40 mb-0.5">Frequency</p>
              <p className="font-cormorant text-xl font-semibold text-near-black">{ad.frequency}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-near-black/40 mb-0.5">Days Running</p>
              <p className="font-cormorant text-xl font-semibold text-near-black">{ad.daysRunning}</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 p-3 mb-3">
            <p className="text-xs font-medium text-green-700 mb-1">Recommended scale: +20% (safe maximum)</p>
            <p className="text-xs text-near-black/60">
              Current daily budget: <strong>${ad.dailyBudget.toFixed(2)}</strong> →
              New daily budget: <strong>${ad.newBudget.toFixed(2)}</strong> (+${ad.increase.toFixed(2)}/day).
              Projected additional monthly spend: <strong>${(ad.increase * 30).toFixed(0)}</strong>.
              At current ROAS of {fmtMult(ad.roas)}, projected additional monthly revenue: <strong>${(ad.increase * 30 * ad.roas).toFixed(0)}</strong>.
            </p>
          </div>
          <p className="text-xs text-near-black/40 mb-3">
            Any increase above 20% will reset the learning phase. The 20% rule keeps the algorithm stable while capturing growth.
          </p>
          <button
            onClick={() => onScale(ad.adSet, { adSetId: ad.adSet.id, adSetName: ad.adSet.name, currentBudget: ad.dailyBudget.toFixed(2), increase: ad.increase.toFixed(2), newBudget: ad.newBudget.toFixed(2) })}
            className="btn-brass text-xs px-3 py-1.5"
          >
            Scale Now (+20%)
          </button>
        </div>
      ))}
    </div>
  )
}

function LearningPhaseAlerts({ campaigns }) {
  const learning = campaigns.flatMap((c) =>
    c.adSets
      .filter((s) => s.status === 'learning')
      .map((s) => ({ ...s, campaignName: c.name }))
  )

  if (learning.length === 0) {
    return <p className="text-xs text-near-black/30 italic">No ad sets currently in learning phase.</p>
  }

  return (
    <div className="space-y-3">
      {learning.map((adSet) => {
        const remaining = adSet.targetConversions - adSet.conversions
        const dailyPace = 1.3 // mock: ~1.3 conversions/day
        const daysToExit = Math.ceil(remaining / dailyPace)
        return (
          <div key={adSet.id} className="bg-bone border border-amber-200 border-l-2 border-l-amber-400 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-watch">Learning Phase</span>
                  <span className="text-sm font-medium text-near-black">{adSet.name}</span>
                </div>
                <p className="text-xs text-near-black/40">{adSet.campaignName}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="font-cormorant text-2xl font-semibold text-amber-600">{adSet.conversions}<span className="text-sm text-near-black/40">/{adSet.targetConversions}</span></p>
                <p className="text-xs text-near-black/40">conversions</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-1.5 bg-bone border border-amber-200 w-full mb-1">
                <div className="h-full bg-amber-400" style={{ width: `${(adSet.conversions / adSet.targetConversions) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-near-black/40">
                <span>{adSet.conversions} recorded</span>
                <span>{remaining} remaining — est. {daysToExit} days at current pace</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-medium text-amber-700 mb-1.5">While in learning phase — do NOT:</p>
              <ul className="space-y-1">
                {['Edit targeting, placements, or creative', 'Change budget by more than 20%', 'Pause and restart the ad set', 'Edit the optimisation event'].map((rule) => (
                  <li key={rule} className="text-xs text-near-black/60 flex items-start gap-1.5">
                    <span className="text-amber-500 flex-shrink-0">×</span> {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BudgetPacingAlert({ pacing }) {
  const { status, monthlyBudget, daysElapsed, daysInMonth, actualSpend, projectedMonthEnd, recommendedDaily, detail, adjustments } = pacing
  const isOver = status === 'over'
  const isUnder = status === 'under'
  const deviation = Math.abs(((projectedMonthEnd - monthlyBudget) / monthlyBudget) * 100).toFixed(1)
  const exceedsThreshold = Math.abs(deviation) > 15

  return (
    <div className={`bg-bone border p-4 ${exceedsThreshold ? (isOver ? 'border-red-200 border-l-2 border-l-red-400' : 'border-amber-200 border-l-2 border-l-amber-400') : 'border-brass/20'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {exceedsThreshold
              ? <span className={isOver ? 'badge-pause' : 'badge-watch'}>{isOver ? 'Over-pacing' : 'Under-pacing'}</span>
              : <span className="badge-scale">On track</span>}
            <span className="text-sm font-medium text-near-black">Monthly Budget Pacing</span>
          </div>
          <p className="text-xs text-near-black/40">Day {daysElapsed} of {daysInMonth}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="font-cormorant text-2xl font-semibold text-near-black">{fmtCurrency(actualSpend)}</p>
          <p className="text-xs text-near-black/40">spent of {fmtCurrency(monthlyBudget)}</p>
        </div>
      </div>

      {/* Pacing bar */}
      <div className="mb-3">
        <div className="h-2 bg-bone border border-brass/20 w-full relative mb-1">
          <div className="h-full bg-brass/60" style={{ width: `${(actualSpend / monthlyBudget) * 100}%` }} />
          {/* Expected marker */}
          <div className="absolute top-0 h-full border-l-2 border-near-black/20" style={{ left: `${(daysElapsed / daysInMonth) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-near-black/40">
          <span>Actual: {fmtCurrency(actualSpend)} ({((actualSpend / monthlyBudget) * 100).toFixed(0)}%)</span>
          <span>Expected at day {daysElapsed}: {fmtCurrency(Math.round((daysElapsed / daysInMonth) * monthlyBudget))}</span>
          <span>Projected month-end: <strong className={exceedsThreshold ? (isOver ? 'text-red-500' : 'text-amber-600') : 'text-near-black/60'}>{fmtCurrency(projectedMonthEnd)}</strong></span>
        </div>
      </div>

      <p className="text-xs text-near-black/60 leading-relaxed mb-3">{detail}</p>

      {exceedsThreshold && (
        <div>
          <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">Recommended adjustments</p>
          {adjustments.map((adj, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-near-black/60 mb-1">
              <span className={adj.action === 'increase' ? 'text-green-600' : 'text-red-500'}>
                {adj.action === 'increase' ? '↑' : '↓'}
              </span>
              <span><strong>{adj.campaign}</strong> — {adj.action} by {fmtCurrency(adj.amount)}/day. {adj.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AudienceSaturation({ audiences }) {
  return (
    <div className="space-y-3">
      {audiences.map((aud) => {
        const isCritical = aud.frequency >= aud.threshold
        const isWarning = aud.frequency >= aud.threshold * 0.9
        return (
          <div key={aud.id} className={`bg-bone border p-4 ${isCritical ? 'border-red-200 border-l-2 border-l-red-400' : isWarning ? 'border-amber-200 border-l-2 border-l-amber-400' : 'border-brass/15'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {isCritical
                  ? <span className="badge-pause">Saturated</span>
                  : isWarning
                    ? <span className="badge-watch">Approaching</span>
                    : <span className="badge-scale">Healthy</span>}
                <span className="text-sm font-medium text-near-black">{aud.name}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <span className={`font-cormorant text-xl font-semibold ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-600' : 'text-near-black/60'}`}>
                  {aud.frequency}
                </span>
                <span className="text-xs text-near-black/40">/{aud.threshold} threshold</span>
              </div>
            </div>
            <div className="h-1.5 bg-bone border border-brass/20 w-full mb-2">
              <div
                className={`h-full ${isCritical ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-brass/60'}`}
                style={{ width: `${Math.min((aud.frequency / aud.threshold) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-near-black/55">
                {aud.estimatedDaysToSaturation === 0
                  ? 'At or above saturation threshold.'
                  : `Estimated ${aud.estimatedDaysToSaturation} days to saturation at current pace.`}
                {' '}{aud.action}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AlertSystem({ campaigns, funnelData, budgetPacing, audiences, onBriefReplacement, briefSentIds, intel }) {
  const fatiguedCount = campaigns.flatMap(c => c.adSets.flatMap(s => s.ads)).filter(a => a.fatigueScore >= 50).length
  const scalingCount = campaigns.flatMap(c => c.adSets.flatMap(s => s.ads)).filter(a => a.roas >= 3.5 && a.frequency < 2.0 && a.hookRate >= 20 && a.daysRunning >= 3).length
  const learningCount = campaigns.flatMap(c => c.adSets).filter(s => s.status === 'learning').length
  const saturatedCount = audiences.filter(a => a.frequency >= a.threshold * 0.9).length

  return (
    <div className="card-brass-top mb-6">
      <div className="mb-4">
        <h2 className="font-cormorant text-2xl font-semibold text-near-black">Proactive Alerts</h2>
        <p className="text-xs text-near-black/40 mt-0.5">Problems surfaced before they cost money. Actions waiting for you.</p>
      </div>
      <AlertSection number="1" title="Creative Fatigue" count={fatiguedCount} severity={fatiguedCount > 0 ? 'critical' : 'ok'} defaultOpen={fatiguedCount > 0}>
        <CreativeFatigueAlerts campaigns={campaigns} onBriefReplacement={onBriefReplacement} briefSentIds={briefSentIds} intel={intel} />
      </AlertSection>
      <AlertSection number="2" title="Scaling Opportunities" count={scalingCount} severity="ok" defaultOpen={scalingCount > 0}>
        <ScalingOpportunities campaigns={campaigns} onScale={() => {}} briefSentIds={briefSentIds} />
      </AlertSection>
      <AlertSection number="3" title="Learning Phase" count={learningCount} severity={learningCount > 0 ? 'warning' : 'ok'} defaultOpen={learningCount > 0}>
        <LearningPhaseAlerts campaigns={campaigns} />
      </AlertSection>
      <AlertSection number="4" title="Budget Pacing" count={1} severity="warning" defaultOpen>
        <BudgetPacingAlert pacing={budgetPacing} />
      </AlertSection>
      <AlertSection number="5" title="Audience Saturation" count={saturatedCount} severity={saturatedCount > 0 ? 'warning' : 'ok'} defaultOpen={saturatedCount > 0}>
        <AudienceSaturation audiences={audiences} />
      </AlertSection>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 4 — TEAM INTELLIGENCE PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function TeamMessage({ message, onMarkRead, onNavigateToCreative, onUpdateCampaign }) {
  const typeConfig = MSG_TYPE_CONFIG[message.type] || MSG_TYPE_CONFIG.handoff_request
  const isFromOptimiser = message.from === 'optimiser'
  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    if (hours > 0) return `${hours}h ago`
    if (mins > 0) return `${mins}m ago`
    return 'just now'
  }

  return (
    <div
      className={`flex gap-3 ${isFromOptimiser ? 'flex-row' : 'flex-row-reverse'}`}
      onClick={() => !message.read && onMarkRead(message.id)}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 flex-shrink-0 border flex items-center justify-center text-xs font-cormorant font-semibold ${isFromOptimiser ? 'border-brass/40 bg-brass/10 text-brass-dark' : 'border-near-black/20 bg-near-black/5 text-near-black/50'}`}>
        {isFromOptimiser ? 'O' : 'C'}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[75%] ${isFromOptimiser ? '' : ''}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-medium text-near-black/60">{isFromOptimiser ? 'Optimiser' : 'Creative Strategist'}</span>
          <span className={typeConfig.cls}>{typeConfig.label}</span>
          {!message.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-brass flex-shrink-0" />
          )}
          <span className="text-xs text-near-black/30 ml-auto">{timeAgo(message.timestamp)}</span>
        </div>

        <div className={`p-3 border ${isFromOptimiser ? 'bg-bone border-brass/20' : 'bg-bone-dark border-brass/15'}`}>
          <p className="text-xs text-near-black/80 leading-relaxed mb-2">{message.message}</p>
          {message.adName && (
            <p className="text-xs text-near-black/40 italic">Re: {message.adName}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          {isFromOptimiser && message.cardId && (
            <button
              onClick={() => onNavigateToCreative(message)}
              className="text-xs text-brass font-medium hover:text-brass-dark transition-colors"
            >
              Go to Creative Strategist →
            </button>
          )}
          {!isFromOptimiser && (
            <button
              onClick={() => onUpdateCampaign(message)}
              className="text-xs text-near-black/40 hover:text-near-black/70 transition-colors"
            >
              Mark actioned
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamIntelligencePanel({ messages, onMarkRead, onNavigateToCreative, onUpdateCampaign, onClearResolved, lastSynced }) {
  const unread = messages.filter((m) => !m.read).length

  return (
    <div className="card-brass-top">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-cormorant text-2xl font-semibold text-near-black">Team Intelligence</h2>
            {unread > 0 && (
              <span className="bg-brass text-near-black text-xs font-medium px-2 py-0.5">
                {unread} unread
              </span>
            )}
          </div>
          <p className="text-xs text-near-black/40 mt-0.5">
            Live coordination between the Optimiser and Creative Strategist.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {lastSynced && (
            <span className="text-xs text-near-black/30">
              Synced {new Date(lastSynced).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={onClearResolved} className="btn-outline text-xs px-3 py-1.5">
            Clear resolved
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-near-black/30">No messages yet. Fatigue alerts and scaling signals will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...messages].reverse().map((msg) => (
            <TeamMessage
              key={msg.id}
              message={msg}
              onMarkRead={onMarkRead}
              onNavigateToCreative={onNavigateToCreative}
              onUpdateCampaign={onUpdateCampaign}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function MetaAdsOptimiser() {
  const navigate = useNavigate()
  const [intel, setIntel] = useState(() => readIntelligence())
  const [health, setHealth] = useState(null)
  const [recalculating, setRecalculating] = useState(false)
  const [briefSentIds, setBriefSentIds] = useState(new Set())
  const [scaledAdSets, setScaledAdSets] = useState(new Set())

  // ─── Init: seed shared intelligence on first visit ──────────────────────
  useEffect(() => {
    const current = readIntelligence()
    let updated = { ...current }

    // Seed team messages if empty
    if (current.teamMessages.length === 0) {
      updated.teamMessages = SEED_TEAM_MESSAGES
    }

    // Calculate and write account health
    const h = calculateMockAccountHealth()
    setHealth(h)
    updated.accountHealth = {
      score: h.score,
      lastScored: h.lastScored,
      criticalIssues: h.criticalIssues,
      warnings: h.warnings,
      opportunities: h.opportunities,
    }

    writeIntelligence(updated)
    setIntel(updated)
  }, [])

  // ─── Listen for shared intelligence updates ──────────────────────────────
  useEffect(() => {
    const handleUpdate = () => {
      const latest = readIntelligence()
      setIntel(latest)
    }
    window.addEventListener('sharedIntelligenceUpdate', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('sharedIntelligenceUpdate', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // ─── Recalculate account health ──────────────────────────────────────────
  function handleRecalculate() {
    setRecalculating(true)
    // TODO: Replace with Claude API call for health score calculation
    setTimeout(() => {
      const h = calculateMockAccountHealth()
      setHealth(h)
      const updated = {
        ...readIntelligence(),
        accountHealth: { score: h.score, lastScored: h.lastScored, criticalIssues: h.criticalIssues, warnings: h.warnings, opportunities: h.opportunities },
      }
      writeIntelligence(updated)
      setIntel(updated)
      setRecalculating(false)
    }, 1200)
  }

  // ─── Brief opportunity from health score ─────────────────────────────────
  function handleBriefOpportunity(opportunity) {
    sendHandoffToCreative({
      type: 'handoff_request',
      message: `Opportunity flagged: ${opportunity.title}. Brief pre-filled and ready in Creative Strategist.`,
      adName: opportunity.title,
      cardId: opportunity.cardId,
      inputs: opportunity.inputs,
    })
  }

  // ─── Brief replacement from table or alert ───────────────────────────────
  function handleBriefReplacement(ad, campaign) {
    sendHandoffToCreative({
      type: 'fatigue_alert',
      message: `${ad.name} has reached fatigue score ${ad.fatigueScore}/100 — frequency ${ad.frequency}, hook rate ${fmtPct(ad.hookRate)}, ${ad.daysRunning} days running. Replacement hook brief pre-filled in Creative Strategist.`,
      adName: ad.name,
      cardId: 'meta-ad',
      inputs: {
        box: campaign.name.includes('BBQ') ? 'BBQ' : campaign.name.includes('Premium') ? 'Premium' : campaign.name.includes('Lamb') ? 'Lamb' : 'Classic',
        audience: 'Families',
        objective: 'Retargeting warm audience',
        performanceContext: `Frequency ${ad.frequency}, hook rate ${fmtPct(ad.hookRate)}, ROAS ${fmtMult(ad.roas)}, ${ad.daysRunning} days running, fatigue score ${ad.fatigueScore}/100`,
        keyMessage: '',
      },
    })
    setBriefSentIds((prev) => new Set([...prev, ad.id]))
  }

  // ─── Scale action ─────────────────────────────────────────────────────────
  function handleScale(adSet, scaleData) {
    // TODO: Replace with Meta Ads API call to update ad set daily budget
    setScaledAdSets((prev) => new Set([...prev, adSet.id]))
    sendHandoffToCreative({
      type: 'scale_opportunity',
      message: `${scaleData.adSetName} scaled 20% ($${scaleData.currentBudget}/day → $${scaleData.newBudget}/day). Brief a second creative to support increased spend before frequency climbs.`,
      adName: scaleData.adSetName,
      cardId: 'meta-ad',
      inputs: {
        box: 'Classic',
        audience: 'General NZ',
        objective: 'Retargeting warm audience',
        performanceContext: `Ad set scaled +20%. Support creative needed to maintain frequency below 2.0 as budget increases.`,
        keyMessage: '',
      },
    })
  }

  // ─── Send handoff to Creative Strategist ─────────────────────────────────
  function sendHandoffToCreative({ type, message, adName, cardId, inputs }) {
    const current = readIntelligence()
    const newMessage = {
      id: `msg_${Date.now()}`,
      from: 'optimiser',
      to: 'creative',
      type,
      message,
      adName,
      cardId,
      inputs,
      timestamp: new Date().toISOString(),
      read: false,
      actioned: false,
    }
    const updated = {
      ...current,
      teamMessages: [...current.teamMessages, newMessage],
      pendingHandoff: { cardId, inputs, messageId: newMessage.id },
    }
    writeIntelligence(updated)
    setIntel(updated)
  }

  // ─── Mark message as read ─────────────────────────────────────────────────
  function handleMarkRead(messageId) {
    const current = readIntelligence()
    const updated = {
      ...current,
      teamMessages: current.teamMessages.map((m) => m.id === messageId ? { ...m, read: true } : m),
    }
    writeIntelligence(updated)
    setIntel(updated)
  }

  // ─── Navigate to Creative Strategist with pre-filled handoff ─────────────
  function handleNavigateToCreative(message) {
    const current = readIntelligence()
    const updated = {
      ...current,
      pendingHandoff: { cardId: message.cardId, inputs: message.inputs, messageId: message.id },
      teamMessages: current.teamMessages.map((m) => m.id === message.id ? { ...m, read: true } : m),
    }
    writeIntelligence(updated)
    navigate('/creative')
  }

  // ─── Mark message actioned ────────────────────────────────────────────────
  function handleUpdateCampaign(message) {
    const current = readIntelligence()
    const updated = {
      ...current,
      teamMessages: current.teamMessages.map((m) => m.id === message.id ? { ...m, actioned: true, read: true } : m),
    }
    writeIntelligence(updated)
    setIntel(updated)
  }

  // ─── Clear resolved messages (>7 days + actioned) ────────────────────────
  function handleClearResolved() {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    const current = readIntelligence()
    const updated = {
      ...current,
      teamMessages: current.teamMessages.filter(
        (m) => !(m.actioned && new Date(m.timestamp).getTime() < cutoff)
      ),
    }
    writeIntelligence(updated)
    setIntel(updated)
  }

  const displayHealth = health || {
    score: 0, breakdown: {}, criticalIssues: [], warnings: [], opportunities: [], lastScored: null,
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="section-title">Meta Ads Optimiser</h1>
        <p className="page-description">
          Proactive account management — data integrity, creative health, scaling and team coordination.
        </p>
        <p className="text-xs text-near-black/30 mt-1">
          [MOCK MODE] — all data is placeholder. Connect Meta Ads API to go live.
        </p>
      </div>

      {/* Layer 1: Account Health */}
      <AccountHealthScore
        health={displayHealth}
        onRecalculate={handleRecalculate}
        onBriefOpportunity={handleBriefOpportunity}
        recalculating={recalculating}
      />

      <div className="brass-divider" />

      {/* Layer 2: Performance Dashboard */}
      <PerformanceDashboard
        campaigns={MOCK_CAMPAIGNS}
        kpis={MOCK_KPIS}
        funnelData={MOCK_FUNNEL}
        onBriefReplacement={handleBriefReplacement}
        onScale={handleScale}
        briefSentIds={briefSentIds}
      />

      <div className="brass-divider" />

      {/* Layer 3: Alert System */}
      <AlertSystem
        campaigns={MOCK_CAMPAIGNS}
        funnelData={MOCK_FUNNEL}
        budgetPacing={MOCK_BUDGET_PACING}
        audiences={MOCK_AUDIENCES}
        onBriefReplacement={handleBriefReplacement}
        briefSentIds={briefSentIds}
        intel={intel}
      />

      <div className="brass-divider" />

      {/* Layer 4: Team Intelligence */}
      <TeamIntelligencePanel
        messages={intel.teamMessages}
        onMarkRead={handleMarkRead}
        onNavigateToCreative={handleNavigateToCreative}
        onUpdateCampaign={handleUpdateCampaign}
        onClearResolved={handleClearResolved}
        lastSynced={intel.lastUpdated}
      />
    </div>
  )
}
