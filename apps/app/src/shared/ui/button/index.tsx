import React from 'react'
import clsx from 'clsx'
import {createMatcher} from 'shared/ui/create-matcher'

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
  'bg-white dark:bg-dark-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white active:bg-gray-100 dark:active:bg-dark-400 active:border-gray-200 active:shadow-inner focus:ring'
const transparent = `bg-white bg-opacity-10 border border-white border-opacity-20 active:bg-white active:bg-opacity-20 text-white`
const indigo =
  'text-white bg-indigo-500 border border-indigo-400 active:bg-indigo-400 active:border-indigo-300 focuse:ring-indigo-300'

type ButtonSize = 'xs' | 'sm' | 'md'
type ButtonVariant = 'blue' | 'red' | 'outline' | 'transparent' | 'indigo'

const matchSize = createMatcher<ButtonSize>('button-size')({xs, sm, md})
const matchVariant = createMatcher<ButtonVariant>('button-variant')({
  blue,
  red,
  outline,
  transparent,
  indigo
})

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
    font-semibold
    transition ease-in duration-100
    disabled:bg-gray-200
    disabled:border-gray-300
    dark:disabled:bg-dark-50
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
