import React, {ChangeEventHandler, useMemo} from 'react'
import {useParams} from 'react-router'
import {MainView} from '@views/MainView'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import isEmpty from 'lodash/fp/isEmpty'
import {PlusIcon} from '@heroicons/react/solid'
import ContentLoader from 'react-content-loader'
import {useQuery} from 'react-query'
import escape from 'escape-html'
import isNil from 'lodash/fp/isNil'
import {Tag} from '@/components/Tag/Tag'
import {BottomSheet} from '@/components/BottomSheet/BottomSheet'
import {Button} from '@components/Button'
import {akira} from '@/lib/akira'
import {
  ChecklistManager,
  MyDayToggle,
  TaskActionToast,
  TextArea
} from '@modules/tasks/components'
import {showBottomSheet} from '@store/bottom-sheet/index'
import {TaskT} from '@store/tasks/types'
import {TagsManager, TaskTag} from '@modules/tags/components'
import {usePatchTaskMutation} from '@modules/tasks/hooks'

export const TaskView: React.FC = () => {
  const {taskId} = useParams<{taskId: string}>()
  const {data: task} = useQuery<TaskT>(['task', taskId], () =>
    akira.tasks.one(taskId)
  )

  const title = task?.title ?? ''
  const taskTitle = useMemo(() => escape(title), [title])

  const patchTaskMutation = usePatchTaskMutation(taskId)

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
      <section className="mt-4 px-4 flex flex-col items-start">
        <h2 className="font-semibold text-lg">Note</h2>
        <TextArea
          value={task.description}
          placeholder="Tap to add note"
          className="mt-2"
          onChange={description => patchTaskMutation.mutate({description})}
        />
      </section>
      {task && <ChecklistManager task={task} />}
      <TaskActionToast
        taskId={taskId}
        isCompleted={task.is_completed}
        isImportant={task.is_important}
      />
    </MainView>
  )
}
