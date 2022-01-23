import clsx from 'clsx'
import noop from 'lodash/fp/noop'
import React from 'react'

type Props = {
  className?: string
  isChecked?: boolean
  onChange?(): void
}

export const Toggle: React.FC<Props> = ({
  className,
  isChecked = false,
  onChange = noop,
  children
}) => {
  return (
    <label className={clsx('flex items-center', className)}>
      {children}
      <div
        className={clsx(
          'w-14 h-8 p-1',
          'rounded-full shadow-inner',
          'transition',
          {
            'bg-blue-500 active:bg-blue-600 dark:bg-blue-500 dark:active:bg-blue-600': isChecked,
            'bg-gray-200 active:bg-gray-300': !isChecked
          }
        )}
      >
        <div
          className={clsx(
            'flex items-center justify-center',
            'rounded-full bg-white w-6 h-6 shadow',
            'transition ease-in-out duration-300 transform'
          )}
          style={{
            transform: isChecked ? `translateX(24px)` : ''
          }}
        >
          <div className="w-4 h-4 rounded-full bg-gray-100 shadow-inner" />
        </div>
        <input
          checked={isChecked}
          onChange={onChange}
          type="checkbox"
          className="sr-only"
        />
      </div>
    </label>
  )
}
