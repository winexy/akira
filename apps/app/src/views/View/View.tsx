import React from 'react'
import {Header} from '@components/Header/Header'
import clsx, {ClassValue} from 'clsx'

export const View: React.FC<{className?: ClassValue}> = ({
  children,
  className
}) => {
  return (
    <>
      <Header />
      <main className={clsx(className)}>{children}</main>
    </>
  )
}
