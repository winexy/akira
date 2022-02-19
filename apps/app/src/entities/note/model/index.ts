import produce, {Draft} from 'immer'
import constant from 'lodash/constant'
import isUndefined from 'lodash/isUndefined'
import {useQuery, QueryClient} from 'react-query'
import {noteApi, noteModel} from '..'

export type NotePreview = {
  uuid: string
  title: string
  updated_at: string
}

export type Note = {
  uuid: string
  title: string
  content: string
  author_uid: string
  updated_at: string
  created_at: string
}

export type NotePatch = {
  title?: string
  content?: string
}

export type PatchNoteResponse = {
  uuid: string
  updated_at: string
}

export const NoteQuery = {
  Preview: constant(['notes']),
  One: (uuid: string) => ['notes', uuid],
}

export function useNotesPreviewQuery() {
  return useQuery(noteModel.NoteQuery.Preview(), noteApi.fetchNotesPreview)
}

type NoteQueryParams = {
  onSuccess(note: noteModel.Note): void
  initialData(): noteModel.Note | undefined
}

export function useNoteQuery(
  id: string,
  {onSuccess, initialData}: NoteQueryParams,
) {
  return useQuery(
    noteModel.NoteQuery.One(id),
    () => {
      return noteApi.fetchNote(id)
    },
    {
      refetchOnMount: true,
      onSuccess,
      initialData,
    },
  )
}

type UpdateNotesPreviewQueryDataParams = {
  queryClient: QueryClient
  noteId: string
  title: string
}

export function updateNotesPreviewQueryData(
  params: UpdateNotesPreviewQueryDataParams,
) {
  const {queryClient, noteId, title} = params

  const queryKey = noteModel.NoteQuery.Preview()
  const notes = queryClient.getQueryData<Array<noteModel.NotePreview>>(queryKey)

  if (isUndefined(notes)) {
    return
  }

  queryClient.setQueryData(
    noteModel.NoteQuery.Preview(),
    produce(notes, draft => {
      const index = draft.findIndex(n => n.uuid === noteId)
      draft[index].title = title
    }),
  )
}

type UpdateNoteQueryDataParams = {
  queryClient: QueryClient
  noteId: string
  mutate(draft: Draft<Note>): void
}

export function updateNoteQueryData(params: UpdateNoteQueryDataParams) {
  const {queryClient, noteId, mutate} = params

  const queryKey = NoteQuery.One(noteId)
  const note = queryClient.getQueryData<Note>(queryKey)

  if (!isUndefined(note)) {
    queryClient.setQueryData(queryKey, produce(note, mutate))
  }
}
