import clsx from 'clsx'
import React from 'react'

type ItemProps = {className?: string} & React.DetailedHTMLProps<
  React.LiHTMLAttributes<HTMLLIElement>,
  HTMLLIElement
>

const Item: React.FC<ItemProps> = ({
  children,
  className,
  onClick,
  dangerouslySetInnerHTML,
}) => {
  return (
    <li
      className={clsx(
        'flex items-center',
        'select-none transition',
        'active:bg-gray-200 dark:active:bg-dark-500',
        className,
      )}
      onClick={onClick}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </li>
  )
}

type Props = {
  className?: string
  children: React.ReactNode
}

export const List: {Item: typeof Item} & React.FC<Props> = ({
  children,
  className,
}) => {
  return (
    <ul
      className={clsx(
        'divide-y divide-gray-100 dark:divide-dark-500',
        className,
      )}
    >
      {children}
    </ul>
  )
}

List.Item = Item
