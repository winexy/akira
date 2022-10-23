import {MutableRefObject, useEffect} from 'react'
import {createFocusTrap, FocusTrap} from 'focus-trap'

export function useFocusTrap(
  visible: boolean,
  ref: MutableRefObject<HTMLElement | null>,
) {
  useEffect(() => {
    let trap: FocusTrap | undefined

    if (visible && ref.current) {
      trap = createFocusTrap(ref.current)
      trap.activate()
    }

    return () => {
      trap?.deactivate()
    }
  }, [visible, ref])
}
