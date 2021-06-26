import React from 'react'
import {MainView} from '@views/MainView'
import {useQuery, useMutation, useQueryClient} from 'react-query'
import {akira} from '@/lib/akira'
import {TagT} from '@store/tasks/types'
import {XIcon} from '@heroicons/react/solid'
import {IconButton} from '@components/IconButton'
import {Spin} from '@/components/Spin'
import isEmpty from 'lodash/fp/isEmpty'
import {Tag} from '@/components/Tag/Tag'
import {CreateTagForm, TaskTag} from '../components'

export const TagsView: React.FC = () => {
  const queryClient = useQueryClient()
  const {data: tags = []} = useQuery<TagT[]>('tags', akira.tags.all)
  const removeTagMutation = useMutation(akira.tags.removeTag, {
    onSuccess(_, tagId) {
      queryClient.setQueryData('tags', () => {
        return tags.filter(tag => tag.id !== tagId)
      })
    }
  })

  const isTagPending = (id: number) =>
    removeTagMutation.isLoading && removeTagMutation.variables === id

  return (
    <MainView withBackNavigation>
      <h2 className="px-4 font-bold text-2xl">Add new tag</h2>
      <CreateTagForm className="p-4" />
      {!isEmpty(tags) && (
        <>
          <h2 className="flex items-center px-4 font-bold text-2xl">
            All tags <span className="ml-4 text-gray-400">{tags.length}</span>
          </h2>
          <ul className="mt-2 divide-y">
            {tags.map(tag => (
              <li
                key={tag.id}
                className="flex items-center justify-between px-4 py-2"
              >
                <TaskTag name={tag.name} />
                <IconButton
                  disabled={isTagPending(tag.id)}
                  onClick={() => removeTagMutation.mutate(tag.id)}
                >
                  {isTagPending(tag.id) ? (
                    <Spin className="text-gray-300 w-4 h-4" />
                  ) : (
                    <XIcon className="w-4 h-4 text-red-500" />
                  )}
                </IconButton>
              </li>
            ))}
          </ul>
        </>
      )}
    </MainView>
  )
}
