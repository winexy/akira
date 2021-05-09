import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'
import find from 'lodash/fp/find'
import {RootState} from '..'
import {TaskIdT, TodoIdT} from './types'

export const selectTasks = (state: RootState) => state.tasks.list

export const selectTask = (id: TaskIdT) => (state: RootState) =>
  state.tasks.byId[id]

export const selectCompletedTasksCount = (state: RootState) =>
  size(filter(id => state.tasks.byId[id].is_completed, state.tasks.list))

export const selectTaskTodo = (taskId: TaskIdT, todoId: TodoIdT) => (
  state: RootState
) => {
  const {checklist} = state.tasks.byId[taskId]
  return find({id: todoId}, checklist)
}
