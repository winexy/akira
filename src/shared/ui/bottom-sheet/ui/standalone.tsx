import React from 'react'
import * as bottomSheetModel from '../model'
import {BottomSheet} from './bottom-sheet'

type Props = {
  name: string
  className?: string
}

export const BottomSheetStandalone: React.FC<Props> = ({
  name,
  children,
  className
}) => {
  const props = bottomSheetModel.useBottomSheet(name)

  return (
    <BottomSheet className={className} {...props}>
      {children}
    </BottomSheet>
  )
}
