import {Either, left, right} from '@sweet-monads/either'

export function either<Error, Value>(
  promise: Promise<Value>
): Promise<Either<Error, Value>> {
  return promise.then(right).catch(left)
}
