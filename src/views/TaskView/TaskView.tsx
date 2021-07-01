import React, {
  ChangeEventHandler,
  FormEventHandler,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import clsx from 'clsx'
import {useParams, useHistory} from 'react-router'
import {MainView} from '@views/MainView'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import isEmpty from 'lodash/fp/isEmpty'
import {
  CheckIcon,
  ClipboardCheckIcon,
  FireIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/solid'
import ContentLoader from 'react-content-loader'
import {useQuery, useMutation, useQueryClient} from 'react-query'
import escape from 'escape-html'
import isNull from 'lodash/fp/isNull'
import isNil from 'lodash/fp/isNil'
import {Tag} from '@/components/Tag/Tag'
import {BottomSheet} from '@/components/BottomSheet/BottomSheet'
import {Button} from '@components/Button'
import {akira} from '@/lib/akira'
import {Checklist, MyDayToggle, TextArea} from '@modules/tasks/components'
import {showBottomSheet} from '@store/bottom-sheet/index'
import {TaskPatchT, TaskT} from '@store/tasks/types'
import {TagsManager, TaskTag} from '@modules/tags/components'
import {
  useAddTodoMutation,
  useRemoveTaskMutation,
  useToggleCompletedMutation,
  useToggleImportantMutation,
  usePatchTaskMutation
} from '@modules/tasks/hooks'
import {ActionToast} from '@components/ActionToast'
import {TaskQueryKeyEnum} from '@modules/tasks/config'

export const TaskView: React.FC = () => {
  const {taskId} = useParams<{taskId: string}>()
  const history = useHistory()
  const {data: task} = useQuery<TaskT>(['task', taskId], () =>
    akira.tasks.one(taskId)
  )

  const todoInputRef = useRef<HTMLInputElement | null>(null)

  const [isTodoInputVisible, setIsTodoInputVisible] = useState(false)
  const [todoTitle, setTodoTitle] = useState('')
  const title = task?.title ?? ''

  const taskTitle = useMemo(() => escape(title), [title])

  const toggleCompletedMutation = useToggleCompletedMutation()
  const toggleImportantMutation = useToggleImportantMutation()
  const removeTaskMutation = useRemoveTaskMutation()
  const patchTaskMutation = usePatchTaskMutation(taskId)
  const addTodoMutation = useAddTodoMutation(taskId)

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

  function onRemove() {
    // eslint-disable-next-line
    if (confirm('Are you sure? This action cannot be undone')) {
      removeTaskMutation.mutateAsync(taskId).then(() => {
        history.push('/')
      })
    }
  }

  const createdAt = format(parseISO(task.created_at), 'd LLLL yyyy')

  return (
    <MainView className="pb-28">
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

      <div className="mt-2 px-4 flex justify-between items-center">
        <time dateTime={task.created_at} className="text-gray-500">
          {createdAt}
        </time>
        <MyDayToggle taskId={taskId} />
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
      <ActionToast>
        <ActionToast.Button
          Icon={CheckIcon}
          className={clsx('active:text-green-600', {
            'text-green-500': task.is_completed
          })}
          onClick={() => toggleCompletedMutation.mutate(taskId)}
        />
        <ActionToast.Button
          Icon={FireIcon}
          className={clsx('active:text-red-600', {
            'text-red-500': task.is_important
          })}
          onClick={() => toggleImportantMutation.mutate(taskId)}
        />
        <ActionToast.Button
          isLoading={removeTaskMutation.isLoading}
          Icon={TrashIcon}
          className="text-red-500 active:text-red-600"
          onClick={onRemove}
        />
      </ActionToast>
    </MainView>
  )
}
