import React, {ChangeEventHandler, FocusEventHandler, useState} from 'react'
import noop from 'lodash/fp/noop'
import size from 'lodash/fp/size'

type Props = {
  value: string
  placeholder?: string
  onChange(value: string): void
  onInput?(value: string): void
}

const countRows = (value: string) => size(value.split('\n'))

export const TextArea: React.FC<Props> = ({
  value,
  placeholder = '',
  onChange,
  onInput = noop
}) => {
  const [rows, setRows] = useState(() => countRows(value))
  const [localValue, setLocalValue] = useState(value)

  const sync = (newValue: string) => {
    setRows(countRows(newValue))
    setLocalValue(newValue)
  }

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
      className="w-full p-0 bg-transparent focus:outline-none"
      value={localValue}
      rows={rows}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
