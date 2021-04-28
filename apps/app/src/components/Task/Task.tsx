import React, {LegacyRef, Ref, useRef} from 'react'
import {DragSourceMonitor, DropTargetMonitor, useDrag, useDrop} from 'react-dnd'
import clsx from 'clsx'
import {XIcon, MenuAlt4Icon, StarIcon} from '@heroicons/react/solid'
import {Swipeable} from '@components/Swipeable/Swipeable'
import {Checkbox} from '@components/Checkbox/Checkbox'
import {TaskT, TaskIdT} from '@store/tasks'
import isNull from 'lodash/isNull'

const ItemType = 'list-item'

type UpdatePositionParams = {
  fromIndex: number
  toIndex: number
}

type DragObject = {
  id: TaskT['id']
  index: number
}

function onDragHover(
  dropRef: React.MutableRefObject<Element | undefined>,
  index: number,
  updatePosition: (params: UpdatePositionParams) => void
) {
  return function (item: DragObject, monitor: DropTargetMonitor) {
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

    if (isNull(clientOffset)) {
      return
    }
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
    updatePosition({fromIndex: dragIndex, toIndex: hoverIndex})
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    item.index = hoverIndex
  }
}

type TaskProps = {
  task: TaskT
  index: number
  onRemove(id: TaskIdT): void
  onCheck(id: TaskIdT): void
  onOrderChange(params: UpdatePositionParams): void
  onSetImportant(id: TaskIdT): void
}

const collectProps = (monitor: DragSourceMonitor) => {
  const isDragging = monitor.isDragging()

  return {
    isDragging,
    opacity: isDragging ? 0.7 : 1
  }
}

export const Task: React.FC<TaskProps> = ({
  task,
  index,
  onRemove,
  onCheck,
  onOrderChange,
  onSetImportant
}) => {
  const dropRef = useRef<Element>()
  const dragRef = useRef<HTMLButtonElement>()
  const [{opacity, isDragging}, connectDragSource] = useDrag<
    DragObject,
    undefined,
    ReturnType<typeof collectProps>
  >(
    () => ({
      type: ItemType,
      item: {id: task.id, index},
      collect: collectProps
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
      ref={dropRef as Ref<Element>}
      Component="li"
      className={clsx(
        'rounded-md overflow-hidden',
        'shadow-xs bg-white',
        'transform',
        'transition ease-in duration-100',
        {
          'scale-95 -rotate-1': isDragging
        }
      )}
      style={{opacity}}
      after={
        <>
          <button
            className="
              h-full px-5 
              flex items-center justify-between  
              text-white bg-red-500
              transition ease-in duration-100
              active:bg-red-600
              focus:outline-none
            "
            onClick={() => onRemove(task.id)}
          >
            <XIcon className="w-5 h-5" />
          </button>
          <button
            className={clsx(
              'flex items-center justify-center',
              'h-full px-5',
              'text-white',
              'transition ease-in duration-100',
              'active:text-2xl',
              'focus:outline-none',
              task.important
                ? 'bg-yellow-500 active:bg-yellow-400'
                : 'bg-gray-400 bg-opacity-70 active:bg-opacity-100'
            )}
            onClick={() => onSetImportant(task.id)}
          >
            <StarIcon className="w-5 h-5" />
          </button>
        </>
      }
    >
      <div
        className={clsx(
          'flex items-center',
          'bg-white p-4 text-lg truncate text-black',
          'rounded-md',
          'transition ease-in duration-150',
          'active:bg-gray-200',
          {
            'line-through text-gray-400': task.completed
          }
        )}
      >
        <Checkbox
          className="mr-3"
          isChecked={task.completed}
          onChange={() => onCheck(task.id)}
        />
        {task.title}
        <button
          ref={dragRef as LegacyRef<HTMLButtonElement>}
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
      </div>
    </Swipeable>
  )
}
