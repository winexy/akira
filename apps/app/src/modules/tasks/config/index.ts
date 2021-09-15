export enum TaskQueryKeyEnum {
  Week = 'week',
  MyDay = 'myday',
  All = 'tasks'
}

export const TaskQuery = {
  One: (taskId: string) => ['task', taskId],
  All: () => ['tasks'],
  MyDay: () => ['tasks'],
  Week: () => ['week']
}
