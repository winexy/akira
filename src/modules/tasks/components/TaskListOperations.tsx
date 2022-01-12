import React, {useRef} from 'react'
import clsx from 'clsx'
import {FilterIcon, SortAscendingIcon} from '@heroicons/react/solid'
import {bottomSheetModel} from 'shared/ui/bottom-sheet'
import {Transition} from 'shared/ui/transition'

type Props = {
  isFiltered: boolean
  isSorted: boolean
}

export const TaskListOperations: React.FC<Props> = ({isFiltered, isSorted}) => {
  const ref = useRef(null)

  return (
    <Transition.Shift nodeRef={ref} appear>
      <div
        ref={ref}
        className="fixed bottom-0 right-0 left-0 py-7 flex items-center mt-4 px-4 from-gray-100 dark:from-dark-600 bg-gradient-to-t"
      >
        <button
          className={clsx(
            'flex items-center px-3 py-1 ',
            'border',
            'font-semibold ',
            'rounded-md shadow-md',
            'active:shadow-lg',
            'focus:outline-none ',
            isFiltered
              ? 'text-white bg-blue-500 border-blue-600 active:bg-blue-600 active:border-blue-700'
              : 'bg-gray-100 dark:bg-dark-500 border-gray-300 dark:border-dark-400 active:bg-gray-200 dark:active:bg-dark-600'
          )}
          onClick={() => bottomSheetModel.showBottomSheet('filters')}
        >
          <FilterIcon className="w-4 h-4 mr-2" />
          Filters
        </button>
        <button
          className={clsx(
            'ml-4 flex items-center px-3 py-1 ',
            'border',
            'font-semibold',
            'rounded-md shadow-md',
            'active:bg-gray-200',
            'active:shadow-lg',
            'focus:outline-none',
            isSorted
              ? 'text-white bg-blue-500 border-blue-600 active:bg-blue-600 active:border-blue-700'
              : 'bg-gray-100 dark:bg-dark-500 border-gray-300 dark:border-dark-400 active:bg-gray-200 dark:active:bg-dark-600'
          )}
          onClick={() => bottomSheetModel.showBottomSheet('sorting')}
        >
          <SortAscendingIcon className="w-4 h-4 mr-2" />
          Sort
        </button>
      </div>
    </Transition.Shift>
  )
}
