import React, { createContext, useContext, useState, useEffect } from 'react'
import { RECIPES } from '@/data/recipes'
import { recipesAPI, collectionsAPI, mealPlannerAPI } from '@/services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [theme,     setTheme]     = useState(() => localStorage.getItem('rr_theme') || 'light')
  const [user,      setUser]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('rr_user') || 'null') } catch { return null }
  })
  const [authOpen,  setAuthOpen]  = useState(false)
  const [authMode,  setAuthMode]  = useState('login')
  const [bookmarks, setBookmarks] = useState(new Set())
  const [recipes,   setRecipes]   = useState(RECIPES)   // mock data until API responds
  const [mealPlan,  setMealPlan]  = useState({})
  const [loading,   setLoading]   = useState(true)

  // ── Apply theme to <html> ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('rr_theme', theme)
  }, [theme])

  // ── Load recipes from backend on mount ──
  // Backend formatRecipe() already shapes the data correctly
  useEffect(() => {
    setLoading(true)
    recipesAPI.getAll()
      .then(data => {
        // Backend returns { recipes: [...], total, page }
        const list = data.recipes || data
        if (Array.isArray(list) && list.length > 0) {
          setRecipes(list)
        }
        // else keep mock RECIPES as fallback
      })
      .catch(() => {
        // Backend not running — silently keep mock data
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Load bookmarks when user logs in ──
  useEffect(() => {
    if (!user) return
    collectionsAPI.getAll()
      .then(data => {
        // Backend returns { bookmarks: [...recipes], collections: [...recipes] }
        const list = data.bookmarks || data.collections || data || []
        const ids  = Array.isArray(list)
          ? list.map(r => r.id || r.recipe_id || r.recipeId).filter(Boolean)
          : []
        setBookmarks(new Set(ids))
      })
      .catch(() => {})
  }, [user])

  // ── Load meal plan when user logs in ──
  useEffect(() => {
    if (!user) return
    mealPlannerAPI.get()
      .then(data => {
        // Backend returns { plan: { "Monday-Dinner": { title, emoji, recipeId } } }
        const plan = data.plan || {}
        if (typeof plan === 'object' && Object.keys(plan).length > 0) {
          setMealPlan(plan)
        }
      })
      .catch(() => {})
  }, [user])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  // ── login: called after successful authAPI.login() or authAPI.register() ──
  // Backend formatUser returns: { id, name, username, email, bio, avatarUrl, interests }
  const login = (userData, token) => {
    setUser(userData)
    if (token) localStorage.setItem('rr_token', token)
    localStorage.setItem('rr_user', JSON.stringify(userData))
    setAuthOpen(false)
  }

  const logout = () => {
    setUser(null)
    setBookmarks(new Set())
    setMealPlan({})
    localStorage.removeItem('rr_token')
    localStorage.removeItem('rr_user')
  }

  // ── Toggle bookmark: optimistic update + backend sync ──
  const toggleBookmark = async (recipeId) => {
    const isSaved = bookmarks.has(recipeId)
    // Update UI instantly
    setBookmarks(prev => {
      const next = new Set(prev)
      isSaved ? next.delete(recipeId) : next.add(recipeId)
      return next
    })
    // Sync to backend — revert if it fails
    try {
      if (isSaved) await collectionsAPI.remove(recipeId)
      else         await collectionsAPI.save(recipeId)
    } catch {
      setBookmarks(prev => {
        const next = new Set(prev)
        isSaved ? next.add(recipeId) : next.delete(recipeId)
        return next
      })
    }
  }

  // ── Add recipe: creates locally + syncs to backend ──
  const addRecipe = async (recipe) => {
    const tempId    = `temp_${Date.now()}`
    const newRecipe = {
      ...recipe,
      id:        tempId,
      views:     0,
      likes:     0,
      saves:     0,
      rating:    '0.0',
      badge:     'New',
      colorClass: 'warm',
      comments:  [],
    }
    setRecipes(prev => [newRecipe, ...prev])
    try {
      const created = await recipesAPI.create(recipe)
      // Backend returns { message, id, recipe }
      const realId  = created.id || created.recipe?.id || tempId
      setRecipes(prev => prev.map(r => r.id === tempId ? { ...r, id: realId } : r))
      return realId
    } catch {
      return tempId
    }
  }

  // ── Meal plan helpers ──
  const addMealPlanItem = async (day, meal, recipe) => {
    const key     = `${day}-${meal}`
    const newPlan = {
      ...mealPlan,
      [key]: { title: recipe.title, emoji: recipe.emoji || '🍳', recipeId: recipe.id },
    }
    setMealPlan(newPlan)
    try { await mealPlannerAPI.save(newPlan) } catch {}
  }

  const removeMealPlanItem = async (key) => {
    const newPlan = { ...mealPlan }
    delete newPlan[key]
    setMealPlan(newPlan)
    try { await mealPlannerAPI.removeSlot(key) } catch {}
  }

  return (
    <AppContext.Provider value={{
      theme,    toggleTheme,
      user,     login, logout,
      authOpen, setAuthOpen, authMode, setAuthMode,
      bookmarks, toggleBookmark,
      recipes,   addRecipe, setRecipes, loading,
      mealPlan,  addMealPlanItem, removeMealPlanItem,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
