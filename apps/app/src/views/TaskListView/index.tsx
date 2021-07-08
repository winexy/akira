import React from 'react'
import {useParams} from 'react-router'
import {useQuery} from 'react-query'
import isUndefined from 'lodash/fp/isUndefined'
import {api} from '@lib/api'
import {TaskT} from '@store/tasks/types'
import {Tasks} from '@components/Tasks'
import {MainView} from '../MainView'

type ApiList = {
  id: number
  title: string
  // eslint-disable-next-line camelcase
  author_uid: string
  tasks: TaskT[]
}

export const TaskListView: React.FC = () => {
  const {listId} = useParams<{listId: string}>()

  const {data: list, isLoading} = useQuery(['list', listId], () =>
    api.get<ApiList>(`lists/${listId}/tasks`).then(r => r.data)
  )

  if (isLoading) {
    return (
      <MainView>
        <h1 className="px-4 font-semibold text-2xl text-gray-700">...</h1>
        <Tasks className="mt-4" isPending={isLoading} tasks={[]} />
      </MainView>
    )
  }

  if (isUndefined(list)) {
    return <MainView>Something went wrong</MainView>
  }

  return (
    <MainView>
      <h1 className="px-4 font-semibold text-2xl text-gray-700">
        {list.title}
      </h1>
      <Tasks className="mt-4" isPending={isLoading} tasks={list.tasks} />
    </MainView>
  )
}
