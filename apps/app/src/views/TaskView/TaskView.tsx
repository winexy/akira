import React from 'react'
import {useParams} from 'react-router'
import {MainView} from '@views/MainView'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import isEmpty from 'lodash/fp/isEmpty'
import {CalendarIcon, PlusIcon, ClockIcon} from '@heroicons/react/outline'
import ContentLoader from 'react-content-loader'
import {useQuery} from 'react-query'
import isNil from 'lodash/fp/isNil'
import {BottomSheet} from '@/components/BottomSheet/BottomSheet'
import {Button} from '@components/Button'
import {akira} from '@/lib/akira'
import {
  ChecklistManager,
  MyDayToggle,
  TaskActionList,
  TaskActionToast,
  TextArea
} from '@modules/tasks/components'
import {showBottomSheet} from '@store/bottom-sheet/index'
import {TaskT} from '@store/tasks/types'
import {TagsManager, TaskTag} from '@modules/tags/components'
import {usePatchTaskMutation} from '@modules/tasks/hooks'
import {WIP, Tag} from '@components/Tag/Tag'
import {EditableHeading} from '@components/EditableHeading'

export const TaskView: React.FC = () => {
  const {taskId} = useParams<{taskId: string}>()
  const {data: task} = useQuery<TaskT>(['task', taskId], () =>
    akira.tasks.findOne(taskId)
  )

  const title = task?.title ?? ''

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

  const createdAt = format(parseISO(task.created_at), 'd LLLL yyyy')

  return (
    <MainView className="pb-32">
      <div className="px-4 space-x-2">
        <Tag variant={task.is_completed ? 'green' : 'gray'}>
          {task.is_completed ? '' : 'not '}completed
        </Tag>
        {task.is_important && <Tag variant="red">important</Tag>}
      </div>
      <EditableHeading
        value={task.title}
        className="mt-4"
        onChange={newTitle => {
          patchTaskMutation.mutate({
            title: newTitle
          })
        }}
      />

      <div className="mt-2 px-4 flex justify-between items-center">
        <time dateTime={task.created_at} className="text-gray-500">
          {createdAt}
        </time>
        <MyDayToggle taskId={taskId} />
      </div>
      <section className="mt-2 py-3 px-4 border-t border-b border-gray-50">
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
      <TaskActionList className="mt-4">
        <TaskActionList.Item Icon={PlusIcon}>
          Add to list <WIP className="ml-auto" />
        </TaskActionList.Item>
        <TaskActionList.Item Icon={CalendarIcon}>
          Add due date <WIP className="ml-auto" />
        </TaskActionList.Item>
        <TaskActionList.Item Icon={ClockIcon}>
          Schedule <WIP className="ml-auto" />
        </TaskActionList.Item>
      </TaskActionList>
      {task && <ChecklistManager task={task} />}
      <TaskActionToast
        taskId={taskId}
        isCompleted={task.is_completed}
        isImportant={task.is_important}
      />
    </MainView>
  )
}
