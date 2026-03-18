# 🔌 Backend Integration Guide
### RecipeRemixing Frontend ↔ RECIPE REMIXING_BACKEND

---

## Your Backend Structure (from screenshots)

```
RECIPE REMIXING_BACKEND/
├── database/
│   ├── schema.sql          ← Supabase table definitions
│   └── seed.sql            ← Sample data
├── src/
│   ├── config/
│   │   ├── aiConfig.js     ← Gemini AI setup
│   │   └── supabaseClient.js ← Supabase connection
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── collabController.js
│   │   ├── collectionController.js   ← bookmarks
│   │   ├── commentController.js
│   │   ├── communityController.js    ← forum
│   │   ├── ingredientController.js
│   │   ├── likeController.js
│   │   ├── mealPlannerController.js
│   │   ├── recipeController.js
│   │   └── tagController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── rbacMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── collabRoutes.js
│   │   ├── collectionRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── index.js              ← main router
│   │   ├── likeRoutes.js
│   │   ├── mealPlannerRoutes.js
│   │   └── recipeRoutes.js
│   ├── services/
│   │   ├── duplicateCheck.js     ← AI uniqueness check
│   │   ├── geminiService.js      ← Gemini AI calls
│   │   └── pdfExportService.js
│   └── utils/
│       ├── constants.js
│       ├── formatters.js
│       └── validators.js
├── server.js
└── .env
```

---

## ✅ Step 1 — Set up your backend .env

Open `RECIPE REMIXING_BACKEND/.env` and make sure these are set:

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
GEMINI_API_KEY=your-gemini-key
JWT_SECRET=your-very-long-random-secret-string
CLIENT_URL=http://localhost:5173
```

---

## ✅ Step 2 — Enable CORS in your backend

Your frontend runs on `http://localhost:5173`.
Open `server.js` and make sure CORS is configured:

```js
// server.js
import cors from 'cors'

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
```

Install cors if not already: `npm install cors`

---

## ✅ Step 3 — Set frontend .env

Open `recipe-remixing/.env` (create from `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## ✅ Step 4 — Run both servers

**Terminal 1 — Backend:**
```bash
cd RECIPE REMIXING_BACKEND
npm install
npm run dev        # or: node server.js
# → Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd recipe-remixing
npm install
npm run dev
# → Runs on http://localhost:5173
```

---

## 📋 Route Mapping Table

The frontend `src/services/api.js` is already configured to call these exact routes.
Make sure your `src/routes/index.js` mounts them with these prefixes:

| Frontend API call | HTTP Method | Backend Route | Controller |
|---|---|---|---|
| `authAPI.register()` | POST | `/api/auth/register` | `authController.register` |
| `authAPI.login()` | POST | `/api/auth/login` | `authController.login` |
| `authAPI.logout()` | POST | `/api/auth/logout` | `authController.logout` |
| `authAPI.getMe()` | GET | `/api/auth/me` | `authController.getMe` |
| `recipesAPI.getAll()` | GET | `/api/recipes` | `recipeController.getAll` |
| `recipesAPI.getById()` | GET | `/api/recipes/:id` | `recipeController.getById` |
| `recipesAPI.getTrending()` | GET | `/api/recipes/trending` | `recipeController.getTrending` |
| `recipesAPI.create()` | POST | `/api/recipes` | `recipeController.create` |
| `recipesAPI.update()` | PUT | `/api/recipes/:id` | `recipeController.update` |
| `recipesAPI.delete()` | DELETE | `/api/recipes/:id` | `recipeController.delete` |
| `recipesAPI.uploadImage()` | POST | `/api/recipes/upload` | via `uploadMiddleware` |
| `likesAPI.toggleRecipeLike()` | POST | `/api/likes/recipe/:id` | `likeController.toggle` |
| `commentsAPI.getByRecipe()` | GET | `/api/comments/recipe/:id` | `commentController.getByRecipe` |
| `commentsAPI.post()` | POST | `/api/comments/recipe/:id` | `commentController.create` |
| `commentsAPI.delete()` | DELETE | `/api/comments/:id` | `commentController.delete` |
| `collectionsAPI.getAll()` | GET | `/api/collections` | `collectionController.getAll` |
| `collectionsAPI.save()` | POST | `/api/collections/:recipeId` | `collectionController.save` |
| `collectionsAPI.remove()` | DELETE | `/api/collections/:recipeId` | `collectionController.remove` |
| `mealPlannerAPI.get()` | GET | `/api/meal-planner` | `mealPlannerController.get` |
| `mealPlannerAPI.save()` | POST | `/api/meal-planner` | `mealPlannerController.save` |
| `analyticsAPI.getOverview()` | GET | `/api/analytics/overview` | `analyticsController.overview` |
| `analyticsAPI.getWeekly()` | GET | `/api/analytics/weekly` | `analyticsController.weekly` |
| `aiAPI.getSuggestions()` | POST | `/api/ai/suggestions` | `aiController` + `geminiService` |
| `aiAPI.analyzeNutrition()` | POST | `/api/ai/nutrition` | `aiController` + `geminiService` |
| `aiAPI.checkDuplicate()` | POST | `/api/ai/duplicate-check` | `aiController` + `duplicateCheck` |
| `communityAPI.getThreads()` | GET | `/api/community` | `communityController.getAll` |
| `communityAPI.createThread()` | POST | `/api/community` | `communityController.create` |
| `communityAPI.toggleLike()` | POST | `/api/community/:id/like` | `communityController.toggleLike` |
| `collabAPI.invite()` | POST | `/api/collab/invite/:recipeId` | `collabController.invite` |
| `pdfAPI.exportRecipe()` | POST | `/api/recipes/:id/export-pdf` | via `pdfExportService` |

---

## 📋 Check your routes/index.js

Make sure it mounts all routes like this:

```js
// src/routes/index.js
import { Router } from 'express'
import authRoutes        from './authRoutes.js'
import recipeRoutes      from './recipeRoutes.js'
import likeRoutes        from './likeRoutes.js'
import commentRoutes     from './commentRoutes.js'
import collectionRoutes  from './collectionRoutes.js'
import mealPlannerRoutes from './mealPlannerRoutes.js'
import analyticsRoutes   from './analyticsRoutes.js'
import aiRoutes          from './aiRoutes.js'
import communityRoutes   from './communityRoutes.js'
import collabRoutes      from './collabRoutes.js'

const router = Router()

router.use('/auth',         authRoutes)
router.use('/recipes',      recipeRoutes)
router.use('/likes',        likeRoutes)
router.use('/comments',     commentRoutes)
router.use('/collections',  collectionRoutes)
router.use('/meal-planner', mealPlannerRoutes)
router.use('/analytics',    analyticsRoutes)
router.use('/ai',           aiRoutes)
router.use('/community',    communityRoutes)
router.use('/collab',       collabRoutes)

export default router
```

And in `server.js`:
```js
import routes from './src/routes/index.js'
app.use('/api', routes)
```

---

## 📋 Expected Auth Response Shape

Your `authController.js` login/register should return this shape
(the frontend reads `data.user` and `data.token`):

```js
// authController.js — login handler
res.status(200).json({
  user: {
    id:       user.id,
    name:     user.name,
    email:    user.email,
    username: user.username,
    avatar:   user.avatar_url,   // optional
  },
  token: jwtToken,   // signed with JWT_SECRET
})
```

---

## 📋 Expected Recipe Response Shape

Your `recipeController.js` should return recipes in this shape
(the frontend maps these fields directly):

```js
// GET /api/recipes — array response
res.json({
  recipes: [
    {
      id:           'uuid',
      title:        'Spicy Ramen',
      description:  'A rich pork broth...',
      emoji:        '🍜',           // optional display field
      author:       'Arjun Kumar',  // or join with users table
      authorId:     'user-uuid',
      time:         '45 min',
      prepTime:     15,
      cookTime:     30,
      servings:     4,
      difficulty:   'Medium',
      category:     'Asian',
      cuisine:      'Japanese',
      tags:         ['Spicy', 'Noodles'],
      rating:       4.9,
      saves:        2100,
      views:        21000,
      likes:        1840,
      badge:        'Trending',
      ingredients:  [{ name, amount, unit }],
      instructions: ['Step 1...', 'Step 2...'],
      substitutions:[{ from, to }],
      nutrition:    { calories, protein, carbs, fat, fiber },
      videoUrl:     '',
      isCollaborative: false,
      imageUrl:     'https://...',
    }
  ],
  total: 24,
  page:  1,
})
```

---

## 🔄 How to wire API calls into pages (example)

Once both servers are running, replace mock data with real API calls.

**Example — HomePage loading real recipes:**

```jsx
// src/pages/HomePage.jsx  — add this useEffect
import { recipesAPI } from '@/services/api'

useEffect(() => {
  recipesAPI.getAll()
    .then(data => setRecipes(data.recipes))
    .catch(err => console.error('Failed to load recipes:', err))
}, [])
```

**Example — Login page already wired:**
The `LoginPage.jsx` and `SignupPage.jsx` already call
`authAPI.login()` and `authAPI.register()` — they'll work
as soon as your backend is running.

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| `CORS error` in browser console | Add `cors()` middleware in `server.js` with `origin: 'http://localhost:5173'` |
| `401 Unauthorized` | Check JWT_SECRET matches between token creation and verification |
| `Cannot POST /api/auth/login` | Make sure routes are mounted with `/api` prefix in `server.js` |
| `Network Error` / `Failed to fetch` | Confirm backend is running on port 5000, check `VITE_API_URL` in `.env` |
| Supabase connection error | Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in backend `.env` |
