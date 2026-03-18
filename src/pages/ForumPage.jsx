import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag } from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import { communityAPI } from '@/services/api'
import { FORUM_THREADS } from '@/data/recipes'
import { useApp } from '@/context/AppContext'
import toast from 'react-hot-toast'
import styles from './ForumPage.module.css'

const FORUM_CATS = ['All Topics','Tips & Tricks','Recipe Help','Ingredient Swaps','Equipment','Diet & Nutrition']

export default function ForumPage() {
  const { user, setAuthOpen } = useApp()
  const [activeTab,     setActiveTab]     = useState('All Topics')
  const [threads,       setThreads]       = useState(FORUM_THREADS)
  const [loading,       setLoading]       = useState(true)
  const [showNewThread, setShowNewThread] = useState(false)
  const [newThread,     setNewThread]     = useState({ title:'', tag:'Tips & Tricks', body:'' })
  const [likedThreads,  setLikedThreads]  = useState(new Set())
  const [submitting,    setSubmitting]    = useState(false)

  // GET /api/community?category=...
  // Returns { threads: [{ id, title, tag, author, initials, likes, replies, time }] }
  useEffect(() => {
    setLoading(true)
    communityAPI.getThreads(activeTab)
      .then(data => {
        const list = data.threads || data || []
        if (Array.isArray(list) && list.length > 0) setThreads(list)
        else setThreads(FORUM_THREADS) // fallback to mock
      })
      .catch(() => setThreads(FORUM_THREADS))
      .finally(() => setLoading(false))
  }, [activeTab])

  const filtered = activeTab === 'All Topics'
    ? threads
    : threads.filter(t => t.tag === activeTab)

  // POST /api/community/:id/like → { liked, likes }
  const toggleLike = async (id) => {
    if (!user) { setAuthOpen(true); return }
    setLikedThreads(prev => {
      const n = new Set(prev)
      if (n.has(id)) {
        n.delete(id)
        setThreads(ts => ts.map(t => t.id === id ? { ...t, likes: Math.max(0,(t.likes||0) - 1) } : t))
      } else {
        n.add(id)
        setThreads(ts => ts.map(t => t.id === id ? { ...t, likes: (t.likes||0) + 1 } : t))
      }
      return n
    })
    try { await communityAPI.toggleLike(id) } catch {}
  }

  // POST /api/community → { message, thread: { id, title, tag, author, ... } }
  const submitThread = async () => {
    if (!user) { setAuthOpen(true); return }
    if (!newThread.title.trim()) { toast.error('Add a thread title'); return }
    setSubmitting(true)
    try {
      const data = await communityAPI.createThread(newThread)
      const created = data.thread || {
        id:       `f${Date.now()}`,
        title:    newThread.title,
        author:   user.name || user.username,
        initials: (user.name || 'U').slice(0,2).toUpperCase(),
        replies:  0,
        likes:    0,
        time:     'Just now',
        tag:      newThread.tag,
      }
      setThreads(prev => [created, ...prev])
      setNewThread({ title:'', tag:'Tips & Tricks', body:'' })
      setShowNewThread(false)
      toast.success('🗣️ Thread posted!')
    } catch (err) {
      toast.error(err.message || 'Failed to post thread')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>🍽️ Community Forum</h1>
          <p>Ask questions, share tips, and connect with fellow food enthusiasts</p>
        </div>
        <Button variant="primary" size="md" onClick={() => { if (!user) { setAuthOpen(true); return } setShowNewThread(true) }}>
          + New Thread
        </Button>
      </div>

      {showNewThread && (
        <motion.div className={styles.newThreadForm} initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}>
          <h3 className={styles.newThreadTitle}>Start a New Thread</h3>
          <input className={styles.formInput} placeholder="What's your question or topic?" value={newThread.title} onChange={e => setNewThread(f => ({ ...f, title:e.target.value }))} />
          <select className={styles.formSelect} value={newThread.tag} onChange={e => setNewThread(f => ({ ...f, tag:e.target.value }))}>
            {FORUM_CATS.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
          <textarea className={styles.formTextarea} placeholder="Add more details (optional)…" value={newThread.body} onChange={e => setNewThread(f => ({ ...f, body:e.target.value }))} rows={3} />
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <Button variant="primary" size="sm" onClick={submitThread} disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Thread'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowNewThread(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      <div className={styles.tabs}>
        {FORUM_CATS.map(cat => (
          <button key={cat} className={`${styles.tab} ${activeTab === cat ? styles.tabActive : ''}`} onClick={() => setActiveTab(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.threadList}>
        {loading && <p style={{ color:'var(--text3)', fontSize:'0.875rem', padding:'1rem 0' }}>Loading threads…</p>}
        {!loading && filtered.length === 0 && (
          <div className={styles.empty}><span>💬</span><p>No threads yet. Be the first to post!</p></div>
        )}
        {filtered.map((t, i) => (
          <motion.div key={t.id} className={styles.thread} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}>
            <div className={styles.threadAvatar}>{t.initials || (t.author||'U').slice(0,2).toUpperCase()}</div>
            <div className={styles.threadContent}>
              <div className={styles.threadTop}>
                <Tag>{t.tag}</Tag>
                <span className={styles.threadTime}>{t.time || t.created_at}</span>
              </div>
              <h3 className={styles.threadTitle}>{t.title}</h3>
              <div className={styles.threadMeta}>
                <span>👤 {t.author || t.username}</span>
                <span>💬 {t.replies || 0} replies</span>
                <button className={`${styles.likeBtn} ${likedThreads.has(t.id) ? styles.liked : ''}`} onClick={() => toggleLike(t.id)}>
                  {likedThreads.has(t.id) ? '❤️' : '🤍'} {t.likes || 0}
                </button>
                <button className={styles.replyBtn} onClick={() => toast(`📝 Reply to: ${t.title}`)}>Reply →</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
