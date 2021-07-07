import {exhaustiveCheck} from '@/utils'
import React, {useState} from 'react'
import values from 'lodash/fp/values'
import {BottomSheet} from '@components/BottomSheet/BottomSheet'
import {Button} from '@components/Button'
import {hideBottomSheet} from '@store/bottom-sheet'
import {CheckIcon, RefreshIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import isNull from 'lodash/fp/isNull'
import {sortTasks} from '@modules/tasks/utils'
import {TaskT} from '@store/tasks'
import {SortEnum} from '../utils/sorting'

function matchSortTypeTitle(sortType: SortEnum) {
  switch (sortType) {
    case SortEnum.CompletedASC:
      return 'Completed first'
    case SortEnum.CompletedDESC:
      return 'Completed last'
    case SortEnum.ImportantASC:
      return 'Important first'
    case SortEnum.ImportantDESC:
      return 'Important last'
    default:
      return exhaustiveCheck(sortType)
  }
}

const sortTypes = values(SortEnum)

type Props = {
  sortType: SortEnum | null
  onChange(sortType: SortEnum | null): void
}

export function useTaskSorting() {
  const [sortType, setSortType] = useState<SortEnum | null>(() => {
    return localStorage.getItem('sort-selection') as SortEnum
  })

  function sort(tasks: TaskT[]) {
    return sortTasks(tasks, sortType)
  }

  return {sortType, setSortType, sort}
}

export const SortingBottomSheet: React.FC<Props> = ({sortType, onChange}) => {
  function handleChange(sortType: SortEnum | null) {
    onChange(sortType)

    if (isNull(sortType)) {
      localStorage.removeItem('sort-selection')
    } else {
      localStorage.setItem('sort-selection', sortType)
    }

    hideBottomSheet()
  }

  return (
    <BottomSheet name="sorting" className="px-4 pb-6 pt-4 text-gray-800">
      <div className="flex justify-between">
        <h2 className="font-bold text-2xl">Sort</h2>
        {sortType && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => handleChange(null)}
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            reset
          </Button>
        )}
      </div>
      <ul className="mt-4 space-y-1">
        {sortTypes.map(type => (
          <li key={type}>
            <label
              className="
              px-3 py-2 
              flex items-center 
              font-semibold text-lg 
              rounded select-none
              transition ease-in duration-75
              active:bg-gray-50
            "
            >
              <input
                type="radio"
                className="sr-only"
                name="sort-type"
                checked={type === sortType}
                onChange={() => handleChange(type)}
              />
              <CheckIcon
                className={clsx(
                  'mr-2 w-6 h-6 ',
                  type === sortType ? 'text-blue-500' : 'text-gray-200'
                )}
              />
              <span
                className={clsx('pl-2', {'text-blue-500': type === sortType})}
              >
                {matchSortTypeTitle(type)}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
