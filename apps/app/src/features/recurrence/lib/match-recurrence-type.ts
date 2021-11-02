import {exhaustiveCheck} from 'shared/lib/utils'
import {RecurrenceEnum} from '../model'

export function matchRecurrenceType(type: RecurrenceEnum) {
  switch (type) {
    case RecurrenceEnum.Daily:
      return 'Daily'
    case RecurrenceEnum.Weekly:
      return 'Weekly'
    case RecurrenceEnum.Monthly:
      return 'Monthly'
    case RecurrenceEnum.Weekdays:
      return 'Weekdays'
    default:
      return exhaustiveCheck(type)
  }
}
