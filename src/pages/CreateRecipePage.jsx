import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Upload, Search } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Button from '@/components/ui/Button'
import { recipesAPI, aiAPI } from '@/services/api'
import toast from 'react-hot-toast'
import styles from './CreateRecipePage.module.css'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
}

export default function CreateRecipePage() {
  const { user, setAuthOpen } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', category: 'Main Course', cuisine: 'Italian',
    prepTime: '', cookTime: '', servings: 4, difficulty: 'Medium',
    videoUrl: '', description: '',
  })
  const [tags,          setTags]          = useState(['Homemade'])
  const [tagInput,      setTagInput]      = useState('')
  const [ingredients,   setIngredients]   = useState([{ name:'', amount:'', unit:'' }, { name:'', amount:'', unit:'' }])
  const [instructions,  setInstructions]  = useState('')
  const [substitutions, setSubstitutions] = useState([{ from:'', to:'' }])
  const [uniqueResult,  setUniqueResult]  = useState(null)
  const [checking,      setChecking]      = useState(false)
  const [publishing,    setPublishing]    = useState(false)
  const [imageFile,     setImageFile]     = useState(null)
  const [imagePreview,  setImagePreview]  = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const addIngredient    = () => setIngredients(prev => [...prev, { name:'', amount:'', unit:'' }])
  const removeIngredient = (i) => setIngredients(prev => prev.filter((_, idx) => idx !== i))
  const setIngr          = (i, k, v) => setIngredients(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row))

  const addSubst    = () => setSubstitutions(prev => [...prev, { from:'', to:'' }])
  const removeSubst = (i) => setSubstitutions(prev => prev.filter((_, idx) => idx !== i))
  const setSubst    = (i, k, v) => setSubstitutions(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row))

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // POST /api/ai/duplicate-check
  // Returns { isDuplicate, confidence, similarRecipe?, message? }
  const runUniqueCheck = async () => {
    if (!form.title) { toast.error('Add a title first'); return }
    setChecking(true)
    setUniqueResult(null)
    try {
      const data = await aiAPI.checkDuplicate(
        form.title,
        ingredients.filter(i => i.name).map(i => i.name)
      )
      // Backend returns { isDuplicate: bool, confidence, message }
      setUniqueResult(data.isDuplicate ? 'duplicate' : 'unique')
      if (data.message) toast(data.message)
    } catch {
      // Offline fallback
      const isDup = ['ramen','carbonara','butter chicken','buddha'].some(k =>
        form.title.toLowerCase().includes(k)
      )
      setUniqueResult(isDup ? 'duplicate' : 'unique')
    } finally {
      setChecking(false)
    }
  }

  // POST /api/recipes (with optional image upload to /api/recipes/upload)
  // Backend create returns { message, id, recipe }
  const publish = async () => {
    if (!user) { setAuthOpen(true); return }
    if (!form.title.trim()) { toast.error('Please add a recipe title'); return }
    if (!ingredients.some(i => i.name.trim())) { toast.error('Add at least one ingredient'); return }
    setPublishing(true)

    try {
      let imageUrl = ''

      // Upload image first if provided
      // POST /api/recipes/upload (multipart) → { imageUrl, url }
      if (imageFile) {
        try {
          const uploadData = await recipesAPI.uploadImage(imageFile)
          imageUrl = uploadData.imageUrl || uploadData.url || ''
        } catch {
          toast('⚠️ Image upload failed — continuing without image')
        }
      }

      // Build payload matching recipeController.create expectations
      const payload = {
        title:        form.title.trim(),
        description:  form.description,
        category:     form.category,
        cuisine:      form.cuisine,
        difficulty:   form.difficulty,
        prepTime:     parseInt(form.prepTime) || 0,
        cookTime:     parseInt(form.cookTime) || 0,
        servings:     parseInt(form.servings) || 4,
        videoUrl:     form.videoUrl,
        imageUrl,
        tags,
        // react-quill returns HTML string — send as instructions
        instructions: instructions,
        ingredients:  ingredients
          .filter(i => i.name.trim())
          .map(i => ({
            name:   i.name.trim(),
            amount: parseFloat(i.amount) || 1,
            unit:   i.unit || '',
          })),
        substitutions: substitutions
          .filter(s => s.from.trim() && s.to.trim())
          .map(s => ({ from: s.from.trim(), to: s.to.trim() })),
      }

      // POST /api/recipes → { message, id, recipe }
      const data  = await recipesAPI.create(payload)
      const newId = data.id || data.recipe?.id

      toast.success('🚀 Recipe published!')
      setTimeout(() => navigate(`/recipe/${newId}`), 600)
    } catch (err) {
      toast.error(err.message || 'Failed to publish recipe')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Share Your Recipe</h1>
        <p>Inspire the community with your culinary creation</p>
      </div>

      {/* Basic Info */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span>📝</span> Basic Information</h2>
        <div className={styles.row1}>
          <div className={styles.fgroup}>
            <label>Recipe Title *</label>
            <input placeholder="e.g. Grandma's Secret Lasagna" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
        </div>
        <div className={styles.row2}>
          <div className={styles.fgroup}>
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {['Main Course','Appetizer','Dessert','Breakfast','Salad','Soup','Beverage','Pasta','Asian','Vegan'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.fgroup}>
            <label>Cuisine</label>
            <select value={form.cuisine} onChange={e => set('cuisine', e.target.value)}>
              {['Italian','Asian','Mexican','Indian','Mediterranean','American','Japanese','French','Middle Eastern'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.fgroup}>
            <label>Prep Time (min)</label>
            <input type="number" placeholder="30" min="0" value={form.prepTime} onChange={e => set('prepTime', e.target.value)} />
          </div>
          <div className={styles.fgroup}>
            <label>Cook Time (min)</label>
            <input type="number" placeholder="45" min="0" value={form.cookTime} onChange={e => set('cookTime', e.target.value)} />
          </div>
          <div className={styles.fgroup}>
            <label>Servings</label>
            <input type="number" placeholder="4" min="1" value={form.servings} onChange={e => set('servings', e.target.value)} />
          </div>
          <div className={styles.fgroup}>
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
              {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.fgroup}>
          <label>Short Description</label>
          <textarea placeholder="A brief, appetizing description…" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className={styles.fgroup}>
          <label>Tags <span style={{ color:'var(--text3)', fontWeight:400 }}>(press Enter to add)</span></label>
          <div className={styles.tagArea}>
            {tags.map((t, i) => (
              <span key={i} className={styles.tagItem}>
                {t}<button onClick={() => setTags(prev => prev.filter((_, idx) => idx !== i))}>×</button>
              </span>
            ))}
            <input className={styles.tagInput} placeholder="Add tag…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
          </div>
        </div>
      </section>

      {/* Media */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span>📸</span> Photos & Video</h2>
        <label className={styles.uploadArea} style={{ cursor:'pointer' }}>
          <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageChange} />
          {imagePreview
            ? <img src={imagePreview} alt="preview" style={{ maxHeight:180, borderRadius:8, objectFit:'cover' }} />
            : (<><Upload size={28} style={{ color:'var(--text3)', marginBottom:8 }} />
               <p><strong style={{ color:'var(--accent)' }}>Drop photo here</strong> or click to browse</p>
               <p className={styles.uploadHint}>JPG, PNG, WEBP — up to 10MB</p></>)
          }
        </label>
        <div className={styles.fgroup} style={{ marginTop:'1rem' }}>
          <label>Video URL <span style={{ color:'var(--text3)', fontWeight:400 }}>(optional)</span></label>
          <input type="url" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} />
        </div>
      </section>

      {/* Ingredients */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span>🥦</span> Ingredients</h2>
        <div className={styles.ingrHeader}>
          <span style={{ flex:2, fontSize:'0.78rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Ingredient</span>
          <span style={{ flex:1, fontSize:'0.78rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Amount</span>
          <span style={{ flex:1, fontSize:'0.78rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Unit</span>
          <span style={{ width:32 }} />
        </div>
        {ingredients.map((ing, i) => (
          <div key={i} className={styles.ingrRow}>
            <input style={{ flex:2 }} placeholder="e.g. All-purpose flour" value={ing.name}   onChange={e => setIngr(i,'name',e.target.value)} />
            <input style={{ flex:1 }} placeholder="2" type="number" min="0" step="0.1" value={ing.amount} onChange={e => setIngr(i,'amount',e.target.value)} />
            <input style={{ flex:1 }} placeholder="cups" value={ing.unit}   onChange={e => setIngr(i,'unit',e.target.value)} />
            <button className={styles.removeBtn} onClick={() => removeIngredient(i)} disabled={ingredients.length <= 1}><Minus size={14} /></button>
          </div>
        ))}
        <button className={styles.addRowBtn} onClick={addIngredient}><Plus size={15} /> Add Ingredient</button>
      </section>

      {/* Instructions rich text */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span>📋</span> Instructions</h2>
        <p className={styles.hint}>Use the toolbar to format your steps. Bold key actions, add numbered lists.</p>
        <ReactQuill
          theme="snow"
          value={instructions}
          onChange={setInstructions}
          modules={QUILL_MODULES}
          placeholder="Write your step-by-step instructions here…"
        />
      </section>

      {/* Substitutions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><span>♻️</span> Ingredient Substitutions</h2>
        <p className={styles.hint}>Help users with dietary restrictions by suggesting alternatives.</p>
        {substitutions.map((s, i) => (
          <div key={i} className={styles.substRow}>
            <input placeholder="Original ingredient" value={s.from} onChange={e => setSubst(i,'from',e.target.value)} />
            <span className={styles.substArrow}>→</span>
            <input placeholder="Substitute (e.g. Coconut oil for Butter)" value={s.to} onChange={e => setSubst(i,'to',e.target.value)} />
            <button className={styles.removeBtn} onClick={() => removeSubst(i)} disabled={substitutions.length <= 1}><Minus size={14} /></button>
          </div>
        ))}
        <button className={styles.addRowBtn} onClick={addSubst}><Plus size={15} /> Add Substitution</button>
      </section>

      {/* Uniqueness check */}
      <section className={styles.section} style={{ borderLeft:'4px solid var(--accent2)' }}>
        <h2 className={styles.sectionTitle}><span>🔍</span> Uniqueness Check</h2>
        <p className={styles.hint}>AI checks your recipe against the database before you publish.</p>
        <Button variant="outline" size="sm" onClick={runUniqueCheck} style={{ display:'inline-flex', gap:8 }}>
          <Search size={14} /> {checking ? 'Checking…' : 'Check Recipe Uniqueness'}
        </Button>
        {uniqueResult === 'duplicate' && (
          <div className={styles.alertWarning}>⚠️ A similar recipe exists. Consider adding your signature twist!</div>
        )}
        {uniqueResult === 'unique' && (
          <div className={styles.alertSuccess}>✅ Great news! Your recipe appears to be unique.</div>
        )}
      </section>

      <Button
        variant="primary" size="lg"
        style={{ width:'100%', justifyContent:'center', borderRadius:14, marginTop:'0.5rem', opacity: publishing ? 0.7 : 1 }}
        onClick={publish}
        disabled={publishing}
      >
        {publishing ? '⏳ Publishing…' : '🚀 Publish Recipe'}
      </Button>
    </div>
  )
}
