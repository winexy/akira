import React from 'react'
import {useParams} from 'react-router'
import isUndefined from 'lodash/fp/isUndefined'
import {TaskList} from 'modules/tasks/components/TaskList'
import {PageView} from 'shared/ui/page-view'
import {useTasksListQuery} from 'modules/tasks/hooks'
import {Invariant} from 'shared/lib/debugger'

const TaskListPage: React.FC = () => {
  const {listId} = useParams()

  if (isUndefined(listId)) {
    throw Invariant('TaskListPage can not have nullable listId parameter')
  }

  const {data: list, isLoading} = useTasksListQuery(listId)

  if (isLoading) {
    return (
      <PageView>
        <h1 className="px-4 font-semibold text-2xl">...</h1>
        <div className="px-4">
          <TaskList className="mt-4" isPending={isLoading} tasks={[]} />
        </div>
      </PageView>
    )
  }

  if (isUndefined(list)) {
    return <PageView>Something went wrong</PageView>
  }

  return (
    <PageView>
      <h1 className="px-4 font-semibold text-2xl">{list.title}</h1>
      <section className="px-4">
        <TaskList className="mt-4" isPending={isLoading} tasks={list.tasks} />
      </section>
    </PageView>
  )
}

export default TaskListPage
