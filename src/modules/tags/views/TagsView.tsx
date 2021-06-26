import React from 'react'
import {MainView} from '@views/MainView'
import {useQuery} from 'react-query'
import {akira} from '@/lib/akira'
import {TagT} from '@store/tasks/types'
import {CreateTagForm, TaskTag} from '../components'

export const TagsView: React.FC = () => {
  const {data: tags = [], isLoading} = useQuery<TagT[]>('tags', akira.tags.all)

  return (
    <MainView>
      <h2 className="px-4 font-bold text-2xl">Add new tag</h2>
      <CreateTagForm className="p-4" />
      <ul className="mt-2 divide-y">
        {tags.map(tag => (
          <li key={tag.id} className="flex items-center px-4 py-2">
            <TaskTag name={tag.name} />
          </li>
        ))}
      </ul>
    </MainView>
  )
}
