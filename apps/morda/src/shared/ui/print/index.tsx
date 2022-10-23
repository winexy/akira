import React from 'react'

export const Print: React.FC<{
  children: React.ReactNode
}> = ({children}) => (
  <pre className="p-4">{JSON.stringify(children, null, ' ')}</pre>
)
