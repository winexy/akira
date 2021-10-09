import React, {useEffect, useState} from 'react'
import {CalendarIcon} from '@heroicons/react/outline'
import {TaskActionList} from 'modules/tasks/components'

import format from 'date-fns/format'
import isEqual from 'date-fns/isEqual'
import parseISO from 'date-fns/parseISO'
import isNull from 'lodash/fp/isNull'
import {TaskId} from 'modules/tasks/types.d'
import {useShimmerColors} from 'shared/ui/shimmer'
import {Match} from 'shared/ui/match'
import {DatePicker} from 'shared/ui/datepicker'
import {Portal} from 'shared/ui/portal'
import {DatePickerSheet} from 'shared/ui/datepicker-sheet'
import {DatePickerShortcut} from 'shared/ui/datepicker-shortcut'
import {showBottomSheet} from 'shared/ui/bottom-sheet'
import ContentLoader from 'react-content-loader'
import {usePatchTaskMutation} from 'modules/tasks/hooks'

type Props = {
  taskId: TaskId
  dueDate: string | null
  isFetchingTask: boolean
}

export const TaskDueDate: React.FC<Props> = ({
  taskId,
  isFetchingTask,
  dueDate
}) => {
  const [date, setDate] = useState<Date | null>(() => {
    return !isNull(dueDate) ? parseISO(dueDate) : null
  })

  useEffect(() => {
    if (date && !isNull(dueDate) && isEqual(parseISO(dueDate), date)) {
      setDate(parseISO(dueDate))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueDate])

  const patchTaskMutation = usePatchTaskMutation(taskId)

  function apply() {
    const shouldChangeDate =
      isNull(dueDate) || isNull(date) || !isEqual(date, parseISO(dueDate))

    if (date && shouldChangeDate) {
      patchTaskMutation.mutate({
        due_date: format(date, 'yyyy-MM-dd')
      })
    }
  }

  const {backgroundColor, foregroundColor} = useShimmerColors()

  const formattedDate = dueDate ? format(parseISO(dueDate), 'd.MM.yy') : ''

  return (
    <>
      <TaskActionList.Item>
        <TaskActionList.Button
          Icon={CalendarIcon}
          onClick={() => {
            showBottomSheet('due-datepicker')
          }}
        >
          <Match>
            <Match.Case when={patchTaskMutation.isLoading || isFetchingTask}>
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
            <Match.Case when={isNull(dueDate)}>Add due date</Match.Case>
            <Match.Default>
              Due date
              <span className="ml-auto bg-blue-50 dark:bg-dark-500 text-blue-600 dark:text-blue-400 rounded px-2">
                {formattedDate}
              </span>
            </Match.Default>
          </Match>
        </TaskActionList.Button>
      </TaskActionList.Item>
      <Portal to="schedule-datepicker">
        <DatePickerSheet
          date={date}
          title="Select due date"
          name="due-datepicker"
          fixedChildren={<DatePickerShortcut onPick={setDate} />}
          onApply={apply}
        >
          <DatePicker date={date} minDate={new Date()} onChange={setDate} />
        </DatePickerSheet>
      </Portal>
    </>
  )
}
