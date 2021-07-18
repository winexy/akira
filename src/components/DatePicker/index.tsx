import React from 'react'
import ReactDatePicker from 'react-datepicker'
import {BottomSheet} from '@components/BottomSheet/BottomSheet'
import ChevronLeftIcon from '@heroicons/react/solid/ChevronLeftIcon'
import format from 'date-fns/format'
import ChevronRightIcon from '@heroicons/react/solid/ChevronRightIcon'
import {Button} from '@components/Button'
import {hideBottomSheet} from '@store/bottom-sheet'
import './DatePicker.css'

type Props = {
  date: Date | null
  minDate?: Date | null
  maxDate?: Date | null
  onChange(date: Date): void
}

export const DatePicker: React.FC<Props> = ({
  date,
  onChange,
  minDate = null,
  maxDate = null
}) => {
  return (
    <ReactDatePicker
      inline
      selected={date}
      monthsShown={1}
      minDate={minDate}
      maxDate={maxDate}
      className="flex flex-col justify-center"
      renderCustomHeader={params => {
        return (
          <div className="text-gray-700 px-2 flex items-center justify-between">
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
      onChange={date => onChange(date as Date)}
    />
  )
}

type DatePickerSheetProps = {
  date: Date | null
  onApply(): void
}

export const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
  children,
  date,
  onApply
}) => {
  return (
    <BottomSheet name="datepicker" className="pb-8">
      <h2 className="mt-4 px-4 text-center font-bold text-2xl text-gray-700">
        Schedule task
      </h2>
      <div className="px-4">{children}</div>
      <div className="sticky bottom-0 mt-6 px-4">
        <Button
          size="md"
          type="button"
          className="w-full"
          onClick={event => {
            event.stopPropagation()
            hideBottomSheet()
            onApply()
          }}
        >
          Select
          {date && <span className=" ml-auto">{format(date, 'dd.MM.yy')}</span>}
        </Button>
      </div>
    </BottomSheet>
  )
}
