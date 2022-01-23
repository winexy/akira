import {PlusIcon} from '@heroicons/react/solid'
import React, {FC} from 'react'
import {useQuery, useMutation} from 'react-query'
import {api} from 'shared/api'
import {List} from 'shared/ui/list'
import {PageView} from 'shared/ui/page-view'
import isEmpty from 'lodash/isEmpty'
import {Empty} from 'shared/ui/empty'
import {Button} from 'shared/ui/button'
import {DocumentTextIcon} from '@heroicons/react/outline'
import {Link} from 'react-router-dom'
import {useHistory} from 'react-router'

const Notes: FC = () => {
  const history = useHistory()
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
    <PageView className="px-4">
      <div className="mt-1 flex justify-between">
        <h1 className="font-bold text-4xl">Notes</h1>
        <Button
          disabled={createEmptyNoteMutation.isLoading}
          onClick={createEmptyNote}
        >
          <PlusIcon className="mr-2" width={32} height={32} />
          Add Note
        </Button>
      </div>
      {isEmpty(notes) && <Empty message="You haven't created any note" />}
      {Array.isArray(notes) && (
        <ul className="mt-4">
          {notes.map(note => (
            <li key={note.uuid}>
              <Link
                to={`/notes/${note.uuid}`}
                className="flex hover:text-indigo-300 active:text-indigo-500"
              >
                <DocumentTextIcon className="mr-2" width={24} height={24} />

                {note.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageView>
  )
}

export default Notes
