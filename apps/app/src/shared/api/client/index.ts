import axios from 'axios'
import identity from 'lodash/fp/identity'
import {
  extractError,
  mutableInjectToken,
  mutableInjectBaseURL
} from './interceptors'

const api = axios.create()

api.interceptors.request.use(mutableInjectBaseURL)
api.interceptors.request.use(mutableInjectToken)
api.interceptors.response.use(identity, extractError)

export {api}
