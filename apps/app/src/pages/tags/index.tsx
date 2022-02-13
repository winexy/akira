import React from 'react'
import {PageView} from 'shared/ui/page-view'
import {useMutation, useQueryClient} from 'react-query'
import {akira} from 'shared/api/akira'
import {XIcon} from '@heroicons/react/solid'
import {IconButton} from 'shared/ui/icon-button'
import {Spin} from 'shared/ui/spin'
import isEmpty from 'lodash/fp/isEmpty'
import {CreateTagForm, TaskTag} from 'modules/tags/components'
import {useTagsQuery} from 'modules/tags/hooks'
import {List} from 'shared/ui/list'

const TagsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const {data: tags = []} = useTagsQuery()
  const removeTagMutation = useMutation(akira.tags.remove, {
    onSuccess(_, tagId) {
      queryClient.setQueryData('tags', () => {
        return tags.filter(tag => tag.id !== tagId)
      })
    },
  })

  const isTagPending = (id: number) =>
    removeTagMutation.isLoading && removeTagMutation.variables === id

  return (
    <PageView withBackNavigation>
      <h2 className="px-4 font-bold text-2xl">Add new tag</h2>
      <CreateTagForm className="p-4" />
      {!isEmpty(tags) && (
        <>
          <h2 className="flex items-center px-4 font-bold text-2xl">
            All tags <span className="ml-4 text-gray-400">{tags.length}</span>
          </h2>
          <List className="mt-2">
            {tags.map(tag => (
              <List.Item key={tag.id} className="justify-between px-4 py-2">
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
              </List.Item>
            ))}
          </List>
        </>
      )}
    </PageView>
  )
}

export default TagsPage
