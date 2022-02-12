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

const Notes: FC = () => {
  const history = useHistory()
  const [noteUUID, setNoteUUID] = useState<string>(null)

  const {data: notes} = useQuery('notes', () =>
    api
      .get<Array<{uuid: string; title: string}>>('notes/preview')
      .then(res => res.data)
  )
  const createEmptyNoteMutation = useMutation(() =>
    api.post('notes').then(res => res.data)
  )

  async function createEmptyNote() {
    const note = await createEmptyNoteMutation.mutateAsync()
    history.push(`/notes/${note.uuid}`)
  }

  return (
    <PageView className="flex-1 grid grid-cols-12">
      <div className="col-span-3 h-full px-2 border-r border-t">
        <div className="mt-4 px-2 flex justify-between">
          <h1 className="font-bold text-4xl">All notes</h1>
          <Button
            disabled={createEmptyNoteMutation.isLoading}
            variant="outline"
            onClick={createEmptyNote}
          >
            <PlusIcon width={32} height={32} />
          </Button>
        </div>
        {isEmpty(notes) && <Empty message="You haven't created any note" />}
        {Array.isArray(notes) && (
          <ul className="mt-4 space-y-1">
            {notes.map(note => (
              <li key={note.uuid}>
                <button
                  className={clsx(
                    'w-full flex px-2 py-2',
                    'rounded-md',
                    'hover:bg-gray-100',
                    'transition',
                    'hover:text-blue-400 active:text-indigo-500',
                    'focus:outline-none focus:text-blue-500'
                  )}
                  onClick={() => setNoteUUID(note.uuid)}
                >
                  <DocumentTextIcon className="mr-2" width={24} height={24} />

                  {note.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <NotePage
        key={noteUUID}
        uuid={noteUUID}
        className="border-t col-span-9 flex-1"
      />
    </PageView>
  )
}

export default Notes
