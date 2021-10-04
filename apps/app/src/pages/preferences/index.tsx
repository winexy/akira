import React from 'react'
import {PageView} from 'shared/ui/page-view'
import {DarkMode} from 'features/darkmode/ui'
import {ApiVersion} from 'features/api-version/ui'

const PreferencesPage: React.FC = () => {
  return (
    <PageView>
      <DarkMode />
      <ApiVersion />
    </PageView>
  )
}

export default PreferencesPage
