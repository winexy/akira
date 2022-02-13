import {FadeTransition} from './fade/FadeTransition'
import {ShiftTransition} from './shift/ShiftTransition'
import {ScaleTransition} from './scale/ScaleTransition'

export const Transition = {
  Scale: ScaleTransition,
  Shift: ShiftTransition,
  Fade: FadeTransition,
}
