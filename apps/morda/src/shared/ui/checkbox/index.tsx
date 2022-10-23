import React, {MouseEventHandler, useRef} from 'react'
import clsx from 'clsx'
import {CheckIcon} from '@heroicons/react/solid'
import noop from 'lodash/fp/noop'
import {createMatcher} from 'shared/ui/create-matcher'
import {Transition} from '../transition'

type Props = {
  isChecked?: boolean
  onChange?(newState: boolean): void
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
  size?: Size
  labeled?: boolean
}

type Size = 'xs' | 'sm' | 'md'

const xs = 'w-4 h-4'
const sm = 'w-5 h-5'
const md = 'w-6 h-6'

const matchSize = createMatcher<Size>('size')({xs, sm, md})
const matchBorderRadius = createMatcher<Size>('borderRadius')({
  xs: 'rounded',
  sm: 'rounded',
  md: 'rounded-md',
})

export const Checkbox: React.FC<Props> = ({
  isChecked = false,
  onChange = noop,
  onClick = noop,
  className = '',
  size = 'xs',
  labeled,
}) => {
  const ref = useRef(null)
  const Element = labeled ? 'div' : 'label'

  return (
    <Element
      className={clsx(
        className,
        'focus-within:ring-2 transition ease-in duration-150',
        matchBorderRadius(size),
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
          'border',
          'transition ease-in duration-75',
          {
            'bg-indigo-400 border-indigo-500': isChecked,
            'bg-white dark:bg-dark-500 border-gray-400 dark:border-dark-400': !isChecked,
          },
          matchSize(size),
          matchBorderRadius(size),
        )}
      >
        <Transition.Scale nodeRef={ref} appear in={isChecked} unmountOnExit>
          <div ref={ref}>
            <CheckIcon className="h-4 w-4 text-white" />
          </div>
        </Transition.Scale>
      </div>
    </Element>
  )
}
