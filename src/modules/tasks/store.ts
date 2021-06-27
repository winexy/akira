import map from 'lodash/fp/map'
import {app} from '@store/app'
import {TaskIdT, TaskT} from '@/store/tasks'

export const onMyDayTaskAdded = app.event<TaskIdT>()
export const onMyDayTaskRemoved = app.event<TaskIdT>()
export const onMyDayFetch = app.event<TaskT[]>()

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
