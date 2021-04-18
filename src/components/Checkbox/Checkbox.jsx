import React from 'react'
import clsx from 'clsx'
import {CheckIcon} from '@heroicons/react/solid'

export function Checkbox({isChecked, onChange, className = ''}) {
  return (
    <div className={className}>
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={() => onChange(!isChecked)}
      />
      <div
        className={clsx(
          'flex items-center justify-center',
          'w-4 h-4 rounded border',
          'transition ease-in duration-75',
          {
            'bg-black border-black': isChecked,
            'bg-white border-gray-400': !isChecked
          }
        )}
      >
        {isChecked && <CheckIcon className="h-4 w-4 text-white" />}
      </div>
    </div>
  )
}
