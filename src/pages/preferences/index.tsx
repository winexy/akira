import React from 'react'
import {DarkModeControl} from 'features/darkmode'
import {ApiVersionControl} from 'features/api-version'
import {PageView} from 'shared/ui/page-view'
import {config} from 'shared/config'

const PreferencesPage: React.FC = () => {
  return (
    <PageView>
      <DarkModeControl />
      {config.env.dev && <ApiVersionControl />}
    </PageView>
  )
}

export default PreferencesPage
