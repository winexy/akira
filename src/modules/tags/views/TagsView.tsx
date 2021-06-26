import React from 'react'
import {MainView} from '@views/MainView'
import {useQuery, useMutation, useQueryClient} from 'react-query'
import {akira} from '@/lib/akira'
import {TagT} from '@store/tasks/types'
import {XIcon} from '@heroicons/react/solid'
import {IconButton} from '@components/IconButton'
import {Spin} from '@/components/Spin'
import isEmpty from 'lodash/fp/isEmpty'
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

  return (
    <MainView withBackNavigation>
      <h2 className="px-4 font-bold text-2xl">Add new tag</h2>
      <CreateTagForm className="p-4" />
      {!isEmpty(tags) && (
        <>
          <h2 className="px-4 font-bold text-2xl">All tags</h2>
          <ul className="mt-2 divide-y">
            {tags.map(tag => (
              <li
                key={tag.id}
                className="flex items-center justify-between px-4 py-2"
              >
                <TaskTag name={tag.name} />
                <IconButton
                  disabled={
                    removeTagMutation.variables === tag.id &&
                    removeTagMutation.isLoading
                  }
                  onClick={() => removeTagMutation.mutate(tag.id)}
                >
                  {removeTagMutation.variables === tag.id &&
                  removeTagMutation.isLoading ? (
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
