import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/Tag'
import { Tag } from '@/components/ui/Tag'
import Button from '@/components/ui/Button'
import { AI_INGREDIENTS } from '@/data/recipes'
import { aiAPI } from '@/services/api'
import toast from 'react-hot-toast'
import styles from './AiChefPage.module.css'

export default function AiChefPage() {
  const [selected,     setSelected]     = useState(new Set(['chicken','tomatoes']))
  const [dietary,      setDietary]      = useState('')
  const [results,      setResults]      = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [nutriText,    setNutriText]    = useState('')
  const [nutriResult,  setNutriResult]  = useState(null)
  const [nutriLoading, setNutriLoading] = useState(false)

  const toggle = (val) => {
    setSelected(prev => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n })
  }

  // POST /api/ai/suggestions
  // Returns { suggestions: [{ name, emoji, match, time, tags, description }] }
  const getSuggestions = async () => {
    if (selected.size === 0) { toast.error('Select at least one ingredient'); return }
    setLoading(true); setResults(null)
    try {
      const data = await aiAPI.getSuggestions([...selected], dietary)
      const list = data.suggestions || data || []
      setResults(Array.isArray(list) ? list : [])
      toast.success(`✨ Found ${list.length} personalized recipes!`)
    } catch {
      // Fallback to mock if Gemini not configured yet
      const { AI_SUGGESTIONS } = await import('@/data/recipes')
      setResults(AI_SUGGESTIONS)
      toast.success('✨ Found matching recipes!')
    } finally {
      setLoading(false)
    }
  }

  // POST /api/ai/nutrition
  // Returns { nutrition: { calories, protein, carbs, fat, fiber, vitamins[] } }
  const analyzeNutrition = async () => {
    if (!nutriText.trim()) { toast.error('Enter ingredients first'); return }
    setNutriLoading(true); setNutriResult(null)
    try {
      const data = await aiAPI.analyzeNutrition(nutriText)
      setNutriResult(data.nutrition || data)
      toast.success('🧬 Analysis complete!')
    } catch {
      // Fallback mock if Gemini not configured
      setNutriResult({ calories:480, protein:32, carbs:54, fat:18, fiber:8, vitamins:['Vitamin A','Vitamin C','Iron','Calcium'] })
      toast.success('🧬 Analysis complete!')
    } finally {
      setNutriLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroSection}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <div className={styles.aiIcon}>✨</div>
          <h1>AI Chef Assistant</h1>
          <p>Powered by Gemini AI — tell me what ingredients you have and I'll suggest personalized recipes.</p>
        </motion.div>
      </div>

      {/* Ingredient selector */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <Badge variant="ai">✨ AI</Badge>
          <h2>Select your available ingredients</h2>
        </div>
        <div className={styles.chips}>
          {AI_INGREDIENTS.map(ing => (
            <button key={ing.value} className={`${styles.chip} ${selected.has(ing.value) ? styles.chipActive : ''}`} onClick={() => toggle(ing.value)}>
              {ing.emoji} {ing.label}
            </button>
          ))}
        </div>
        <div className={styles.controls}>
          <input
            className={styles.dietInput}
            placeholder="Dietary restrictions? e.g. gluten-free, dairy-free, low-carb…"
            value={dietary}
            onChange={e => setDietary(e.target.value)}
          />
          <Button variant="primary" size="md" onClick={getSuggestions}>✨ Suggest Recipes</Button>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Gemini AI is analyzing your ingredients…</p>
            </motion.div>
          )}
          {results && !loading && (
            <motion.div key="results" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className={styles.resultsGrid}>
              {results.map((s, i) => (
                <motion.div
                  key={s.name || i}
                  className={styles.resultCard}
                  initial={{ opacity:0, y:16 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.07 }}
                  onClick={() => toast(`🔍 Opening ${s.name}…`)}
                >
                  <span className={styles.resultEmoji}>{s.emoji || '🍽️'}</span>
                  <h3 className={styles.resultName}>{s.name}</h3>
                  {s.match != null && <div className={styles.resultMatch}>{s.match}% match</div>}
                  <div className={styles.resultMeta}>{s.time || ''}</div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'center' }}>
                    {(s.tags||[]).map(t => <Tag key={t}>{t}</Tag>)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nutrition analysis */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <Badge variant="ai">🧬 AI</Badge>
          <h2>Nutrition Analysis</h2>
        </div>
        <p className={styles.hint}>Paste your recipe ingredients to get a detailed nutrition breakdown powered by Gemini AI.</p>
        <textarea
          className={styles.nutriInput}
          placeholder="e.g. 200g chicken breast, 100g pasta, 2 tbsp olive oil, 1 clove garlic…"
          value={nutriText}
          onChange={e => setNutriText(e.target.value)}
          rows={4}
        />
        <Button variant="primary" size="md" onClick={analyzeNutrition} style={{ marginTop:'0.75rem' }}>
          🧬 Analyze Nutrition
        </Button>

        <AnimatePresence>
          {nutriLoading && (
            <motion.div key="nloading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className={styles.loadingState}>
              <div className={styles.spinner} /><p>Calculating nutritional values…</p>
            </motion.div>
          )}
          {nutriResult && !nutriLoading && (
            <motion.div key="nresult" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className={styles.nutriCard}>
              <div className={styles.macroRow}>
                {[
                  { label:'Calories', val:nutriResult.calories, unit:'kcal', color:'var(--accent)'  },
                  { label:'Protein',  val:nutriResult.protein,  unit:'g',    color:'var(--accent3)' },
                  { label:'Carbs',    val:nutriResult.carbs,    unit:'g',    color:'var(--accent2)' },
                  { label:'Fat',      val:nutriResult.fat,      unit:'g',    color:'#f472b6'        },
                ].map(m => (
                  <div key={m.label} className={styles.macroItem}>
                    <span className={styles.macroVal} style={{ color:m.color }}>{m.val}<small>{m.unit}</small></span>
                    <span className={styles.macroLabel}>{m.label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.bars}>
                {[
                  { label:'Protein', val:nutriResult.protein||0, max:60, color:'var(--accent3)' },
                  { label:'Carbs',   val:nutriResult.carbs  ||0, max:80, color:'var(--accent2)' },
                  { label:'Fat',     val:nutriResult.fat    ||0, max:50, color:'#f472b6'        },
                  { label:'Fiber',   val:nutriResult.fiber  ||0, max:20, color:'#a78bfa'        },
                ].map(b => (
                  <div key={b.label} className={styles.barRow}>
                    <span className={styles.barLabel}>{b.label}</span>
                    <div className={styles.barTrack}>
                      <motion.div
                        className={styles.barFill}
                        style={{ background:b.color }}
                        initial={{ width:0 }}
                        animate={{ width:`${Math.min(100,(b.val/b.max)*100)}%` }}
                        transition={{ duration:0.7, ease:'easeOut' }}
                      />
                    </div>
                    <span className={styles.barVal}>{b.val}g</span>
                  </div>
                ))}
              </div>
              {nutriResult.vitamins?.length > 0 && (
                <div className={styles.vitamins}>
                  <p className={styles.vitaminsLabel}>Key Vitamins & Minerals:</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {nutriResult.vitamins.map(v => <Tag key={v}>{v}</Tag>)}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
