import axios from 'axios'
import identity from 'lodash/fp/identity'
import {config} from 'shared/config'
import {
  extractError,
  mutableInjectToken,
  mutableInjectBaseURL,
} from './interceptors'

const api = axios.create()

api.interceptors.request.use(mutableInjectBaseURL)
api.interceptors.request.use(mutableInjectToken)
api.interceptors.response.use(identity, extractError)

if (config.env.dev) {
  // @ts-expect-error
  // eslint-disable-next-line no-underscore-dangle
  window.__api__ = api
}

export {api}
