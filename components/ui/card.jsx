import React from 'react'

export const Card = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = 'Card'

export const CardHeader = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-slate-500 ${className}`}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
))
CardContent.displayName = 'CardContent'
