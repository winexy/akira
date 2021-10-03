import {ApiTask} from 'modules/tasks/types.d'

/* eslint-disable camelcase */
export type TaskList = {
  id: number
  author_uid: string
  title: string
  tasksCount: string
}

export type ApiList = {
  id: number
  title: string
  author_uid: string
  tasks: ApiTask[]
}

export type NewList = {
  id: number
  title: string
  author_uid: string
}
