import {useQuery} from 'react-query'
import {akira} from '@lib/akira'

export function useListsQuery() {
  return useQuery('lists', akira.lists.findAll)
}
