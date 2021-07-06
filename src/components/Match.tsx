import React from 'react'
import get from 'lodash/fp/get'

type MatchComponent = React.FC & {
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
}

type CaseDefault = {
  default?: true
}

Match.Case = ({children}) => <>{children}</>
Match.Default = ({children}) => <>{children}</>

Match.Default.defaultProps = {
  default: true
}

export {Match}
