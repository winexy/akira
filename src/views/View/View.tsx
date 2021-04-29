import React from 'react'
import {Header} from '@components/Header/Header'

export const View: React.FC = ({children}) => {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
