import React, {useEffect, useState, useRef} from 'react'
import clsx from 'clsx'
import pipe from 'lodash/fp/pipe'
import get from 'lodash/fp/get'

const getBoundingRect = el => el.getBoundingClientRect()
const getWidth = pipe(getBoundingRect, get('width'))
const getTouch = get('touches.0.pageX')

export function Swipeable({
  Component = 'div',
  children,
  before,
  after,
  className,
}) {
  const [shift, setShift] = useState(0)
  const touchStartRef = useRef(0)
  const finalTouchRef = useRef(0)
  const swipeInfoRef = useRef({isSwipeLeft: false, isSwipeRight: false})
  const beforeRef = useRef()
  const ref = useRef()
  const afterRef = useRef()

  useEffect(() => {
    const beforeWidth = beforeRef.current ? getWidth(beforeRef.current) : 0
    const afterWidth = afterRef.current ? getWidth(afterRef.current) : 0

    const onTouchStart = e => {
      const touch = getTouch(e)
      touchStartRef.current = touch
    }

    const onTouchEnd = () => {
      const {isSwipeLeft, isSwipeRight} = swipeInfoRef.current
      const finalShift = Math.abs(finalTouchRef.current - touchStartRef.current)

      const isOverSwipeLeft = isSwipeLeft && finalShift > afterWidth
      const isOverSwipeRight = isSwipeRight && finalShift > beforeWidth
      const isOverHalfShiftLeft = isSwipeLeft && finalShift > afterWidth / 2
      const isOverHalfShiftRight = isSwipeRight && finalShift > beforeWidth / 2

      if (!isOverSwipeLeft && !isOverSwipeRight) {
        setShift(0)
      }

      if (isOverHalfShiftLeft) {
        setShift(-afterWidth)
      } else if (isOverHalfShiftRight) {
        setShift(beforeWidth)
      }
    }

    const onTouchMove = e => {
      const touchStart = touchStartRef.current
      const currentTouch = getTouch(e)

      const shift = touchStart - currentTouch

      swipeInfoRef.current.isSwipeLeft = shift > 0
      swipeInfoRef.current.isSwipeRight = shift < 0

      if (swipeInfoRef.current.isSwipeLeft) {
        setShift(Math.max(-afterWidth, -shift))
      } else if (swipeInfoRef.current.isSwipeRight) {
        setShift(Math.min(beforeWidth, -shift))
      }

      finalTouchRef.current = currentTouch
    }

    ref.current.addEventListener('touchstart', onTouchStart)
    ref.current.addEventListener('touchmove', onTouchMove)
    ref.current.addEventListener('touchend', onTouchEnd)

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('touchstart', onTouchStart)
        ref.current.removeEventListener('touchmove', onTouchMove)
        ref.current.removeEventListener('touchend', onTouchEnd)
      }
    }
  }, [])

  return (
    <Component className={clsx('relative overflow-hidden', className)}>
      {before && (
        <div ref={beforeRef} className="absolute left-0 top-0 bottom-0 flex">
          {before}
        </div>
      )}
      <div
        ref={ref}
        className="relative z-10 w-full transition ease-in duration-150"
        style={{transform: `translateX(${shift}px)`}}
      >
        {children}
      </div>
      {after && (
        <div ref={afterRef} className="absolute right-0 top-0 bottom-0 flex">
          {after}
        </div>
      )}
    </Component>
  )
}
