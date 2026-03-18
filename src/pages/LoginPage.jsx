import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ChefHat, ArrowRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'
import styles from './AuthPages.module.css'

const FOOD_QUOTES = [
  { quote: 'Cooking is love made visible.',                               author: 'Unknown' },
  { quote: 'The secret ingredient is always love.',                       author: 'Every Grandma Ever' },
  { quote: 'Food is our common ground, a universal experience.',          author: 'James Beard' },
  { quote: 'To eat is a necessity, but to cook is an art.',               author: 'François de La Rochefoucauld' },
]
const FLOATING_EMOJIS = ['🍜','🥗','🍝','🥘','🍰','🥞','🍣','🫕','🍲','🥙','🧆','🍱']

export default function LoginPage() {
  const { login }    = useApp()
  const navigate     = useNavigate()
  const location     = useLocation()
  const from         = location.state?.from?.pathname || '/'
  const [form, setForm]       = useState({ email:'', password:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [errors,  setErrors]   = useState({})
  const [quoteIdx]             = useState(() => Math.floor(Math.random() * FOOD_QUOTES.length))

  const set = (k, v) => { setForm(f => ({ ...f, [k]:v })); if (errors[k]) setErrors(e => ({ ...e, [k]:'' })) }

  const validate = () => {
    const e = {}
    if (!form.email)                           e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Enter a valid email'
    if (!form.password)                         e.password = 'Password is required'
    else if (form.password.length < 6)          e.password = 'At least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // POST /api/auth/login → { message, user: { id,name,username,email,bio,avatarUrl }, token }
      const data = await authAPI.login(form)
      login(data.user, data.token)
      // Safe display name — backend formatUser returns name field
      const displayName = data.user?.name || data.user?.username || 'Chef'
      toast.success(`👋 Welcome back, ${displayName}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Invalid email or password')
      setErrors({ password: err.message || 'Invalid credentials' })
    } finally {
      setLoading(false)
    }
  }

  const q = FOOD_QUOTES[quoteIdx]

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.floatingOrbs}>
          {FLOATING_EMOJIS.map((em, i) => (
            <motion.span key={i} className={styles.orb}
              style={{ left:`${(i*83)%90}%`, top:`${(i*67+10)%85}%`, fontSize:`${1.2+(i%3)*0.6}rem` }}
              initial={{ opacity:0, scale:0 }} animate={{ opacity:0.18, scale:1 }} transition={{ delay:i*0.07 }}
            >{em}</motion.span>
          ))}
        </div>
        <motion.div className={styles.heroEmoji} initial={{ opacity:0, scale:0.5, rotate:-10 }} animate={{ opacity:1, scale:1, rotate:0 }} transition={{ type:'spring', stiffness:120, damping:14, delay:0.2 }}>🍳</motion.div>
        <motion.div className={styles.leftContent} initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
          <div className={styles.leftLogo}><ChefHat size={20} /> RecipeRemixing</div>
          <h2 className={styles.leftHeading}>The home chef's<br />community</h2>
          <p className={styles.leftSub}>Discover 24,000+ recipes. Share your creations.<br />Connect with food lovers worldwide.</p>
          <div className={styles.quoteBox}>
            <p className={styles.quoteText}>"{q.quote}"</p>
            <p className={styles.quoteAuthor}>— {q.author}</p>
          </div>
          <div className={styles.statsRow}>
            {[['24K+','Recipes'],['180K','Chefs'],['4.9M','Saves']].map(([n,l]) => (
              <div key={l} className={styles.statItem}><span className={styles.statNum}>{n}</span><span className={styles.statLbl}>{l}</span></div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <motion.div className={styles.formCard} initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}>
          <div className={styles.formHeader}>
            <motion.h1 className={styles.formTitle} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}>Welcome back</motion.h1>
            <motion.p className={styles.formSub} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }}>Sign in to your RecipeRemixing account</motion.p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email address</label>
                <div className={`${styles.inputWrap} ${errors.email ? styles.inputError : ''}`}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input type="email" className={styles.input} placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" autoFocus />
                </div>
                <AnimatePresence>
                  {errors.email && <motion.p className={styles.errorMsg} initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>{errors.email}</motion.p>}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.44 }}>
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
                  <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                </div>
                <div className={`${styles.inputWrap} ${errors.password ? styles.inputError : ''}`}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input type={showPass ? 'text' : 'password'} className={styles.input} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="current-password" />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && <motion.p className={styles.errorMsg} initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>{errors.password}</motion.p>}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.btnSpinner} /> : <> Sign In <ArrowRight size={16} /></>}
              </button>
            </motion.div>
          </form>

          <motion.p className={styles.switchText} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }}>
            Don't have an account? <Link to="/signup" className={styles.switchLink}>Create one free →</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
