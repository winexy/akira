import React from 'react'
import {render} from '@testing-library/react'
import {Checkbox} from './Checkbox'

test('Checkbox', () => {
  render(<Checkbox />)
  
  expect(2).toBe(4)
})
