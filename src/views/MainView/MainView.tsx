import React, {useState, useRef, FormEvent} from 'react'
import isNull from 'lodash/isNull'
import {PlusIcon} from '@heroicons/react/solid'
import {TaskForm, TaskFormRef} from '@/components/TaskForm/TaskForm'
import {Tasks} from '@/components/Tasks/Tasks'
import {useEffect} from 'react'

import {useDispatch} from '@/store/index'
import {addTask, loadTasks} from '@/store/tasks'

const mainStyles = {
  backgroundImage: ''
  // 'url(https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=1&auto=format%2Ccompress&fit=crop&w=2999&h=594%201x,%20https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=2&auto=format%2Ccompress&fit=crop&w=2999&h=594%202x)'
}

function useBodyBackground() {
  useEffect(() => {
    document.body.style.backgroundImage = mainStyles.backgroundImage
    document.body.style.backgroundSize = 'cover'

    return () => {
      document.body.style.backgroundImage = 'none'
    }
  }, [])
}

export function MainView() {
  const formRef = useRef<TaskFormRef>(null)
  const [title, setTitle] = useState('')
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(true)
  const dispatch = useDispatch()

  useBodyBackground()

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
    <div className="mb-24">
      <TaskForm
        ref={formRef}
        title={title}
        onTitleChange={setTitle}
        onSubmit={onSubmit}
        onVisibilityChange={onTaskFormVisiblityChange}
      />
      <section className="mt-1">
        <Tasks />
      </section>
      {isAddButtonVisible && (
        <div className="z-20 fixed bottom-0 left-0 right-0 p-4">
          <button
            className="
            flex items-center justify-center
            w-full py-4
            bg-black bg-opacity-30 
            border border-black border-opacity-20
            text-white rounded-md 
            active:bg-opacity-40 
            transition ease-in duration-100 
            focus:outline-none focus:ring
          "
            onClick={onAddItemIntent}
          >
            <PlusIcon className="w-6 h-6 mr-2" /> Добавить
          </button>
        </div>
      )}
    </div>
  )
}
