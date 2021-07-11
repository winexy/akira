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
  'bg-blue-500 border border-blue-600 active:bg-blue-600 active:border-blue-700 text-white shadow-md active:shadow'
const red =
  'bg-red-500 border border-red-600 active:bg-red-600 active:border-red-700 text-white shadow-md active:shadow focus:ring-red-300'
const outline =
  'bg-transparent border border-gray-200 text-gray-700 shadow-none active:bg-gray-100 active:border-gray-200 active:shadow-inner focus:ring'
const transparent = `bg-white bg-opacity-10 border border-white border-opacity-20 active:bg-white active:bg-opacity-20`
const indigo =
  'bg-indigo-500 border border-indigo-400 active:bg-indigo-400 active:border-indigo-300 focuse:ring-indigo-300'

type ButtonSize = 'xs' | 'sm' | 'md'
type ButtonVariant = 'blue' | 'red' | 'outline' | 'transparent' | 'indigo'

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
    case 'transparent':
      return transparent
    case 'indigo':
      return indigo
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
    focus:ring
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
