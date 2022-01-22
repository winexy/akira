import React, {
  ChangeEventHandler,
  FocusEventHandler,
  useEffect,
  useRef,
  useState
} from 'react'
import noop from 'lodash/fp/noop'
import size from 'lodash/fp/size'
import clsx from 'clsx'

type Props = {
  value: string
  placeholder?: string
  className?: string
  onChange(value: string): void
  onInput?(value: string): void
}

export const TextArea: React.FC<Props> = ({
  value,
  placeholder = '',
  className = '',
  onChange,
  onInput = noop
}) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [localValue, setLocalValue] = useState(value)
  const [height, setHeight] = useState<string | number>()

  const sync = (newValue: string) => {
    setLocalValue(newValue)
  }

  const syncHeight = () => {
    setHeight('auto')

    requestAnimationFrame(() => {
      if (ref.current) {
        getComputedStyle(ref.current)
        setHeight(ref.current.scrollHeight)
      }
    })
  }

  useEffect(() => {
    syncHeight()
  }, [localValue])

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = event => {
    const {value} = event.target

    onInput(value)
    sync(value)
  }

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = event => {
    const value = event.target.value.trim()

    onChange(value)
    sync(value)
  }

  return (
    <textarea
      ref={ref}
      style={{height}}
      className={clsx(
        'w-full p-0 bg-transparent text-white focus:outline-none',
        className
      )}
      value={localValue}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
