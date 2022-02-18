import constant from 'lodash/constant'

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
