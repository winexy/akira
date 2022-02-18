import constant from 'lodash/constant'
import {useQuery} from 'react-query'
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
