import constant from 'lodash/constant'

export const taskConfig = {
  queryKey: {
    One: (taskId: string) => ['tasks', taskId],
    All: constant(['tasks', 'all']),
    MyDay: constant(['tasks', 'myday']),
    Week: constant(['tasks', 'week']),
    List: (taskId: string) => ['tasks', 'lists', taskId],
  },
}
