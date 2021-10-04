import React from 'react'
import {SegmentedControl, Segment} from 'shared/ui/segmented-control'
import {useStore} from 'effector-react'
import {apiModel} from 'shared/api'

export const ApiVersion: React.FC = () => {
  const apiVersion = useStore(apiModel.$apiVersion)

  return (
    <div className="mt-2 px-4 w-full">
      <span className="font-semibold text-lg">API Version</span>
      <SegmentedControl
        activeId={apiVersion}
        onChange={apiModel.changeApiVersion}
      >
        <Segment id={apiModel.ApiVersionEnum.Prod}>Production</Segment>
        <Segment id={apiModel.ApiVersionEnum.Dev}>Development</Segment>
      </SegmentedControl>
    </div>
  )
}
