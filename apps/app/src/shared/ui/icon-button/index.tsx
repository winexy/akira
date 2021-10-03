import clsx from 'clsx'
import React from 'react'
import {createMatcher} from '@shared/ui/create-matcher'

type ButtonSize = 'sm'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {size?: ButtonSize}

const sm = 'w-8 h-8'
const matchSize = createMatcher<ButtonSize>('icon-button-size')({sm})

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
