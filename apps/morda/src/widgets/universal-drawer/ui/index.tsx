import React, {FC} from 'react'
import {bottomSheetModel, BottomSheet} from 'shared/ui/bottom-sheet'
import {Drawer} from 'shared/ui/drawer'

type Props = {
  name: string
  className?: string
}

export const UniversalDrawer: FC<Props> = ({name, className, children}) => {
  const bottomSheetProps = bottomSheetModel.useBottomSheet(name)
  const isDesktop = globalThis.matchMedia('(min-width: 640px)').matches

  return isDesktop ? (
    <Drawer
      visible={bottomSheetProps.isVisible}
      className={className}
      onClose={() => bottomSheetModel.hideBottomSheet()}
    >
      {children}
    </Drawer>
  ) : (
    <BottomSheet.UI {...bottomSheetProps} className={className}>
      {children}
    </BottomSheet.UI>
  )
}
