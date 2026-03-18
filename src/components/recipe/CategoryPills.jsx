import React from 'react'
import { CATEGORIES } from '@/utils/helpers'
import styles from './CategoryPills.module.css'

export default function CategoryPills({ active, onChange }) {
  return (
    <div className={styles.wrap}>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          className={`${styles.pill} ${active === cat ? styles.active : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
