import RRule, {Frequency, WeekdayStr} from 'rrule'
import {exhaustiveCheck} from 'shared/lib/utils'
import {RecurrenceEnum} from '../model'

export type CustomRecurrenceType =
  | RecurrenceEnum.Daily
  | RecurrenceEnum.Monthly
  | RecurrenceEnum.Weekly

function matchFrequency(type: CustomRecurrenceType) {
  switch (type) {
    case RecurrenceEnum.Daily:
      return RRule.DAILY
    case RecurrenceEnum.Weekly:
      return RRule.WEEKLY
    case RecurrenceEnum.Monthly:
      return RRule.MONTHLY
    default:
      return exhaustiveCheck(type)
  }
}

export function makeCustomRule(
  type: CustomRecurrenceType,
  interval: number
): RecurrenceParams {
  return {
    frequency: matchFrequency(type),
    interval
  }
}

export type RecurrenceParams = {
  frequency: Frequency
  interval?: number
  weekDays?: Array<WeekdayStr>
}

export function makeRecurrencePayload(
  type: Exclude<RecurrenceEnum, RecurrenceEnum.Custom>
): RecurrenceParams {
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
