import React from 'react'
import {Outlet, useMatch} from 'react-router'
import {PageView} from 'shared/ui/page-view'
import {useQueryClient, useMutation} from 'react-query'
import {akira} from 'shared/api/akira'
import {
  AddTaskForm,
  AddTaskButton,
  useAddTaskControl,
} from 'features/create-task'
import clsx from 'clsx'
import {CreateTaskPayload} from 'modules/tasks/types.d'
import {BookOpenIcon, PlusIcon} from '@heroicons/react/solid'
import {useNavigate} from 'react-router-dom'
import {taskConfig} from 'entities/task'
import isNull from 'lodash/isNull'
import {Invariant} from 'shared/lib/debugger'

const Control: React.FC<{
  value: string
  activeValue: string
  onClick(value: string): void
}> = ({activeValue, value, children, onClick}) => (
  <button
    type="button"
    className={clsx(
      'py-1 px-4 flex items-center justify-center',
      'font-bold text-xl',
      'bg-transparent border-b-2 dark:border-gray-600',
      'transition',
      'active:text-purple-500 dark:active:text-gray-300',
      'focus:outline-none',
      {'border-purple-500 dark:border-purple-500': activeValue === value},
    )}
    onClick={() => onClick(value)}
  >
    {children}
  </button>
)

const SnackBar: React.FC = () => (
  <div className="fixed bottom-0 w-full px-4 p-1 bg-blue-500">
    <p className="text-white text-sm text-center">Refreshing...</p>
  </div>
)

type HabbitProps = {
  Icon: SVGIconElement
  variant?: 'outline'
}

const Habbit: React.FC<HabbitProps> = ({Icon, variant, children}) => {
  return (
    <div className="group inline-flex flex-col items-center justify-center flex-shrink-0">
      <div
        className={clsx(
          'w-12 h-12 relative',
          'flex items-center justify-center',
          'rounded-full',
          'transition',
          variant === 'outline'
            ? 'bg-white active:bg-gray-100 dark:bg-dark-500 dark:active:bg-dark-400'
            : 'bg-indigo-400 active:bg-indigo-500',
        )}
      >
        <div
          className={clsx(
            'absolute flex items-center justify-center w-11 h-11 rounded-full border-2 transition',
            variant === 'outline'
              ? 'border-gray-400 dark:border-dark-600'
              : 'border-white dark:border-dark-500',
          )}
        />
        <Icon
          className={clsx(
            'w-6 h-6',
            variant === 'outline'
              ? 'text-gray-400 dark:text-dark-100'
              : 'text-white',
          )}
        />
      </div>
      <span className="max-w-[72px] mt-2 text-xs select-none truncate">
        {children}
      </span>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const match = useMatch('dashboard/:mode')

  if (isNull(match)) {
    throw Invariant('Dashboard Page missing mode')
  }

  const {mode = 'today'} = match.params

  const addTaskControl = useAddTaskControl()
  const queryClient = useQueryClient()
  const createTaskMutation = useMutation(
    (payload: CreateTaskPayload) => {
      return akira.tasks.create(payload)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(taskConfig.queryKey.MyDay())
        queryClient.invalidateQueries(taskConfig.queryKey.Week())
      },
    },
  )

  return (
    <PageView className="flex-1">
      <AddTaskForm
        ref={addTaskControl.formRef}
        onSubmit={createTaskMutation.mutate}
        onVisibilityChange={addTaskControl.onFormVisiblityChange}
      />
      {false && (
        <div className="px-4 pb-2 flex space-x-4 overflow-auto">
          <Habbit variant="outline" Icon={PlusIcon}>
            New
          </Habbit>
          {['Drink Water', 'Leetcode Hello There', 'Run'].map(text => (
            <Habbit key={text} Icon={BookOpenIcon}>
              {text}
            </Habbit>
          ))}
        </div>
      )}
      <div className="flex">
        <Control
          activeValue={mode}
          value="today"
          onClick={() => {
            navigate('/dashboard/today')
          }}
        >
          Today
        </Control>
        <Control
          activeValue={mode}
          value="week"
          onClick={() => {
            navigate('/dashboard/week')
          }}
        >
          Week
        </Control>
        <div className="flex-1 border-b-2 border-gray-200 dark:border-gray-600" />
      </div>
      <Outlet />
      {addTaskControl.isVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <AddTaskButton onClick={addTaskControl.onAddIntent} />
        </div>
      )}
    </PageView>
  )
}
