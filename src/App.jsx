import React, {useState, useRef} from 'react'
import {uid} from 'uid'
import findIndex from 'lodash/fp/findIndex'
import propEq from 'lodash/fp/propEq'
import produce from 'immer'
import assign from 'lodash/fp/assign'
import get from 'lodash/fp/get'
import clsx from 'clsx'
import pipe from 'lodash/fp/pipe'

const storage = {
  save(key, data) {},
  remove(key) {},
}

const getBoundingRect = el => el.getBoundingClientRect()
const getWidth = pipe(getBoundingRect, get('width'))
const getTouch = get('touches.0.pageX')

function Swipeable({Component = 'div', children, before, after}) {
  const [shift, setShift] = useState(0)
  const touchStartRef = useRef(0)
  const finalTouchRef = useRef(0)
  const swipeInfoRef = useRef({isSwipeLeft: false, isSwipeRight: false})
  const beforeRef = useRef()
  const ref = useRef()
  const afterRef = useRef()

  React.useEffect(() => {
    const beforeWidth = beforeRef.current ? getWidth(beforeRef.current) : 0
    const afterWidth = afterRef.current ? getWidth(afterRef.current) : 0

    const onTouchStart = e => {
      const touch = getTouch(e)
      touchStartRef.current = touch
    }

    const onTouchEnd = () => {
      const {isSwipeLeft, isSwipeRight} = swipeInfoRef.current
      const finalShift = Math.abs(finalTouchRef.current - touchStartRef.current)

      const isOverSwipeLeft = isSwipeLeft && finalShift > afterWidth
      const isOverSwipeRight = isSwipeRight && finalShift > beforeWidth

      if (!isOverSwipeLeft && !isOverSwipeRight) {
        setShift(0)
      }
    }

    const onTouchMove = e => {
      const touchStart = touchStartRef.current
      const currentTouch = getTouch(e)

      const shift = touchStart - currentTouch

      swipeInfoRef.current.isSwipeLeft = shift > 0
      swipeInfoRef.current.isSwipeRight = shift < 0

      if (swipeInfoRef.current.isSwipeLeft) {
        setShift(Math.max(-afterWidth, -shift))
      } else if (swipeInfoRef.current.isSwipeRight) {
        setShift(Math.min(beforeWidth, -shift))
      }

      finalTouchRef.current = currentTouch
    }

    ref.current.addEventListener('touchstart', onTouchStart)
    ref.current.addEventListener('touchmove', onTouchMove)
    ref.current.addEventListener('touchend', onTouchEnd)

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('touchstart', onTouchStart)
        ref.current.removeEventListener('touchmove', onTouchMove)
        ref.current.removeEventListener('touchend', onTouchEnd)
      }
    }
  }, [])

  return (
    <Component className="relative overflow-hidden">
      {before && (
        <div ref={beforeRef} className="absolute left-0 top-0 bottom-0">
          {before}
        </div>
      )}
      <div
        ref={ref}
        className="relative z-10 w-full transition ease-in duration-150 bg-gray-100"
        style={{transform: `translateX(${shift}px)`}}
      >
        {children}
      </div>
      {after && (
        <div ref={afterRef} className="absolute right-0 top-0 bottom-0">
          {after}
        </div>
      )}
    </Component>
  )
}

function ItemForm({title, onTitleInput, onSubmit}) {
  return (
    <div className="relative z-20 pb-7">
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
            placeholder="Bread..."
            type="text"
            value={title}
            onInput={e => onTitleInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  )
}

function ItemList({list, onCheck, onRemove}) {
  return (
    <ul className="divide-y">
      {list.map(item => (
        <Swipeable
          key={item.id}
          Component="li"
          before={
            <button className="appearance-none focus:outline-none bg-indigo-400 h-full px-5 text-xl flex items-center justify-center active:bg-indigo-500">
              😘
            </button>
          }
          after={
            <button
              className="h-full px-5 text-xl font-bold flex items-center justify-between text-white bg-red-500"
              onClick={() => onRemove(item.id)}
            >
              &times;
            </button>
          }
        >
          <div
            className={clsx(
              'bg-gray-100 p-4 text-lg truncate',
              'active:bg-gray-200',
              'transition ease-in duration-150',
              {
                'line-through': item.checked,
              }
            )}
            onClick={() => onCheck(item.id)}
          >
            {item.title}
          </div>
        </Swipeable>
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

  function onRemove(id) {
    setList(
      produce(list, draft => {
        delete draft[findIndex(propEq('id', id), list)]
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
      <main className="flex-1 bg-gray-100">
        <ItemForm title={title} onTitleInput={setTitle} onSubmit={onSubmit} />
        <section className="mt-4">
          <ItemList list={list} onCheck={checkItem} onRemove={onRemove} />
        </section>
      </main>
    </React.Fragment>
  )
}

export default App
