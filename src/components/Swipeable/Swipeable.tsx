import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  CSSProperties
} from 'react'
import clsx, {ClassValue} from 'clsx'
import pipe from 'lodash/fp/pipe'
import get from 'lodash/fp/get'
import defaultTo from 'lodash/defaultTo'

const getWidth = pipe(getComputedStyle, get('width'), parseInt)
const getTouch = get('touches.0.pageX')

type SwipeableProps = {
  Component: React.ElementType
  before?: React.ReactChild
  after?: React.ReactChild
  className?: ClassValue
  children: React.ReactChild
  style?: CSSProperties
}

export const Swipeable = forwardRef<Element, SwipeableProps>(
  (
    {Component = 'div', children, before, after, className, ...props},
    parentRef
  ) => {
    const [shift, setShift] = useState(0)
    const touchStartRef = useRef(0)
    const finalTouchRef = useRef(0)
    const swipeInfoRef = useRef({isSwipeLeft: false, isSwipeRight: false})
    const beforeRef = useRef<HTMLDivElement>(null)
    const ref = useRef<HTMLDivElement>(null)
    const afterRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const beforeWidth = beforeRef.current
        ? defaultTo(getWidth(beforeRef.current), 0)
        : 0
      const afterWidth = afterRef.current
        ? defaultTo(getWidth(afterRef.current), 0)
        : 0

      const onTouchStart = (e: TouchEvent) => {
        const touch = getTouch(e)
        touchStartRef.current = touch
      }

      const onTouchEnd = () => {
        const {isSwipeLeft, isSwipeRight} = swipeInfoRef.current
        const finalShift = Math.abs(
          finalTouchRef.current - touchStartRef.current
        )

        const isOverSwipeLeft = isSwipeLeft && finalShift > afterWidth
        const isOverSwipeRight = isSwipeRight && finalShift > beforeWidth
        const isOverHalfShiftLeft = isSwipeLeft && finalShift > afterWidth / 2
        const isOverHalfShiftRight =
          isSwipeRight && finalShift > beforeWidth / 2

        if (!isOverSwipeLeft && !isOverSwipeRight) {
          setShift(0)
        }

        if (isOverHalfShiftLeft) {
          setShift(-afterWidth)
        } else if (isOverHalfShiftRight) {
          setShift(beforeWidth)
        }
      }

      const onTouchMove = (e: TouchEvent) => {
        const touchStart = touchStartRef.current
        const currentTouch = getTouch(e)

        const currentShift = touchStart - currentTouch

        swipeInfoRef.current.isSwipeLeft = currentShift > 0
        swipeInfoRef.current.isSwipeRight = currentShift < 0

        if (swipeInfoRef.current.isSwipeLeft) {
          setShift(Math.max(-afterWidth, -currentShift))
        } else if (swipeInfoRef.current.isSwipeRight) {
          setShift(Math.min(beforeWidth, -currentShift))
        }

        finalTouchRef.current = currentTouch
      }

      const node = ref.current

      if (node) {
        node.addEventListener('touchstart', onTouchStart, {passive: true})
        node.addEventListener('touchmove', onTouchMove, {passive: true})
        node.addEventListener('touchend', onTouchEnd, {passive: true})
      }

      return () => {
        if (node) {
          node.removeEventListener('touchstart', onTouchStart)
          node.removeEventListener('touchmove', onTouchMove)
          node.removeEventListener('touchend', onTouchEnd)
        }
      }
    }, [])

    return (
      <Component
        ref={parentRef}
        className={clsx('relative overflow-hidden', className)}
        {...props}
      >
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
)
