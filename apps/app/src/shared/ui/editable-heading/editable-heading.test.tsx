import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {EditableHeading} from '.'
import '@testing-library/jest-dom/extend-expect'

describe('EditableHeading', () => {
  it('should correctly render spaces', () => {
    const TEST_VALUE = 'Hello World'

    const result = render(
      <EditableHeading value={TEST_VALUE} onChange={() => {}} />,
    )

    expect(result.getByRole('heading')).toHaveTextContent(TEST_VALUE)
  })

  it('should escape xss', () => {
    const TEST_VALUE = '<img onerror="alert(1)" />'

    const result = render(
      <EditableHeading value={TEST_VALUE} onChange={() => {}} />,
    )

    expect(result.getByRole('heading')).toContainHTML(
      '&lt;img onerror="alert(1)" /&gt;',
    )
  })

  it('should emit onChange', () => {
    const onChange = jest.fn()
    const value = 'hello'

    const result = render(<EditableHeading value="" onChange={onChange} />)
    const heading = result.getByRole('heading')

    userEvent.type(heading, value)
    userEvent.tab()

    expect(onChange).toBeCalledWith(value)
  })

  it('should emit trimmed value', () => {
    const onChange = jest.fn()
    const value = 'hello'

    const result = render(<EditableHeading value="" onChange={onChange} />)
    const heading = result.getByRole('heading')

    userEvent.type(heading, `  ${value}  `)
    userEvent.tab()

    expect(onChange).toBeCalledWith(value)
  })
})
