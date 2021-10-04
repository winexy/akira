import React from 'react'
import {DarkMode} from 'features/darkmode/ui'
import {ApiVersion} from 'features/api-version/ui'
import {PageView} from 'shared/ui/page-view'
import {config} from 'shared/config'

const PreferencesPage: React.FC = () => {
  return (
    <PageView>
      <DarkMode />
      {config.env.dev && <ApiVersion />}
    </PageView>
  )
}

export default PreferencesPage
