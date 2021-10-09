import React from 'react'
import {DarkModeControl} from 'features/darkmode'
import {ApiVersion} from 'features/api-version/ui'
import {PageView} from 'shared/ui/page-view'
import {config} from 'shared/config'

const PreferencesPage: React.FC = () => {
  return (
    <PageView>
      <DarkModeControl />
      {config.env.dev && <ApiVersion />}
    </PageView>
  )
}

export default PreferencesPage
