import React, {ChangeEventHandler, useMemo} from 'react'
import isNil from 'lodash/fp/isNil'

type Props = {
  value: string
  onChange(value: string): void
}

export const EditableHeading: React.FC<Props> = ({value, onChange}) => {
  const escaped = useMemo(() => escape(value), [value])

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
      className="
        mt-4 px-4 
        font-semibold text-2xl 
        focus:outline-none 
        focus:text-gray-500
      "
      contentEditable
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: escaped
      }}
      onBlur={handleChange}
    />
  )
}
