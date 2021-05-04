import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'
import {RootState} from '..'
import {TaskIdT} from './types'

export const selectTasks = (state: RootState) => state.tasks.list

export const selectTask = (id: TaskIdT) => (state: RootState) =>
  state.tasks.byId[id]

export const selectCompletedTasksCount = (state: RootState) =>
  size(filter(id => state.tasks.byId[id].completed, state.tasks.list))
