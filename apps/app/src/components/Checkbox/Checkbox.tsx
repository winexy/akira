import React from 'react'
import clsx from 'clsx'
import {CheckIcon} from '@heroicons/react/solid'

type CheckboxProps = {
  isChecked: boolean
  onChange(newState: boolean): void
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  isChecked,
  onChange,
  className = ''
}) => {
  return (
    <label className={className}>
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
            'bg-blue-500 border-blue-600': isChecked,
            'bg-white border-gray-400': !isChecked
          }
        )}
      >
        {isChecked && <CheckIcon className="h-4 w-4 text-white" />}
      </div>
    </label>
  )
}
