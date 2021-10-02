import React from 'react'
import {useParams} from 'react-router'
import {useQuery} from 'react-query'
import isUndefined from 'lodash/fp/isUndefined'
import {api} from '@lib/api'
import {ApiTask} from '@modules/tasks/types.d'
import {TaskList} from '@/modules/tasks/components/TaskList'
import {MainView} from '../MainView'

type ApiList = {
  id: number
  title: string
  // eslint-disable-next-line camelcase
  author_uid: string
  tasks: ApiTask[]
}

const TaskListView: React.FC = () => {
  const {listId} = useParams<{listId: string}>()

  const {data: list, isLoading} = useQuery(['list', listId], () =>
    api.get<ApiList>(`lists/${listId}/tasks`).then(r => r.data)
  )

  if (isLoading) {
    return (
      <MainView>
        <h1 className="px-4 font-semibold text-2xl">...</h1>
        <div className="px-4">
          <TaskList className="mt-4" isPending={isLoading} tasks={[]} />
        </div>
      </MainView>
    )
  }

  if (isUndefined(list)) {
    return <MainView>Something went wrong</MainView>
  }

  return (
    <MainView>
      <h1 className="px-4 font-semibold text-2xl">{list.title}</h1>
      <section className="px-4">
        <TaskList className="mt-4" isPending={isLoading} tasks={list.tasks} />
      </section>
    </MainView>
  )
}

export default TaskListView
