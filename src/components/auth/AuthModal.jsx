import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import styles from './AuthModal.module.css'

export default function AuthModal() {
  const { authOpen, setAuthOpen, authMode, setAuthMode, login } = useApp()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  if (!authOpen) return null

  const isLogin = authMode === 'login'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    if (!isLogin && !form.name) { toast.error('Please enter your name'); return }
    login({ name: isLogin ? form.email.split('@')[0] : form.name, email: form.email })
    toast.success(isLogin ? '👋 Welcome back!' : '🎉 Welcome to RecipeRemixing!')
    setForm({ name: '', email: '', password: '' })
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setAuthOpen(false)}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={() => setAuthOpen(false)}><X size={18} /></button>
        <div className={styles.header}>
          <div className={styles.logo}>🍳 RecipeRemixing</div>
          <h2 className={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p className={styles.sub}>{isLogin ? 'Sign in to your account' : 'Join 180K+ home chefs'}</p>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              className={styles.input}
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          )}
          <input
            className={styles.input}
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <Button type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 12, padding: '13px' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        <p className={styles.toggle}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => setAuthMode(isLogin ? 'register' : 'login')}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
        <div className={styles.divider}><span>or continue with</span></div>
        <div className={styles.social}>
          <button className={styles.socialBtn} onClick={() => { login({ name: 'Google User', email: 'user@gmail.com' }); toast.success('Signed in with Google!') }}>
            <span>G</span> Google
          </button>
          <button className={styles.socialBtn} onClick={() => { login({ name: 'GitHub User', email: 'user@github.com' }); toast.success('Signed in with GitHub!') }}>
            <span>⌥</span> GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
