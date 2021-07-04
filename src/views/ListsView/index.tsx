import React from 'react'
import {TaskLists} from '@modules/lists/components/TaskLists'
import {MainView} from '../MainView'

export const ListsView: React.FC = () => {
  return (
    <MainView>
      <TaskLists />
    </MainView>
  )
}
