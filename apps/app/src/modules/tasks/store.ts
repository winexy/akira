import map from 'lodash/fp/map'
import {app} from '@store/app'
import {TaskId, ApiTask} from '@modules/tasks/types.d'

export const onMyDayTaskAdded = app.event<TaskId>()
export const onMyDayTaskRemoved = app.event<TaskId>()
export const onMyDayFetch = app.event<ApiTask[]>()

export const $myDayTasksIds = app
  .store(new Set())
  .on(onMyDayFetch, (_, tasks) => {
    return new Set(map('id', tasks))
  })
  .on(onMyDayTaskAdded, (set, taskId) => {
    const newSet = new Set(set)
    newSet.add(taskId)
    return newSet
  })
  .on(onMyDayTaskRemoved, (set, taskId) => {
    const newSet = new Set(set)
    newSet.delete(taskId)
    return newSet
  })
