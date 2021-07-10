import map from 'lodash/fp/map'
import React from 'react'
import ContentLoader from 'react-content-loader'
import isUndefined from 'lodash/fp/isUndefined'
import isEmpty from 'lodash/fp/isEmpty'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {PencilAltIcon} from '@heroicons/react/solid'

import {
  useAddTaskTagMutation,
  useRemoveTaskTagMutation
} from '@modules/tasks/hooks'
import {ApiTask} from '@modules/tasks/types.d'
import {Button} from '@components/Button'
import {TaskTag} from './TaskTag'
import {useTagsQuery} from '../hooks/index'

export const TagsManager: React.FC<{task: ApiTask}> = ({task}) => {
  const {data: tags, isLoading} = useTagsQuery()
  const taskTagsIdSet = new Set(map('id', task.tags))

  const addTagMutation = useAddTaskTagMutation(task)
  const removeTaskTagMutation = useRemoveTaskTagMutation(task)

  return (
    <>
      <h2 className="px-4 font-bold text-2xl text-gray-700">Tags</h2>
      {isLoading && (
        <ContentLoader
          speed={2}
          width={320}
          height={214}
          className="mt-4"
          viewBox="0 0 320 214"
          backgroundColor="#ffffff"
          foregroundColor="#e9e9e9"
        >
          <rect x="0" y="0" width="100%" height="42" />
          <rect x="0" y="43" width="100%" height="42" />
          <rect x="0" y="86" width="100%" height="42" />
          <rect x="0" y="129" width="100%" height="42" />
          <rect x="0" y="172" width="100%" height="42" />
        </ContentLoader>
      )}
      {!isUndefined(tags) && !isEmpty(tags) && (
        <ul className="mt-2 divide-y">
          {tags.map(tag => (
            <li key={tag.id} className="flex items-center px-4 py-2">
              <TaskTag name={tag.name} />
              {taskTagsIdSet.has(tag.id) ? (
                <Button
                  className="ml-auto text-xs"
                  variant="red"
                  onClick={() => removeTaskTagMutation.mutate(tag)}
                >
                  remove
                </Button>
              ) : (
                <Button
                  className="ml-auto text-xs"
                  onClick={() => addTagMutation.mutate(tag)}
                >
                  add tag
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div
        className={clsx(
          'px-4 py-3 sticky bottom-0',
          'bg-white border-t',
          'transition ease-in duration-150',
          'active:bg-gray-100'
        )}
      >
        <Link to="/tags" className="flex justify-between items-center ">
          <h3 className="font-bold text-xl">Edit tags</h3>
          <PencilAltIcon className="w-5 h-5" />
        </Link>
      </div>
    </>
  )
}
