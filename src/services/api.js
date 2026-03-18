/**
 * ═══════════════════════════════════════════════════════
 *  RecipeRemixing — API Service Layer
 *  Perfectly matched to recipe-remixing-backend routes
 *  Set VITE_API_URL=http://localhost:5000/api in .env
 * ═══════════════════════════════════════════════════════
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('rr_token')

// Core fetch wrapper — attaches JWT, parses JSON, throws on errors
async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || data.error || `Error ${res.status}`)
  return data
}

// ─────────────────────────────────────────────
//  AUTH  →  /api/auth/*
//  authController returns: { user, token }
//  user shape: { id, name, username, email, bio, avatarUrl, interests }
// ─────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  getMe: () =>
    request('/auth/me'),

  refreshToken: () =>
    request('/auth/refresh', { method: 'POST' }),
}

// ─────────────────────────────────────────────
//  RECIPES  →  /api/recipes/*
//  recipeController formats via formatRecipe()
//  Returns: { recipes: [...] } or { recipe: {...} }
//  Each recipe has: id, title, emoji, imageUrl, author,
//  authorInitials, time, servings, difficulty, category,
//  cuisine, tags, rating, likes, saves, views, badge,
//  colorClass, instructions, ingredients, substitutions,
//  nutrition, isCollaborative, videoUrl, description
// ─────────────────────────────────────────────
export const recipesAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString()
    return request(`/recipes${qs ? `?${qs}` : ''}`)
  },

  getById: (id) => request(`/recipes/${id}`),

  getTrending: () => request('/recipes/trending'),

  create: (recipeData) =>
    request('/recipes', { method: 'POST', body: JSON.stringify(recipeData) }),

  update: (id, recipeData) =>
    request(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(recipeData) }),

  delete: (id) =>
    request(`/recipes/${id}`, { method: 'DELETE' }),

  // Multipart upload — uses uploadMiddleware on backend
  uploadImage: (file) => {
    const token = getToken()
    const form  = new FormData()
    form.append('image', file)
    return fetch(`${BASE_URL}/recipes/upload`, {
      method:  'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    form,
    }).then(r => r.json())
  },
}

// ─────────────────────────────────────────────
//  LIKES  →  /api/likes/*
//  likeController returns: { liked, likesCount }
// ─────────────────────────────────────────────
export const likesAPI = {
  toggle: (recipeId) =>
    request(`/likes/recipe/${recipeId}`, { method: 'POST' }),

  get: (recipeId) =>
    request(`/likes/recipe/${recipeId}`),
}

// ─────────────────────────────────────────────
//  COMMENTS  →  /api/comments/*
//  commentController returns:
//    GET  → { comments: [{ id, user, username, initials, text, rating, time }] }
//    POST → { message, comment: { id, user, initials, text, rating, time } }
// ─────────────────────────────────────────────
export const commentsAPI = {
  getByRecipe: (recipeId) =>
    request(`/comments/recipe/${recipeId}`),

  post: (recipeId, payload) =>
    request(`/comments/recipe/${recipeId}`, {
      method: 'POST',
      body:   JSON.stringify(payload),
    }),

  update: (commentId, text) =>
    request(`/comments/${commentId}`, {
      method: 'PUT',
      body:   JSON.stringify({ text }),
    }),

  delete: (commentId) =>
    request(`/comments/${commentId}`, { method: 'DELETE' }),
}

// ─────────────────────────────────────────────
//  COLLECTIONS (Bookmarks)  →  /api/collections/*
//  collectionController returns:
//    GET    → { bookmarks: [...recipes], collections: [...recipes] }
//    POST   → { message }
//    DELETE → { message }
// ─────────────────────────────────────────────
export const collectionsAPI = {
  getAll: () =>
    request('/collections'),

  save: (recipeId) =>
    request(`/collections/${recipeId}`, { method: 'POST' }),

  remove: (recipeId) =>
    request(`/collections/${recipeId}`, { method: 'DELETE' }),
}

// ─────────────────────────────────────────────
//  MEAL PLANNER  →  /api/meal-planner/*
//  mealPlannerController returns:
//    GET  → { plan: { "Monday-Dinner": { title, emoji, recipeId } } }
//    POST → { message, plan: {...} }
// ─────────────────────────────────────────────
export const mealPlannerAPI = {
  get: () =>
    request('/meal-planner'),

  save: (planData) =>
    request('/meal-planner', {
      method: 'POST',
      body:   JSON.stringify({ plan: planData }),
    }),

  removeSlot: (slotKey) =>
    request(`/meal-planner/${encodeURIComponent(slotKey)}`, { method: 'DELETE' }),
}

// ─────────────────────────────────────────────
//  ANALYTICS  →  /api/analytics/*
//  analyticsController returns:
//    overview → { totalViews, totalLikes, totalComments,
//                 totalSaves, recipesShared, avgRating, shares }
//    weekly   → { data: [{ day, views, likes }] }
//    recipe   → { recipeId, title, views, likes, comments, saves, avgRating }
// ─────────────────────────────────────────────
export const analyticsAPI = {
  getOverview: () =>
    request('/analytics/overview'),

  getWeekly: () =>
    request('/analytics/weekly'),

  getRecipeStats: (recipeId) =>
    request(`/analytics/recipe/${recipeId}`),
}

// ─────────────────────────────────────────────
//  AI  →  /api/ai/*
//  aiController + geminiService + duplicateCheck
//  Returns:
//    suggestions  → { suggestions: [{ name, emoji, match, time, tags, description }] }
//    nutrition    → { nutrition: { calories, protein, carbs, fat, fiber, vitamins[] } }
//    duplicate    → { isDuplicate, confidence, similarRecipe?, message? }
// ─────────────────────────────────────────────
export const aiAPI = {
  getSuggestions: (ingredients, dietary = '') =>
    request('/ai/suggestions', {
      method: 'POST',
      body:   JSON.stringify({ ingredients, dietary }),
    }),

  analyzeNutrition: (ingredientsText) =>
    request('/ai/nutrition', {
      method: 'POST',
      body:   JSON.stringify({ ingredients: ingredientsText }),
    }),

  checkDuplicate: (title, ingredients) =>
    request('/ai/duplicate-check', {
      method: 'POST',
      body:   JSON.stringify({ title, ingredients }),
    }),
}

// ─────────────────────────────────────────────
//  COMMUNITY  →  /api/community/*
//  communityController returns:
//    GET list  → { threads: [{ id, title, body, tag, author,
//                              initials, likes, replies, time }] }
//    GET one   → { thread: {...}, replies: [...] }
//    POST      → { message, thread: {...} }
//    like      → { liked, likes }
//    reply     → { message, reply: {...} }
// ─────────────────────────────────────────────
export const communityAPI = {
  getThreads: (category = '') => {
    const qs = category && category !== 'All Topics'
      ? `?category=${encodeURIComponent(category)}`
      : ''
    return request(`/community${qs}`)
  },

  getThread: (threadId) =>
    request(`/community/${threadId}`),

  createThread: (data) =>
    request('/community', { method: 'POST', body: JSON.stringify(data) }),

  reply: (threadId, text) =>
    request(`/community/${threadId}/reply`, {
      method: 'POST',
      body:   JSON.stringify({ text }),
    }),

  toggleLike: (threadId) =>
    request(`/community/${threadId}/like`, { method: 'POST' }),
}

// ─────────────────────────────────────────────
//  COLLABORATION  →  /api/collab/*
//  collabController returns:
//    invite → { message, collaborator: { id, name, email } }
//    GET    → { collaborators: [{ id, name, username, role }] }
//    PUT    → { message, recipe: {...} }
// ─────────────────────────────────────────────
export const collabAPI = {
  invite: (recipeId, email) =>
    request(`/collab/invite/${recipeId}`, {
      method: 'POST',
      body:   JSON.stringify({ email }),
    }),

  getCollaborators: (recipeId) =>
    request(`/collab/${recipeId}`),

  saveEdit: (recipeId, changes) =>
    request(`/collab/${recipeId}`, {
      method: 'PUT',
      body:   JSON.stringify(changes),
    }),
}

// ─────────────────────────────────────────────
//  PDF EXPORT  →  /api/recipes/:id/export-pdf
//  pdfController streams back an HTML file
//  Browser downloads it automatically
// ─────────────────────────────────────────────
export const pdfAPI = {
  exportRecipe: async (recipeId, recipeTitle) => {
    const token = getToken()
    const res   = await fetch(`${BASE_URL}/recipes/${recipeId}/export-pdf`, {
      method:  'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error('PDF export failed')
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${recipeTitle.replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  },
}
