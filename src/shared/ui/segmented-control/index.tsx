import React, {
  CSSProperties,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import clsx from 'clsx'
import isNull from 'lodash/fp/isNull'
import isUndefined from 'lodash/fp/isUndefined'

type Rect = {
  width: number
  height: number
  offsetLeft: number
}

const Context = React.createContext<
  Undefined<{
    update(newActiveId: string, rect: Rect): void
    activeId: string
  }>
>(undefined)

type SegmentProps = {
  id: string
}

const Segment: React.FC<SegmentProps> = ({id, children}) => {
  const context = useContext(Context)
  const ref = useRef<HTMLButtonElement>(null)

  if (isUndefined(context)) {
    throw new Error('Segment should be used within SegmentedControl')
  }

  const isActive = context.activeId === id

  useEffect(() => {
    if (isActive && ref.current) {
      context.update(id, {
        height: ref.current.clientHeight,
        width: ref.current.clientWidth,
        offsetLeft: ref.current.offsetLeft
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        'flex-1 flex justify-center z-10',
        'p-1.5 rounded-xl font-semibold',
        'transition ease-in duration-150',
        'focus:outline-none',
        {
          'text-white': isActive,
          'active:text-gray-400': !isActive
        }
      )}
      onClick={() => {
        const control = ref.current!

        context.update(id, {
          height: control.clientHeight,
          width: control.clientWidth,
          offsetLeft: control.offsetLeft
        })
      }}
    >
      {children}
    </button>
  )
}

type Props = {
  activeId: string
  className?: string
  onChange(id: string): void
}

const SegmentedControl: React.FC<Props> = ({
  className,
  activeId,
  onChange,
  children
}) => {
  const [styles, setStyles] = useState<CSSProperties>()
  const rootRef = useRef<HTMLDivElement>(null)

  const update = (id: string, rect: Rect) => {
    onChange(id)

    const root = rootRef.current

    if (isUndefined(rect)) {
      globalThis.console.warn('[SegmentedControl] rect is undefined')
      return
    }

    if (isNull(root)) {
      globalThis.console.warn('[SegmentedControl] root is null')
      return
    }

    const INNER_PADDING = 4

    setStyles({
      width: rect.width,
      height: rect.height,
      transform: `translateX(${rect.offsetLeft - INNER_PADDING}px)`
    })
  }

  return (
    <Context.Provider value={{update, activeId}}>
      <div
        ref={rootRef}
        className={clsx(
          'mt-2 relative flex p-1 w-full shadow-inner rounded-2xl bg-gray-100 dark:bg-dark-300 transition',
          className
        )}
      >
        {children}
        <div
          style={styles}
          className="absolute rounded-xl bg-blue-500 dark:bg-dark-600 shadow-lg transition-all ease-in-out"
        />
      </div>
    </Context.Provider>
  )
}

export {SegmentedControl, Segment}
