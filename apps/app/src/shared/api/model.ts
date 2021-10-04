import {app} from 'shared/lib/app-domain'
import {config} from 'shared/config'

enum ApiVersionEnum {
  Dev = 'dev',
  Prod = 'prod'
}

const changeApiVersion = app.event<ApiVersionEnum>()

const defaultApiVersion = config.env.dev
  ? ApiVersionEnum.Dev
  : ApiVersionEnum.Prod

const $apiVersion = app.store(defaultApiVersion)

$apiVersion.on(changeApiVersion, (_, version) => version)

export {ApiVersionEnum, $apiVersion, changeApiVersion}
