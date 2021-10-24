import {Inject, Injectable} from '@nestjs/common'
import {UniqueViolationError} from 'db-errors'
import {TagModel, CreateTagDto, Tag} from './tag.model'
import {UserError} from '../../filters/user-error.exception.filter'
import {
  RejectedQueryError,
  transformRejectReason
} from '../../shared/transform-reject-reason'
import * as TE from 'fp-ts/lib/TaskEither'
import {pipe} from 'fp-ts/lib/function'

@Injectable()
export class TagsRepo {
  constructor(@Inject(TagModel) private readonly tagModel: typeof TagModel) {}

  findAllByUID(uid: UID) {
    return this.tagModel.query().where({uid})
  }

  createTag(
    uid: UID,
    dto: CreateTagDto
  ): TE.TaskEither<DBException | UserError, Tag> {
    return pipe(
      TE.tryCatch(() => {
        return this.tagModel.query().insert({...dto, uid})
      }, transformRejectReason),
      TE.mapLeft(error => {
        if (error instanceof UniqueViolationError) {
          return UserError.of({
            type: UserError.DUPLICATE,
            message: `tag "${dto.name}" is already exist`,
            meta: {
              name: dto.name
            }
          })
        }

        return error
      })
    )
  }

  deleteTag(
    uid: UID,
    tagId: Tag['id']
  ): TE.TaskEither<RejectedQueryError, number> {
    return TE.tryCatch(() => {
      return this.tagModel
        .query()
        .deleteById(tagId)
        .where({
          uid
        })
        .throwIfNotFound()
    }, transformRejectReason)
  }
}
