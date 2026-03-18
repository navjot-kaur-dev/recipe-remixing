import React from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Clock } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Tag } from '@/components/ui/Tag'
import { CARD_GRADIENTS, formatNumber } from '@/utils/helpers'
import toast from 'react-hot-toast'
import styles from './RecipeCard.module.css'

export default function RecipeCard({ recipe, style }) {
  const { bookmarks, toggleBookmark, user, setAuthOpen } = useApp()
  const saved = bookmarks.has(recipe.id)

  // Safe field reads — backend formatRecipe() provides all of these
  // but we guard every field to prevent crashes
  const emoji      = recipe.emoji      || '🍳'
  const title      = recipe.title      || 'Untitled Recipe'
  const author     = recipe.author     || 'Chef'
  const time       = recipe.time       || ''
  const saves      = recipe.saves      ?? recipe.saves_count ?? 0
  const rating     = recipe.rating     ?? recipe.avg_rating  ?? '0.0'
  const badge      = recipe.badge      || 'New'
  const colorClass = recipe.colorClass || 'warm'
  const tags       = Array.isArray(recipe.tags) ? recipe.tags : []

  const handleBookmark = (e) => {
    e.preventDefault()
    if (!user) { setAuthOpen(true); return }
    toggleBookmark(recipe.id)
    toast(saved ? 'Removed from bookmarks' : '🔖 Saved to bookmarks!')
  }

  return (
    <Link to={`/recipe/${recipe.id}`} className={styles.card} style={style}>
      <div
        className={styles.imgWrap}
        style={{ background: CARD_GRADIENTS[colorClass] || CARD_GRADIENTS.warm }}
      >
        {/* Show uploaded image if available, else show emoji */}
        {recipe.imageUrl
          ? <img src={recipe.imageUrl} alt={title} className={styles.recipeImg} />
          : <span className={styles.emoji}>{emoji}</span>
        }
        <span className={styles.badgePill}>{badge}</span>
        <button
          className={`${styles.bookmarkBtn} ${saved ? styles.saved : ''}`}
          onClick={handleBookmark}
          title={saved ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.tags}>
          {tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.author}>by {author}</p>
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {time && <span className={styles.meta}><Clock size={11} /> {time}</span>}
            <span className={styles.meta}><Bookmark size={11} /> {formatNumber(saves)}</span>
          </div>
          <div className={styles.rating}>
            <span style={{ color: 'var(--accent2)', fontSize: 12 }}>★</span>
            <span className={styles.ratingNum}>{rating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
