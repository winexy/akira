import axios from 'axios'
import identity from 'lodash/fp/identity'
import replace from 'lodash/fp/replace'
import {config as appConfig} from '@config/app'
import {extractError, mutableInjectToken} from './interceptors'

const removeTrailingSlash = (url: string) => replace(/\/$/, '', url)

const api = axios.create({
  baseURL: removeTrailingSlash(appConfig.api.url)
})

api.interceptors.request.use(mutableInjectToken)
api.interceptors.response.use(identity, extractError)

export {api}
