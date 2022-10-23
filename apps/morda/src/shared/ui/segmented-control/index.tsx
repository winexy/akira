import React, {
  CSSProperties,
  useContext,
  useEffect,
  useRef,
  useState,
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
    update(newActiveId: string): void
    activeId: string
  }>
>(undefined)

type SegmentProps = {
  id: string
  children: React.ReactNode
}

const Segment: React.FC<SegmentProps> = ({id, children}) => {
  const context = useContext(Context)
  const ref = useRef<HTMLButtonElement>(null)

  if (isUndefined(context)) {
    throw new Error('Segment should be used within SegmentedControl')
  }

  const isActive = context.activeId === id

  return (
    <button
      ref={ref}
      data-segment-id={id}
      type="button"
      className={clsx(
        'flex-1 flex justify-center z-10',
        'p-1.5 rounded-xl font-semibold',
        'transition ease-in duration-150',
        'focus:outline-none',
        {
          'text-white': isActive,
          'active:text-gray-400': !isActive,
        },
      )}
      onClick={() => context.update(id)}
    >
      {children}
    </button>
  )
}

type Props = {
  activeId: string
  className?: string
  onChange(id: string): void
  children: React.ReactNode
}

const SegmentedControl: React.FC<Props> = ({
  className,
  activeId,
  onChange,
  children,
}) => {
  const [styles, setStyles] = useState<CSSProperties>()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = document.querySelector(`button[data-segment-id="${activeId}"]`)

    if (!node) {
      globalThis.console.warn(`node rect was not found for ${activeId} segment`)
      return
    }

    if (!(node instanceof HTMLButtonElement)) {
      globalThis.console.warn(`found rect is not type of button`)
      return
    }

    const rect = {
      height: node.clientHeight,
      width: node.clientWidth,
      offsetLeft: node.offsetLeft,
    }

    const INNER_PADDING = 4

    setStyles({
      width: rect.width,
      height: rect.height,
      transform: `translateX(${rect.offsetLeft - INNER_PADDING}px)`,
    })
  }, [activeId])

  const update = (id: string) => {
    if (id !== activeId) {
      onChange(id)
    }
  }

  return (
    <Context.Provider value={{update, activeId}}>
      <div
        ref={rootRef}
        className={clsx(
          'mt-2 relative flex p-1 w-full shadow-inner rounded-2xl bg-gray-100 dark:bg-dark-300 transition',
          className,
        )}
      >
        {children}
        <div
          style={styles}
          className="absolute rounded-xl bg-indigo-500 dark:bg-dark-600 shadow-lg transition-all ease-in-out"
        />
      </div>
    </Context.Provider>
  )
}

export {SegmentedControl, Segment}
