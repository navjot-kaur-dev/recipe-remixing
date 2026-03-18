import React, { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { collectionsAPI } from '@/services/api'
import RecipeGrid from '@/components/recipe/RecipeGrid'
import styles from './BookmarksPage.module.css'

export default function BookmarksPage() {
  const { recipes, bookmarks, user } = useApp()
  const [savedRecipes, setSavedRecipes] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    if (!user) {
      // Not logged in — filter local recipes using bookmark IDs
      setSavedRecipes(recipes.filter(r => bookmarks.has(r.id)))
      setLoading(false)
      return
    }

    // Logged in — fetch from backend
    // GET /api/collections
    // Returns { bookmarks: [...formatRecipe() objects], collections: [...] }
    collectionsAPI.getAll()
      .then(data => {
        const list = data.bookmarks || data.collections || data || []
        if (Array.isArray(list) && list.length > 0 && list[0]?.title) {
          // Backend returned full recipe objects (formatRecipe output)
          setSavedRecipes(list)
        } else if (Array.isArray(list)) {
          // Backend returned IDs — map against local recipes
          const ids = list.map(b => b.id || b.recipe_id || b.recipeId).filter(Boolean)
          setSavedRecipes(recipes.filter(r => ids.includes(r.id)))
        }
      })
      .catch(() => {
        // Fallback to local bookmark state
        setSavedRecipes(recipes.filter(r => bookmarks.has(r.id)))
      })
      .finally(() => setLoading(false))
  }, [user, bookmarks, recipes])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>🔖 My Bookmarks</h1>
        <p>
          {loading
            ? 'Loading…'
            : `${savedRecipes.length} recipe${savedRecipes.length !== 1 ? 's' : ''} saved`
          }
        </p>
      </div>

      {!user && (
        <div className={styles.signInPrompt}>
          <span style={{ fontSize:'2rem' }}>🔒</span>
          <p>Sign in to sync your bookmarks across all your devices.</p>
        </div>
      )}

      {loading
        ? <p style={{ color:'var(--text3)', padding:'2rem 0' }}>Loading your saved recipes…</p>
        : <RecipeGrid recipes={savedRecipes} emptyMessage="No bookmarks yet. Start saving recipes you love!" />
      }
    </div>
  )
}
