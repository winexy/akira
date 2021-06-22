import {TaskIdT, TaskT} from '@store/tasks/types'
import compareAsc from 'date-fns/compareAsc'
import parseISO from 'date-fns/parseISO'

export enum SortEnum {
  ImportantASC = 'Important::ASC',
  ImportantDESC = 'Important::DESC',
  CompletedASC = 'Completed::ASC',
  CompletedDESC = 'Completed::DESC'
}

function compareBy(
  key: 'is_important' | 'is_completed',
  taskA: TaskT,
  taskB: TaskT
) {
  if (taskA[key] && !taskB[key]) return -1
  if (taskB[key] && !taskA[key]) return 1
  return 0
}

function compareByCreatedAt(taskA: TaskT, taskB: TaskT) {
  return compareAsc(parseISO(taskA.created_at), parseISO(taskB.created_at))
}

export function sortTasks(
  tasksIds: TaskIdT[],
  tasksById: Record<TaskIdT, TaskT>,
  sortType: SortEnum | null
) {
  return tasksIds.slice().sort((taskIdA, taskIdB) => {
    const taskA = tasksById[taskIdA]
    const taskB = tasksById[taskIdB]

    switch (sortType) {
      case SortEnum.ImportantASC:
        return compareBy('is_important', taskA, taskB)
      case SortEnum.ImportantDESC:
        return compareBy('is_important', taskA, taskB) * -1
      case SortEnum.CompletedASC:
        return compareBy('is_completed', taskA, taskB)
      case SortEnum.CompletedDESC:
        return compareBy('is_completed', taskA, taskB) * -1
      default: {
        return compareByCreatedAt(taskA, taskB)
      }
    }
  })
}
