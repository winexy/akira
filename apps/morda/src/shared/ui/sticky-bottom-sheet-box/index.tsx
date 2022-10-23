import React from 'react'

export const StickyBottomSheetBox: React.FC<{
  children: React.ReactNode
}> = ({children}) => (
  <div className="sticky bottom-0 px-4 pt-4 pb-6 border-t border-gray-100 dark:border-dark-500">
    {children}
  </div>
)
