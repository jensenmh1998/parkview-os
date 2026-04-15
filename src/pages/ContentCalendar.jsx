import { useState, useEffect } from 'react'
import { calendarPlatformColours } from '../data/mockData'

const STORAGE_KEY = 'parkview_calendar_history'

const ALL_PLATFORMS = ['Instagram', 'TikTok', 'Email', 'Meta Ads']

// [MOCK] Example content briefs used to populate calendar cells
const MOCK_BRIEFS = {
  Instagram: [
    { format: 'Reel', hook: 'Watch this cut hit the pan 🔥', caption: 'Show butcher prep → sear → serve. Tag #ParkviewMeats. Best time: 7–9am', time: '7:30am' },
    { format: 'Carousel', hook: 'Why our beef tastes different', caption: '5-slide carousel: farm → paddock → butcher → box → plate. Story-driven.', time: '12:00pm' },
    { format: 'Story', hook: 'This week\'s box is ready', caption: 'Behind-the-scenes packing, add swipe-up to shop link.', time: '9:00am' },
    { format: 'Post', hook: 'Canterbury-raised, hand-cut', caption: 'Hero product photo with provenance caption. Tag farmer.', time: '6:00pm' },
  ],
  TikTok: [
    { format: 'Video', hook: 'POV: You ordered Parkview', caption: 'Unboxing + cook. Trending audio. 30–60s. No voiceover needed.', time: '6:00pm' },
    { format: 'Duet', hook: 'Reacting to premium vs supermarket beef', caption: 'Duet with food comparison trend. Show texture difference.', time: '7:00pm' },
    { format: 'Tutorial', hook: 'How to cook the perfect sirloin in 60s', caption: 'Fast-cut tutorial. Stitch-friendly format.', time: '5:30pm' },
  ],
  Email: [
    { format: 'Newsletter', hook: 'Your fortnightly cut is ready', caption: 'Featured cut of the fortnight + recipe + subscriber referral CTA.', time: '8:00am' },
    { format: 'Promo', hook: 'We added something new to the box', caption: 'Announce new product add-on. Urgency: "first 50 subscribers only".', time: '10:00am' },
  ],
  'Meta Ads': [
    { format: 'Video Ad', hook: 'Not every cut earns the Parkview name', caption: 'Cold audience. 15s cut. Farm B-roll + product close-up.', time: 'Scheduled' },
    { format: 'Carousel Ad', hook: 'From paddock to your door', caption: 'Retargeting: show journey. 3-card carousel. CTA: Subscribe.', time: 'Scheduled' },
  ],
}

function platformBadge(platform) {
  const cls = calendarPlatformColours[platform] || 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span key={platform} className={`inline-block text-xs px-1.5 py-0.5 border ${cls} mr-1`}>
      {platform}
    </span>
  )
}

function CalendarCell({ date, briefs }) {
  const dayNum = date.getDate()
  const dayName = date.toLocaleDateString('en-NZ', { weekday: 'short' })
  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <div className={`border border-brass/15 p-2 min-h-[120px] ${isToday ? 'bg-brass/5 border-brass/40' : 'bg-bone'}`}>
      <div className={`text-xs font-medium mb-2 ${isToday ? 'text-brass' : 'text-near-black/50'}`}>
        {dayName} <span className={`ml-1 ${isToday ? 'font-bold text-brass' : ''}`}>{dayNum}</span>
      </div>
      <div className="space-y-1.5">
        {briefs.map((b, i) => (
          <div key={i} className="bg-bone-dark border border-brass/20 p-1.5">
            <div className="flex items-center justify-between mb-1">
              {platformBadge(b.platform)}
              <span className="text-xs text-near-black/30">{b.time}</span>
            </div>
            <div className="text-xs font-medium text-near-black/80 leading-snug mb-0.5">{b.format}</div>
            <div className="text-xs text-near-black/50 leading-snug italic">"{b.hook}"</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarGrid({ entry }) {
  // Build 14 days from entry.startDate
  const start = new Date(entry.startDate)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  // [MOCK] Distribute mock briefs across the 14 days in a rotating pattern
  const getBriefsForDay = (date, platforms) => {
    const idx = Math.floor((date - start) / 86400000)
    const briefs = []
    platforms.forEach((platform) => {
      const pool = MOCK_BRIEFS[platform] || []
      if (pool.length > 0) {
        // Show a brief every 2-3 days per platform (mock rotation)
        const offset = { Instagram: 0, TikTok: 1, Email: 3, 'Meta Ads': 0 }[platform] || 0
        const interval = { Instagram: 2, TikTok: 3, Email: 5, 'Meta Ads': 4 }[platform] || 3
        if ((idx + offset) % interval === 0) {
          briefs.push({ ...pool[idx % pool.length], platform })
        }
      }
    })
    return briefs
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-xs text-near-black/40">Platforms:</span>
        {entry.platforms.map(p => platformBadge(p))}
        <span className="text-xs text-near-black/30 ml-auto">
          {new Date(entry.startDate).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })} –{' '}
          {new Date(entry.endDate).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => (
          <CalendarCell
            key={i}
            date={date}
            briefs={getBriefsForDay(date, entry.platforms)}
          />
        ))}
      </div>
    </div>
  )
}

function HistoryEntry({ entry }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="card border-l-2 border-l-brass/40">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div>
          <span className="font-medium text-near-black text-sm">{entry.focus}</span>
          <span className="text-near-black/30 mx-2">·</span>
          <span className="text-xs text-near-black/35">
            {new Date(entry.timestamp).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-near-black/30 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="mt-4">
          <CalendarGrid entry={entry} />
        </div>
      )}
    </div>
  )
}

export default function ContentCalendar() {
  const [focus, setFocus] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 13)
    return d.toISOString().split('T')[0]
  })
  const [platforms, setPlatforms] = useState(['Instagram', 'TikTok', 'Email'])
  const [history, setHistory] = useState([])
  const [building, setBuilding] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const togglePlatform = (p) => {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const handleBuild = () => {
    if (!focus.trim() || platforms.length === 0) return
    setBuilding(true)
    setTimeout(() => {
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        focus: focus.trim(),
        startDate,
        endDate,
        platforms,
        // [MOCK] Calendar content is generated from MOCK_BRIEFS above
      }
      const updated = [entry, ...history]
      setHistory(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setFocus('')
      setBuilding(false)
    }, 900)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="section-title">Content Calendar Builder</h1>
        <p className="page-description">Plan and brief your content across Instagram, TikTok and email</p>
        <p className="text-xs text-near-black/30 mt-1">[MOCK MODE] — calendar content is placeholder briefs, not AI-generated plans</p>
      </div>

      {/* Input Panel */}
      <div className="card-brass-top mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">
              Campaign Focus
            </label>
            <input
              className="input-field"
              placeholder="e.g. Father's Day promotion, new box launch, subscriber drive..."
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-near-black/50 uppercase tracking-wider mb-2">Platforms</label>
          <div className="flex gap-2 flex-wrap">
            {ALL_PLATFORMS.map(p => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 text-sm border transition-colors duration-150 ${
                  platforms.includes(p)
                    ? 'bg-brass text-near-black border-brass'
                    : 'bg-bone border-brass/30 text-near-black/50 hover:border-brass/60'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="btn-brass"
            onClick={handleBuild}
            disabled={building || !focus.trim() || platforms.length === 0}
          >
            {building ? 'Building...' : 'Build Calendar'}
          </button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cormorant text-xl font-medium text-near-black/60 tracking-wide">Calendars</h2>
            <button onClick={clearHistory} className="text-xs text-near-black/35 hover:text-near-black/60 transition-colors">Clear history</button>
          </div>
          <div className="space-y-4">
            {history.map((entry) => <HistoryEntry key={entry.id} entry={entry} />)}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-near-black/30 text-sm">No calendars yet — fill in the details above and click Build Calendar.</p>
        </div>
      )}
    </div>
  )
}
