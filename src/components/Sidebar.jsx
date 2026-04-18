import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { readIntelligence } from '../data/sharedIntelligence'

const navItems = [
  {
    path: '/brain',
    label: 'Marketing Brain',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-2.5-2.5v-1a2.5 2.5 0 010-5v-1A2.5 2.5 0 019.5 8 2.5 2.5 0 017 5.5 2.5 2.5 0 019.5 3z" />
        <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 002.5-2.5v-1a2.5 2.5 0 000-5v-1A2.5 2.5 0 0014.5 8 2.5 2.5 0 0117 5.5 2.5 2.5 0 0014.5 3z" />
      </svg>
    ),
    notify: true,
  },
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    path: '/seo',
    label: 'SEO Assistant',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    path: '/calendar',
    label: 'Content Calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  // Show notification dot on Marketing Brain when there are unread checklist tasks
  // or unread messages from the intelligence layer
  const [brainNotify, setBrainNotify] = useState(false)

  useEffect(() => {
    function checkNotify() {
      // Unread team messages
      const intel = readIntelligence()
      const hasUnread = (intel.teamMessages || []).some(
        (m) => m.from === 'optimiser' && m.to === 'creative' && !m.read
      )
      // Unread checklist items (tasks from today that aren't completed)
      try {
        const state = JSON.parse(localStorage.getItem('parkview_checklist_state') || '{}')
        const completedCount = Object.keys(state.ids || {}).length
        const totalTasks = 6 // MOCK_CHECKLIST_TASKS.length — keep in sync
        const hasPendingTasks = completedCount < totalTasks
        setBrainNotify(hasUnread || hasPendingTasks)
      } catch {
        setBrainNotify(hasUnread)
      }
    }

    checkNotify()

    function handleUpdate() { checkNotify() }
    window.addEventListener('sharedIntelligenceUpdate', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('sharedIntelligenceUpdate', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-brass/20 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-brass/20">
        <div className="flex items-center gap-2">
          <span className="font-cormorant text-xl font-semibold text-near-black tracking-wide leading-none">
            Parkview Meats Co.
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-brass flex-shrink-0 mb-0.5" />
        </div>
        <p className="text-xs text-near-black/40 mt-1.5 font-inter">Business OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const showDot = item.notify && brainNotify
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-inter transition-colors duration-150 group',
                  isActive
                    ? 'border-l-2 border-brass bg-brass/10 text-near-black pl-[10px]'
                    : 'border-l-2 border-transparent text-near-black/50 hover:text-near-black hover:bg-brass/5 pl-[10px]',
                ].join(' ')
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {showDot && (
                <span className="w-2 h-2 rounded-full bg-brass flex-shrink-0" aria-label="New items" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-6 py-5 border-t border-brass/20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-brass/20 border border-brass/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-cormorant font-semibold text-brass-dark">M</span>
          </div>
          <span className="text-sm font-inter text-near-black/70">Matt Jensen</span>
        </div>
      </div>
    </aside>
  )
}
