import React, {ReactNode} from 'react'
import format from 'date-fns/format'
import {hideBottomSheet, BottomSheet} from 'shared/ui/bottom-sheet'
import {Button} from 'shared/ui/button'

type DatePickerSheetProps = {
  name?: string
  title: React.ReactNode
  date: Date | null
  onApply?(): void
  fixedChildren?: ReactNode
}

export const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
  name = 'datepicker',
  title,
  children,
  date,
  fixedChildren,
  onApply
}) => {
  return (
    <BottomSheet name={name} className="pb-8">
      <h2 className="mt-4 px-4 text-center font-bold text-2xl">{title}</h2>
      <div className="px-4">{children}</div>
      <div className="sticky bottom-0 mt-2 px-4">
        {fixedChildren}
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
