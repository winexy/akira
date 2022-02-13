import React, {FC} from 'react'
import clsx from 'clsx'

type Props = {
  withBorder?: boolean
  size: 'sm' | 'md'
  Icon: SVGIconElement
  onClick?(): void
}

export const ControlButton: FC<Props> = ({withBorder, size, Icon, onClick}) => {
  return (
    <button
      className={clsx(
        'flex justify-center items-center',
        'rounded-full shadow-2xl bg-gray-100 dark:bg-dark-500',
        'transition ease-in transform',
        'focus:outline-none',
        'dark:active:bg-dark-700',
        'active:shadow-lg active:scale-90',
        'text-indigo-500 dark:text-gray-200',
        'focus:scale-110 focus:text-indigo-400 dark:focus:text-white',
        {
          'border border-gray-200 border-opacity-50 dark:border-none': withBorder,
          'w-24 h-24': size === 'md',
          'w-16 h-16': size === 'sm',
        },
      )}
      onClick={onClick}
    >
      <Icon
        className={clsx({
          'w-24 h-24': size === 'md',
          'w-8 h-8': size === 'sm',
        })}
      />
    </button>
  )
}
