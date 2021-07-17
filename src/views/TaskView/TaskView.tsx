import React, {useEffect, useState} from 'react'
import DatePicker from 'react-datepicker'
import './DatePicker.css'
import {useParams} from 'react-router'
import {MainView} from '@views/MainView'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import isEmpty from 'lodash/fp/isEmpty'
import {CalendarIcon, PlusIcon, ClockIcon} from '@heroicons/react/outline'
import ContentLoader from 'react-content-loader'
import {useQuery, useMutation, useQueryClient} from 'react-query'
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
import {showBottomSheet, hideBottomSheet} from '@store/bottom-sheet/index'
import {ApiTask, TaskId} from '@modules/tasks/types.d'
import {TagsManager, TaskTag} from '@modules/tags/components'
import {usePatchTaskMutation} from '@modules/tasks/hooks'
import {Tag} from '@components/Tag/Tag'
import {EditableHeading} from '@components/EditableHeading'
import {
  DotsVerticalIcon,
  ViewListIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import isNull from 'lodash/fp/isNull'
import {TaskListPicker} from '@modules/tasks/components/TaskListPicker'
import {api} from '@lib/api'
import {Match} from '@/components/Match'
import isEqual from 'date-fns/isEqual'
import isUndefined from 'lodash/fp/isUndefined'

type TaskScheduleProps = {
  taskId: TaskId
  scheduledTaskDate?: string
  isFetchingTask: boolean
}

const TaskSchedule: React.FC<TaskScheduleProps> = ({
  taskId,
  isFetchingTask,
  scheduledTaskDate
}) => {
  const [scheduledDate, setScheduledDate] = useState<Date>(() => {
    return !isUndefined(scheduledTaskDate)
      ? parseISO(scheduledTaskDate)
      : new Date()
  })

  useEffect(() => {
    if (
      !isUndefined(scheduledTaskDate) &&
      isEqual(parseISO(scheduledTaskDate), scheduledDate)
    ) {
      setScheduledDate(parseISO(scheduledTaskDate))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledTaskDate])

  const queryClient = useQueryClient()

  const scheduleTaskMutation = useMutation(
    (date: string) =>
      api.post(`task-scheduler/schedule`, {
        task_id: taskId,
        date
      }),
    {
      onSuccess() {
        queryClient.refetchQueries(['task', taskId])
      }
    }
  )

  function apply() {
    const shouldChangeDate =
      isUndefined(scheduledTaskDate) ||
      !isEqual(scheduledDate, parseISO(scheduledTaskDate))

    if (scheduledDate && shouldChangeDate) {
      scheduleTaskMutation.mutate(format(scheduledDate, 'yyyy-MM-dd'))
    }
  }

  const formattedDate = scheduledTaskDate
    ? format(parseISO(scheduledTaskDate), 'd.MM.yy')
    : ''

  return (
    <TaskActionList.Item>
      <TaskActionList.Button
        Icon={ClockIcon}
        onClick={() => {
          showBottomSheet('datepicker')
        }}
      >
        <Match>
          <Match.Case when={scheduleTaskMutation.isLoading || isFetchingTask}>
            <ContentLoader
              width={160}
              height={27}
              viewBox="0 0 160 27"
              backgroundColor="#ffffff"
              foregroundColor="#e9e9e9"
            >
              <rect rx="5" ry="5" x="0" y="0" width="100%" height="27" />
            </ContentLoader>
          </Match.Case>
          <Match.Case when={isUndefined(scheduledTaskDate)}>
            Schedule
          </Match.Case>
          <Match.Default>
            Scheduled
            <span className="ml-auto bg-blue-50 text-blue-600 rounded px-2 py-0.5">
              {formattedDate}
            </span>
          </Match.Default>
        </Match>
        <BottomSheet name="datepicker" className="pb-8">
          <h2 className="mt-4 font-bold text-2xl text-gray-700">
            Schedule task
          </h2>
          <div className="px-4">
            <DatePicker
              inline
              selected={scheduledDate}
              monthsShown={1}
              minDate={new Date()}
              className="flex flex-col justify-center"
              renderCustomHeader={params => {
                return (
                  <div className="text-gray-700 px-2 py-2 flex items-center justify-between">
                    <button
                      className="w-12 h-12 flex items-center justify-center rounded transition ease-in duration-150 active:bg-gray-100 focus:outline-none disabled:text-gray-200 disabled:bg-transparent"
                      disabled={params.prevMonthButtonDisabled}
                      onClick={params.decreaseMonth}
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <strong className="font-semibold">
                      {format(params.date, 'LLLL')}
                    </strong>
                    <button
                      className="w-12 h-12 flex items-center justify-center rounded transition ease-in duration-150 active:bg-gray-100 focus:outline-none disabled:text-gray-200 disabled:bg-transparent"
                      disabled={params.nextMonthButtonDisabled}
                      onClick={params.increaseMonth}
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                )
              }}
              onChange={date => setScheduledDate(date as Date)}
            />
          </div>
          <div className="sticky bottom-0 mt-6 px-4">
            <Button
              size="md"
              type="button"
              className="w-full"
              onClick={event => {
                event.stopPropagation()
                hideBottomSheet()
                apply()
              }}
            >
              Select
              <span className=" ml-auto">
                {format(scheduledDate, 'dd.MM.yy')}
              </span>
            </Button>
          </div>
        </BottomSheet>
      </TaskActionList.Button>
    </TaskActionList.Item>
  )
}

export const TaskView: React.FC = () => {
  const {taskId} = useParams<{taskId: string}>()
  const {data: task, isFetching} = useQuery<ApiTask>(['task', taskId], () =>
    akira.tasks.findOne(taskId)
  )

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
        {isNull(task.list_id) ? (
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
                to={`/lists/${task.list_id}`}
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
        <TaskActionList.Item>
          <TaskActionList.Button Icon={CalendarIcon}>
            Add due date
          </TaskActionList.Button>
        </TaskActionList.Item>
        <TaskSchedule
          taskId={taskId}
          scheduledTaskDate={task.schedule?.date}
          isFetchingTask={isFetching}
        />
      </TaskActionList>
      {task && <ChecklistManager task={task} />}
      <TaskActionToast
        taskId={taskId}
        isCompleted={task.is_completed}
        isImportant={task.is_important}
      />
      <BottomSheet name="lists" className="">
        <TaskListPicker taskId={task.id} activeListId={task.list_id} />
      </BottomSheet>
    </MainView>
  )
}
