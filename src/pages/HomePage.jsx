import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { CARD_GRADIENTS, formatNumber } from '@/utils/helpers'
import { recipesAPI, aiAPI } from '@/services/api'
import RecipeGrid from '@/components/recipe/RecipeGrid'
import CategoryPills from '@/components/recipe/CategoryPills'
import Button from '@/components/ui/Button'
import { Tag, Badge } from '@/components/ui/Tag'
import { AI_INGREDIENTS } from '@/data/recipes'
import toast from 'react-hot-toast'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { recipes, loading } = useApp()
  const [searchParams]   = useSearchParams()
  const q                = searchParams.get('q') || ''
  const [category, setCategory]         = useState('All')
  const [selectedIngr, setSelectedIngr] = useState(new Set(['chicken']))
  const [aiResults, setAiResults]       = useState(null)
  const [aiLoading, setAiLoading]       = useState(false)
  const [trending,  setTrending]        = useState([])

  // Load trending from backend: GET /api/recipes/trending
  // Returns { recipes: [...formatRecipe() objects] }
  useEffect(() => {
    recipesAPI.getTrending()
      .then(data => {
        const list = data.recipes || data || []
        if (Array.isArray(list) && list.length > 0) setTrending(list)
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let list = [...recipes]
    if (q) list = list.filter(r =>
      r.title?.toLowerCase().includes(q.toLowerCase()) ||
      r.author?.toLowerCase().includes(q.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(q.toLowerCase()))
    )
    if (category !== 'All') list = list.filter(r =>
      r.category?.toLowerCase().includes(category.toLowerCase()) ||
      r.tags?.some(t => t.toLowerCase().includes(category.toLowerCase()))
    )
    return list
  }, [recipes, q, category])

  const toggleIngr = (val) => {
    setSelectedIngr(prev => {
      const next = new Set(prev)
      next.has(val) ? next.delete(val) : next.add(val)
      return next
    })
  }

  // POST /api/ai/suggestions → { suggestions: [{ name, emoji, match, time, tags }] }
  const getSuggestions = async () => {
    if (selectedIngr.size === 0) { toast.error('Select at least one ingredient'); return }
    setAiLoading(true)
    try {
      const data = await aiAPI.getSuggestions([...selectedIngr])
      const list = data.suggestions || data || []
      setAiResults(Array.isArray(list) ? list : [])
      toast.success(`✨ Found ${list.length} recipes!`)
    } catch {
      // Fallback to mock
      const { AI_SUGGESTIONS } = await import('@/data/recipes')
      setAiResults(AI_SUGGESTIONS)
      toast.success('✨ Found matching recipes!')
    } finally {
      setAiLoading(false)
    }
  }

  const displayRecipes = trending.length ? trending : recipes
  const featured       = displayRecipes[0]

  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <motion.div className={styles.heroContent} initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
          <div className={styles.eyebrow}>🌍 For Food Lovers Everywhere</div>
          <h1 className={styles.heroTitle}>Cook. Share.<br /><em>Remix</em> Together.</h1>
          <p className={styles.heroSub}>Discover thousands of recipes, share your culinary creations, and connect with home chefs from around the world.</p>
          <div className={styles.heroActions}>
            <Button variant="primary" size="lg" onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior:'smooth' })}>
              Explore Recipes
            </Button>
            <Link to="/create"><Button variant="outline" size="lg">Share a Recipe</Button></Link>
          </div>
        </motion.div>

        <motion.div className={styles.heroVisual} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.7, delay:0.2 }}>
          {displayRecipes.slice(0, 3).map((r, i) => (
            <Link to={`/recipe/${r.id}`} key={r.id} className={`${styles.heroCard} ${styles[`hc${i}`]}`}>
              <div className={styles.heroCardImg} style={{ background: CARD_GRADIENTS[r.colorClass || 'warm'] || CARD_GRADIENTS.warm }}>
                {r.imageUrl
                  ? <img src={r.imageUrl} alt={r.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize: i === 0 ? 64 : 52 }}>{r.emoji || '🍳'}</span>
                }
              </div>
              <div className={styles.heroCardBody}>
                <p className={styles.heroCardTitle}>{r.title}</p>
                <p className={styles.heroCardMeta}>⭐ {r.rating || '0.0'} · {formatNumber(r.saves || 0)} saves</p>
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* STATS BAR */}
      <div className={styles.statsBar}>
        {[['24,800+','Recipes Shared'],['180K+','Home Chefs'],['4.9M','Saves & Bookmarks'],['98','Countries']].map(([n,l]) => (
          <div key={l} className={styles.stat}>
            <div className={styles.statN}>{n}</div>
            <div className={styles.statL}>{l}</div>
          </div>
        ))}
      </div>

      <div className={styles.body}>
        {/* AI PANEL — calls /api/ai/suggestions */}
        <div className={styles.aiPanel}>
          <div className={styles.aiHeader}>
            <Badge variant="ai">✨ AI</Badge>
            <h3 className={styles.aiTitle}>What's in your fridge? Get personalized suggestions.</h3>
          </div>
          <div className={styles.aiChips}>
            {AI_INGREDIENTS.map(ing => (
              <button
                key={ing.value}
                className={`${styles.chip} ${selectedIngr.has(ing.value) ? styles.chipActive : ''}`}
                onClick={() => toggleIngr(ing.value)}
              >
                {ing.emoji} {ing.label}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" onClick={getSuggestions} style={{ opacity: aiLoading ? 0.7 : 1 }}>
            {aiLoading ? '⏳ Finding recipes…' : '✨ Find Recipes for Me'}
          </Button>

          {aiResults && (
            <motion.div className={styles.aiResults} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
              {aiResults.map((s, i) => (
                <div key={s.name || i} className={styles.aiCard} onClick={() => toast(`Opening ${s.name}…`)}>
                  <span className={styles.aiEmoji}>{s.emoji || '🍽️'}</span>
                  <p className={styles.aiName}>{s.name}</p>
                  {s.match != null && <p className={styles.aiMatch}>{s.match}% match</p>}
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'center' }}>
                    {(s.tags || []).map(t => <Tag key={t}>{t}</Tag>)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* FEATURED RECIPE */}
        {featured && (
          <div className={styles.featuredSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recipe of the Week</h2>
              {featured.isCollaborative && <Badge variant="green">👥 Collaborative</Badge>}
            </div>
            <Link to={`/recipe/${featured.id}`} className={styles.featuredCard}>
              <div className={styles.featuredImg} style={{ background: CARD_GRADIENTS[featured.colorClass || 'warm'] || CARD_GRADIENTS.warm }}>
                {featured.imageUrl
                  ? <img src={featured.imageUrl} alt={featured.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span>{featured.emoji || '🍳'}</span>
                }
              </div>
              <div className={styles.featuredBody}>
                <div className={styles.featuredLabel}>Chef's Special · Featured</div>
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                <p className={styles.featuredDesc}>{featured.description}</p>
                <div className={styles.featuredAuthor}>
                  <div className={styles.avatar}>
                    {(featured.authorInitials || featured.author?.slice(0,2) || 'CH').toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--text)' }}>{featured.author || 'Chef'}</p>
                    <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>
                      ⭐ {featured.rating || '0.0'} · {formatNumber(featured.saves || 0)} saves
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* RECIPE GRID */}
        <div id="discover">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {q ? `Results for "${q}"` : 'Trending Recipes'}
            </h2>
          </div>
          <CategoryPills active={category} onChange={setCategory} />
          {loading
            ? <p style={{ color:'var(--text3)', padding:'2rem 0' }}>Loading recipes…</p>
            : <RecipeGrid recipes={filtered} emptyMessage={q ? `No recipes matching "${q}"` : 'No recipes yet.'} />
          }
        </div>

        {!q && category === 'All' && !loading && (
          <div style={{ marginTop:'4rem' }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recently Added</h2>
            </div>
            <RecipeGrid recipes={[...recipes].reverse()} />
          </div>
        )}
      </div>
    </div>
  )
}
