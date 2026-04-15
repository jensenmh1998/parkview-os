import { NavLink } from 'react-router-dom'

const navItems = [
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
    path: '/creative',
    label: 'Creative Strategist',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
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
    path: '/ads',
    label: 'Meta Ads Optimiser',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
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
        {navItems.map((item) => (
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
            <span>{item.label}</span>
          </NavLink>
        ))}
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
