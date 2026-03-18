import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Moon, Sun, ChefHat, Menu, X, LogOut, Bookmark } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import toast from 'react-hot-toast'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { theme, toggleTheme, user, logout, setAuthOpen, setAuthMode } = useApp()
  const [search, setSearch]           = useState('')
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  // ── Safe helpers — never crash even if user fields are missing ──
  const displayName    = user?.name || user?.username || user?.email || 'User'
  const avatarInitials = displayName.slice(0, 2).toUpperCase()
  const displayEmail   = user?.email || ''

  const openLogin = () => { setAuthMode('login'); setAuthOpen(true) }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    toast('👋 Signed out')
    navigate('/')
  }

  const navLinks = [
    { to: '/',          label: 'Discover'   },
    { to: '/planner',   label: 'Meal Plan'  },
    { to: '/ai',        label: '✨ AI Chef'  },
    { to: '/forum',     label: 'Community'  },
    { to: '/analytics', label: 'Dashboard'  },
  ]

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <ChefHat size={22} />
        Recipe<em>Remixing</em>
      </Link>

      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search recipes, ingredients, chefs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className={styles.links}>
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`${styles.navLink} ${location.pathname === l.to ? styles.active : ''}`}
          >
            {l.label}
          </Link>
        ))}

        <Link to="/create" className={styles.createBtn}>+ Share Recipe</Link>

        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div className={styles.profileWrap}>
            <button
              className={styles.avatarBtn}
              onClick={() => setProfileOpen(o => !o)}
              title={displayName}
            >
              {avatarInitials}
            </button>

            {profileOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileInfo}>
                  <div className={styles.profileAvatar}>{avatarInitials}</div>
                  <div>
                    <p className={styles.profileName}>{displayName}</p>
                    <p className={styles.profileEmail}>{displayEmail}</p>
                  </div>
                </div>
                <div className={styles.profileDivider} />
                <Link to="/bookmarks" className={styles.profileLink} onClick={() => setProfileOpen(false)}>
                  <Bookmark size={14} /> Bookmarks
                </Link>
                <Link to="/analytics" className={styles.profileLink} onClick={() => setProfileOpen(false)}>
                  📊 My Analytics
                </Link>
                <div className={styles.profileDivider} />
                <button className={styles.profileLogout} onClick={handleLogout}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.authBtns}>
            <Link to="/login"  className={styles.signInBtn}>Sign In</Link>
            <Link to="/signup" className={styles.signUpBtn}>Sign Up</Link>
          </div>
        )}
      </div>

      <button className={styles.hamburger} onClick={() => setMobileOpen(o => !o)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link to="/create" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
            + Share Recipe
          </Link>
          {user ? (
            <button className={styles.mobileLink} onClick={() => { handleLogout(); setMobileOpen(false) }}>
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/login"  className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/signup" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
