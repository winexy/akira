import React, {ChangeEventHandler, useMemo} from 'react'
import isNil from 'lodash/fp/isNil'
import escape from 'escape-html'
import clsx from 'clsx'

type Props = {
  value: string
  placeholder?: string
  className?: string
  onChange(value: string): void
}

export const EditableHeading: React.FC<Props> = ({
  value,
  placeholder = '',
  className = '',
  onChange
}) => {
  const escaped = useMemo(() => escape(value), [value]) || placeholder

  const handleChange: ChangeEventHandler<HTMLHeadingElement> = event => {
    const {textContent} = event.target

    // eslint-disable-next-line
    event.target.innerHTML = textContent ?? ''

    if (!isNil(textContent) && value !== textContent) {
      onChange(textContent.trim())
    }
  }

  return (
    <h1
      className={clsx(
        `
        px-4 
        font-semibold text-2xl 
        focus:outline-none 
        focus:text-gray-500
      `,
        className
      )}
      contentEditable
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: escaped
      }}
      onBlur={handleChange}
    />
  )
}
