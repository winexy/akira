import {PlusIcon} from '@heroicons/react/solid'
import React, {FC, useState} from 'react'
import {useQuery, useMutation} from 'react-query'
import {api} from 'shared/api'
import {PageView} from 'shared/ui/page-view'
import isEmpty from 'lodash/isEmpty'
import {Empty} from 'shared/ui/empty'
import {DocumentTextIcon} from '@heroicons/react/outline'
import {useHistory, useLocation} from 'react-router'
import clsx from 'clsx'
import NotePage from 'pages/note'
import isNull from 'lodash/isNull'
import ContentLoader from 'react-content-loader'
import {useShimmerColors} from 'shared/ui/shimmer'
import {noteModel, noteApi} from 'entities/note'

const Notes: FC = () => {
  const {search} = useLocation()
  const history = useHistory()
  const [noteUUID, setNoteUUID] = useState<string | null>(() => {
    return new URLSearchParams(search).get('id')
  })
  const {backgroundColor, foregroundColor} = useShimmerColors()

  const {data: notes, isLoading} = useQuery(noteModel.NoteQuery.Preview(), () =>
    noteApi.fetchNotesPreview(),
  )

  const createEmptyNoteMutation = useMutation(() =>
    api.post('notes').then(res => res.data),
  )

  async function createEmptyNote() {
    const note = await createEmptyNoteMutation.mutateAsync()
    history.push(`/notes/${note.uuid}`)
  }

  const selectNote = (id: string) => {
    setNoteUUID(id)
    history.replace({search: `id=${id}`})
  }

  return (
    <PageView className="flex-1 grid grid-cols-12">
      <div className="col-span-3 h-full px-2 border-r border-t dark:border-dark-500">
        <div className="mt-4 px-2 flex justify-between">
          <h1 className="flex items-center font-bold text-2xl lg:text-3xl">
            <DocumentTextIcon className="mr-2 w-6 h-6 lg:w-7 lg:h-7" />
            All notes
          </h1>
          <button
            disabled={createEmptyNoteMutation.isLoading}
            className={clsx(
              'w-10 h-10 border rounded-lg dark:border-dark-400',
              'flex items-center justify-center',
              'transition',
              'hover:border-gray-300 dark:hover:border-dark-300',
              'active:bg-gray-100 dark:active:bg-dark-500',
              'focus:outline-none focus:border-blue-500 dark:focus:border-blue-500',
            )}
            onClick={createEmptyNote}
          >
            <PlusIcon width={32} height={32} />
          </button>
        </div>
        {isLoading && (
          <ContentLoader
            className="mt-4 px-2"
            width="100%"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <rect x="0" y="0" rx="8" ry="8" width="90%" height="24" />
            <rect x="0" y="32" rx="8" ry="8" width="70%" height="24" />
            <rect x="0" y="64" rx="8" ry="8" width="80%" height="24" />
            <rect x="0" y="96" rx="8" ry="8" width="60%" height="24" />
            <rect x="0" y="128" rx="8" ry="8" width="40%" height="24" />
          </ContentLoader>
        )}
        {!isLoading && isEmpty(notes) && (
          <Empty message="You haven't created any note" />
        )}
        {Array.isArray(notes) && (
          <ul className="mt-4">
            {notes.map(note => (
              <li key={note.uuid}>
                <button
                  className={clsx(
                    'w-full flex items-center px-2 py-2',
                    'rounded-md dark:text-white',
                    'hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-dark-500',
                    'transition ease-in duration-150',
                    'active:bg-gray-200 active:text-indigo-600',
                    'focus:outline-none focus:bg-gray-100 focus:text-blue-500 dark:focus:bg-dark-400',
                  )}
                  onClick={() => selectNote(note.uuid)}
                >
                  {note.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t col-span-9 flex dark:border-dark-500">
        {!isNull(noteUUID) && (
          <NotePage key={noteUUID} id={noteUUID} className="flex-1" />
        )}
      </div>
    </PageView>
  )
}

export default Notes
