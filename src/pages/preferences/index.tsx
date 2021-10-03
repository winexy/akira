import React from 'react'
import {PageView} from '@shared/ui/page-view'
import {DarkMode} from '@features/darkmode/ui'

const PreferencesPage: React.FC = () => {
  return (
    <PageView>
      <DarkMode />
    </PageView>
  )
}

export default PreferencesPage
