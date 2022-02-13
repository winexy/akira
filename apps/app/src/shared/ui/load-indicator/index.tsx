import React, {FC} from 'react'
import clsx from 'clsx'
import './index.css'

export const LoadIndicator: FC<{className?: string}> = ({className}) => {
  return (
    <div className={clsx('dots-loader', className)}>
      <div className="dots-loader__dot" />
      <div className="dots-loader__dot" />
      <div className="dots-loader__dot" />
    </div>
  )
}
