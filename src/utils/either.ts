import {Either, left, right} from '@sweet-monads/either'
import {Maybe} from '@sweet-monads/maybe'

export function either<Error, Value>(
  promise: Promise<Value>
): Promise<Either<Error, Value>> {
  return promise.then(right).catch(left)
}

export function fromMaybe<T>(maybe: Maybe<T>): Either<null, T> {
  return maybe.isJust() ? right(maybe.value) : left(null)
}
