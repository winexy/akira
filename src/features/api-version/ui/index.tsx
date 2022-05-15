import React from 'react'
import clsx from 'clsx'
import {SegmentedControl, Segment} from 'shared/ui/segmented-control'
import {useStore} from 'effector-react'
import {apiModel} from 'shared/api'
import {useQueryClient} from 'react-query'

type Props = {
  className?: string
}

export const ApiVersionControl: React.FC<Props> = ({className}) => {
  const apiVersion = useStore(apiModel.$apiVersion)
  const queryClient = useQueryClient()

  const onChange = (id: apiModel.ApiVersionEnum) => {
    apiModel.changeApiVersion(id)
    queryClient.clear()
  }

  return (
    <div className={clsx('px-4 w-full', className)}>
      <span className="font-semibold text-lg">API Version</span>
      <SegmentedControl activeId={apiVersion} onChange={onChange}>
        <Segment id={apiModel.ApiVersionEnum.Prod}>Production</Segment>
        <Segment id={apiModel.ApiVersionEnum.Dev}>Development</Segment>
      </SegmentedControl>
    </div>
  )
}
