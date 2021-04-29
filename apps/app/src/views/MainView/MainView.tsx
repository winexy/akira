import React, {useState, useRef} from 'react'
import isNull from 'lodash/isNull'
import {PlusIcon} from '@heroicons/react/solid'
import {TaskForm, TaskFormRef} from '@/components/TaskForm/TaskForm'
import {Tasks} from '@/components/Tasks/Tasks'
import size from 'lodash/fp/size'
import {useEffect} from 'react'

import {useDispatch, useSelector} from '@store/index'
import {View} from '@views/View/View'
import {
  selectCompletedTasksCount,
  selectTasks,
  addTask,
  loadTasks
} from '@store/tasks'
import {selectIsMenuOpen} from '@store/menu'
import clsx from 'clsx'

export function MainView() {
  const formRef = useRef<TaskFormRef>(null)
  const [title, setTitle] = useState('')
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(true)
  const isMenuOpened = useSelector(selectIsMenuOpen)
  const dispatch = useDispatch()
  const completedTasksCount = useSelector(selectCompletedTasksCount)
  const tasks = useSelector(selectTasks)

  useEffect(() => {
    dispatch(loadTasks())
  }, [])

  function onSubmit() {
    dispatch(addTask(title))
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
    <View className="bg-gray-100 flex-1 pt-4">
      <TaskForm
        ref={formRef}
        title={title}
        onTitleChange={setTitle}
        onSubmit={onSubmit}
        onVisibilityChange={onTaskFormVisiblityChange}
      />
      <div className="px-4">
        <span className="text-gray-700 font-bold mr-4">
          {completedTasksCount} / {size(tasks)}
        </span>
        <button
          className="
            px-2 py-1 
            text-gray-700 rounded 
            border border-gray-300
            transition ease-in duration-150
            active:bg-white 
            active:border-gray-300
            focus:outline-none
          "
        >
          All tasks
        </button>
      </div>
      <section className="mt-4">
        <Tasks />
      </section>
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
              isMenuOpened ? 'rounded-2xl' : 'rounded-md'
            )}
            onClick={onAddItemIntent}
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}
    </View>
  )
}
