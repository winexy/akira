import {
  useTasksQuery,
  useTaskQuery,
  useMyDayQuery,
  useWeekQuery,
  useTasksListQuery,
} from './queries'
import {
  usePatchTaskMutation,
  useRemoveTaskMutation,
  useToggleCompletedMutation,
  useToggleImportantMutation,
} from './mutations'

export const taskModel = {
  useTaskQuery,
  useTasksQuery,
  useMyDayQuery,
  useWeekQuery,
  useTasksListQuery,
  usePatchTaskMutation,
  useRemoveTaskMutation,
  useToggleCompletedMutation,
  useToggleImportantMutation,
}
