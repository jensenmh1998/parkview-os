import { useState, useEffect } from 'react'
import { seoPlaceholder } from '../data/mockData'

const STORAGE_KEY = 'parkview_seo_history'
const taskTypes = ['Site Audit', 'Keyword Research', 'Competitor Analysis', 'Page Optimisation']

function SeverityDot({ severity }) {
  if (severity === 'critical') return <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0 mt-1.5" />
  if (severity === 'warning') return <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2 flex-shrink-0 mt-1.5" />
  return <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0 mt-1.5" />
}

function ScoreRing({ score }) {
  const colour = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-500' : 'text-red-500'
  const label = score >= 80 ? 'Good' : score >= 50 ? 'Needs work' : 'Poor'
  return (
    <div className="flex items-center gap-4">
      <div className={`font-cormorant text-5xl font-semibold ${colour}`}>{score}</div>
      <div>
        <div className={`text-sm font-medium ${colour}`}>{label}</div>
        <div className="text-xs text-near-black/40">out of 100</div>
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

  const criticalCount = entry.output.issuesFound.filter(i => i.severity === 'critical').length
  const warningCount = entry.output.issuesFound.filter(i => i.severity === 'warning').length
  const goodCount = entry.output.issuesFound.filter(i => i.severity === 'good').length

  return (
    <div className="card border-l-2 border-l-brass/40">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-near-black/40 uppercase tracking-wider">{entry.taskType}</span>
          <span className="text-near-black/25 mx-2">·</span>
          <span className="text-xs text-near-black/35">{entry.input}</span>
          <span className="text-near-black/25 mx-2">·</span>
          <span className="text-xs text-near-black/30">{new Date(entry.timestamp).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
        <button onClick={handleCopy} className="btn-outline text-xs px-3 py-1">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Score */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="card">
          <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-3">Score</p>
          <ScoreRing score={entry.output.score} />
          <div className="flex gap-4 mt-3 text-xs text-near-black/50">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> {criticalCount} critical</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> {warningCount} warnings</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> {goodCount} good</span>
          </div>
        </div>

        {/* Issues Found */}
        <div className="card">
          <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-3">Issues Found</p>
          <ul className="space-y-2">
            {entry.output.issuesFound.map((issue, i) => (
              <li key={i} className="flex items-start text-sm text-near-black/75">
                <SeverityDot severity={issue.severity} />
                <span>{issue.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Opportunities */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-3">Opportunities</p>
          <ul className="space-y-2">
            {entry.output.opportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-near-black/75">
                <span className="text-brass mt-0.5">↗</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-near-black/50 uppercase tracking-wider mb-3">Recommended Actions</p>
          <ul className="space-y-2">
            {entry.output.recommendedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-near-black/75">
                <span className="text-brass/60 mt-0.5">→</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function SeoAssistant() {
  const [input, setInput] = useState('')
  const [taskType, setTaskType] = useState(taskTypes[0])
  const [history, setHistory] = useState([])
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleRun = () => {
    if (!input.trim()) return
    setRunning(true)
    setTimeout(() => {
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: input.trim(),
        taskType,
        output: seoPlaceholder, // [MOCK] Replace with real SEO API / AI response
      }
      const updated = [entry, ...history]
      setHistory(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setInput('')
      setRunning(false)
    }, 900)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="section-title">SEO Assistant</h1>
        <p className="page-description">Audit your site, find keyword gaps, and get optimisation recommendations</p>
        <p className="text-xs text-near-black/30 mt-1">[MOCK MODE] — outputs are placeholder templates, not real SEO data</p>
      </div>

      {/* Input Panel */}
      <div className="card-brass-top mb-6">
        <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">URL or Keyword</label>
        <input
          className="input-field mb-4"
          placeholder="e.g. parkviewmeats.co.nz or 'grass-fed beef subscription NZ'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
        />
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <select
              className="select-field"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
            >
              {taskTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>
          <button
            className="btn-brass"
            onClick={handleRun}
            disabled={running || !input.trim()}
          >
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-5 text-xs text-near-black/40">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Warning</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Good</span>
      </div>

      {/* History */}
      {history.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cormorant text-xl font-medium text-near-black/60 tracking-wide">Results</h2>
            <button onClick={clearHistory} className="text-xs text-near-black/35 hover:text-near-black/60 transition-colors">Clear history</button>
          </div>
          <div className="space-y-4">
            {history.map((entry) => <OutputCard key={entry.id} entry={entry} />)}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-near-black/30 text-sm">No results yet — enter a URL or keyword above and click Run.</p>
        </div>
      )}
    </div>
  )
}
