import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import toast from 'react-hot-toast'
import styles from './MealPlannerPage.module.css'

const DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MEALS = ['Breakfast','Lunch','Dinner']

export default function MealPlannerPage() {
  const { recipes, mealPlan, addMealPlanItem, removeMealPlanItem, user, setAuthOpen } = useApp()
  const [plan,    setPlan]    = useState(mealPlan || {})
  const [picker,  setPicker]  = useState(null) // { day, meal }

  // Sync local plan when global mealPlan updates (loaded from backend)
  useEffect(() => {
    if (mealPlan && Object.keys(mealPlan).length > 0) {
      setPlan(mealPlan)
    }
  }, [mealPlan])

  const handleSlotClick = (day, meal) => {
    const key = `${day}-${meal}`
    if (plan[key]) {
      // Remove slot — calls DELETE /api/meal-planner/:slotKey
      removeMealPlanItem(key)
      setPlan(prev => { const n = { ...prev }; delete n[key]; return n })
      toast('🗑️ Meal removed')
    } else {
      if (!user) { setAuthOpen(true); return }
      setPicker({ day, meal })
    }
  }

  const pickRecipe = async (recipe) => {
    if (!picker) return
    const key = `${picker.day}-${picker.meal}`
    const slot = { title: recipe.title, emoji: recipe.emoji || '🍳', recipeId: recipe.id }
    setPlan(prev => ({ ...prev, [key]: slot }))
    // addMealPlanItem calls POST /api/meal-planner on backend
    await addMealPlanItem(picker.day, picker.meal, recipe)
    setPicker(null)
    toast.success(`📅 ${recipe.title} added to ${picker.day} ${picker.meal}!`)
  }

  const totalMeals    = Object.keys(plan).length
  const estCalories   = totalMeals * 450

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>📅 Weekly Meal Planner</h1>
        <p>Plan your week ahead with saved recipes. Click a slot to add or remove a meal.</p>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{totalMeals}</span>
          <span className={styles.summaryLabel}>Meals Planned</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{estCalories.toLocaleString()}</span>
          <span className={styles.summaryLabel}>Est. Weekly Calories</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{21 - totalMeals}</span>
          <span className={styles.summaryLabel}>Slots Remaining</span>
        </div>
        <button
          className={styles.clearBtn}
          onClick={() => {
            setPlan({})
            DAYS.forEach(day => MEALS.forEach(meal => removeMealPlanItem(`${day}-${meal}`)))
            toast('🗑️ Planner cleared')
          }}
        >
          Clear All
        </button>
      </div>

      <div className={styles.grid}>
        {DAYS.map(day => (
          <div key={day} className={styles.dayCol}>
            <div className={styles.dayName}>{day.slice(0, 3)}</div>
            {MEALS.map(meal => {
              const key    = `${day}-${meal}`
              const filled = plan[key]
              return (
                <div
                  key={meal}
                  className={`${styles.slot} ${filled ? styles.filled : ''}`}
                  onClick={() => handleSlotClick(day, meal)}
                  title={filled ? `Remove ${filled.title}` : `Add ${meal}`}
                >
                  <span className={styles.mealLabel}>{meal}</span>
                  {filled ? (
                    <div className={styles.mealFilled}>
                      <span className={styles.mealEmoji}>{filled.emoji || '🍳'}</span>
                      <span className={styles.mealName}>{filled.title}</span>
                    </div>
                  ) : (
                    <span className={styles.addHint}>+ Add</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Recipe picker modal */}
      {picker && (
        <div className={styles.pickerOverlay} onClick={() => setPicker(null)}>
          <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
            <div className={styles.pickerHeader}>
              <h3>Add recipe to {picker.day} {picker.meal}</h3>
              <button className={styles.pickerClose} onClick={() => setPicker(null)}>×</button>
            </div>
            <div className={styles.pickerList}>
              {recipes.length === 0 && (
                <p style={{ color:'var(--text3)', padding:'1rem', textAlign:'center' }}>No recipes available yet.</p>
              )}
              {recipes.map(r => (
                <div key={r.id} className={styles.pickerItem} onClick={() => pickRecipe(r)}>
                  <span className={styles.pickerEmoji}>{r.emoji || '🍳'}</span>
                  <div>
                    <p className={styles.pickerTitle}>{r.title}</p>
                    <p className={styles.pickerMeta}>{r.time || ''}{r.difficulty ? ` · ${r.difficulty}` : ''}</p>
                  </div>
                  <span className={styles.pickerRating}>⭐ {r.rating || '0.0'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
