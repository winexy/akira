import {auth} from '@/firebase/firebase'
import axios, {AxiosError} from 'axios'
import {config as appConfig} from '@config/app'
import {identity} from 'lodash/fp'

const api = axios.create({
  baseURL: appConfig.api.url.endsWith('/')
    ? appConfig.api.url
    : `${appConfig.api.url}/`
})

api.interceptors.request.use(async config => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken()

    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(identity, (error: AxiosError) => {
  if (!error.isAxiosError) {
    return Promise.reject(error)
  }

  return Promise.reject(error.response?.data)
})

export {api}
