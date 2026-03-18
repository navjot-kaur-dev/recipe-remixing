import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Share2, FileDown, Calendar, Users, ArrowLeft, Heart } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useServings } from '@/hooks/useServings'
import { Tag, Badge } from '@/components/ui/Tag'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'
import { CARD_GRADIENTS, formatNumber, DIFFICULTY_COLORS } from '@/utils/helpers'
import { recipesAPI, commentsAPI, likesAPI, pdfAPI } from '@/services/api'
import toast from 'react-hot-toast'
import styles from './RecipeDetailPage.module.css'

export default function RecipeDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { recipes, bookmarks, toggleBookmark, user, setAuthOpen } = useApp()

  // Start with local cache, then load full data from backend
  const cached = recipes.find(r => r.id === id) || null
  const [recipe,   setRecipe]   = useState(cached)
  const [pageLoad, setPageLoad] = useState(!cached)
  const [comments, setComments] = useState([])
  const [commLoad, setCommLoad] = useState(true)
  const [likeCount, setLikeCount]   = useState(cached?.likes || 0)
  const [userLiked, setUserLiked]   = useState(false)
  const [commentText, setCommentText] = useState('')
  const [starRating,  setStarRating]  = useState(0)

  const { servings, inc, dec, scaleAmount } = useServings(recipe?.servings || 4)

  // ── Fetch full recipe from backend ──
  // Backend getById returns { recipe: { ...formatRecipe() output } }
  useEffect(() => {
    setPageLoad(true)
    recipesAPI.getById(id)
      .then(data => {
        // data.recipe is the formatted recipe from backend
        const r = data.recipe || data
        setRecipe(r)
        setLikeCount(r.likes || 0)
      })
      .catch(() => {
        // Keep cached version if backend fails
        if (!cached) navigate('/')
      })
      .finally(() => setPageLoad(false))
  }, [id])

  // ── Fetch comments from backend ──
  // Backend getByRecipe returns { comments: [{ id, user, initials, text, rating, time }] }
  useEffect(() => {
    setCommLoad(true)
    commentsAPI.getByRecipe(id)
      .then(data => {
        const list = data.comments || data || []
        setComments(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        // Fallback to recipe's embedded comments
        if (cached?.comments) setComments(cached.comments)
      })
      .finally(() => setCommLoad(false))
  }, [id])

  // ── Fetch like status for current user ──
  useEffect(() => {
    if (!id) return
    likesAPI.get(id)
      .then(data => {
        setLikeCount(data.likesCount || 0)
        setUserLiked(data.userLiked  || false)
      })
      .catch(() => {})
  }, [id, user])

  if (pageLoad) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: 'var(--text3)' }}>Loading recipe…</p>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</p>
        <h2 style={{ fontFamily: 'Playfair Display,serif', marginBottom: '1rem', color: 'var(--text)' }}>Recipe not found</h2>
        <Button onClick={() => navigate('/')}>← Back to Home</Button>
      </div>
    )
  }

  const saved      = bookmarks.has(recipe.id)
  const colorClass = recipe.colorClass || 'warm'
  const difficulty = recipe.difficulty
  const diffColor  = difficulty ? (DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.Medium) : null

  const handleBookmark = () => {
    if (!user) { setAuthOpen(true); return }
    toggleBookmark(recipe.id)
    toast(saved ? 'Removed from bookmarks' : '🔖 Saved to bookmarks!')
  }

  const handleLike = async () => {
    if (!user) { setAuthOpen(true); return }
    try {
      const data = await likesAPI.toggle(recipe.id)
      setLikeCount(data.likesCount)
      setUserLiked(data.liked)
      toast(data.liked ? '❤️ Liked!' : 'Like removed')
    } catch { toast.error('Could not toggle like') }
  }

  const handleExportPDF = async () => {
    toast('📄 Generating PDF…')
    try {
      await pdfAPI.exportRecipe(recipe.id, recipe.title)
      toast.success('📄 Downloaded!')
    } catch { toast.error('PDF export failed') }
  }

  const postComment = async () => {
    if (!user) { setAuthOpen(true); return }
    if (!commentText.trim()) { toast.error('Write something first!'); return }
    try {
      // Backend returns { message, comment: { id, user, initials, text, rating, time } }
      const data = await commentsAPI.post(recipe.id, { text: commentText, rating: starRating || 5 })
      const newComment = data.comment || {
        id:       `c${Date.now()}`,
        user:     user.name || user.username,
        initials: (user.name || 'U').slice(0, 2).toUpperCase(),
        text:     commentText,
        rating:   starRating || 5,
        time:     'Just now',
      }
      setComments(prev => [newComment, ...prev])
      setCommentText('')
      setStarRating(0)
      toast.success('✓ Review posted!')
    } catch { toast.error('Could not post comment') }
  }

  // Safe reads — all shaped by backend formatRecipe()
  const ingredients   = Array.isArray(recipe.ingredients)   ? recipe.ingredients   : []
  const substitutions = Array.isArray(recipe.substitutions) ? recipe.substitutions : []
  const instructions  = typeof recipe.instructions === 'string'
    ? recipe.instructions.split('\n').filter(Boolean)
    : Array.isArray(recipe.instructions) ? recipe.instructions : []

  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero image / emoji */}
      <div
        className={styles.heroImg}
        style={{ background: CARD_GRADIENTS[colorClass] || CARD_GRADIENTS.warm }}
      >
        {recipe.imageUrl
          ? <img src={recipe.imageUrl} alt={recipe.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span>{recipe.emoji || '🍳'}</span>
        }
        {recipe.isCollaborative && (
          <div className={styles.collabBadge}><Badge variant="green">👥 Collaborative Recipe</Badge></div>
        )}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.tagRow}>
          {Array.isArray(recipe.tags) && recipe.tags.map(t => <Tag key={t}>{t}</Tag>)}
          {diffColor && (
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.72rem', fontWeight:600, background:diffColor.bg, color:diffColor.text }}>
              {recipe.difficulty}
            </span>
          )}
        </div>
        <h1 className={styles.title}>{recipe.title}</h1>
        <div className={styles.metaRow}>
          <span className={styles.meta}>👤 {recipe.author || 'Chef'}</span>
          {recipe.time      && <span className={styles.meta}>⏱ {recipe.time}</span>}
          {recipe.servings  && <span className={styles.meta}>👥 {servings} servings</span>}
          <span className={styles.meta}><StarRating rating={parseFloat(recipe.rating) || 0} size={13} /> {recipe.rating || '0.0'}</span>
          <span className={styles.meta}>👀 {formatNumber(recipe.views || 0)} views</span>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${saved ? styles.active : ''}`} onClick={handleBookmark}>
            <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
            {saved ? 'Saved' : 'Bookmark'}
          </button>
          <button className={`${styles.actionBtn} ${userLiked ? styles.active : ''}`} onClick={handleLike}>
            <Heart size={15} fill={userLiked ? 'currentColor' : 'none'} />
            {formatNumber(likeCount)}
          </button>
          <button className={styles.actionBtn} onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('📤 Link copied!') }}>
            <Share2 size={15} /> Share
          </button>
          <button className={styles.actionBtn} onClick={handleExportPDF}>
            <FileDown size={15} /> Export PDF
          </button>
          <button className={styles.actionBtn} onClick={() => toast('📅 Added to meal plan!')}>
            <Calendar size={15} /> Add to Planner
          </button>
          <button className={styles.actionBtn} onClick={() => toast('👥 Collaboration invite sent!')}>
            <Users size={15} /> Collaborate
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* ── LEFT SIDEBAR ── */}
        <div className={styles.sidebar}>

          {/* Ingredients panel */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Ingredients</h3>
            <div className={styles.servingsControl}>
              <span className={styles.servingsLabel}>Servings</span>
              <button className={styles.servBtn} onClick={dec}>−</button>
              <span className={styles.servCount}>{servings}</span>
              <button className={styles.servBtn} onClick={inc}>+</button>
            </div>
            <div className={styles.ingredientList}>
              {ingredients.length === 0 && (
                <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>No ingredients listed.</p>
              )}
              {ingredients.map((ing, i) => (
                <div key={i} className={styles.ingredientRow}>
                  <span className={styles.ingrName}>{ing.name}</span>
                  <span className={styles.ingrAmt}>
                    {scaleAmount(ing.amount)}{ing.unit ? ` ${ing.unit}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition panel */}
          {recipe.nutrition && (
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>🧬 Nutrition</h3>
              <div className={styles.macroRow}>
                {[
                  { label:'Calories', val: Math.round((recipe.nutrition.calories||0) * servings / (recipe.servings||4)), unit:'kcal', color:'var(--accent)'  },
                  { label:'Protein',  val: Math.round((recipe.nutrition.protein ||0) * servings / (recipe.servings||4)), unit:'g',    color:'var(--accent3)' },
                  { label:'Carbs',    val: Math.round((recipe.nutrition.carbs   ||0) * servings / (recipe.servings||4)), unit:'g',    color:'var(--accent2)' },
                ].map(m => (
                  <div key={m.label} className={styles.macroItem}>
                    <span className={styles.macroVal} style={{ color: m.color }}>{m.val}<small style={{ fontSize:'0.65rem' }}>{m.unit}</small></span>
                    <span className={styles.macroLabel}>{m.label}</span>
                  </div>
                ))}
              </div>
              {[
                { label:'Protein', val:recipe.nutrition.protein||0, max:60, color:'var(--accent3)' },
                { label:'Carbs',   val:recipe.nutrition.carbs  ||0, max:80, color:'var(--accent2)' },
                { label:'Fat',     val:recipe.nutrition.fat    ||0, max:50, color:'var(--accent)'  },
                { label:'Fiber',   val:recipe.nutrition.fiber  ||0, max:20, color:'#a78bfa'        },
              ].map(n => (
                <div key={n.label} className={styles.nutriRow}>
                  <span className={styles.nutriLabel}>{n.label}</span>
                  <div className={styles.nutriBar}>
                    <div className={styles.nutriFill} style={{ width:`${Math.min(100,(n.val/n.max)*100)}%`, background:n.color }} />
                  </div>
                  <span className={styles.nutriVal}>{n.val}g</span>
                </div>
              ))}
            </div>
          )}

          {/* Substitutions panel */}
          {substitutions.length > 0 && (
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>♻️ Substitutions</h3>
              {substitutions.map((s, i) => (
                <div key={i} className={styles.substRow}>
                  <span className={styles.substFrom}>{s.from}</span>
                  <span className={styles.substArrow}>→</span>
                  <span className={styles.substTo}>{s.to}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT MAIN COLUMN ── */}
        <div className={styles.main}>
          {recipe.description && (
            <p className={styles.description}>{recipe.description}</p>
          )}

          {recipe.videoUrl && (
            <div className={styles.videoWrap}>
              <span style={{ fontSize: '1.5rem' }}>▶️</span>
              <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)', fontWeight:600 }}>
                Watch Video Tutorial
              </a>
            </div>
          )}

          {/* Instructions */}
          <h3 className={styles.sectionTitle}>Instructions</h3>
          {instructions.length === 0
            ? <p style={{ color:'var(--text3)', marginBottom:'2rem' }}>No instructions yet.</p>
            : (
              <div className={styles.instructions}>
                {instructions.map((step, i) => (
                  <motion.div key={i} className={styles.step} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}>
                    <div className={styles.stepNum}>{i+1}</div>
                    <p className={styles.stepText}>{step}</p>
                  </motion.div>
                ))}
              </div>
            )
          }

          {/* Comments */}
          <div className={styles.commentsSection}>
            <h3 className={styles.sectionTitle}>Comments & Reviews ({comments.length})</h3>
            <div className={styles.commentForm}>
              <textarea
                className={styles.commentInput}
                placeholder={user ? 'Share your tips, experience or photos…' : 'Sign in to leave a review'}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                disabled={!user}
              />
              <div className={styles.commentFormFooter}>
                <StarRating rating={starRating} interactive size={22} onRate={setStarRating} />
                <Button variant="primary" size="sm" onClick={postComment}>Post Review</Button>
              </div>
            </div>
            <div className={styles.commentList}>
              {commLoad && <p style={{ color:'var(--text3)', fontSize:'0.875rem' }}>Loading comments…</p>}
              {!commLoad && comments.length === 0 && (
                <p style={{ color:'var(--text3)', fontSize:'0.875rem' }}>No reviews yet. Be the first!</p>
              )}
              {!commLoad && comments.map(c => (
                <div key={c.id} className={styles.comment}>
                  <div className={styles.commentAvatar}>
                    {c.initials || (c.user || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentUser}>{c.user || c.username || 'User'}</span>
                      <span className={styles.commentMeta}>
                        {c.time || c.created_at}
                        {c.rating && <> · <StarRating rating={c.rating} size={11} /></>}
                      </span>
                    </div>
                    <p className={styles.commentText}>{c.text || c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
