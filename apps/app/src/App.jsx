import React, {useState, useRef} from 'react'
import {uid} from 'uid'
import findIndex from 'lodash/fp/findIndex'
import produce from 'immer'
import assign from 'lodash/fp/assign'
import {usePersistedState} from './hooks/use-persisted-state'
import remove from 'lodash/fp/remove'
import {PlusIcon} from '@heroicons/react/solid'
import {TodoForm} from './components/TodoForm/TodoForm'
import {TodoList} from './components/TodoList/TodoList'

const storage = {
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
  },
  get(key) {
    return JSON.parse(localStorage.getItem(key))
  },
  remove(key) {
    localStorage.removeItem(key)
  }
}

function App() {
  const formRef = useRef()
  const [title, setTitle] = useState('')
  const [list, setList] = usePersistedState(storage, {
    key: 'akira:todo-list',
    defaultState: []
  })

  function addItem() {
    setList(
      produce(list, draft => {
        draft.unshift({
          id: uid(),
          title,
          timestamp: Date.now(),
          checked: false
        })
      })
    )
  }

  function checkItem(id) {
    setList(
      produce(list, draft => {
        const idx = findIndex({id}, list)
        const item = draft[idx]

        draft[idx] = assign(item, {checked: !item.checked})
      })
    )
  }

  function onRemove(id) {
    setList(remove({id}, list))
  }

  function onSubmit(e) {
    e.preventDefault()
    addItem()
    setTitle('')
  }

  function onAddItemIntent() {
    formRef.current.focus()
  }

  function onOrderChange(dragIndex, hoverIndex) {
    const newList = list.slice()
    const item = newList[dragIndex]
    newList.splice(dragIndex, 1)
    newList.splice(hoverIndex, 0, item)
    setList(newList)
  }

  return (
    <React.Fragment>
      <main
        className="flex-1 bg-indigo-400 bg-cover"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=1&auto=format%2Ccompress&fit=crop&w=2999&h=594%201x,%20https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=2&auto=format%2Ccompress&fit=crop&w=2999&h=594%202x)'
        }}
      >
        <TodoForm
          ref={formRef}
          title={title}
          onTitleChange={setTitle}
          onSubmit={onSubmit}
        />
        <section>
          <TodoList
            list={list}
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
      </main>
    </React.Fragment>
  )
}

export default App
