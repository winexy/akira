import React from 'react'
import clsx from 'clsx'
import addDays from 'date-fns/addDays'
import {Button} from 'shared/ui/button'

type Props = {
  className?: string
  onPick(date: Date): void
}

export const DatePickerShortcut: React.FC<Props> = ({className, onPick}) => {
  return (
    <div className={clsx('flex gap-4', className)}>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 shadow-sm"
        onClick={() => {
          onPick(new Date())
        }}
      >
        Today
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 shadow-sm"
        onClick={() => {
          onPick(addDays(new Date(), 1))
        }}
      >
        Tomorrow
      </Button>
    </div>
  )
}
