import React from 'react'
import {DarkModeControl} from 'features/darkmode'
import {ApiVersionControl} from 'features/api-version'
import {ReactQueryDebuggerControl} from 'features/react-query-debugger'
import {PageView} from 'shared/ui/page-view'
import {config} from 'shared/config'

const PreferencesPage: React.FC = () => {
  return (
    <PageView withBackNavigation className="pb-6">
      <div className="md:max-w-lg">
        <DarkModeControl />
        {config.env.dev && <ApiVersionControl className="mt-4" />}
        {config.env.dev && <ReactQueryDebuggerControl className="mt-4" />}
      </div>
    </PageView>
  )
}

export default PreferencesPage
