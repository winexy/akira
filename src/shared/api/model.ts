import {app} from 'shared/lib/app-domain'
import {config} from 'shared/config'
import {withPersist} from 'shared/lib/with-persist'

enum ApiVersionEnum {
  Dev = 'dev',
  Prod = 'prod'
}

const changeApiVersion = app.event<ApiVersionEnum>()

const defaultApiVersion = config.env.dev
  ? ApiVersionEnum.Dev
  : ApiVersionEnum.Prod

const $apiVersion = withPersist(
  app.store(defaultApiVersion, {name: 'ApiVersion'})
)

$apiVersion.on(changeApiVersion, (_, version) => version)

export {ApiVersionEnum, $apiVersion, changeApiVersion}
