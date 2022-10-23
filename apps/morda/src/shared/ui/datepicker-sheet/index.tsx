import React, {ReactNode} from 'react'
import format from 'date-fns/format'
import {Button} from 'shared/ui/button'
import {UniversalDrawer, universalDrawerModel} from 'widgets/universal-drawer'
import isFunction from 'lodash/isFunction'

type FixedChildrenProps = {
  hide(): void
}

type DatePickerSheetProps = {
  name?: string
  title: React.ReactNode
  date: Date | null
  onApply?(): void
  fixedChildren?: ReactNode | ((props: FixedChildrenProps) => ReactNode)
}

export const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
  name = 'datepicker',
  title,
  children,
  date,
  fixedChildren,
  onApply,
}) => {
  const hide = () => universalDrawerModel.hideDrawer()
  return (
    <UniversalDrawer
      name={name}
      className="pb-8 md:pb-4 md:pt-0 md:w-96 md:flex flex-col"
    >
      <h2 className="mt-4 px-4 text-center font-bold text-2xl">{title}</h2>
      <div className="px-4">{children}</div>
      <div className="mt-auto sticky bottom-0 px-4">
        {isFunction(fixedChildren) ? fixedChildren({hide}) : fixedChildren}
        <Button
          size="md"
          type="button"
          className="mt-4 w-full"
          onClick={event => {
            event.stopPropagation()
            hide()
            onApply?.()
          }}
        >
          Select
          {date && <span className=" ml-auto">{format(date, 'dd.MM.yy')}</span>}
        </Button>
      </div>
    </UniversalDrawer>
  )
}
