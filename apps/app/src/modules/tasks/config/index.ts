import constant from 'lodash/constant'

export const TaskQuery = {
  One: (taskId: string) => ['task', taskId],
  All: constant(['tasks']),
  MyDay: constant(['myday']),
  Week: constant(['week'])
}
