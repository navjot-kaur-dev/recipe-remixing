import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

/**
 * ProtectedRoute
 * ──────────────
 * Wraps ALL app pages. If the user is not logged in,
 * they are redirected to /login. The page they tried
 * to visit is saved in location.state.from so they
 * are sent back after a successful login.
 */
export default function ProtectedRoute({ children }) {
  const { user } = useApp()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
