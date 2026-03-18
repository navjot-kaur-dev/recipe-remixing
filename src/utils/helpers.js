export function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toString()
}

export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export const CARD_GRADIENTS = {
  warm:   'linear-gradient(135deg,#fde68a,#f97316)',
  green:  'linear-gradient(135deg,#a7f3d0,#34d399)',
  blue:   'linear-gradient(135deg,#bfdbfe,#60a5fa)',
  pink:   'linear-gradient(135deg,#fecdd3,#fb7185)',
  orange: 'linear-gradient(135deg,#fed7aa,#f97316)',
  yellow: 'linear-gradient(135deg,#fef08a,#facc15)',
  purple: 'linear-gradient(135deg,#e9d5ff,#a78bfa)',
}

export const CATEGORIES = ['All', 'Vegan', 'Quick Meals', 'Dessert', 'Breakfast', 'Pasta', 'Seafood', 'Asian', 'Indian']

export const DIFFICULTY_COLORS = {
  Easy:   { bg: '#d1fae5', text: '#065f46' },
  Medium: { bg: '#fef3c7', text: '#92400e' },
  Hard:   { bg: '#fee2e2', text: '#991b1b' },
}
