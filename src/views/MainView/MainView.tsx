import React, {useState, useRef, FormEvent, Ref} from 'react'
import {uid} from 'uid'
import findIndex from 'lodash/fp/findIndex'
import produce from 'immer'
import isNull from 'lodash/isNull'
import assign from 'lodash/fp/assign'
import remove from 'lodash/fp/remove'
import {PlusIcon} from '@heroicons/react/solid'
import {usePersistedState} from '@hooks/use-persisted-state'
import {TaskForm, TaskFormRef} from '@/components/TaskForm/TaskForm'
import {Tasks} from '@/components/Tasks/Tasks'
import {storage} from '@/models/Storage'
import {TaskT} from '@/models/Task'

export function MainView() {
  const formRef = useRef<TaskFormRef>(null)
  const [title, setTitle] = useState('')
  const [tasks, setTasks] = usePersistedState<TaskT[]>(storage, {
    key: 'akira:tasks',
    defaultState: []
  })

  function addItem() {
    setTasks(
      produce(tasks, draft => {
        draft.unshift({
          id: uid(),
          title,
          timestamp: Date.now(),
          checked: false
        })
      })
    )
  }

  function checkItem(id: TaskT['id']) {
    setTasks(
      produce(tasks, draft => {
        const idx = findIndex({id}, tasks)
        const item = draft[idx]

        draft[idx] = assign(item, {checked: !item.checked})
      })
    )
  }

  function onRemove(id: TaskT['id']) {
    setTasks(remove({id}, tasks))
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    addItem()
    setTitle('')
  }

  function onAddItemIntent() {
    if (!isNull(formRef.current)) {
      formRef.current.show()
    }
  }

  function onOrderChange(dragIndex: number, hoverIndex: number) {
    const newTasks = tasks.slice()
    const item = newTasks[dragIndex]
    newTasks.splice(dragIndex, 1)
    newTasks.splice(hoverIndex, 0, item)
    setTasks(newTasks)
  }

  return (
    <div className="pt-2 mb-24">
      <TaskForm
        ref={formRef}
        title={title}
        onTitleChange={setTitle}
        onSubmit={onSubmit}
      />
      <section className="mt-3 overflow-y-scroll">
        <Tasks
          tasks={tasks}
          onCheck={checkItem}
          onRemove={onRemove}
          onOrderChange={onOrderChange}
        />
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
