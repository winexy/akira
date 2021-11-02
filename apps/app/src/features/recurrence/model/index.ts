import {values} from 'fp-ts-std/Record'

export enum RecurrenceEnum {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Weekdays = 'weekdays'
}

export const recurrenceTypes = values(RecurrenceEnum)
