import React, {FC} from 'react'
import clsx from 'clsx'

type Props = {
  className?: string
  size?: 'sm' | 'lg'
}

export const AkiraTitle: FC<Props> = ({className, size = 'sm'}) => (
  <h1
    className={clsx(
      'font-bold text-center font-mono',
      'bg-gradient-to-r from-indigo-500 to-pink-600',
      {
        'text-sm': size === 'sm',
        'text-lg': size === 'lg',
      },
      className,
    )}
    style={{
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
  >
    akira.app
  </h1>
)
