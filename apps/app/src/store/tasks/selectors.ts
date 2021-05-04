import find from 'lodash/fp/find'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'
import {RootState} from '..'
import {TaskIdT} from './types'

export const selectTasks = (state: RootState) => state.tasks.list

export const selectTask = (id: TaskIdT) => (state: RootState) =>
  find({id}, state.tasks.list)

export const selectCompletedTasksCount = (state: RootState) =>
  size(filter({completed: true}, state.tasks.list))
