import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MarketingBrain from './pages/MarketingBrain'
import Dashboard from './pages/Dashboard'
import SeoAssistant from './pages/SeoAssistant'
import ContentCalendar from './pages/ContentCalendar'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bone overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-bone">
          <div className="p-8 max-w-5xl">
            <Routes>
              <Route path="/" element={<Navigate to="/brain" replace />} />
              <Route path="/brain" element={<MarketingBrain />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/seo" element={<SeoAssistant />} />
              <Route path="/calendar" element={<ContentCalendar />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
