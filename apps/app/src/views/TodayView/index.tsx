import React, {useState, useRef} from 'react'
import isNull from 'lodash/isNull'
import {
  CheckIcon,
  PlusIcon,
  RefreshIcon,
  SortAscendingIcon
} from '@heroicons/react/solid'
import {TaskForm, TaskFormRef} from '@components/TaskForm/TaskForm'
import {Tasks} from '@components/Tasks'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'

import {$isMenuOpen} from '@store/menu'
import values from 'lodash/fp/values'
import clsx from 'clsx'
import {useStore} from 'effector-react'
import format from 'date-fns/format'
import {MainView} from '@views/MainView'
import {showBottomSheet, hideBottomSheet} from '@store/bottom-sheet/index'
import {BottomSheet} from '@components/BottomSheet/BottomSheet'
import {Checkbox} from '@components/Checkbox/Checkbox'
import {FilterIcon} from '@heroicons/react/outline'
import {sortTasks, SortEnum} from '@/modules/tasks/utils'
import {exhaustiveCheck} from '@/utils'
import {Button} from '@/components/Button'
import {useQuery, useQueryClient, useMutation} from 'react-query'
import {akira} from '@/lib/akira'
import {useFirebaseAuth} from '@/firebase'

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

export function TodayView() {
  const formRef = useRef<TaskFormRef>(null)
  const [title, setTitle] = useState('')
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(true)
  const isMenuOpen = useStore($isMenuOpen)
  const [filters, setFilters] = useState<string[]>([])
  const [sortType, setSortType] = useState<SortEnum | null>(() => {
    return localStorage.getItem('sort-selection') as SortEnum
  })
  const {user} = useFirebaseAuth()
  const queryClient = useQueryClient()
  const createTaskMutation = useMutation(
    (title: string) => {
      if (isNull(user)) {
        return Promise.reject(new Error('unauthorized'))
      }

      return akira.tasks.createTask({
        author_uid: user.uid,
        title
      })
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['tasks:today'])
      }
    }
  )

  const {data: tasks = [], isLoading} = useQuery(
    'tasks:today',
    () => akira.tasks.query({is_today: 1}),
    {
      onSuccess(tasks) {
        tasks.forEach(task => {
          queryClient.setQueryData(['task', task.id], task)
        })
      }
    }
  )

  const completedTasksCount = size(filter({is_completed: true}, tasks))

  const sorted = sortTasks(tasks, sortType)

  const today = format(new Date(), 'eeee, do MMMM')

  function onSubmit() {
    createTaskMutation.mutate(title)
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
          {completedTasksCount} / {size(tasks)}
        </span>
      </div>
      <BottomSheet name="filters" className="px-4 pb-6 pt-4 text-gray-800">
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
        <Button
          className="mt-6 w-full"
          variant="blue"
          size="md"
          onClick={() => hideBottomSheet()}
        >
          Apply
        </Button>
      </BottomSheet>
      <BottomSheet name="sorting" className="px-4 pb-6 pt-4 text-gray-800">
        <div className="flex justify-between">
          <h2 className="font-bold text-2xl">Sort</h2>
          {sortType && (
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => {
                setSortType(null)
                localStorage.removeItem('sort-selection')
                hideBottomSheet()
              }}
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              reset
            </Button>
          )}
        </div>
        <ul className="mt-4 space-y-1">
          {sortTypes.map(type => (
            <li className="" key={type}>
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
                  onChange={checked => {
                    if (checked) {
                      setSortType(type)
                      localStorage.setItem('sort-selection', type)
                    } else {
                      setSortType(null)
                      localStorage.removeItem('sort-selection')
                    }
                    hideBottomSheet()
                  }}
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
      <section className="mt-4 pb-24">
        <Tasks isPending={isLoading} tasks={sorted} />
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
                bg-blue-500
                text-white rounded-full
                shadow-2xl transform: ;
                transition ease-in duration-100 
                active:bg-blue-600
                active:scale-95
                active:shadow-md
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
