import React, {
  ChangeEventHandler,
  FormEventHandler,
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
import {TodoT, TaskIdT, TagT} from '@store/tasks'
import isEmpty from 'lodash/fp/isEmpty'
import filter from 'lodash/fp/filter'
import {
  ClipboardCheckIcon,
  XIcon,
  PlusIcon,
  PencilAltIcon
} from '@heroicons/react/solid'
import ContentLoader from 'react-content-loader'
import {useQuery, useMutation, useQueryClient, QueryClient} from 'react-query'
import escape from 'escape-html'
import isNull from 'lodash/fp/isNull'
import isUndefined from 'lodash/fp/isUndefined'
import isNil from 'lodash/fp/isNil'
import produce from 'immer'
import map from 'lodash/fp/map'
import {Checkbox} from '@components/Checkbox/Checkbox'
import {Tag} from '@/components/Tag/Tag'
import {BottomSheet} from '@/components/BottomSheet/BottomSheet'
import {Button} from '@components/Button'
import {akira} from '@/lib/akira'
import {TextArea} from '@modules/tasks/components'
import {showBottomSheet} from '@store/bottom-sheet/index'
import {TaskPatchT, TaskT, TodoIdT, TodoPatchT} from '@store/tasks/types'
import {Link} from 'react-router-dom'
import {TaskTag} from '@modules/tags/components'

type ChecklistPropsT = {
  taskId: TaskIdT
  checklist: TodoT[]
}

const Checklist: React.FC<ChecklistPropsT> = ({taskId, checklist}) => {
  const queryClient = useQueryClient()
  const patchTodoMutation = useMutation(
    ({todoId, patch}: {todoId: TodoIdT; patch: TodoPatchT}) => {
      return akira.checklist.patchTodo(taskId, todoId, patch)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['task', taskId])
      }
    }
  )

  const removeTodoMutation = useMutation(
    (todoId: TodoIdT) => {
      return akira.checklist.removeTodo(taskId, todoId)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['task', taskId])
      }
    }
  )

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
              patchTodoMutation.mutate({
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
            onClick={() => removeTodoMutation.mutate(todo.id)}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

const TagsManager: React.FC<{task: TaskT}> = ({task}) => {
  const queryClient = useQueryClient()
  const {data: tags, isLoading} = useQuery<TagT[]>('tags', akira.tags.all)
  const taskTagsIdSet = new Set(map('id', task.tags))

  const addTagMutation = useMutation(
    (tag: TagT) => {
      return akira.tasks.addTag(task.id, tag.id)
    },
    {
      onSuccess(_, tag) {
        queryClient.setQueriesData(
          ['task', task.id],
          produce(task, draft => {
            draft.tags.push(tag)
          })
        )
      }
    }
  )

  const removeTaskTagMutation = useMutation(
    (tag: TagT) => {
      return akira.tasks.removeTag(task.id, tag.id)
    },
    {
      onSuccess(_, tag) {
        queryClient.setQueriesData(
          ['task', task.id],
          produce(task, draft => {
            draft.tags = filter(t => t.id !== tag.id, task.tags)
          })
        )
      }
    }
  )

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
              {taskTagsIdSet.has(tag.id) ? (
                <Button
                  className="ml-auto text-xs"
                  variant="red"
                  onClick={() => removeTaskTagMutation.mutate(tag)}
                >
                  remove
                </Button>
              ) : (
                <Button
                  className="ml-auto text-xs"
                  onClick={() => addTagMutation.mutate(tag)}
                >
                  add tag
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div
        className={clsx(
          'px-4 py-3 sticky bottom-0',
          'bg-white border-t',
          'transition ease-in duration-150',
          'active:bg-gray-100'
        )}
      >
        <Link to="/tags" className="flex justify-between items-center ">
          <h3 className="font-bold text-xl">Edit tags</h3>
          <PencilAltIcon className="w-5 h-5" />
        </Link>
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

  const addTodoMutation = useMutation(
    (todoTitle: string) => {
      return akira.checklist.addTodo({
        taskId: id,
        title: todoTitle
      })
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['task', id])
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
      addTodoMutation.mutate(todoTitle)
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
          <TagsManager task={task} />
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
              enterKeyHint="send"
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
