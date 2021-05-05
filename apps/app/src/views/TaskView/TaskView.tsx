import React, {FormEventHandler, useEffect, useRef, useState} from 'react'
import clsx from 'clsx'
import {useParams} from 'react-router'
import {View} from '@views/View/View'
import {useSelector, useDispatch} from '@store/index'
import {
  selectTask,
  loadTask,
  TodoT,
  addTodo,
  removeTodo,
  TaskIdT
} from '@store/tasks'
import isUndefined from 'lodash/fp/isUndefined'
import isEmpty from 'lodash/fp/isEmpty'
import {ClipboardCheckIcon, XIcon} from '@heroicons/react/solid'
import {Checkbox} from '@components/Checkbox/Checkbox'

type ChecklistPropsT = {
  taskId: TaskIdT
  checklist: TodoT[]
}

const Checklist: React.FC<ChecklistPropsT> = ({taskId, checklist}) => {
  const dispatch = useDispatch()

  return (
    <ul className="mt-2 divide-y transition ease-in duration-75">
      {checklist.map(todo => (
        <li
          key={todo.id}
          className={clsx(
            'flex items-center px-4 py-2',
            'select-none',
            'transitino ease-in duration-150',
            'active:bg-gray-200',
            {underline: todo.completed}
          )}
        >
          <Checkbox
            isChecked={todo.completed}
            className="mr-4"
            onChange={() => {}}
          />
          {todo.title}
          <button
            className={clsx(
              'ml-auto -mr-2 w-8 h-8',
              'flex items-center justify-center',
              'text-red-500 rounded',
              'transition ease-in duration-150',
              'active:text-red-600 active:bg-gray-300',
              'focus:outline-none'
            )}
            onClick={() =>
              dispatch(
                removeTodo({
                  taskId,
                  todoId: todo.id
                })
              )
            }
          >
            <XIcon className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

export const TaskView: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const todoInputRef = useRef<HTMLInputElement | null>(null)
  const task = useSelector(selectTask(id))
  const dispatch = useDispatch()
  const [isTodoInputVisible, setIsTodoInputVisible] = useState(false)
  const [todoTitle, setTodoTitle] = useState('')

  useEffect(() => {
    if (isUndefined(task)) {
      dispatch(loadTask(id))
    }
  }, [id, task, dispatch])

  useEffect(() => {
    if (isTodoInputVisible) {
      todoInputRef.current?.focus()
    }
  }, [isTodoInputVisible])

  if (isUndefined(task)) {
    return <View>loading...</View>
  }

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()

    if (!isEmpty(todoTitle)) {
      dispatch(addTodo({taskId: task.id, todoTitle}))
      setTodoTitle('')
    }
  }

  return (
    <View>
      <div className="mt-4 px-4 space-x-2">
        <span
          className={clsx(
            'inline-block px-2 py-1',
            'font-bold text-xs text-white',
            'rounded shadow-md border',
            task.completed
              ? 'bg-green-500 border-green-600'
              : 'bg-gray-500 border-gray-600'
          )}
        >
          {task.completed ? '' : 'not '}completed
        </span>
        {task.important && (
          <span
            className={clsx(
              'inline-block px-2 py-1',
              'font-bold text-xs text-white',
              'rounded shadow-md border',
              'bg-red-500 border-red-600'
            )}
          >
            important
          </span>
        )}
      </div>
      <h1 className="mt-4 px-4 font-semibold text-2xl">{task.title}</h1>
      <section className="mt-4 px-4">
        {isEmpty(task.checklist) && !isTodoInputVisible ? (
          <button
            className={clsx(
              'flex items-center justify-center',
              'px-3 py-2 rounded-md shadow-sm',
              'bg-gray-50 border border-gray-200',
              'select-none',
              'transition ease-in duration-150',
              'active:shadow-inner',
              'focus:outline-none'
            )}
            onClick={() => setIsTodoInputVisible(true)}
          >
            <ClipboardCheckIcon className="mr-2 w-4 h-4" />
            Add Checklist
          </button>
        ) : (
          <form onSubmit={onSubmit}>
            <input
              ref={todoInputRef}
              placeholder="Add todo..."
              className={clsx(
                'bg-gray-200 bg-opacity-50 px-4 py-2 rounded-md border shadow-none',
                'appearance-none border border-gray-300',
                'focus:outline-none focus:border-indigo-500'
              )}
              onInput={e => setTodoTitle((e.target as HTMLInputElement).value)}
            />
          </form>
        )}
      </section>
      {!isUndefined(task.checklist) && (
        <Checklist taskId={task.id} checklist={task.checklist} />
      )}
    </View>
  )
}
