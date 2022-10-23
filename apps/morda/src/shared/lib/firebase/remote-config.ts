import amplitude from 'amplitude-js'
import {
  getRemoteConfig,
  getValue,
  activate,
  fetchConfig,
} from 'firebase/remote-config'
import {app} from './app'

const remoteConfig = getRemoteConfig(app)

remoteConfig.defaultConfig = {
  test: 42,
}

fetchConfig(remoteConfig).then(
  () => {
    activate(remoteConfig)
    amplitude.getInstance().logEvent('ActivateRemoteConfig')
  },
  error => {
    console.log('[remote-config]', 'failed to fetch', error.message)
  },
)

export {remoteConfig}
