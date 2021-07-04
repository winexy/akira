import {useQuery} from 'react-query'
import {TagT} from '@store/tasks'
import {akira} from '@lib/akira'

export function useTagsQuery() {
  return useQuery<TagT[]>('tags', akira.tags.findAll)
}
