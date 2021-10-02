import React from 'react'
import {TaskLists} from '@modules/lists/components/TaskLists'
import {MainView} from '../MainView'

const ListsView: React.FC = () => {
  return (
    <MainView>
      <div className="px-4 flex items-center">
        <h1 className="flex items-center font-semibold text-3xl ">Lists</h1>
      </div>
      <TaskLists className="mt-2 border-t border-gray-100" />
    </MainView>
  )
}

export default ListsView
