import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from '@/context/AppContext'
import Navbar from '@/components/layout/Navbar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

import HomePage          from '@/pages/HomePage'
import RecipeDetailPage  from '@/pages/RecipeDetailPage'
import CreateRecipePage  from '@/pages/CreateRecipePage'
import AnalyticsPage     from '@/pages/AnalyticsPage'
import MealPlannerPage   from '@/pages/MealPlannerPage'
import AiChefPage        from '@/pages/AiChefPage'
import ForumPage         from '@/pages/ForumPage'
import BookmarksPage     from '@/pages/BookmarksPage'
import LoginPage         from '@/pages/LoginPage'
import SignupPage        from '@/pages/SignupPage'
import AuthModal         from '@/components/auth/AuthModal'

/** Pages that show the Navbar */
function AppShell({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-h)' }}>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Routes>
          {/* ── Auth pages — no navbar ── */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── App pages — with navbar ── */}
          <Route path="/" element={
            <AppShell>
              <HomePage />
            </AppShell>
          }/>
          <Route path="/recipe/:id" element={
            <AppShell>
              <RecipeDetailPage />
            </AppShell>
          }/>
          <Route path="/forum" element={
            <AppShell>
              <ForumPage />
            </AppShell>
          }/>
          <Route path="/ai" element={
            <AppShell>
              <AiChefPage />
            </AppShell>
          }/>

          {/* ── Protected pages — must be logged in ── */}
          <Route path="/create" element={
            <AppShell>
              <ProtectedRoute><CreateRecipePage /></ProtectedRoute>
            </AppShell>
          }/>
          <Route path="/analytics" element={
            <AppShell>
              <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
            </AppShell>
          }/>
          <Route path="/planner" element={
            <AppShell>
              <ProtectedRoute><MealPlannerPage /></ProtectedRoute>
            </AppShell>
          }/>
          <Route path="/bookmarks" element={
            <AppShell>
              <ProtectedRoute><BookmarksPage /></ProtectedRoute>
            </AppShell>
          }/>
        </Routes>

        {/* Quick-access auth modal (for inline sign-in prompts) */}
        <AuthModal />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--text)',
              color: 'var(--bg)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem',
              borderRadius: '12px',
              padding: '12px 20px',
            },
          }}
        />
      </div>
    </AppProvider>
  )
}
