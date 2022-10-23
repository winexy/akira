import {api} from 'shared/api'
import {noteModel} from '..'

type PatchNoteParams = {
  noteId: string
  patch: noteModel.NotePatch
}

export function patchNote(
  params: PatchNoteParams,
): Promise<noteModel.PatchNoteResponse> {
  return api.patch(`notes/${params.noteId}`, params.patch).then(res => res.data)
}

export function fetchNote(id: string): Promise<noteModel.Note> {
  return api.get(`notes/${id}`).then(res => res.data)
}

export function fetchNotesPreview(): Promise<Array<noteModel.NotePreview>> {
  return api.get('notes/preview').then(res => res.data)
}

export function createEmptyNote(): Promise<noteModel.CreatedNote> {
  return api.post('notes').then(res => res.data)
}
