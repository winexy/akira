import React, {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import clsx, {ClassValue} from 'clsx'
import {useParams} from 'react-router'
import {MainView} from '@views/MainView'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import {TodoT, TaskIdT, addTodoFx, removeTodoFx, TagT} from '@store/tasks'
import isEmpty from 'lodash/fp/isEmpty'
import {
  ClipboardCheckIcon,
  XIcon,
  PlusIcon,
  ChevronDownIcon
} from '@heroicons/react/solid'
import ContentLoader from 'react-content-loader'
import {useQuery, useMutation, useQueryClient, QueryClient} from 'react-query'
import escape from 'escape-html'
import isNull from 'lodash/fp/isNull'
import isUndefined from 'lodash/fp/isUndefined'
import isNil from 'lodash/fp/isNil'
import {patchTodoFx} from '@store/tasks/slice'
import {Checkbox} from '@components/Checkbox/Checkbox'
import {Tag} from '@/components/Tag/Tag'
import {BottomSheet} from '@/components/BottomSheet/BottomSheet'
import {Button} from '@components/Button'
import {akira} from '@/lib/akira'
import {TextArea} from '@modules/tasks/components'
import {showBottomSheet} from '../../store/bottom-sheet/index'
import {TaskPatchT, TaskT} from '../../store/tasks/types'

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

type CreateTagFormProps = {
  className?: ClassValue
  taskId: TaskIdT
}

const CreateTagForm: React.FC<CreateTagFormProps> = ({className, taskId}) => {
  const [name, setName] = useState<string>('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()
  const createTaskTagMutation = useMutation(
    async (name: string) => {
      const tag = await akira.tags.create(name)
      return akira.tasks.addTag(taskId, tag.id)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['tags', ['task', taskId]])
      }
    }
  )

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()
    createTaskTagMutation.mutate(name)
    setName('')
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <form onSubmit={onSubmit} className={clsx(className)}>
      <input
        ref={inputRef}
        value={name}
        type="text"
        placeholder="name"
        className={clsx(
          'w-full px-3 py-2',
          'rounded-md border border-gray-300',
          'focus:outline-none focus:border-blue-500'
        )}
        onChange={e => setName(e.target.value)}
      />
      <Button className="mt-4 w-full" size="md" variant="blue">
        Create
      </Button>
    </form>
  )
}

const TaskTag: React.FC<{name: string}> = ({name}) => (
  <button
    className="
      px-2 py-0.5 
      border border-gray-300 bg-gray-200 
      text-xs text-gray-500 font-semibold
      shadow-sm rounded-2xl
      transition ease-in duration-75
      active:bg-gray-300 active:border-gray-400
      active:text-gray-600 active:shadow-inner
      focus:outline-none
    "
  >
    #{name}
  </button>
)

const TagsManager: React.FC<{taskId: TaskIdT}> = ({taskId}) => {
  const {data: tags, isLoading} = useQuery<TagT[]>('tags', akira.tags.all)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <h2 className="px-4 font-bold text-2xl text-gray-700">Tags</h2>
      {isLoading && (
        <ContentLoader
          speed={2}
          width={320}
          height={214}
          className="mt-4"
          viewBox="0 0 320 214"
          backgroundColor="#ffffff"
          foregroundColor="#e9e9e9"
        >
          <rect x="0" y="0" width="100%" height="42" />
          <rect x="0" y="43" width="100%" height="42" />
          <rect x="0" y="86" width="100%" height="42" />
          <rect x="0" y="129" width="100%" height="42" />
          <rect x="0" y="172" width="100%" height="42" />
        </ContentLoader>
      )}
      {!isUndefined(tags) && !isEmpty(tags) && (
        <ul className="mt-2 divide-y">
          {tags.map(tag => (
            <li key={tag.id} className="flex items-center px-4 py-2">
              <TaskTag name={tag.name} />
              <Button className="ml-auto text-xs">add tag</Button>
            </li>
          ))}
        </ul>
      )}
      <div
        className={clsx('px-4 py-2 sticky bottom-0 bg-white border-t', {
          'pb-4': isExpanded
        })}
      >
        <div className="flex justify-between items-center ">
          <h3 className="font-bold text-xl">Add new tag</h3>
          <button
            className="
              flex justify-center items-center w-12 h-12
              rounded-md
              transition ease-in duration-75
              active:bg-gray-100 focus:outline-none
            "
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDownIcon
              className={clsx(
                'w-5 h-5 transform transition ease-in duration-150',
                {
                  'rotate-180': isExpanded
                }
              )}
            />
          </button>
        </div>
        {isExpanded && <CreateTagForm taskId={taskId} className="mt-4" />}
      </div>
    </>
  )
}

export const TaskView: React.FC = () => {
  const {id} = useParams<{id: string}>()
  const {data: task} = useQuery<TaskT>(['task', id], () => akira.tasks.one(id))

  const todoInputRef = useRef<HTMLInputElement | null>(null)

  const [isTodoInputVisible, setIsTodoInputVisible] = useState(false)
  const [todoTitle, setTodoTitle] = useState('')
  const title = task?.title ?? ''

  const taskTitle = useMemo(() => escape(title), [title])

  const queryClient = useQueryClient()
  const patchTaskMutation = useMutation(
    (patch: TaskPatchT) => {
      return akira.tasks.patch(id, patch)
    },
    {
      onSuccess(task) {
        queryClient.setQueryData(['task', id], task)
      }
    }
  )

  useLayoutEffect(() => {
    if (isTodoInputVisible) {
      todoInputRef.current?.focus()
    }
  }, [isTodoInputVisible])

  if (isNil(task)) {
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
    const {textContent} = event.target

    // eslint-disable-next-line
    event.target.innerHTML = textContent ?? ''

    if (!isNil(textContent) && task.title !== textContent) {
      const newTitle = textContent.trim()

      patchTaskMutation.mutate({
        title: newTitle
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

      <div className="mt-2 px-4">
        <time dateTime={task.created_at} className="text-gray-500">
          {createdAt}
        </time>
      </div>
      <section className="mt-2 py-3 px-4 border-t border-b">
        {!isEmpty(task.tags) && (
          <ul className="mb-2 inline-flex space-x-1">
            {task.tags.map(tag => (
              <li key={tag.id}>
                <TaskTag name={tag.name} />
              </li>
            ))}
          </ul>
        )}
        <Button
          size="sm"
          variant="blue"
          className="text-sm"
          onClick={() => showBottomSheet('tags')}
        >
          Add Tag <PlusIcon className="ml-2 w-5 h-5" />
        </Button>
        <BottomSheet name="tags" className="pt-4">
          <TagsManager taskId={id} />
        </BottomSheet>
      </section>
      <section className="mt-4 px-4 flex items-center">
        <TextArea
          value={task.description}
          placeholder="Tap to add description"
          onChange={description => patchTaskMutation.mutate({description})}
        />
      </section>
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
      {!isNull(task.checklist) && (
        <Checklist taskId={task.id} checklist={task.checklist} />
      )}
    </MainView>
  )
}
