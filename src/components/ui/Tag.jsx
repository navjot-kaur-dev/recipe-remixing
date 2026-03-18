import React from 'react'

export function Tag({ children, color }) {
  const style = color
    ? { background: color.bg, color: color.text }
    : { background: 'var(--tag-bg)', color: 'var(--tag-text)' }
  return (
    <span style={{
      ...style,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.3px',
      display: 'inline-block',
    }}>
      {children}
    </span>
  )
}

export function Badge({ children, variant = 'accent' }) {
  const colors = {
    accent:  { bg: 'var(--accent)', color: '#fff' },
    green:   { bg: 'rgba(45,106,79,0.12)', color: 'var(--accent3)' },
    yellow:  { bg: '#fef3c7', color: '#92400e' },
    ai:      { bg: 'var(--accent)', color: '#fff' },
  }
  const c = colors[variant] || colors.accent
  return (
    <span style={{
      ...c,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.5px',
    }}>
      {children}
    </span>
  )
}
