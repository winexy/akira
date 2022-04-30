import {
  clearAllBodyScrollLocks,
  disableBodyScroll,
  enableBodyScroll,
} from 'body-scroll-lock'
import {useStore} from 'effector-react'
import find from 'lodash/fp/find'
import get from 'lodash/fp/get'
import isNull from 'lodash/isNull'
import {
  MutableRefObject,
  TouchEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  $activeBottomSheet,
  $bottomSheets,
  hideBottomSheet,
  Sheet,
} from './store'

export type BottomSheetState = {
  contentRef: MutableRefObject<HTMLDivElement | null>
  sheet: Sheet | null
  sheetShift: number
  isVisible: boolean
  isActive: boolean
}

export type BottomSheetEvents = {
  onSheetTouchEnd: TouchEventHandler
  onSheetTouchMove: TouchEventHandler
  onSheetTouchStart: TouchEventHandler
  onBlackoutTouchEnd(): void
  onBlackoutTouchStart(): void
}

const extractTouch = get('changedTouches.0.clientY')

export function useBottomSheet(
  name: string,
): BottomSheetState & BottomSheetEvents {
  const sheet =
    useStore(
      $bottomSheets.map(
        find<Sheet>({name}),
      ),
    ) ?? null

  const activeBottomSheet = useStore($activeBottomSheet)
  const [isBlackoutTouchStarted, setIsBlackoutTouchStarted] = useState(false)
  const [isSheetTouchStarted, setIsSheetTouchStarted] = useState(false)
  const [sheetTouchStart, setSheetTouchStart] = useState(0)
  const [sheetShift, setSheetShift] = useState(0)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const isVisible = !isNull(sheet)
  const isActive = activeBottomSheet?.name === name

  useEffect(() => {
    return () => {
      if (isVisible) {
        hideBottomSheet(name)
        clearAllBodyScrollLocks()
      }
    }
  }, [name, isVisible])

  useEffect(() => {
    if (isVisible && contentRef.current) {
      disableBodyScroll(contentRef.current)
      setIsSheetTouchStarted(false)
      setSheetShift(0)
    } else if (contentRef.current) {
      enableBodyScroll(contentRef.current)
    }
  }, [isVisible])

  const onBlackoutTouchStart = () => {
    if (isActive) {
      setIsBlackoutTouchStarted(true)
    }
  }

  const onBlackoutTouchEnd = () => {
    if (isBlackoutTouchStarted) {
      setIsBlackoutTouchStarted(false)
      hideBottomSheet()
    }
  }

  const onSheetTouchStart: TouchEventHandler = e => {
    if (!isActive) {
      return
    }

    window.console.assert(contentRef.current !== null, 'Content Ref is NULL')

    if (contentRef.current) {
      setIsSheetTouchStarted(contentRef.current.scrollTop === 0)
      setSheetTouchStart(extractTouch(e))
    }
  }

  const onSheetTouchMove: TouchEventHandler = e => {
    if (isSheetTouchStarted) {
      const shift = extractTouch(e) - sheetTouchStart
      setSheetShift(Math.max(0, shift))
    }
  }

  const onSheetTouchEnd: TouchEventHandler = () => {
    if (isSheetTouchStarted && sheetShift >= 100) {
      hideBottomSheet()
      return
    }

    setIsSheetTouchStarted(false)
    setSheetShift(0)
  }

  return {
    contentRef,
    sheet,
    sheetShift,
    isVisible,
    isActive,
    onSheetTouchEnd,
    onSheetTouchMove,
    onSheetTouchStart,
    onBlackoutTouchEnd,
    onBlackoutTouchStart,
  }
}
