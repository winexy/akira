import React, {LegacyRef, Ref, useRef} from 'react'
import {DragSourceMonitor, DropTargetMonitor, useDrag, useDrop} from 'react-dnd'
import {Link} from 'react-router-dom'
import clsx from 'clsx'
import {XIcon, MenuAlt4Icon, FireIcon} from '@heroicons/react/solid'
import {Swipeable} from '@components/Swipeable/Swipeable'
import {Checkbox} from '@components/Checkbox/Checkbox'
import {ApiTask, TaskId, CheckList} from '@modules/tasks/types.d'
import isNull from 'lodash/isNull'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'
import isEmpty from 'lodash/fp/isEmpty'
import {useIsMutating} from 'react-query'
import {ActionSheet} from '@components/ActionSheet/ActionSheet'
import {openActionSheet} from '@store/action-sheet'
import {Spin} from '@components/Spin'

const ItemType = 'list-item'

type UpdatePositionParams = {
  fromIndex: number
  toIndex: number
}

type DragObject = {
  id: TaskId
  index: number
}

function onDragHover(
  dropRef: React.MutableRefObject<Undefined<Element>>,
  index: number,
  updatePosition: (params: UpdatePositionParams) => void
) {
  return function dragHover(item: DragObject, monitor: DropTargetMonitor) {
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
    // eslint-disable-next-line no-param-reassign
    item.index = hoverIndex
  }
}

type TaskProps = {
  task: ApiTask
  index: number
  sortable?: boolean
  onRemove(id: TaskId): void
  onCheck(id: TaskId): void
  onOrderChange(params: UpdatePositionParams): void
  onSetImportant(id: TaskId): void
}

const collectProps = (monitor: DragSourceMonitor) => {
  const isDragging = monitor.isDragging()

  return {
    isDragging,
    opacity: isDragging ? 0.4 : 1
  }
}

type ProgressBarProps = {
  checklist: CheckList
}

const ChecklistProgressBar: React.FC<ProgressBarProps> = ({checklist}) => {
  const completedCount = size(filter('is_completed', checklist))
  const percentage = (completedCount * 100) / size(checklist)

  return (
    <div className="mt-1 w-full h-1 flex bg-gray-200 rounded overflow-hidden">
      <div
        className="h-1 bg-green-400"
        style={{
          width: `${percentage}%`
        }}
      />
    </div>
  )
}

export const Task: React.FC<TaskProps> = ({
  task,
  index,
  sortable,
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

  const isDeleting = Boolean(
    useIsMutating({
      mutationKey: 'delete-task',
      predicate(mutation) {
        return mutation.options.variables === task.id
      }
    })
  )

  const [, connectDropTarget] = useDrop({
    accept: ItemType,
    hover: onDragHover(dropRef, index, onOrderChange)
  })

  if (sortable) {
    connectDropTarget(dropRef)
    connectDragSource(dragRef)
  }

  function onRemoveIntent() {
    openActionSheet(`delete-task-sheet-${task.id}`)
  }

  function onRemoveConfirm() {
    onRemove(task.id)
  }

  return (
    <Swipeable
      ref={dropRef as Ref<Element>}
      Component="li"
      className={clsx(
        'rounded-lg overflow-hidden',
        'bg-white dark:bg-gray-600',
        'transform border border-gray-200 dark:border-gray-500',
        'shadow-xs',
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
            disabled={isDeleting}
            onClick={onRemoveIntent}
          >
            {isDeleting ? (
              <Spin className="w-5 h-5 text-white" />
            ) : (
              <XIcon className="w-5 h-5" />
            )}
          </button>
        </>
      }
    >
      <Link
        to={`/tasks/${task.id}`}
        className={clsx(
          'flex items-center',
          'bg-white dark:bg-gray-600 pl-4 p-2 text-lg text-black',
          'rounded-md dark:text-white',
          'transition ease-in duration-150',
          'active:bg-gray-50',
          {
            'line-through text-gray-300 dark:text-gray-400': task.is_completed
          }
        )}
      >
        <Checkbox
          className="mr-1"
          size="sm"
          isChecked={task.is_completed}
          onChange={() => onCheck(task.id)}
          onClick={e => e.stopPropagation()}
        />
        <div className="flex-1 mx-2 flex flex-col truncate">
          <p className="truncate">{task.title}</p>
          {!isEmpty(task.checklist) && (
            <ChecklistProgressBar checklist={task.checklist} />
          )}
        </div>
        <button
          className={clsx(
            'flex items-center justify-center',
            'w-10 h-10 rounded',
            'text-white',
            'focus:outline-none',
            task.is_important
              ? 'text-red-500 active:text-red-400'
              : 'text-gray-300 bg-opacity-70 active:text-opacity-100'
          )}
          onClick={e => {
            e.preventDefault()
            onSetImportant(task.id)
          }}
        >
          <FireIcon
            className={clsx(
              'w-5 h-5 transform active:scale-150 transition ease-in duration'
            )}
          />
        </button>
        {sortable && (
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
        )}
        <ActionSheet name={`delete-task-sheet-${task.id}`}>
          <ActionSheet.Action destructive onClick={onRemoveConfirm}>
            Delete task
          </ActionSheet.Action>
        </ActionSheet>
      </Link>
    </Swipeable>
  )
}
