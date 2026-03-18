import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

/**
 * GuestRoute
 * ──────────
 * Only accessible when NOT logged in.
 * If the user is already authenticated, send them home.
 * Used for /login and /signup pages.
 */
export default function GuestRoute({ children }) {
  const { user } = useApp()

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}
