import {useQuery} from 'react-query'
import {akira} from 'shared/api/akira'

export type TaskTag = {
  hex_bg: string
  hex_color: string
  id: number
  name: string
  uid: string
}

export function useTagsQuery() {
  return useQuery<TaskTag[]>('tags', akira.tags.findAll)
}
