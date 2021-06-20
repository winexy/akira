import React, {
  ChangeEventHandler,
  FocusEventHandler,
  FormEventHandler,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import clsx from 'clsx'
import {useParams} from 'react-router'
import {MainView} from '@views/MainView'
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
import {
  CheckIcon,
  ClipboardCheckIcon,
  FireIcon,
  XIcon
} from '@heroicons/react/solid'
import ContentLoader from 'react-content-loader'
import {useStoreMap} from 'effector-react'
import escape from 'escape-html'
import isNull from 'lodash/fp/isNull'
import size from 'lodash/fp/size'
import noop from 'lodash/fp/noop'
import isNil from 'lodash/fp/isNil'
import {
  $checklistByTaskId,
  loadChecklistFx,
  patchTaskFx,
  patchTodoFx
} from '@store/tasks/slice'
import {Checkbox} from '@components/Checkbox/Checkbox'
import {Tag} from '@/components/Tag/Tag'

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
              'focus:outline-none focus:bg-gray-200 focus:bg-opacity-75'
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

  const sync = (newValue: string) => {
    setRows(countRows(newValue))
    setLocalValue(newValue)
  }

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = event => {
    const {value} = event.target

    onInput(value)
    sync(value)
  }

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = event => {
    const value = event.target.value.trim()

    onChange(value)
    sync(value)
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
  const title = task?.title ?? ''

  const taskTitle = useMemo(() => escape(title), [title])

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
      <MainView className="p-4">
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
      </MainView>
    )
  }

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()

    if (!isEmpty(todoTitle)) {
      addTodoFx({taskId: task.id, todoTitle})
      setTodoTitle('')
    }
  }

  const onTitleChange: ChangeEventHandler<HTMLHeadingElement> = event => {
    const newTitle = event.target.textContent

    if (!isNil(newTitle) && task.title !== newTitle) {
      patchTaskFx({
        taskId: id,
        patch: {title: newTitle}
      })
    }
  }

  const createdAt = format(parseISO(task.created_at), 'd LLLL yyyy')

  return (
    <MainView>
      <div className="px-4 space-x-2">
        <Tag variant={task.is_completed ? 'green' : 'gray'}>
          {task.is_completed ? '' : 'not '}completed
        </Tag>
        {task.is_important && <Tag variant="red">important</Tag>}
      </div>
      <h1
        className="
          mt-4 px-4 
          font-semibold text-2xl 
          focus:outline-none 
          focus:text-gray-500
        "
        contentEditable
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: taskTitle
        }}
        onBlur={onTitleChange}
      />
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
                'bg-gray-200 bg-opacity-50 px-4 py-2 rounded-md border shadow-inner',
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
    </MainView>
  )
}
