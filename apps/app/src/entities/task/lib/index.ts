import startOfToday from 'date-fns/startOfToday'
import isBefore from 'date-fns/fp/isBefore'
import parseISO from 'date-fns/parseISO'
import {constFalse, constTrue, flow, pipe} from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import {ApiTask} from 'modules/tasks/types.d'
import format from 'date-fns/fp/format'
import isValid from 'date-fns/isValid'
import isToday from 'date-fns/isToday'

const parseDueDate = (task: ApiTask): O.Option<Date> =>
  pipe(O.fromNullable(task.due_date), O.map(parseISO), O.filter(isValid))

export const isOverdue = (task: ApiTask): boolean =>
  pipe(
    parseDueDate(task),
    O.filter(isBefore(startOfToday())),
    O.filter(() => !task.is_completed),
    O.fold(constFalse, constTrue)
  )

export const isDeadlineToday = flow(
  parseDueDate,
  O.map(isToday),
  O.getOrElse(constFalse)
)

export const getFormattedDueDate = flow(
  parseDueDate,
  O.map(format('dd.MM.yy')),
  O.getOrElse(() => '')
)
