import React from 'react'
import get from 'lodash/fp/get'

type MatchComponent = React.FC<{children: React.ReactNode}> & {
  Case: React.FC<CaseWhen>
  Default: React.FC<CaseDefault>
}

const Match: MatchComponent = ({children}) => {
  const child = React.Children.toArray(children).find(child => {
    return Boolean(get('props.when', child) || get('props.default', child))
  })

  return <>{child}</>
}

type CaseWhen = {
  when: boolean
  children: React.ReactNode
}

type CaseDefault = {
  default?: true
  children: React.ReactNode
}

Match.Case = ({children}) => <>{children}</>
Match.Default = ({children}) => <>{children}</>

Match.Default.defaultProps = {
  default: true,
}

export {Match}
