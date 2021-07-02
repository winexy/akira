import clsx from 'clsx'
import React from 'react'
import {exhaustiveCheck} from '../utils/index'

type ButtonSize = 'sm'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {size?: ButtonSize}

function matchSize(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return 'w-8 h-8'
    default:
      return exhaustiveCheck(size)
  }
}

export const IconButton: React.FC<Props> = ({
  size = 'sm',
  className,
  ...props
}) => (
  <button
    className={clsx(
      'flex justify-center items-center',
      'rounded',
      'transition ease-in duration-150',
      'active:bg-gray-200',
      'focus:outline-none focus-within:ring',
      matchSize(size)
    )}
    type="button"
    {...props}
  />
)
