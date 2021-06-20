import React from 'react'
import clsx, {ClassValue} from 'clsx'
import {Header} from '@components/Header/Header'
import isUndefined from 'lodash/fp/isUndefined'

type ViewProps = {
  className?: ClassValue
  header?: React.ReactChild
}

export const MainView: React.FC<ViewProps> = ({
  children,
  className,
  header
}) => {
  return (
    <>
      {isUndefined(header) ? <Header /> : header}
      <main className={clsx(className)}>{children}</main>
    </>
  )
}
