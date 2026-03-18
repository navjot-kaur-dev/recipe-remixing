import React from 'react'
import RecipeCard from './RecipeCard'
import styles from './RecipeGrid.module.css'

export default function RecipeGrid({ recipes, emptyMessage = 'No recipes found.' }) {
  if (!recipes.length) {
    return (
      <div className={styles.empty}>
        <span style={{ fontSize: '3rem' }}>🍽️</span>
        <p>{emptyMessage}</p>
      </div>
    )
  }
  return (
    <div className={styles.grid}>
      {recipes.map((r, i) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          style={{ animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  )
}
