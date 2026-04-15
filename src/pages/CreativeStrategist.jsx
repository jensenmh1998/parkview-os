import { useState, useEffect } from 'react'
import { creativePlaceholder } from '../data/mockData'

const STORAGE_KEY = 'parkview_creative_history'

const contentTypes = ['Meta Ad', 'Email Campaign', 'Organic Post', 'Ad Concept']

function OutputCard({ entry, onCopy }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = [
      `Campaign Concept:\n${entry.output.campaignConcept}`,
      `\nAd Angles:\n${entry.output.adAngles.join('\n')}`,
      `\nRecommended Copy:\n${entry.output.recommendedCopy}`,
      `\nAudience Notes:\n${entry.output.audienceNotes}`,
    ].join('')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card border-l-2 border-l-brass/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-near-black/40 uppercase tracking-wider">{entry.contentType}</span>
          <span className="text-near-black/25 mx-2">·</span>
          <span className="text-xs text-near-black/35">{new Date(entry.timestamp).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
        <button onClick={handleCopy} className="btn-outline text-xs px-3 py-1">
          {copied ? 'Copied!' : 'Copy all'}
        </button>
      </div>

      <div className="text-xs text-near-black/40 italic mb-4 border-l border-brass/20 pl-3">
        Brief: {entry.brief}
      </div>

      <div className="space-y-4">
        <Section label="Campaign Concept" content={entry.output.campaignConcept} />
        <div>
          <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">Ad Angles</p>
          <ul className="space-y-1.5">
            {entry.output.adAngles.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-near-black/75">
                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center border border-brass/30 text-brass text-xs mt-0.5">{i + 1}</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
        <Section label="Recommended Copy" content={entry.output.recommendedCopy} />
        <Section label="Audience Notes" content={entry.output.audienceNotes} />
      </div>
    </div>
  )
}

function Section({ label, content }) {
  return (
    <div>
      <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm text-near-black/80 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  )
}

export default function CreativeStrategist() {
  const [brief, setBrief] = useState('')
  const [contentType, setContentType] = useState(contentTypes[0])
  const [history, setHistory] = useState([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleGenerate = () => {
    if (!brief.trim()) return
    setGenerating(true)
    // Simulate a brief delay (no real API call — mock output only)
    setTimeout(() => {
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        brief: brief.trim(),
        contentType,
        output: creativePlaceholder, // [MOCK] Replace with real AI response
      }
      const updated = [entry, ...history]
      setHistory(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setBrief('')
      setGenerating(false)
    }, 900)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="section-title">Creative Strategist</h1>
        <p className="page-description">Generate Meta ad campaigns, copy and audience strategy</p>
        <p className="text-xs text-near-black/30 mt-1">[MOCK MODE] — outputs are placeholder templates, not real AI responses</p>
      </div>

      {/* Input Panel */}
      <div className="card-brass-top mb-6">
        <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">Brief</label>
        <textarea
          className="input-field h-28 resize-none mb-4"
          placeholder="Describe your campaign goal, product focus, or audience you want to reach..."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <select
              className="select-field"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              {contentTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <button
            className="btn-brass"
            onClick={handleGenerate}
            disabled={generating || !brief.trim()}
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cormorant text-xl font-medium text-near-black/60 tracking-wide">
              Previous Outputs
            </h2>
            <button onClick={clearHistory} className="text-xs text-near-black/35 hover:text-near-black/60 transition-colors">
              Clear history
            </button>
          </div>
          <div className="space-y-4">
            {history.map((entry) => (
              <OutputCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-near-black/30 text-sm">No outputs yet — enter a brief above and click Generate.</p>
        </div>
      )}
    </div>
  )
}
