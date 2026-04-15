import { useState, useEffect } from 'react'
import { adsPlaceholder } from '../data/mockData'

const STORAGE_KEY = 'parkview_ads_history'

function Badge({ type }) {
  const cls = {
    scale: 'badge-scale',
    pause: 'badge-pause',
    watch: 'badge-watch',
    refresh: 'badge-refresh',
  }[type] || 'badge-watch'
  const labels = { scale: 'Scale', pause: 'Pause', watch: 'Watch', refresh: 'Refresh Creative' }
  return <span className={cls}>{labels[type] || type}</span>
}

function RecommendationCard({ rec }) {
  return (
    <div className="card flex items-start gap-3">
      <div className="pt-0.5">
        <Badge type={rec.type} />
      </div>
      <div>
        <div className="text-sm font-medium text-near-black mb-0.5">{rec.ad}</div>
        <div className="text-xs text-near-black/55">{rec.reason}</div>
      </div>
    </div>
  )
}

function OutputCard({ entry }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = JSON.stringify(entry.output, null, 2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const groups = {
    scale: entry.output.recommendations.filter(r => r.type === 'scale'),
    pause: entry.output.recommendations.filter(r => r.type === 'pause'),
    watch: entry.output.recommendations.filter(r => r.type === 'watch'),
    refresh: entry.output.recommendations.filter(r => r.type === 'refresh'),
  }

  return (
    <div className="card border-l-2 border-l-brass/40">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-near-black/35">
          {new Date(entry.timestamp).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
        <button onClick={handleCopy} className="btn-outline text-xs px-3 py-1">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Performance Summary */}
      <div className="card mb-5">
        <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">Performance Summary</p>
        <p className="text-sm text-near-black/80 leading-relaxed">{entry.output.performanceSummary}</p>
      </div>

      {/* Recommendation Groups */}
      <div className="space-y-4">
        {groups.scale.length > 0 && (
          <div>
            <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">Scale Recommendations</p>
            <div className="space-y-2">{groups.scale.map((r, i) => <RecommendationCard key={i} rec={r} />)}</div>
          </div>
        )}
        {groups.pause.length > 0 && (
          <div>
            <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">Pause Recommendations</p>
            <div className="space-y-2">{groups.pause.map((r, i) => <RecommendationCard key={i} rec={r} />)}</div>
          </div>
        )}
        {groups.watch.length > 0 && (
          <div>
            <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">Watch</p>
            <div className="space-y-2">{groups.watch.map((r, i) => <RecommendationCard key={i} rec={r} />)}</div>
          </div>
        )}
        {groups.refresh.length > 0 && (
          <div>
            <p className="text-xs font-medium text-near-black/40 uppercase tracking-wider mb-2">Creative Fatigue Alerts</p>
            <div className="space-y-2">{groups.refresh.map((r, i) => <RecommendationCard key={i} rec={r} />)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MetaAdsOptimiser() {
  const [data, setData] = useState('')
  const [history, setHistory] = useState([])
  const [analysing, setAnalysing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleAnalyse = () => {
    if (!data.trim()) return
    setAnalysing(true)
    setTimeout(() => {
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        rawData: data.trim(),
        output: adsPlaceholder, // [MOCK] Replace with real AI analysis
      }
      const updated = [entry, ...history]
      setHistory(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setData('')
      setAnalysing(false)
    }, 900)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="section-title">Meta Ads Optimiser</h1>
        <p className="page-description">Daily ad performance analysis and spend recommendations</p>
        <p className="text-xs text-near-black/30 mt-1">[MOCK MODE] — outputs are placeholder templates, not real ad analysis</p>
      </div>

      {/* Input Panel */}
      <div className="card-brass-top mb-6">
        <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">
          Paste Ad Performance Data
        </label>
        <p className="text-xs text-near-black/35 mb-3">
          Paste a CSV export, table, or plain-text summary of your Meta Ads performance data
        </p>
        <textarea
          className="input-field h-36 resize-none mb-4 font-mono text-xs"
          placeholder={`Campaign Name, Spend, Impressions, Clicks, CTR, ROAS\n"Butcher Story Video", $420, 18200, 692, 3.8%, 5.2x\n"Summer BBQ Static", $180, 22000, 88, 0.4%, 0.8x\n...`}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            className="btn-brass"
            onClick={handleAnalyse}
            disabled={analysing || !data.trim()}
          >
            {analysing ? 'Analysing...' : 'Analyse'}
          </button>
        </div>
      </div>

      {/* Badge Legend */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span className="text-xs text-near-black/40">Badges:</span>
        <span className="badge-scale">Scale</span>
        <span className="badge-pause">Pause</span>
        <span className="badge-watch">Watch</span>
        <span className="badge-refresh">Refresh Creative</span>
      </div>

      {/* History */}
      {history.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cormorant text-xl font-medium text-near-black/60 tracking-wide">Analysis History</h2>
            <button onClick={clearHistory} className="text-xs text-near-black/35 hover:text-near-black/60 transition-colors">Clear history</button>
          </div>
          <div className="space-y-4">
            {history.map((entry) => <OutputCard key={entry.id} entry={entry} />)}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-near-black/30 text-sm">No analyses yet — paste performance data above and click Analyse.</p>
        </div>
      )}
    </div>
  )
}
