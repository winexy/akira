import React, {MouseEventHandler} from 'react'
import clsx from 'clsx'
import {CheckIcon} from '@heroicons/react/solid'
import noop from 'lodash/fp/noop'

type CheckboxProps = {
  isChecked?: boolean
  onChange?(newState: boolean): void
  onClick?: MouseEventHandler<HTMLLabelElement>
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  isChecked = false,
  onChange = noop,
  onClick = noop,
  className = ''
}) => {
  return (
    <label
      className={clsx(
        className,
        'focus-within:ring-2 rounded transition ease-in duration-150'
      )}
      onClick={onClick}
    >
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
