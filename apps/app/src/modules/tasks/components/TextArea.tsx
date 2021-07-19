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

const countRows = (value: string) => size(value.split('\n'))

export const TextArea: React.FC<Props> = ({
  value,
  placeholder = '',
  className = '',
  onChange,
  onInput = noop
}) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [localValue, setLocalValue] = useState(value)
  const [height, setHeight] = useState<number>()

  const sync = (newValue: string) => {
    setLocalValue(newValue)
  }

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = event => {
    const {value} = event.target

    onInput(value)
    sync(value)

    if (ref.current) {
      setHeight(ref.current.scrollHeight)
    }
  }

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = event => {
    const value = event.target.value.trim()

    onChange(value)
    sync(value)
  }

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight)
    }
  }, [])

  return (
    <textarea
      ref={ref}
      style={{height}}
      className={clsx(
        'w-full p-0 bg-transparent focus:outline-none',
        className
      )}
      value={localValue}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
