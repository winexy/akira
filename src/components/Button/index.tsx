import React from 'react'
import clsx from 'clsx'
import {exhaustiveCheck} from '../../utils/index'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  size?: ButtonSize
  variant?: ButtonVariant
}

const sm = 'px-2 py-1'
const md = 'px-6 py-3'
const blue =
  'bg-blue-500 border border-blue-600 active:bg-blue-600 active:border-blue-700'
const red =
  'bg-red-500 border border-red-600 active:bg-red-600 active:border-red-700'

type ButtonSize = 'sm' | 'md'
type ButtonVariant = 'blue' | 'red'

function matchSize(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return sm
    case 'md':
      return md
    default:
      return exhaustiveCheck(size)
  }
}

function matchVariant(variant: ButtonVariant) {
  switch (variant) {
    case 'blue':
      return blue
    case 'red':
      return red
    default:
      return exhaustiveCheck(variant)
  }
}

export const Button: React.FC<Props> = ({
  size = 'sm',
  variant = 'blue',
  children,
  className,
  ...props
}) => {
  const classNames = clsx(
    `
    flex justify-center items-center 
    rounded-md shadow-md
    text-white font-semibold
    transition ease-in duration-100
    active:shadow
    focus:outline-none
  `,
    matchSize(size),
    matchVariant(variant),
    className
  )

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  )
}
