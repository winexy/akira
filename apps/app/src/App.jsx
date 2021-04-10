import React, {useState} from 'react'
import {uid} from 'uid'
import findIndex from 'lodash/fp/findIndex'
import propEq from 'lodash/fp/propEq'
import produce from 'immer'
import assign from 'lodash/fp/assign'
import clsx from 'clsx'

const storage = {
  save(key, data) {},
  remove(key) {},
}

function ItemForm({title, onTitleInput, onSubmit}) {
  return (
    <div className="pb-7">
      <div className="relative bg-red-400 h-12">
        <form
          className="w-full px-4 absolute left-0 bottom-0 -mb-7 flex flex-col"
          onSubmit={onSubmit}
        >
          <input
            className="
              w-full px-4 py-3
              text-2xl caret-black
              border border-gray-200
              rounded-lg shadow appearance-none
              transition ease-in duration-150
              focus:outline-none focus:shadow-2xl
            "
            type="text"
            value={title}
            onInput={e => onTitleInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  )
}

function ItemList({list, onCheck}) {
  return (
    <ul className="divide-y">
      {list.map(item => (
        <li
          key={item.id}
          className={clsx(
            'py-3 px-4 text-lg active:bg-gray-50 transition ease-in duration-150',
            {
              'line-through': item.checked,
            }
          )}
          onClick={() => onCheck(item.id)}
        >
          {item.title}
        </li>
      ))}
    </ul>
  )
}

function App() {
  const [title, setTitle] = useState('')
  const [list, setList] = useState([])

  function addItem() {
    setList(
      produce(list, draft => {
        draft.push({
          id: uid(),
          title,
          timestamp: Date.now(),
          checked: false,
        })
      })
    )
  }

  function checkItem(id) {
    setList(
      produce(list, draft => {
        const idx = findIndex(propEq('id', id), list)
        const item = draft[idx]

        draft[idx] = assign(item, {checked: !item.checked})
      })
    )
  }

  function onSubmit(e) {
    e.preventDefault()
    addItem()
    setTitle('')
  }

  return (
    <React.Fragment>
      <main className="min-h-screen bg-gray-100">
        <ItemForm title={title} onTitleInput={setTitle} onSubmit={onSubmit} />
        <section className="mt-4">
          <ItemList list={list} onCheck={checkItem} />
        </section>
      </main>
    </React.Fragment>
  )
}

export default App
