import React from 'react'
import {Route, Routes, useNavigate, useParams} from 'react-router'
import {PageView} from 'shared/ui/page-view'
import {DatePicker} from 'shared/ui/datepicker'
import format from 'date-fns/format'
import {api} from 'shared/api'
import {useQuery} from 'react-query'
import {Match} from 'shared/ui/match'
import isUndefined from 'lodash/fp/isUndefined'
import get from 'lodash/fp/get'
import clsx from 'clsx'
import parseISO from 'date-fns/parseISO'
import {CheckIcon, ExternalLinkIcon, FireIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import ContentLoader from 'react-content-loader'
import isEmpty from 'lodash/fp/isEmpty'
import {useShimmerColors} from 'shared/ui/shimmer'
import {ApiTask} from 'modules/tasks/types.d'
import {Empty} from 'shared/ui/empty'

type Report = {
  date: string
  tasks: Array<ApiTask>
}

function useReportQuery(date: string) {
  return useQuery<Report>(['report', date], () => {
    return api
      .get(`reports?date=${date}`)
      .then(res => res.data)
      .catch(error => {
        if (error.type === 'NotFound') {
          return {
            date,
            tasks: [],
          }
        }

        return Promise.reject(error)
      })
  })
}

const ReportLoader: React.FC = () => {
  const {backgroundColor, foregroundColor} = useShimmerColors()

  return (
    <ContentLoader
      speed={2}
      width="100%"
      className="mt-4"
      height="128px"
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x="0" y={0} rx="6" ry="6" width="60%" height={24} />
      <rect x="70%" y={0} rx="6" ry="6" width="30%" height={24} />
      <rect x="0" y={32} rx="6" ry="6" width="40%" height={20} />
      <rect x="0" y={64} rx="6" ry="6" width="100%" height={60} />
    </ContentLoader>
  )
}

function ReportView() {
  const {date = ''} = useParams()
  const {data: report, isLoading, isError, error} = useReportQuery(date)

  return (
    <PageView className="px-4" withBackNavigation>
      <h1 className="flex items-center font-bold text-3xl">
        Report
        <span className="ml-auto">{date.replaceAll('-', '/')}</span>
      </h1>
      <Match>
        <Match.Case when={isLoading}>
          <ReportLoader />
        </Match.Case>
        <Match.Case when={isError}>
          <p className="mt-4">Error occured: {get('message', error)}</p>
        </Match.Case>
        <Match.Case when={!isUndefined(report)}>
          {isEmpty(report?.tasks) ? (
            <Empty message="Looks like you've done nothing" />
          ) : (
            <ul className="mt-4 space-y-2">
              {report?.tasks.map(task => (
                <li key={task.id}>
                  <div>
                    <div className="flex items-center">
                      <h2
                        className={clsx('font-semibold text-xl truncate', {
                          'line-through': task.is_completed,
                        })}
                      >
                        {task.title}
                      </h2>
                      <div className="ml-2 mr-4 flex space-x-2">
                        {task.is_completed && (
                          <CheckIcon className="w-6 h-6 text-green-500" />
                        )}
                        {task.is_important && (
                          <FireIcon className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <Link
                        to={`/tasks/${task.id}`}
                        className="ml-auto flex items-center text-blue-500 dark:text-blue-400 active:text-blue-600"
                      >
                        <ExternalLinkIcon className="w-5 h-5 mr-2" /> Link
                      </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Updated at:{' '}
                      {format(parseISO(task.updated_at), 'HH:mm:ss')}
                    </p>
                    <p className="mt-2">{task.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Match.Case>
      </Match>
    </PageView>
  )
}

const ReportsView: React.FC = () => {
  const navigate = useNavigate()

  function onDateSelect(dateInstance: Date) {
    navigate(`/reports/${format(dateInstance, 'Y-MM-dd')}`)
  }

  return (
    <Routes>
      <Route path=":date" element={<ReportView />} />
      <Route
        path="/"
        element={
          <PageView className="px-4">
            <h1 className="font-bold text-3xl">Select day</h1>
            <DatePicker
              maxDate={new Date()}
              className="mt-6"
              onChange={onDateSelect}
            />
          </PageView>
        }
      />
    </Routes>
  )
}

export default ReportsView
