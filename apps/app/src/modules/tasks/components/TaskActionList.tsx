import clsx from 'clsx'
import React from 'react'

type Props = {
  className?: string
}

type ItemProps = {}

type ButtonProps = {
  Icon?: SVGIconElement
  stretch?: boolean
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const TaskActionList: React.FC<Props> & {
  Item: React.FC<ItemProps>
  Button: React.FC<ButtonProps>
} = ({children, className}) => (
  <ul
    className={clsx(
      'mt-4 border-t border-b border-gray-50 divide-y divide-gray-50',
      className
    )}
  >
    {children}
  </ul>
)

TaskActionList.Item = props => <li className="flex" {...props} />

TaskActionList.Button = ({
  children,
  Icon,
  stretch = true,
  className,
  ...props
}) => (
  <button
    className={clsx(
      'flex items-center px-4 py-3',
      'text-blue-500 font-semibold',
      'transition ease-in duration-75',
      'active:text-blue-600 active:bg-gray-50',
      'focus:outline-none',
      {'flex-1': stretch},
      className
    )}
    {...props}
  >
    {Icon && <Icon className="w-6 h-6 mr-3" />}
    {children}
  </button>
)
