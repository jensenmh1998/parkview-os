import { Link } from 'react-router-dom'
import { dashboardMetrics, toolShortcuts } from '../data/mockData'

function MetricIcon({ type }) {
  const cls = 'w-5 h-5 text-brass/70'
  if (type === 'users') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
  if (type === 'dollar') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
  if (type === 'search') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
  if (type === 'trending') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  )
  return null
}

function ToolIcon({ type }) {
  const cls = 'w-5 h-5 text-brass'
  if (type === 'edit') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
  if (type === 'search') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
  if (type === 'trending') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  )
  if (type === 'calendar') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
  return null
}

export default function Dashboard() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-semibold text-near-black">
          {greeting}, Matt
        </h1>
        <p className="text-sm text-near-black/50 mt-1.5">
          Parkview Meats Co. &middot; Hawarden, Canterbury
        </p>
      </div>

      {/* Metric Cards */}
      <div className="mb-2">
        <h2 className="font-cormorant text-xl font-medium text-near-black/60 mb-4 tracking-wide">
          Overview
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {dashboardMetrics.map((m) => (
            <div key={m.id} className="card-brass-top">
              <div className="flex items-start justify-between mb-3">
                <MetricIcon type={m.icon} />
                <span className={`text-xs px-1.5 py-0.5 border ${m.live ? 'border-green-300 text-green-700 bg-green-50' : 'border-brass/20 text-near-black/30 bg-bone'}`}>
                  {m.live ? 'Live' : 'Mock'}
                </span>
              </div>
              <div className="font-cormorant text-3xl font-semibold text-near-black leading-none mb-2">
                {m.value}
              </div>
              <div className="text-xs font-medium text-near-black/70 mb-1">{m.label}</div>
              <div className="text-xs text-near-black/35">{m.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="brass-divider" />

      {/* Tool Shortcuts */}
      <div>
        <h2 className="font-cormorant text-xl font-medium text-near-black/60 mb-4 tracking-wide">
          Tools
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {toolShortcuts.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className="card group hover:border-brass/50 transition-colors duration-150 block"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-brass/30 flex items-center justify-center flex-shrink-0 group-hover:border-brass transition-colors duration-150">
                  <ToolIcon type={t.icon} />
                </div>
                <div>
                  <div className="font-cormorant text-lg font-semibold text-near-black group-hover:text-brass-dark transition-colors duration-150">
                    {t.label}
                  </div>
                  <div className="text-xs text-near-black/50 mt-0.5 leading-relaxed">
                    {t.description}
                  </div>
                </div>
                <svg className="w-4 h-4 text-brass/40 ml-auto mt-0.5 group-hover:text-brass transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
