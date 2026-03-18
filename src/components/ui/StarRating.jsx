import React, { useState } from 'react'

export default function StarRating({ rating = 0, interactive = false, size = 14, onRate }) {
  const [hover, setHover] = useState(0)
  const stars = [1,2,3,4,5]

  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {stars.map(s => (
        <span
          key={s}
          style={{
            fontSize: size,
            color: s <= (hover || Math.round(rating)) ? 'var(--accent2)' : 'var(--border2)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(s)}
        >
          ★
        </span>
      ))}
    </span>
  )
}
