import React from 'react'
import ContentLoader from 'react-content-loader'
import {useShimmerColors} from 'shared/ui/shimmer'
import {PageView} from 'shared/ui/page-view'

export const TaskPageFallback: React.FC = () => {
  const {backgroundColor, foregroundColor} = useShimmerColors()

  return (
    <PageView className="p-4">
      <ContentLoader
        speed={2}
        width={320}
        height={160}
        viewBox="0 0 320 160"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        <rect x="0" y="0" rx="4" ry="4" width="105" height="25" />
        <rect x="120" y="0" rx="4" ry="4" width="105" height="25" />
        <rect x="0" y="46" rx="4" ry="4" width="240" height="28" />
        <rect x="0" y="92" rx="4" ry="4" width="200" height="42" />
      </ContentLoader>
    </PageView>
  )
}
