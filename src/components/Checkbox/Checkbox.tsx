import React, {MouseEventHandler} from 'react'
import clsx from 'clsx'
import {CheckIcon} from '@heroicons/react/solid'
import noop from 'lodash/fp/noop'
import {createMatcher} from '../ui/utils'

type Props = {
  isChecked?: boolean
  onChange?(newState: boolean): void
  onClick?: MouseEventHandler<HTMLLabelElement>
  className?: string
  size?: Size
}

type Size = 'xs' | 'sm'

const xs = 'w-4 h-4'
const sm = 'w-5 h-5'

const matchSize = createMatcher<Size>('size')({xs, sm})

export const Checkbox: React.FC<Props> = ({
  isChecked = false,
  onChange = noop,
  onClick = noop,
  className = '',
  size = 'xs'
}) => {
  return (
    <label
      className={clsx(
        className,
        'focus-within:ring-2 rounded-md transition ease-in duration-150'
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
          'rounded-md border',
          'transition ease-in duration-75',
          {
            'bg-indigo-400 border-indigo-500': isChecked,
            'bg-white dark:bg-gray-600 border-gray-400 dark:border-gray-500': !isChecked
          },
          matchSize(size)
        )}
      >
        {isChecked && <CheckIcon className="h-4 w-4 text-white" />}
      </div>
    </label>
  )
}
