import React from 'react'
import clsx, {ClassValue} from 'clsx'

type Variant = 'green' | 'gray' | 'red' | 'purple'

export type TagPropsT = {
  variant: Variant
  className?: ClassValue
}

export const Tag: React.FC<TagPropsT> = ({variant, children, className}) => {
  return (
    <span
      className={clsx(
        'inline-flex justify-center items-center px-2 py-1',
        'font-bold text-xs text-white',
        'rounded shadow-md border',
        {
          'bg-green-500 border-green-600': variant === 'green',
          'bg-gray-500 border-gray-600': variant === 'gray',
          'bg-red-500 border-red-600': variant === 'red',
          'bg-indigo-500 border-indigo-600': variant === 'purple'
        },
        className
      )}
    >
      {children}
    </span>
  )
}

export const WIP: React.FC<{className?: ClassValue}> = ({className = ''}) => (
  <Tag variant="red" className={className}>
    WIP
  </Tag>
)
