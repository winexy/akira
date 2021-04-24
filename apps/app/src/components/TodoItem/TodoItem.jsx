import React, {useRef} from 'react'
import {useDrag, useDrop} from 'react-dnd'
import clsx from 'clsx'
import {XIcon, MenuAlt4Icon} from '@heroicons/react/solid'
import {Swipeable} from '@components/Swipeable/Swipeable'
import {Checkbox} from '@components/Checkbox/Checkbox'

const ItemType = 'list-item'

function onDragHover(dropRef, index, swap) {
  return function (item, monitor) {
    if (!dropRef.current) {
      return
    }
    const dragIndex = item.index
    const hoverIndex = index

    if (dragIndex === hoverIndex) {
      return
    }
    // Determine rectangle on screen
    const hoverBoundingRect = dropRef.current?.getBoundingClientRect()
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
    swap(dragIndex, hoverIndex)
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    item.index = hoverIndex
  }
}

export function TodoItem({item, index, onRemove, onCheck, onOrderChange}) {
  const dropRef = useRef()
  const dragRef = useRef()
  const [{opacity, isDragging}, connectDragSource] = useDrag(
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
    [index]
  )

  const [, connectDropTarget] = useDrop({
    accept: ItemType,
    hover: onDragHover(dropRef, index, onOrderChange)
  })

  connectDropTarget(dropRef)
  connectDragSource(dragRef)

  return (
    <Swipeable
      ref={dropRef}
      Component="li"
      className={clsx(
        'rounded-md overflow-hidden shadow bg-white transform transition ease-in duration-100',
        {
          'scale-95 -rotate-1': isDragging
        }
      )}
      style={{opacity}}
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
