import React, {useEffect, useState} from 'react'
import format from 'date-fns/format'
import isEqual from 'date-fns/isEqual'
import parseISO from 'date-fns/parseISO'
import isNull from 'lodash/fp/isNull'
import {ClockIcon} from '@heroicons/react/outline'
import isUndefined from 'lodash/fp/isUndefined'
import {TaskActionList} from 'modules/tasks/components'
import {TaskId} from 'modules/tasks/types.d'
import {useShimmerColors} from 'shared/ui/shimmer'
import {Match} from 'shared/ui/match'
import {DatePicker} from 'shared/ui/datepicker'
import {Portal} from 'shared/ui/portal'
import {DatePickerSheet} from 'shared/ui/datepicker-sheet'
import {DatePickerShortcut} from 'shared/ui/datepicker-shortcut'
import {bottomSheetModel} from 'shared/ui/bottom-sheet'
import ContentLoader from 'react-content-loader'
import {useScheduleTaskMutation} from '../model'

type Props = {
  taskId: TaskId
  scheduledTaskDate: string | null
  isFetchingTask: boolean
}

export const ScheduleTask: React.FC<Props> = ({
  taskId,
  isFetchingTask,
  scheduledTaskDate,
}) => {
  const [scheduledDate, setScheduledDate] = useState<Date | null>(() => {
    return !isNull(scheduledTaskDate) ? parseISO(scheduledTaskDate) : null
  })

  useEffect(() => {
    if (
      scheduledDate &&
      !isNull(scheduledTaskDate) &&
      isEqual(parseISO(scheduledTaskDate), scheduledDate)
    ) {
      setScheduledDate(parseISO(scheduledTaskDate))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledTaskDate])

  const scheduleTaskMutation = useScheduleTaskMutation(taskId)

  function apply() {
    const shouldChangeDate =
      isNull(scheduledTaskDate) ||
      isNull(scheduledDate) ||
      !isEqual(scheduledDate, parseISO(scheduledTaskDate))

    if (scheduledDate && shouldChangeDate) {
      scheduleTaskMutation.mutate(format(scheduledDate, 'yyyy-MM-dd'))
    }
  }

  const {backgroundColor, foregroundColor} = useShimmerColors()

  const formattedDate = scheduledTaskDate
    ? format(parseISO(scheduledTaskDate), 'd.MM.yy')
    : ''

  return (
    <>
      <TaskActionList.Item>
        <TaskActionList.Button
          Icon={ClockIcon}
          onClick={() => {
            bottomSheetModel.showBottomSheet('datepicker')
          }}
        >
          <Match>
            <Match.Case when={scheduleTaskMutation.isLoading || isFetchingTask}>
              Loading...
              <ContentLoader
                className="ml-auto"
                width="40%"
                height={24}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
              >
                <rect rx="5" ry="5" x="0" y="0" width="100%" height="24" />
              </ContentLoader>
            </Match.Case>
            <Match.Case when={isUndefined(scheduledTaskDate)}>
              Schedule
            </Match.Case>
            <Match.Default>
              Scheduled
              <span className="ml-auto bg-blue-50 dark:bg-dark-500 text-blue-600 dark:text-blue-400 rounded px-2">
                {formattedDate}
              </span>
            </Match.Default>
          </Match>
        </TaskActionList.Button>
      </TaskActionList.Item>
      <Portal to="schedule-datepicker">
        <DatePickerSheet
          date={scheduledDate}
          title="Schedule task"
          fixedChildren={<DatePickerShortcut onPick={setScheduledDate} />}
          onApply={apply}
        >
          <DatePicker date={scheduledDate} onChange={setScheduledDate} />
        </DatePickerSheet>
      </Portal>
    </>
  )
}
