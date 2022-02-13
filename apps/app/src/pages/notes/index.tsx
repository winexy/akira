import {PlusIcon} from '@heroicons/react/solid'
import React, {FC, useState} from 'react'
import {useQuery, useMutation} from 'react-query'
import {api} from 'shared/api'
import {PageView} from 'shared/ui/page-view'
import isEmpty from 'lodash/isEmpty'
import {Empty} from 'shared/ui/empty'
import {Button} from 'shared/ui/button'
import {DocumentTextIcon} from '@heroicons/react/outline'
import {useHistory} from 'react-router'
import clsx from 'clsx'
import NotePage from 'pages/note'
import isNull from 'lodash/isNull'

const Notes: FC = () => {
  const history = useHistory()
  const [noteUUID, setNoteUUID] = useState<string | null>(null)

  const {data: notes} = useQuery('notes', () =>
    api
      .get<Array<{uuid: string; title: string}>>('notes/preview')
      .then(res => res.data),
  )
  const createEmptyNoteMutation = useMutation(() =>
    api.post('notes').then(res => res.data),
  )

  async function createEmptyNote() {
    const note = await createEmptyNoteMutation.mutateAsync()
    history.push(`/notes/${note.uuid}`)
  }

  return (
    <PageView className="flex-1 grid grid-cols-12">
      <div className="col-span-3 h-full px-2 border-r border-t dark:border-dark-500">
        <div className="mt-4 px-2 flex justify-between">
          <h1 className="flex items-center font-bold text-3xl">
            <DocumentTextIcon className="mr-2" width={28} height={28} />
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
        {isEmpty(notes) && <Empty message="You haven't created any note" />}
        {Array.isArray(notes) && (
          <ul className="mt-4">
            {notes.map(note => (
              <li key={note.uuid}>
                <button
                  className={clsx(
                    'w-full flex px-2 py-2',
                    'rounded-md dark:text-white',
                    'hover:bg-gray-100 hover:text-blue-500 dark:hover:bg-dark-500',
                    'transition ease-in duration-150',
                    'active:bg-gray-200 active:text-indigo-600',
                    'focus:outline-none focus:bg-gray-100 focus:text-blue-500 dark:focus:bg-dark-400',
                  )}
                  onClick={() => setNoteUUID(note.uuid)}
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
          <NotePage key={noteUUID} uuid={noteUUID} className="flex-1" />
        )}
      </div>
    </PageView>
  )
}

export default Notes
