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

const xs = 'px-2 py-1'
const sm = 'px-3 py-2'
const md = 'px-6 py-3'
const blue =
  'bg-blue-500 border border-blue-600 active:bg-blue-600 active:border-blue-700 text-white shadow-md active:shadow focus-withing:ring'
const red =
  'bg-red-500 border border-red-600 active:bg-red-600 active:border-red-700 text-white shadow-md active:shadow focus-within:ring-red-300'
const outline =
  'bg-transparent border border-gray-200 text-gray-700 shadow-none active:bg-gray-100 active:border-gray-200 active:shadow-inner focus-withing:ring'

type ButtonSize = 'xs' | 'sm' | 'md'
type ButtonVariant = 'blue' | 'red' | 'outline'

function matchSize(size: ButtonSize) {
  switch (size) {
    case 'xs':
      return xs
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
    case 'outline':
      return outline
    default:
      return exhaustiveCheck(variant)
  }
}

export const Button: React.FC<Props> = ({
  size = 'xs',
  variant = 'blue',
  children,
  className,
  ...props
}) => {
  const classNames = clsx(
    `
    flex justify-center items-center 
    rounded-md
    text-white font-semibold
    transition ease-in duration-100
    disabled:bg-gray-200
    disabled:border-gray-300
    disabled:text-gray-300
    disabled:shadow-sm
    focus:outline-none
    focus-within:ring
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
