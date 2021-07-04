import React from 'react'
import {useListsQuery} from '@modules/lists/hooks'
import {TaskLists} from '@modules/lists/components/TaskLists'
import {MainView} from '../MainView'

export const ListsView: React.FC = () => {
  const {data: lists} = useListsQuery()

  return <MainView>{lists && <TaskLists lists={lists} />}</MainView>
}
