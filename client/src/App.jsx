import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Nutrition from './pages/Nutrition'
import Plans from './pages/Plans'
import Streaks from './pages/Streaks'
import './App.css'
import { useAthleteData } from './context/AthleteDataContext'

function SidebarContent({ navLinks, overviewStats, onNavigate }) {
  return (
    <>
      <div className="brand">Protena</div>
      <nav>
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              ['nav-link', isActive ? 'nav-link-active' : '']
                .filter(Boolean)
                .join(' ')
            }
            end={link.path === '/'}
            onClick={onNavigate}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-stats">
        {overviewStats.map((stat) => (
          <article key={stat.label}>
            <p className="eyebrow">{stat.label}</p>
            <p className="sidebar-stat-value">{stat.value}</p>
            <p className="muted">
              {stat.delta} <span>{stat.unit}</span>
            </p>
          </article>
        ))}
      </div>

      <button className="secondary-btn full-width">Quick scan meal</button>
    </>
  )
}

function App() {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { overviewStats, user } = useAthleteData()
  const location = useLocation()
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/nutrition', label: 'Diet' },
    { path: '/plans', label: 'Plans' },
    { path: '/streaks', label: 'Streaks' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0
      document.documentElement.style.setProperty('--scroll-progress', progress.toString())
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div
      className="app-shell"
      data-high-contrast={highContrast ? 'true' : 'false'}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      <aside className={`app-sidebar ${isSidebarOpen ? 'is-open' : ''}`} id="sidebar-drawer">
        <SidebarContent
          navLinks={navLinks}
          overviewStats={overviewStats}
          onNavigate={() => setIsSidebarOpen(false)}
        />
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>{user.name}</h2>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="pill ghost-btn menu-trigger"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-expanded={isSidebarOpen}
              aria-controls="sidebar-drawer"
            >
              Menu
            </button>
            <span className="pill pill-outline">{user.focus}</span>
            <button className="primary-btn">Sync devices</button>
            <div className="toggle-group">
              <button
                type="button"
                className={`pill toggle-btn ${highContrast ? 'toggle-active' : ''}`}
                onClick={() => setHighContrast((prev) => !prev)}
                aria-pressed={highContrast}
              >
                Contrast
              </button>
              <button
                type="button"
                className={`pill toggle-btn ${reducedMotion ? 'toggle-active' : ''}`}
                onClick={() => setReducedMotion((prev) => !prev)}
                aria-pressed={reducedMotion}
              >
                Calm motion
              </button>
            </div>
          </div>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/streaks" element={<Streaks />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Protena AI · Train hard, recover smarter.</p>
        </footer>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default App
