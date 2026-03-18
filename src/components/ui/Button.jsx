import React from 'react'
import styles from './Button.module.css'
import clsx from 'clsx'

export default function Button({ variant = 'primary', size = 'md', children, className, ...props }) {
  return (
    <button
      className={clsx(styles.btn, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
