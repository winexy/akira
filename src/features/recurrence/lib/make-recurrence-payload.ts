import RRule from 'rrule'
import {exhaustiveCheck} from 'shared/lib/utils'
import {RecurrenceEnum} from '../model'

export function makeRecurrencePayload(type: RecurrenceEnum) {
  switch (type) {
    case RecurrenceEnum.Daily:
      return {
        frequency: RRule.DAILY
      }
    case RecurrenceEnum.Weekly:
      return {
        frequency: RRule.WEEKLY
      }
    case RecurrenceEnum.Monthly:
      return {
        frequency: RRule.MONTHLY
      }
    case RecurrenceEnum.Weekdays:
      return {
        frequency: RRule.DAILY,
        weekDays: ['MO', 'TU', 'WE', 'TH', 'FR']
      }
    default:
      return exhaustiveCheck(type)
  }
}
