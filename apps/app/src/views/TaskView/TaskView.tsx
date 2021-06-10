import React, {
  ChangeEventHandler,
  FocusEventHandler,
  FormEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import clsx from 'clsx'
import {useParams} from 'react-router'
import {View} from '@views/View/View'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import {
  TodoT,
  TaskIdT,
  loadTaskFx,
  addTodoFx,
  removeTodoFx,
  $tasksById
} from '@store/tasks'
import isEmpty from 'lodash/fp/isEmpty'
import {ClipboardCheckIcon, XIcon} from '@heroicons/react/solid'
import {Checkbox} from '@components/Checkbox/Checkbox'
import ContentLoader from 'react-content-loader'
import {Tag} from '@/components/Tag/Tag'
import {useStoreMap} from 'effector-react'
import isNull from 'lodash/fp/isNull'
import size from 'lodash/fp/size'
import noop from 'lodash/fp/noop'
import {
  $checklistByTaskId,
  loadChecklistFx,
  patchTaskFx,
  patchTodoFx
} from '@store/tasks/slice'

type ChecklistPropsT = {
  taskId: TaskIdT
  checklist: TodoT[]
}

const Checklist: React.FC<ChecklistPropsT> = ({taskId, checklist}) => {
  return (
    <ul className="mt-2 divide-y transition ease-in duration-75">
      {checklist.map(todo => (
        <li
          key={todo.id}
          className={clsx(
            'flex items-center px-4 py-1',
            'select-none',
            'transitino ease-in duration-150',
            'active:bg-gray-200',
            {'line-through': todo.is_completed}
          )}
        >
          <Checkbox
            isChecked={todo.is_completed}
            className="mr-4"
            onChange={() =>
              patchTodoFx({
                taskId,
                todoId: todo.id,
                patch: {
                  is_completed: !todo.is_completed
                }
              })
            }
          />
          {todo.title}
          <button
            className={clsx(
              'ml-auto -mr-3 w-10 h-10',
              'flex items-center justify-center',
              'text-red-500 rounded',
              'transition ease-in duration-150',
              'active:text-red-600 active:bg-gray-300',
              'focus:outline-none'
            )}
            onClick={() =>
              removeTodoFx({
                taskId,
                todoId: todo.id
              })
            }
          >
            <XIcon className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

type TextAreaProps = {
  value: string
  placeholder?: string
  onChange(value: string): void
  onInput?(value: string): void
}

const countRows = (value: string) => size(value.split('\n'))

const TextArea: React.FC<TextAreaProps> = ({
  value,
  placeholder = '',
  onChange,
  onInput = noop
}) => {
  const [rows, setRows] = useState(() => countRows(value))
  const [localValue, setLocalValue] = useState(value)

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = event => {
    const {value} = event.target

    setRows(countRows(value))
    setLocalValue(value)
    onInput(value)
  }

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = event => {
    onChange(event.target.value)
  }

  return (
    <textarea
      className="w-full p-0 bg-transparent focus:outline-none"
      value={localValue}
      rows={rows}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}

export const TaskView: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const todoInputRef = useRef<HTMLInputElement | null>(null)
  const task = useStoreMap($tasksById, byId => byId[id] ?? null)
  const checklist = useStoreMap($checklistByTaskId, byId => byId[id] ?? null)
  const [isTodoInputVisible, setIsTodoInputVisible] = useState(false)
  const [todoTitle, setTodoTitle] = useState('')

  useEffect(() => {
    if (isNull(task)) {
      loadTaskFx(id)
      loadChecklistFx(id)
    }
  }, [id, task])

  useLayoutEffect(() => {
    if (isTodoInputVisible) {
      todoInputRef.current?.focus()
    }
  }, [isTodoInputVisible])

  if (isNull(task)) {
    return (
      <View className="p-4">
        <ContentLoader
          speed={2}
          width={320}
          height={160}
          viewBox="0 0 320 160"
          backgroundColor="#ffffff"
          foregroundColor="#e9e9e9"
        >
          <rect x="0" y="0" rx="4" ry="4" width="105" height="25" />
          <rect x="120" y="0" rx="4" ry="4" width="105" height="25" />
          <rect x="0" y="46" rx="4" ry="4" width="240" height="28" />
          <rect x="0" y="92" rx="4" ry="4" width="200" height="42" />
        </ContentLoader>
      </View>
    )
  }

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()

    if (!isEmpty(todoTitle)) {
      addTodoFx({taskId: task.id, todoTitle})
      setTodoTitle('')
    }
  }

  const createdAt = format(parseISO(task.created_at), 'd LLLL yyyy')

  return (
    <View>
      <div className="px-4 space-x-2">
        <Tag variant={task.is_completed ? 'green' : 'gray'}>
          {task.is_completed ? '' : 'not '}completed
        </Tag>
        {task.is_important && <Tag variant="red">important</Tag>}
      </div>
      <h1 className="mt-4 px-4 font-semibold text-2xl">{task.title}</h1>
      <div className="mt-4 px-4">
        <time dateTime={task.created_at} className="text-gray-500">
          {createdAt}
        </time>
      </div>
      <section className="mt-4 px-4 flex items-center">
        <TextArea
          value={task.description}
          placeholder="Tap to add description"
          onChange={description =>
            patchTaskFx({
              taskId: id,
              patch: {description}
            })
          }
        />
      </section>
      <section className="mt-4 px-4">
        {isEmpty(checklist) && !isTodoInputVisible ? (
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
              value={todoTitle}
              placeholder="Add todo..."
              className={clsx(
                'bg-gray-200 bg-opacity-50 px-4 py-2 rounded-md border shadow-none',
                'appearance-none border border-gray-300',
                'focus:outline-none focus:border-indigo-500'
              )}
              onInput={e => setTodoTitle((e.target as HTMLInputElement).value)}
              onBlur={() => setIsTodoInputVisible(false)}
            />
          </form>
        )}
      </section>
      {!isNull(checklist) && (
        <Checklist taskId={task.id} checklist={checklist} />
      )}
    </View>
  )
}
