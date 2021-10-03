import {useQuery} from 'react-query'
import {akira} from 'shared/api/akira'

export function useListsQuery() {
  return useQuery('lists', akira.lists.findAll)
}
