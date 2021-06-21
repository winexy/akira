import React, {useState, useRef, useEffect, useMemo} from 'react'
import isNull from 'lodash/isNull'
import {PlusIcon, SortAscendingIcon} from '@heroicons/react/solid'
import {TaskForm, TaskFormRef} from '@components/TaskForm/TaskForm'
import {Tasks} from '@components/Tasks'
import size from 'lodash/fp/size'

import {
  queryTasksFx,
  addTaskFx,
  $tasksIds,
  $tasksById,
  $completedTasksCount
} from '@store/tasks'
import {$isMenuOpen} from '@store/menu'
import clsx from 'clsx'
import {useStore} from 'effector-react'
import format from 'date-fns/format'
import {MainView} from '@views/MainView'
import {showBottomSheet, hideBottomSheet} from '@store/bottom-sheet/index'
import {BottomSheet} from '@components/BottomSheet/BottomSheet'
import {Checkbox} from '@components/Checkbox/Checkbox'
import {FilterIcon} from '@heroicons/react/outline'

enum SortEnum {
  ImportantASC = 'Important::ASC',
  ImportantDESC = 'Important::DESC',
  CompletedASC = 'Completed::ASC',
  CompletedDESC = 'Completed::DESC'
}

export function TodayView() {
  const formRef = useRef<TaskFormRef>(null)
  const [title, setTitle] = useState('')
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(true)
  const isMenuOpen = useStore($isMenuOpen)
  const completedTasksCount = useStore($completedTasksCount)
  const isPending = useStore(queryTasksFx.pending)
  const tasksIds = useStore($tasksIds)
  const tasksById = useStore($tasksById)
  const [filters, setFilters] = useState<string[]>([])
  const [sortSelection, setSortSelection] = useState<string | null>(null)
  const sorted = tasksIds.slice().sort((taskIdA, taskIdB) => {
    const taskA = tasksById[taskIdA]
    const taskB = tasksById[taskIdB]

    switch (sortSelection) {
      case SortEnum.ImportantASC: {
        if (taskA.is_important && !taskB.is_important) return -1
        if (taskB.is_important && !taskA.is_important) return 1
        return 0
      }
      case SortEnum.ImportantDESC: {
        if (taskA.is_important && !taskB.is_important) return 1
        if (taskB.is_important && !taskA.is_important) return -1
        return 0
      }
      case SortEnum.CompletedASC: {
        if (taskA.is_completed && !taskB.is_completed) return 1
        if (taskB.is_completed && !taskA.is_completed) return -1
        return 0
      }
      case SortEnum.CompletedDESC: {
        if (taskA.is_completed && !taskB.is_completed) return 1
        if (taskB.is_completed && !taskA.is_completed) return -1
        return 0
      }
      default:
        return 0
    }
  })

  const today = format(new Date(), 'eeee, do MMMM')

  useEffect(() => {
    queryTasksFx({
      is_today: 1
    })
  }, [])

  function onSubmit() {
    addTaskFx(title)
    setTitle('')
  }

  function onAddItemIntent() {
    if (!isNull(formRef.current)) {
      formRef.current.show()
    }
  }

  function onTaskFormVisiblityChange(isVisible: boolean) {
    setIsAddButtonVisible(!isVisible)
  }

  return (
    <MainView className="bg-gray-100 flex-1">
      <TaskForm
        ref={formRef}
        title={title}
        onTitleChange={setTitle}
        onSubmit={onSubmit}
        onVisibilityChange={onTaskFormVisiblityChange}
      />
      <div className="flex justify-between items-center px-4 text-gray-600">
        <div>
          <h2 className="font-bold text-3xl">Today</h2>
          <p className="text-sm">{today}</p>
        </div>
        <span className="text-gray-700 text-4xl font-bold">
          {completedTasksCount} / {size(tasksIds)}
        </span>
      </div>
      <BottomSheet name="filters" className="px-4 pb-6 pt-1 text-gray-800">
        <h2 className="font-bold text-2xl">Filters</h2>
        <ul className="mt-4 space-y-1">
          {['Completed', 'Important'].map(value => (
            <li className="" key={value}>
              <label
                className="
                  px-3 py-2 
                  flex items-center 
                  font-semibold text-lg 
                  border border-gray-100 
                  bg-gray-50 rounded
                  transition ease-in duration-75
                  select-none
                  active:bg-gray-100
                  active:border-gray-200
                "
              >
                <Checkbox
                  className="mr-3"
                  isChecked={filters.includes(value)}
                  onChange={checked => {
                    if (!checked) {
                      setFilters(filters.filter(v => v !== value))
                    } else {
                      setFilters([...filters, value])
                    }
                  }}
                />
                {value}
              </label>
            </li>
          ))}
        </ul>
        <button
          className="
            mt-6 px-6 w-full py-3 
            text-white bg-blue-600  font-semibold
            border-blue-400 border
            rounded-md
            transition ease-in duration-150
            focus:outline-none
            active:bg-blue-700
            active:border-blue-700
            active:shadow-md
          "
          onClick={() => hideBottomSheet()}
        >
          Apply
        </button>
      </BottomSheet>
      <BottomSheet name="sorting" className="px-4 pb-6 pt-1 text-gray-800">
        <h2 className="font-bold text-2xl">Sort</h2>
        <ul className="mt-4 space-y-1">
          {[
            SortEnum.CompletedASC,
            SortEnum.CompletedDESC,
            SortEnum.ImportantASC,
            SortEnum.ImportantDESC
          ].map(value => (
            <li className="" key={value}>
              <label
                className="
                  px-3 py-2 
                  flex items-center 
                  font-semibold text-lg 
                  border border-gray-100 
                  bg-gray-50 rounded
                  transition ease-in duration-75
                  select-none
                  active:bg-gray-100
                  active:border-gray-200
                "
              >
                <Checkbox
                  className="mr-3"
                  isChecked={value === sortSelection}
                  onChange={checked => {
                    if (checked) {
                      setSortSelection(value)
                    } else {
                      setSortSelection(null)
                    }
                    hideBottomSheet()
                  }}
                />
                {value}
              </label>
            </li>
          ))}
        </ul>
      </BottomSheet>
      <section className="mt-4 pb-24">
        <Tasks isPending={isPending} tasksIds={sorted} />
      </section>
      <div className="fixed bottom-0 right-0 left-0 py-7 flex items-center mt-4 px-4 from-gray-100 bg-gradient-to-t">
        <button
          className="
            flex items-center px-3 py-1 
            border border-gray-300
            font-semibold 
            rounded-md shadow-md
            bg-gray-100
            active:bg-gray-200
            active:shadow-lg
            focus:outline-none 
          "
          onClick={() => showBottomSheet('filters')}
        >
          <FilterIcon className="w-4 h-4 mr-2" />
          Filters
        </button>
        <button
          className="
            ml-4 flex items-center px-3 py-1 
            border border-gray-300
            font-semibold 
            rounded-md shadow-md
            bg-gray-100
            active:bg-gray-200
            active:shadow-lg
            focus:outline-none 
          "
          onClick={() => showBottomSheet('sorting')}
        >
          <SortAscendingIcon className="w-4 h-4 mr-2" />
          Sort
          {/* <WIP className="ml-2" /> */}
        </button>
      </div>
      {isAddButtonVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <button
            className={clsx(
              `
                flex items-center justify-center
                p-1 w-12 h-12 box-content
                bg-blue-500 border-blue-600
                border border-opacity-20
                text-white rounded-full
                shadow-2xl transform
                transition ease-in duration-100 
                active:bg-blue-600
                active:scale-95
                focus:outline-none
              `,
              isMenuOpen ? 'rounded-2xl' : 'rounded-md'
            )}
            onClick={onAddItemIntent}
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}
    </MainView>
  )
}
