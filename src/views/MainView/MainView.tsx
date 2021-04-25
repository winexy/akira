import React, {useState, useRef, FormEvent} from 'react'
import isNull from 'lodash/isNull'
import {PlusIcon} from '@heroicons/react/solid'
import {TaskForm, TaskFormRef} from '@/components/TaskForm/TaskForm'
import {Tasks} from '@/components/Tasks/Tasks'
import {useEffect} from 'react'
import {addTask, loadTasks} from '@/store/tasks'

export function MainView() {
  const formRef = useRef<TaskFormRef>(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    addTask(title)
    setTitle('')
  }

  function onAddItemIntent() {
    if (!isNull(formRef.current)) {
      formRef.current.show()
    }
  }

  return (
    <div className="pt-2 mb-24">
      <TaskForm
        ref={formRef}
        title={title}
        onTitleChange={setTitle}
        onSubmit={onSubmit}
      />
      <section className="mt-3">
        <Tasks />
      </section>
      <div className="z-20 fixed bottom-0 left-0 right-0 p-4">
        <button
          className="
            flex items-center justify-center
            w-full py-4
            bg-black bg-opacity-30 
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
    </div>
  )
}
