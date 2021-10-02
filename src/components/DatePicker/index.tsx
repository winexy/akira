import React from 'react'
import ReactDatePicker from 'react-datepicker'
import {BottomSheet} from '@components/BottomSheet/BottomSheet'
import ChevronLeftIcon from '@heroicons/react/solid/ChevronLeftIcon'
import format from 'date-fns/format'
import ChevronRightIcon from '@heroicons/react/solid/ChevronRightIcon'
import {Button} from '@shared/ui/button'
import {hideBottomSheet} from '@store/bottom-sheet'
import './DatePicker.css'
import clsx from 'clsx'

type Props = {
  date?: Date | null
  minDate?: Date | null
  maxDate?: Date | null
  onChange(date: Date): void
  className?: string
}

const ChangeMonth: React.FC<{isDisabled: boolean; onClick(): void}> = ({
  isDisabled,
  onClick,
  children
}) => {
  return (
    <button
      className={clsx(
        'w-10 h-10',
        'flex items-center justify-center',
        'bg-white dark:bg-dark-500 rounded-lg shadow-sm',
        'border border-gray-200 dark:border-dark-400',
        'transition ease-in duration-150',
        'active:bg-gray-100',
        'focus:outline-none',
        'disabled:text-gray-200 dark:disabled:text-dark-400',
        'disabled:bg-transparent dark:disabled:bg-transparent'
      )}
      type="button"
      disabled={isDisabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export const DatePicker: React.FC<Props> = ({
  date = null,
  onChange,
  minDate = null,
  maxDate = null,
  className
}) => {
  return (
    <ReactDatePicker
      inline
      selected={date}
      monthsShown={1}
      minDate={minDate}
      maxDate={maxDate}
      className={clsx('flex flex-col justify-center', className)}
      renderCustomHeader={params => {
        return (
          <div className="py-4 px-2 flex items-center justify-between">
            <ChangeMonth
              isDisabled={params.prevMonthButtonDisabled}
              onClick={params.decreaseMonth}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </ChangeMonth>
            <strong className="font-semibold text-xl">
              {format(params.date, 'LLLL')}
            </strong>
            <ChangeMonth
              isDisabled={params.nextMonthButtonDisabled}
              onClick={params.increaseMonth}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </ChangeMonth>
          </div>
        )
      }}
      onChange={date => onChange(date as Date)}
    />
  )
}

type DatePickerSheetProps = {
  name?: string
  date: Date | null
  onApply?(): void
}

export const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
  name = 'datepicker',
  children,
  date,
  onApply
}) => {
  return (
    <BottomSheet name={name} className="pb-8">
      <h2 className="mt-4 px-4 text-center font-bold text-2xl">
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
            onApply?.()
          }}
        >
          Select
          {date && <span className=" ml-auto">{format(date, 'dd.MM.yy')}</span>}
        </Button>
      </div>
    </BottomSheet>
  )
}
