import constant from 'lodash/constant'

export type NotePreview = {
  uuid: string
  title: string
  // eslint-disable-next-line camelcase
  updated_at: string
}

export type Note = {
  uuid: string
  title: string
  content: string
  // eslint-disable-next-line camelcase
  author_uid: string
  // eslint-disable-next-line camelcase
  updated_at: string
  // eslint-disable-next-line camelcase
  created_at: string
}

export type NotePatch = {
  title?: string
  content?: string
}

export const NoteQuery = {
  Preview: constant(['notes']),
  One: (uuid: string) => ['notes', uuid],
}
