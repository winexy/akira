import React from 'react'
import clsx from 'clsx'
import {Header} from '@components/Header/Header'
import isUndefined from 'lodash/fp/isUndefined'
import {useHistory} from 'react-router'
import {ChevronLeftIcon} from '@heroicons/react/solid'

type ViewProps = {
  className?: string
  header?: React.ReactChild
  withBackNavigation?: boolean
}

export const PageView: React.FC<ViewProps> = ({
  children,
  className,
  header,
  withBackNavigation = false
}) => {
  const history = useHistory()
  const canGoBack = history.length > 2

  const defaultHeader =
    withBackNavigation && canGoBack ? (
      <Header>
        <button
          className="-ml-1 flex items-center font-bold active:text-gray-500 rounded focus:outline-none"
          onClick={history.goBack}
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
        className={clsx(
          'bg-white text-gray-700 dark:bg-dark-600 dark:text-white',
          className
        )}
      >
        {children}
      </main>
    </>
  )
}
