import React, {
  ChangeEventHandler,
  FocusEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react'
import noop from 'lodash/fp/noop'
import clsx from 'clsx'
import isFunction from 'lodash/isFunction'

type NativeProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>

type Props = {
  value: string
  placeholder?: string
  className?: string
  onChange(value: string): void
  onInput?(value: string): void
} & Omit<NativeProps, 'onChange'>

export const TextArea: React.FC<Props> = ({
  value,
  placeholder = '',
  className = '',
  onChange,
  onInput = noop,
  onBlur: nativeOnBlur,
  ...nativeProps
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
    setLocalValue(value)
  }, [value])

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

    if (isFunction(nativeOnBlur)) {
      nativeOnBlur(event)
    }
  }

  return (
    <textarea
      ref={ref}
      style={{height}}
      rows={1}
      className={clsx(
        'w-full p-0 bg-transparent focus:outline-none',
        className,
      )}
      value={localValue}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      {...nativeProps}
    />
  )
}
