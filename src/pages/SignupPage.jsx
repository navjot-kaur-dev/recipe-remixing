import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ChefHat, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'
import styles from './AuthPages.module.css'

const STEPS    = ['Account','Profile','Done']
const INTERESTS = ['🍝 Italian','🍛 Indian','🥢 Asian','🫕 Middle Eastern','🌮 Mexican','🥐 French','🥗 Healthy','🍰 Baking','🥩 BBQ & Grill','🌿 Vegan','🐟 Seafood','☕ Beverages']

export default function SignupPage() {
  const { login } = useApp()
  const navigate  = useNavigate()
  const [step,      setStep]      = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})
  const [showPass,  setShowPass]  = useState(false)
  const [interests, setInterests] = useState(new Set())
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', username:'', bio:'' })

  const set = (k, v) => { setForm(f => ({ ...f, [k]:v })); if (errors[k]) setErrors(e => ({ ...e, [k]:'' })) }
  const toggleInterest = (i) => setInterests(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })

  const validateStep0 = () => {
    const e = {}
    if (!form.name.trim())                           e.name            = 'Name is required'
    if (!form.email)                                 e.email           = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email           = 'Enter a valid email'
    if (!form.password)                              e.password        = 'Password is required'
    else if (form.password.length < 8)               e.password        = 'At least 8 characters'
    if (form.password !== form.confirmPassword)      e.confirmPassword = 'Passwords do not match'
    setErrors(e); return Object.keys(e).length === 0
  }
  const validateStep1 = () => {
    const e = {}
    if (!form.username.trim())                       e.username = 'Username is required'
    else if (form.username.length < 3)               e.username = 'At least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers and _ only'
    setErrors(e); return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !validateStep1()) return
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // POST /api/auth/register
      // Sends: { name, username, email, password, bio, interests[] }
      // Returns: { message, user: { id,name,username,email,bio,avatarUrl }, token }
      const data = await authAPI.register({ ...form, interests: [...interests] })
      login(data.user, data.token)
      setStep(2)
      setTimeout(() => { toast.success('🎉 Welcome to RecipeRemixing!'); navigate('/') }, 2200)
    } catch (err) {
      toast.error(err.message || 'Registration failed')
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = (p) => {
    if (!p) return { score:0, label:'', color:'' }
    let s = 0
    if (p.length >= 8)            s++
    if (/[A-Z]/.test(p))          s++
    if (/[0-9]/.test(p))          s++
    if (/[^A-Za-z0-9]/.test(p))   s++
    return [{ label:'',color:'' },{ label:'Weak',color:'#ef4444' },{ label:'Fair',color:'#f59e0b' },{ label:'Good',color:'#3b82f6' },{ label:'Strong',color:'#22c55e' }][s]
  }
  const pw = pwStrength(form.password)

  const slideVars = {
    enter:  (d) => ({ x: d > 0 ? 60 : -60, opacity:0 }),
    center: { x:0, opacity:1 },
    exit:   (d) => ({ x: d > 0 ? -60 : 60, opacity:0 }),
  }

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.leftPanel}>
        <motion.div className={styles.heroEmoji} initial={{ opacity:0, scale:0.4, rotate:10 }} animate={{ opacity:1, scale:1, rotate:0 }} transition={{ type:'spring', stiffness:100, delay:0.15 }}>👨‍🍳</motion.div>
        <motion.div className={styles.leftContent} initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <div className={styles.leftLogo}><ChefHat size={20} /> RecipeRemixing</div>
          <h2 className={styles.leftHeading}>Join 180,000+<br />home chefs</h2>
          <p className={styles.leftSub}>Share recipes, discover new dishes,<br />and build your culinary legacy.</p>
          <ul className={styles.benefitsList}>
            {['Create & publish unlimited recipes','AI-powered ingredient suggestions','Weekly meal planner included','Connect with chefs worldwide'].map((b,i) => (
              <motion.li key={i} className={styles.benefitItem} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4+i*0.1 }}>
                <Check size={14} className={styles.checkIcon} />{b}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <motion.div className={styles.formCard} initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}>
          {/* Step indicator */}
          <div className={styles.stepIndicator}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`${styles.stepDot} ${i<=step?styles.stepDotActive:''} ${i<step?styles.stepDotDone:''}`}>
                  {i < step ? <Check size={12} /> : <span>{i+1}</span>}
                </div>
                <span className={`${styles.stepLabel} ${i===step?styles.stepLabelActive:''}`}>{s}</span>
                {i < STEPS.length-1 && <div className={`${styles.stepLine} ${i<step?styles.stepLineDone:''}`} />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={1}>
            {/* STEP 0 */}
            {step === 0 && (
              <motion.div key="s0" custom={1} variants={slideVars} initial="enter" animate="center" exit="exit" transition={{ duration:0.3 }}>
                <div className={styles.formHeader}>
                  <h1 className={styles.formTitle}>Create account</h1>
                  <p className={styles.formSub}>Start your culinary journey today</p>
                </div>
                {[
                  { label:'Full Name',       key:'name',     type:'text',     icon:<User size={15} />,  ph:'Gordon Ramsay' },
                  { label:'Email Address',   key:'email',    type:'email',    icon:<Mail size={15} />,  ph:'you@example.com' },
                ].map(f => (
                  <div key={f.key} className={styles.fieldGroup}>
                    <label className={styles.label}>{f.label}</label>
                    <div className={`${styles.inputWrap} ${errors[f.key]?styles.inputError:''}`}>
                      <span style={{ color:'var(--text3)', flexShrink:0 }}>{f.icon}</span>
                      <input type={f.type} className={styles.input} placeholder={f.ph} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
                    </div>
                    <AnimatePresence>{errors[f.key] && <motion.p className={styles.errorMsg} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>{errors[f.key]}</motion.p>}</AnimatePresence>
                  </div>
                ))}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Password</label>
                  <div className={`${styles.inputWrap} ${errors.password?styles.inputError:''}`}>
                    <Lock size={15} className={styles.inputIcon} />
                    <input type={showPass?'text':'password'} className={styles.input} placeholder="At least 8 characters" value={form.password} onChange={e => set('password',e.target.value)} autoComplete="new-password" />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(s=>!s)} tabIndex={-1}>{showPass?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                  </div>
                  {form.password && (
                    <div className={styles.strengthBar}>
                      {[1,2,3,4].map(n => <div key={n} className={styles.strengthSegment} style={{ background:n<=pwStrength(form.password).score?pw.color:'var(--border)' }} />)}
                      <span className={styles.strengthLabel} style={{ color:pw.color }}>{pw.label}</span>
                    </div>
                  )}
                  <AnimatePresence>{errors.password && <motion.p className={styles.errorMsg} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>{errors.password}</motion.p>}</AnimatePresence>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Confirm Password</label>
                  <div className={`${styles.inputWrap} ${errors.confirmPassword?styles.inputError:''}`}>
                    <Lock size={15} className={styles.inputIcon} />
                    <input type="password" className={styles.input} placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword',e.target.value)} autoComplete="new-password" />
                  </div>
                  <AnimatePresence>{errors.confirmPassword && <motion.p className={styles.errorMsg} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>{errors.confirmPassword}</motion.p>}</AnimatePresence>
                </div>
                <button type="button" className={styles.submitBtn} onClick={nextStep}>Continue <ArrowRight size={16}/></button>
                <p className={styles.switchText}>Already have an account? <Link to="/login" className={styles.switchLink}>Sign in →</Link></p>
              </motion.div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="s1" custom={1} variants={slideVars} initial="enter" animate="center" exit="exit" transition={{ duration:0.3 }}>
                <div className={styles.formHeader}>
                  <h1 className={styles.formTitle}>Your chef profile</h1>
                  <p className={styles.formSub}>Tell us a bit about yourself</p>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Username</label>
                  <div className={`${styles.inputWrap} ${errors.username?styles.inputError:''}`}>
                    <span style={{ fontSize:14, color:'var(--text3)', flexShrink:0 }}>@</span>
                    <input type="text" className={styles.input} placeholder="chef_username" value={form.username} onChange={e => set('username', e.target.value.toLowerCase())} autoFocus />
                  </div>
                  <AnimatePresence>{errors.username && <motion.p className={styles.errorMsg} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>{errors.username}</motion.p>}</AnimatePresence>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Bio <span style={{ color:'var(--text3)', fontWeight:400 }}>(optional)</span></label>
                  <textarea className={styles.textarea} placeholder="I love cooking Italian food…" value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} maxLength={200} />
                  <p className={styles.charCount}>{form.bio.length}/200</p>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Cuisine interests <span style={{ color:'var(--text3)', fontWeight:400 }}>(pick any)</span></label>
                  <div className={styles.interestGrid}>
                    {INTERESTS.map(item => (
                      <button key={item} type="button" className={`${styles.interestChip} ${interests.has(item)?styles.interestActive:''}`} onClick={() => toggleInterest(item)}>
                        {item}{interests.has(item) && <Check size={10} className={styles.interestCheck} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.stepBtns}>
                  <button type="button" className={styles.backBtn} onClick={() => setStep(0)}><ArrowLeft size={15}/> Back</button>
                  <button type="button" className={styles.submitBtn} style={{ flex:1 }} onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className={styles.btnSpinner}/> : <>Create Account <ArrowRight size={16}/></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — SUCCESS */}
            {step === 2 && (
              <motion.div key="s2" custom={1} variants={slideVars} initial="enter" animate="center" exit="exit" transition={{ duration:0.4 }} style={{ textAlign:'center', padding:'2rem 0' }}>
                <motion.div className={styles.successCircle} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200, damping:14, delay:0.1 }}>
                  <span>🎉</span>
                </motion.div>
                <motion.h2 className={styles.successTitle} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
                  You're all set, {form.name.split(' ')[0]}!
                </motion.h2>
                <motion.p className={styles.successSub} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}>
                  Welcome to the RecipeRemixing family.<br />Taking you to the kitchen…
                </motion.p>
                <motion.div className={styles.successDots} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}>
                  {[0,1,2].map(i => <motion.span key={i} className={styles.successDot} animate={{ scale:[1,1.5,1] }} transition={{ repeat:Infinity, duration:0.8, delay:i*0.2 }} />)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
