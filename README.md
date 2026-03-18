# 🍳 RecipeRemixing

> **Cook. Share. Remix Together.**
> A full-featured recipe sharing platform for home chefs — built with React + Vite.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+ (comes with Node)

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

---

## 📁 Folder Structure

```
recipe-remixing/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css          # CSS variables, reset, base styles
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthModal.jsx        # Login / Register modal
│   │   │   └── AuthModal.module.css
│   │   ├── layout/
│   │   │   ├── Navbar.jsx           # Fixed top navigation
│   │   │   └── Navbar.module.css
│   │   ├── recipe/
│   │   │   ├── RecipeCard.jsx       # Individual recipe card
│   │   │   ├── RecipeCard.module.css
│   │   │   ├── RecipeGrid.jsx       # Responsive recipe grid
│   │   │   ├── RecipeGrid.module.css
│   │   │   ├── CategoryPills.jsx    # Category filter tabs
│   │   │   └── CategoryPills.module.css
│   │   └── ui/
│   │       ├── Button.jsx           # Shared button component
│   │       ├── Button.module.css
│   │       ├── Tag.jsx              # Tag & Badge components
│   │       └── StarRating.jsx       # Interactive star rating
│   ├── context/
│   │   └── AppContext.jsx           # Global state (theme, auth, recipes, bookmarks)
│   ├── data/
│   │   └── recipes.js               # Mock recipe data, forum threads, AI suggestions
│   ├── hooks/
│   │   └── useServings.js           # Dynamic servings scaling hook + utilities
│   ├── pages/
│   │   ├── HomePage.jsx             # Hero, AI panel, recipe grid
│   │   ├── HomePage.module.css
│   │   ├── RecipeDetailPage.jsx     # Full recipe view with nutrition, comments
│   │   ├── RecipeDetailPage.module.css
│   │   ├── CreateRecipePage.jsx     # Recipe creation form with rich text editor
│   │   ├── CreateRecipePage.module.css
│   │   ├── AnalyticsPage.jsx        # Dashboard with Recharts charts
│   │   ├── AnalyticsPage.module.css
│   │   ├── MealPlannerPage.jsx      # 7-day weekly meal planner
│   │   ├── MealPlannerPage.module.css
│   │   ├── AiChefPage.jsx           # AI ingredient suggestions + nutrition analysis
│   │   ├── AiChefPage.module.css
│   │   ├── ForumPage.jsx            # Community discussion threads
│   │   ├── ForumPage.module.css
│   │   ├── BookmarksPage.jsx        # Saved/bookmarked recipes
│   │   └── BookmarksPage.module.css
│   ├── utils/
│   │   └── helpers.js               # Formatters, gradients, constants
│   ├── App.jsx                      # Root with React Router routes
│   └── main.jsx                     # ReactDOM entry point
├── index.html                       # HTML template
├── vite.config.js                   # Vite config with @ alias
├── package.json
└── README.md
```

---

## 🎯 Features Implemented

### Minimum Features
| Feature | Status | Location |
|---|---|---|
| User Authentication | ✅ | `AuthModal.jsx` + `AppContext` |
| Recipe Creation & Management | ✅ | `CreateRecipePage.jsx` |
| Video support | ✅ | `CreateRecipePage.jsx` + `RecipeDetailPage.jsx` |
| Rich Text Editor | ✅ | `CreateRecipePage.jsx` (react-quill) |
| Recipe Tagging & Categorization | ✅ | `CategoryPills.jsx` + recipe data |
| Comments & Reviews | ✅ | `RecipeDetailPage.jsx` |
| Recipe Ratings | ✅ | `StarRating.jsx` |
| Favorites & Bookmarking | ✅ | `BookmarksPage.jsx` + `AppContext` |
| Weekly Meal Planner | ✅ | `MealPlannerPage.jsx` |
| Ingredient Substitutions | ✅ | `RecipeDetailPage.jsx` |

### Unique Features
| Feature | Status | Location |
|---|---|---|
| Recipe Uniqueness Check | ✅ | `CreateRecipePage.jsx` |
| Recipe Analytics Dashboard | ✅ | `AnalyticsPage.jsx` (Recharts) |
| Recipe Collaboration Badge | ✅ | `RecipeDetailPage.jsx` |

### Challenging Features
| Feature | Status | Location |
|---|---|---|
| AI-Powered Recipe Suggestions | ✅ | `AiChefPage.jsx` + `HomePage.jsx` |
| Dynamic Servings Adjustment | ✅ | `RecipeDetailPage.jsx` + `useServings.js` |
| Nutrition Analysis (AI) | ✅ | `AiChefPage.jsx` |

### Additional Features
| Feature | Status |
|---|---|
| Dark Mode | ✅ |
| Responsive Design | ✅ |
| Community Forum | ✅ |
| Social Sharing (copy link) | ✅ |
| Export PDF (toast stub) | ✅ |
| Search | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router DOM v6 |
| State Management | React Context API |
| Animations | Framer Motion |
| Charts | Recharts |
| Rich Text Editor | React Quill |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Styling | CSS Modules + CSS Variables |
| Fonts | Playfair Display, DM Sans, DM Mono |

---

## 🎨 Design System

- **Primary font**: Playfair Display (headings, editorial)
- **Body font**: DM Sans
- **Mono font**: DM Mono (amounts, numbers)
- **Accent**: `#c84b11` (burnt orange)
- **Secondary accent**: `#e8a020` (amber)
- **Success**: `#2d6a4f` (forest green)
- Full **dark/light mode** via CSS custom properties

---

## 🔌 Connecting a Real Backend

The app uses mock data in `src/data/recipes.js`. To connect a real backend:

1. Replace the mock data in `AppContext.jsx` with API calls (e.g. using `fetch` or `axios`)
2. Add environment variables in a `.env` file:
   ```
   VITE_API_URL=https://your-backend.com/api
   ```
3. Use `import.meta.env.VITE_API_URL` in your API calls

---

## 📦 Key Dependencies

```
react-router-dom   → client-side routing
framer-motion      → page & component animations
recharts           → analytics charts
react-quill        → rich text editor for recipes
react-hot-toast    → notification toasts
lucide-react       → icon library
clsx               → conditional class names
```
