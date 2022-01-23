import {Inject, Injectable, Logger} from '@nestjs/common'
import * as TE from 'fp-ts/lib/TaskEither'
import {UserError} from 'src/filters/user-error.exception.filter'
import {taskEitherQuery} from 'src/shared/task-either-query'
import {Note, NoteModel} from './note.model'

type NotePreview = Pick<Note, 'uuid' | 'title'>

@Injectable()
export class NotesRepo {
  private readonly logger = new Logger(NotesRepo.name)

  constructor(
    @Inject(NoteModel)
    private readonly noteModel: typeof NoteModel
  ) {}

  FindNotesPreview(uid: UID): TE.TaskEither<UserError, NotePreview> {
    return taskEitherQuery(() => {
      return (this.noteModel.query().select(['uuid', 'title']).where({
        author_uid: uid
      }) as unknown) as Promise<NotePreview>
    })
  }

  CreateEmptyNote(uid: UID): TE.TaskEither<UserError, Note> {
    return taskEitherQuery(() => {
      return this.noteModel.query().insert({
        author_uid: uid
      })
    })
  }

  FindOne(noteId: string, uid: UID) {
    return taskEitherQuery(() => {
      return this.noteModel
        .query()
        .findById(noteId)
        .where({
          author_uid: uid
        })
        .throwIfNotFound()
    })
  }
}