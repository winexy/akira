import React from 'react'
import clsx, {ClassValue} from 'clsx'

type Variant = 'green' | 'gray' | 'red' | 'purple'

export type TagPropsT = {
  variant: Variant
  className?: ClassValue
  onClick?(): void
}

export const Tag: React.FC<TagPropsT> = ({
  variant,
  children,
  className,
  onClick
}) => {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex justify-center items-center px-2 py-1',
        'font-bold text-xs text-white',
        'rounded shadow-md border',
        'focus:outline-none focus:ring',
        {
          'bg-green-500 border-green-600 focus-within:ring-green-300':
            variant === 'green',
          'bg-gray-500 border-gray-600 focus-within:ring-gray-300':
            variant === 'gray',
          'bg-red-500 border-red-600 focus-within:ring-red-300':
            variant === 'red',
          'bg-indigo-500 border-indigo-600 focus-within:ring-indigo-300':
            variant === 'purple'
        },
        className
      )}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export const WIP: React.FC<{className?: ClassValue}> = ({className = ''}) => (
  <Tag variant="red" className={className}>
    WIP
  </Tag>
)