import React from 'react'

export const TaskTag: React.FC<{name: string}> = ({name}) => (
  <button
    className="
      px-2 py-0.5 
      border border-gray-300 bg-gray-200 
      text-xs text-gray-500 font-semibold
      shadow-sm rounded-2xl
      transition ease-in duration-75
      active:bg-gray-300 active:border-gray-400
      active:text-gray-600 active:shadow-inner
      focus:outline-none
    "
  >
    #{name}
  </button>
)
