import React from 'react'
import {Route, Switch, useHistory, useRouteMatch} from 'react-router'
import {MainView} from '@/views/MainView'
import {DatePicker} from '@/components/DatePicker'
import format from 'date-fns/format'
import {api} from '@lib/api'
import {useQuery} from 'react-query'
import subDays from 'date-fns/subDays'
import {Match} from '@/components/Match'
import isUndefined from 'lodash/fp/isUndefined'
import get from 'lodash/fp/get'
import clsx from 'clsx'
import parseISO from 'date-fns/parseISO'
import {CheckIcon, ExternalLinkIcon, FireIcon} from '@heroicons/react/solid'
import {Link} from 'react-router-dom'
import ContentLoader from 'react-content-loader'
import {ApiTask} from '../tasks/types.d'

type Report = {
  date: string
  tasks: Array<ApiTask>
}

function useReportQuery(date: string) {
  return useQuery<Report>(['report', date], () => {
    return api.get(`reports?date=${date}`).then(res => res.data)
  })
}

const ReportLoader = (
  <ContentLoader
    speed={2}
    width="100%"
    className="mt-4"
    height="128px"
    backgroundColor="#ffffff"
    foregroundColor="#e9e9e9"
  >
    <rect x="0" y={0} rx="6" ry="6" width="60%" height={24} />
    <rect x="70%" y={0} rx="6" ry="6" width="30%" height={24} />
    <rect x="0" y={32} rx="6" ry="6" width="40%" height={20} />
    <rect x="0" y={64} rx="6" ry="6" width="100%" height={60} />
  </ContentLoader>
)

function ReportView() {
  const match = useRouteMatch<{date: string}>()
  const {date} = match.params

  const {data: report, isLoading, isError, error} = useReportQuery(date)

  return (
    <MainView className="px-4" withBackNavigation>
      <h1 className="flex items-center font-bold text-3xl text-gray-600">
        Report
        <span className="ml-auto">{date.replaceAll('-', '/')}</span>
      </h1>
      <Match>
        <Match.Case when={isLoading}>
          {ReportLoader}
          {ReportLoader}
        </Match.Case>
        <Match.Case when={isError}>
          <p className="mt-4">Error occured: {get('message', error)}</p>
        </Match.Case>
        <Match.Case when={!isUndefined(report)}>
          <ul className="mt-4 text-gray-600 space-y-2">
            {report?.tasks.map(task => (
              <li key={task.id}>
                <div>
                  <div className="flex items-center">
                    <h2
                      className={clsx('font-semibold text-xl truncate', {
                        'line-through': task.is_completed
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
                      className="ml-auto flex items-center text-blue-500 active:text-blue-600"
                    >
                      <ExternalLinkIcon className="w-5 h-5 mr-2" /> Link
                    </Link>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Updated at: {format(parseISO(task.updated_at), 'HH:mm:ss')}
                  </p>
                  <p className="mt-2">{task.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Match.Case>
      </Match>
    </MainView>
  )
}

const yesterday = subDays(new Date(), 1)

export const ReportsView: React.FC = () => {
  const history = useHistory()

  function onDateSelect(dateInstance: Date) {
    history.push(`/reports/${format(dateInstance, 'Y-MM-dd')}`)
  }

  return (
    <Switch>
      <Route exact path="/reports/:date">
        <ReportView />
      </Route>
      <Route exact>
        <MainView className="px-4">
          <h1 className="font-bold text-3xl text-gray-600">Select day</h1>
          <DatePicker
            maxDate={yesterday}
            className="mt-6"
            onChange={onDateSelect}
          />
        </MainView>
      </Route>
    </Switch>
  )
}
