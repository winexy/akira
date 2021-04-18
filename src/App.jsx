import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect
} from 'react'
import {uid} from 'uid'
import findIndex from 'lodash/fp/findIndex'
import produce from 'immer'
import assign from 'lodash/fp/assign'
import clsx from 'clsx'
import {Swipeable} from './components/Swipeable/Swipeable'
import {usePersistedState} from './hooks/use-persisted-state'
import remove from 'lodash/fp/remove'
import isEmpty from 'lodash/fp/isEmpty'
import {
  CheckIcon,
  PlusIcon,
  XCircleIcon,
  XIcon,
  MenuAlt4Icon
} from '@heroicons/react/solid'
import {useDrag, useDrop} from 'react-dnd'

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

const ItemForm = forwardRef(function ItemForm(
  {title, onTitleChange, onSubmit},
  ref
) {
  const inputRef = useRef()
  const [isFocused, setIsFocused] = useState(false)
  const height = useRef()

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus()
  }))

  useEffect(() => {
    height.current = getComputedStyle(inputRef.current).height
  }, [])

  function handleSubmit(e) {
    if (isEmpty(title)) {
      e.preventDefault()
      return
    }

    onSubmit(e)
  }

  function onReset() {
    onTitleChange('')
    inputRef.current.focus()
  }

  return (
    <div
      className={clsx('p-4 box-content')}
      style={{
        height: isFocused ? height.current : 'auto'
      }}
    >
      <div
        className={clsx('transition ease-in duration-75 backdrop-filter', {
          'p-4 z-20 fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm': isFocused
        })}
      >
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              className="
              w-full pl-4 py-3 pr-12
              text-2xl caret-white text-white placeholder-white
              bg-white bg-opacity-10
              border border-gray-200 border-opacity-30
              rounded-lg shadow appearance-none
              transition ease-in duration-150
              focus:outline-none focus:shadow-2xl
            "
              placeholder="Bread..."
              type="text"
              value={title}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onInput={e => onTitleChange(e.target.value)}
            />
            {!isEmpty(title) && (
              <button
                type="button"
                className="
                  absolute right-0 
                  text-white text-3xl p-4 
                  transition ease-in duration-150
                  focus:outline-none 
                  active:text-gray-500
                "
                onClick={onReset}
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
})

const ItemType = 'list-item'

function onDragHover(ref, index, changeCallback) {
  return function (item, monitor) {
    if (!ref.current) {
      return
    }
    const dragIndex = item.index
    const hoverIndex = index

    if (dragIndex === hoverIndex) {
      return
    }
    // Determine rectangle on screen
    const hoverBoundingRect = ref.current?.getBoundingClientRect()
    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    // Determine mouse position
    const clientOffset = monitor.getClientOffset()
    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top
    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%
    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return
    }
    // Time to actually perform the action
    changeCallback(dragIndex, hoverIndex)
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    item.index = hoverIndex
  }
}

function ListItem({item, index, onRemove, onCheck, onOrderChange}) {
  const dragRef = useRef()
  const dropRef = useRef()
  const [{opacity, isDragging}, drag] = useDrag(
    () => ({
      type: ItemType,
      item: {id: item.id, index},
      collect(monitor) {
        const isDragging = monitor.isDragging()
        return {
          isDragging,
          opacity: isDragging ? 0.7 : 1
        }
      }
    }),
    []
  )

  const [{handlerId}, drop] = useDrop({
    accept: ItemType,
    collect: monitor => ({
      handlerId: monitor.getHandlerId()
    }),
    hover: onDragHover(dragRef, index, onOrderChange)
  })

  drag(dragRef)
  drop(dropRef)

  return (
    <Swipeable
      ref={dropRef}
      key={item.id}
      Component="li"
      className={clsx(
        'rounded-md overflow-hidden shadow bg-white transform transition ease-in duration-100',
        {
          'scale-95': isDragging
        }
      )}
      style={{opacity}}
      data-handler-id={handlerId}
      after={
        <button
          className="h-full px-5 text-xl font-bold flex items-center justify-between  text-white bg-red-500"
          onClick={() => onRemove(item.id)}
        >
          <XIcon className="w-5 h-5" />
        </button>
      }
    >
      <label
        className={clsx(
          'flex items-center',
          'bg-white p-4 text-lg truncate text-black',
          'select-none rounded-md',
          'transition ease-in duration-150',
          'active:bg-gray-200',
          {
            'line-through text-gray-400': item.checked
          }
        )}
      >
        <Checkbox
          className="mr-3"
          isChecked={item.checked}
          onChange={() => onCheck(item.id)}
        />
        {item.title}
        <button
          ref={dragRef}
          className="
              ml-auto w-8 h-8 -mr-2
              flex items-center justify-center
              text-gray-400 
              active:text-gray-300
              focus:outline-none
              "
        >
          <MenuAlt4Icon className="w-4 h-4" />
        </button>
      </label>
    </Swipeable>
  )
}

function ItemList({list, onCheck, onRemove, onOrderChange}) {
  return (
    <ul className="space-y-1 px-4">
      {list.map((item, index) => (
        <ListItem
          key={item.id}
          item={item}
          index={index}
          onCheck={onCheck}
          onRemove={onRemove}
          onOrderChange={onOrderChange}
        />
      ))}
    </ul>
  )
}

function Checkbox({isChecked, onChange, className = ''}) {
  return (
    <div className={className}>
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={() => onChange(!isChecked)}
      />
      <div
        className={clsx(
          'flex items-center justify-center',
          'w-4 h-4 rounded border',
          'transition ease-in duration-75',
          {
            'bg-black border-black': isChecked,
            'bg-white border-gray-400': !isChecked
          }
        )}
      >
        {isChecked && <CheckIcon className="h-4 w-4 text-white" />}
      </div>
    </div>
  )
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
        <ItemForm
          ref={formRef}
          title={title}
          onTitleChange={setTitle}
          onSubmit={onSubmit}
        />
        <section>
          <ItemList
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
