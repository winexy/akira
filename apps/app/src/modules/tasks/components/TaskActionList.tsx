import clsx from 'clsx'
import React from 'react'

type Props = {
  className?: string
}

export const TaskActionList: React.FC<Props> & {
  Item: React.FC<{Icon: SVGIconElement}>
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

TaskActionList.Item = ({children, Icon}) => (
  <li>
    <button
      className="
        flex items-center w-full px-4 py-3 
        text-blue-500 font-semibold 
        transition ease-in duration-75 
        active:text-blue-600 active:bg-gray-50
        focus:outline-none
      "
    >
      <Icon className="w-6 h-6 mr-3" />
      {children}
    </button>
  </li>
)
