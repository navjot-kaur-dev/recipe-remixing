import { useState, useEffect } from 'react'

export function useServings(baseServings = 4) {
  const [servings, setServings] = useState(baseServings)
  const ratio = servings / baseServings
  const inc = () => setServings(s => s + 1)
  const dec = () => setServings(s => Math.max(1, s - 1))
  const scaleAmount = (amount) => {
    const scaled = amount * ratio
    return scaled % 1 === 0 ? scaled : parseFloat(scaled.toFixed(1))
  }
  return { servings, inc, dec, scaleAmount }
}

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch { return initial }
  })
  const set = (val) => {
    setValue(val)
    try { window.localStorage.setItem(key, JSON.stringify(val)) } catch {}
  }
  return [value, set]
}
