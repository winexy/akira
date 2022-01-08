import React, {useState} from 'react'
import {useHistory, useParams} from 'react-router'
import {PageView} from 'shared/ui/page-view'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import isEmpty from 'lodash/fp/isEmpty'
import {
  ExclamationIcon,
  PlusIcon,
  ClipboardCopyIcon
} from '@heroicons/react/outline'
import isNil from 'lodash/fp/isNil'
import {showBottomSheet, BottomSheet} from 'shared/ui/bottom-sheet'
import {Button} from 'shared/ui/button'
import {
  TaskActionList,
  TaskActionToast,
  TextArea
} from 'modules/tasks/components'
import {TagsManager, TaskTag} from 'modules/tags/components'
import {
  usePatchTaskMutation,
  useTaskQuery,
  useCloneTaskMutation
} from 'modules/tasks/hooks'
import {Tag} from 'modules/tags/components/Tag'
import {
  DotsVerticalIcon,
  ViewListIcon,
  RefreshIcon
} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import isNull from 'lodash/fp/isNull'
import {TaskListPicker} from 'modules/tasks/components/TaskListPicker'
import {EditableHeading} from 'shared/ui/editable-heading'
import clsx from 'clsx'
import RRule from 'rrule'
import {MyDayToggle} from 'features/toggle-myday'
import {ScheduleTask} from 'features/schedule-task'
import {TaskDueDate} from 'features/add-due-date'
import {ChecklistManager} from 'features/checklist'
import {IconButton} from 'shared/ui/icon-button'
import {Recurrence} from 'features/recurrence'
import capitalize from 'lodash/capitalize'
import {Spin} from 'shared/ui/spin'
import {Transition} from 'shared/ui/transition'

const TaskPage: React.FC = () => {
  const {taskId} = useParams<{taskId: string}>()
  const [isActionToastVisible, setIsActionToastVisible] = useState(true)
  const {data: task, isFetching} = useTaskQuery(taskId, {
    suspense: true
  })

  const patchTaskMutation = usePatchTaskMutation(taskId)
  const cloneTaskMutation = useCloneTaskMutation(taskId)
  const history = useHistory()

  if (isNil(task)) {
    return null
  }

  const createdAt = format(parseISO(task.created_at), 'd LLL yyyy')

  function cloneTask() {
    cloneTaskMutation.mutateAsync().then(cloneId => {
      history.push(`/tasks/${cloneId}`)
    })
  }

  return (
    <PageView className="pb-32" withBackNavigation>
      <div className="mt-1 flex px-4 space-x-2">
        <div className="space-x-2 flex-1">
          <Tag variant={task.is_completed ? 'green' : 'gray'}>
            {task.is_completed ? '' : 'not '}completed
          </Tag>
          {task.is_important && <Tag variant="red">important</Tag>}
        </div>
        <div className="ml-auto">
          <IconButton>
            <ExclamationIcon
              className={clsx(
                'w-6 h-6 text-gray-400',
                'transition',
                'transform active:scale-110'
              )}
            />
          </IconButton>
        </div>
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
      <section className="mt-2 py-3 px-4 border-t border-b border-gray-50 dark:border-dark-500">
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
        {isNull(task.list) ? (
          <TaskActionList.Item>
            <TaskActionList.Button
              Icon={PlusIcon}
              onClick={() => showBottomSheet('lists')}
            >
              Add to list
            </TaskActionList.Button>
          </TaskActionList.Item>
        ) : (
          <TaskActionList.Item>
            <TaskActionList.Button Icon={ViewListIcon} className="truncate">
              <Link
                to={`/lists/${task.list.id}`}
                className="w-full text-left truncate"
              >
                {task.list.title}
              </Link>
            </TaskActionList.Button>
            <TaskActionList.Button
              stretch={false}
              onClick={() => showBottomSheet('lists')}
            >
              <DotsVerticalIcon className="ml-auto w-5 h-5" />
            </TaskActionList.Button>
          </TaskActionList.Item>
        )}
        <TaskDueDate
          taskId={taskId}
          dueDate={task.due_date}
          isFetchingTask={isFetching}
        />
        <ScheduleTask
          taskId={taskId}
          scheduledTaskDate={task.date}
          isFetchingTask={isFetching}
        />
        <TaskActionList.Item>
          <TaskActionList.Button
            disabled={cloneTaskMutation.isLoading}
            Icon={ClipboardCopyIcon}
            onClick={cloneTask}
          >
            Clone task
            <Transition.Scale
              appear
              in={cloneTaskMutation.isLoading}
              unmountOnExit
            >
              <Spin className="ml-2 w-4 h-4 text-gray-400" />
            </Transition.Scale>
          </TaskActionList.Button>
        </TaskActionList.Item>
        <TaskActionList.Item>
          <TaskActionList.Button
            Icon={RefreshIcon}
            onClick={() => showBottomSheet('repeat-patterns')}
          >
            {task.recurrence
              ? capitalize(RRule.fromString(task.recurrence.rule).toText())
              : 'Make recurring'}
          </TaskActionList.Button>
        </TaskActionList.Item>
      </TaskActionList>
      <div id="schedule-datepicker" />
      <BottomSheet name="repeat-patterns">
        <div className="text-center py-3">
          <h2 className="font-semibold text-2xl">Repeat</h2>
        </div>
        <Recurrence taskId={task.id} />
      </BottomSheet>
      {task && (
        <ChecklistManager
          task={task}
          onFocus={() => setIsActionToastVisible(false)}
          onBlur={() => setIsActionToastVisible(true)}
        />
      )}
      <TaskActionToast
        isForcedVisible={isActionToastVisible}
        taskId={taskId}
        isCompleted={task.is_completed}
        isImportant={task.is_important}
      />
      <BottomSheet name="lists" className="">
        <TaskListPicker taskId={task.id} activeListId={task.list_id} />
      </BottomSheet>
    </PageView>
  )
}

export default TaskPage
