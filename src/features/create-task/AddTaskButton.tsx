import React, {useRef, useState} from 'react'
import clsx from 'clsx'
import isNull from 'lodash/fp/isNull'
import {PlusIcon} from '@heroicons/react/solid'
import {TaskFormRef} from 'features/create-task/AddTaskForm'
import {Transition} from 'shared/ui/transition'

export function useAddTaskControl() {
  const [isVisible, setIsVisible] = useState(true)
  const formRef = useRef<TaskFormRef>(null)

  function onAddIntent() {
    if (!isNull(formRef.current)) {
      formRef.current.show()
    }
  }

  function onFormVisiblityChange(isVisible: boolean) {
    setIsVisible(!isVisible)
  }

  return {formRef, isVisible, onFormVisiblityChange, onAddIntent}
}

export const AddTaskButton: React.FC<NativeButtonProps> = ({onClick}) => {
  return (
    <Transition.Shift appear>
      <div>
        <button
          className={clsx(
            `
              flex items-center justify-center
              p-1 w-12 h-12 box-content
              text-white rounded-full
              shadow-2xl transform
              transition ease-in duration-200
              bg-gradient-to-tr
              from-indigo-300 via-indigo-400 to-blue-500
              active:from-indigo-500 active:to-blue-500
              active:ring-8 active:ring-indigo-50 dark:active:ring-opacity-20
              active:scale-110
              active:shadow-md
              focus:outline-none
          `
          )}
          onClick={onClick}
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
    </Transition.Shift>
  )
}
