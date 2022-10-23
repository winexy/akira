import * as A from 'fp-ts/lib/Array'
import {flow, pipe} from 'fp-ts/lib/function'
import {CheckList, Todo} from 'modules/tasks/types.d'
import {prop} from 'shared/lib/utils'

export const countCompleted = flow(A.filter<Todo>(prop('is_completed')), A.size)

const getPercentOf = (total: number) => (done: number) => (done * 100) / total

export const getPercentageOfCompleted = (checklist: CheckList) =>
  pipe(checklist, countCompleted, getPercentOf(A.size(checklist)))
