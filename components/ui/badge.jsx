import React from 'react'

export const Badge = React.forwardRef(({ className = '', variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-slate-300 text-slate-700 bg-white'
  }
  
  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

Badge.displayName = 'Badge'
