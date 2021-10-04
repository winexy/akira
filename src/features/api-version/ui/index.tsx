import React, {useState} from 'react'
import {config} from 'shared/config'
import {SegmentedControl, Segment} from 'shared/ui/segmented-control'

export const ApiVersion: React.FC = () => {
  const [activeId, setActiveId] = useState('dev')

  if (config.env.prod) {
    return null
  }

  return (
    <div className="mt-2 px-4 w-full">
      <span className="font-semibold text-lg">API Version</span>
      <SegmentedControl activeId={activeId} onChange={setActiveId}>
        <Segment id="prod">Production</Segment>
        <Segment id="dev">Development</Segment>
      </SegmentedControl>
    </div>
  )
}
