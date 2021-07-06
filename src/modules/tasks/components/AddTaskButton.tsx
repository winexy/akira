import React, {useRef, useState} from 'react'
import {useStore} from 'effector-react'
import clsx from 'clsx'
import {PlusIcon} from '@heroicons/react/solid'
import {$isMenuOpen} from '@store/menu'
import {TaskFormRef} from '@components/TaskForm/TaskForm'
import isNull from 'lodash/fp/isNull'

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
  const isMenuOpen = useStore($isMenuOpen)

  return (
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
      onClick={onClick}
    >
      <PlusIcon className="w-8 h-8" />
    </button>
  )
}
