import React from 'react'
import {useNavigate} from 'react-router'
import clsx from 'clsx'
import isUndefined from 'lodash/fp/isUndefined'
import {ChevronLeftIcon} from '@heroicons/react/solid'
import {Header} from 'shared/ui/header'

type ViewProps = {
  id?: string
  className?: string
  header?: React.ReactNode
  withBackNavigation?: boolean
  children: React.ReactNode
}

export const PageView: React.FC<ViewProps> = ({
  id,
  children,
  className,
  header,
  withBackNavigation = false,
}) => {
  const navigate = useNavigate()
  const canGoBack = window.history.length > 2

  const defaultHeader =
    withBackNavigation && canGoBack ? (
      <Header>
        <button
          className="-ml-1 flex items-center font-bold active:text-gray-500 rounded focus:outline-none"
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon className="w-6 h-6 mr-1" />
          Return
        </button>
      </Header>
    ) : (
      <Header />
    )

  return (
    <>
      {isUndefined(header) ? defaultHeader : header}
      <main
        id={id}
        className={clsx(
          'bg-white text-gray-700 dark:bg-dark-600 dark:text-white',
          className,
        )}
      >
        {children}
      </main>
    </>
  )
}
