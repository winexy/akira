import {useQuery} from 'react-query'
import {TaskTag} from '@modules/tags/types.d'
import {akira} from '@lib/akira'

export function useTagsQuery() {
  return useQuery<TaskTag[]>('tags', akira.tags.findAll)
}