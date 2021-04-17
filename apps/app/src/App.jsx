import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react'
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

function Swipeable({Component = 'div', children, before, after, className}) {
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
      const isOverHalfShiftLeft = isSwipeLeft && finalShift > afterWidth / 2
      const isOverHalfShiftRight = isSwipeRight && finalShift > beforeWidth / 2

      if (!isOverSwipeLeft && !isOverSwipeRight) {
        setShift(0)
      }

      if (isOverHalfShiftLeft) {
        setShift(-afterWidth)
      } else if (isOverHalfShiftRight) {
        setShift(beforeWidth)
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
    <Component className={clsx('relative overflow-hidden', className)}>
      {before && (
        <div ref={beforeRef} className="absolute left-0 top-0 bottom-0 flex">
          {before}
        </div>
      )}
      <div
        ref={ref}
        className="relative z-10 w-full transition ease-in duration-150"
        style={{transform: `translateX(${shift}px)`}}
      >
        {children}
      </div>
      {after && (
        <div ref={afterRef} className="absolute right-0 top-0 bottom-0 flex">
          {after}
        </div>
      )}
    </Component>
  )
}

const ItemForm = forwardRef(function ItemForm(
  {title, onTitleInput, onSubmit},
  ref
) {
  const inputRef = useRef()
  const [isFocused, setIsFocused] = useState(false)
  const height = useRef()

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
  }))

  useEffect(() => {
    height.current = getComputedStyle(inputRef.current).height
  }, [])

  return (
    <div
      className={clsx('p-4 box-content')}
      style={{
        height: isFocused ? height.current : 'auto',
      }}
    >
      <div
        className={clsx('transition ease-in duration-75 backdrop-filter', {
          'p-4 z-20 fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm': isFocused,
        })}
      >
        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onInput={e => onTitleInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  )
})

function ItemList({list, onCheck, onRemove}) {
  return (
    <ul className="space-y-1 px-4">
      {list.map(item => (
        <Swipeable
          key={item.id}
          Component="li"
          className="rounded-md overflow-hidden shadow bg-white"
          after={
            <>
              <button
                className="h-full px-5 text-xl font-bold flex items-center justify-between  text-white bg-red-500"
                onClick={() => onRemove(item.id)}
              >
                &times;
              </button>
            </>
          }
        >
          <div
            className={clsx(
              'bg-white p-4 text-lg truncate',
              'rounded-md',
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
  const formRef = useRef()

  function addItem() {
    setList(
      produce(list, draft => {
        draft.unshift({
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

  function onAddItemIntent() {
    formRef.current.focus()
  }

  return (
    <React.Fragment>
      <main
        className="flex-1 bg-indigo-400 bg-cover"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=1&auto=format%2Ccompress&fit=crop&w=2999&h=594%201x,%20https://images.unsplash.com/photo-1616466446987-62a71e71b629?ixid=MnwxMjA3fDB8MHxwaG90by1vZi10aGUtZGF5fHx8fGVufDB8fHx8&ixlib=rb-1.2.1&dpr=2&auto=format%2Ccompress&fit=crop&w=2999&h=594%202x)',
        }}
      >
        <ItemForm
          ref={formRef}
          title={title}
          onTitleInput={setTitle}
          onSubmit={onSubmit}
        />
        <section>
          <ItemList list={list} onCheck={checkItem} onRemove={onRemove} />
        </section>
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <button
            className="w-full py-4 bg-black bg-opacity-30 text-white rounded-md active:bg-opacity-40 transition ease-in duration-100 focus:outline-none focus:ring"
            onClick={onAddItemIntent}
          >
            Добавить
          </button>
        </div>
      </main>
    </React.Fragment>
  )
}

export default App
