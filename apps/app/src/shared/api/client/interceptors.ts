import {AxiosError, AxiosRequestConfig} from 'axios'
import {auth} from 'shared/lib/firebase'

export function extractError(error: AxiosError) {
  if (!error.isAxiosError) {
    return Promise.reject(error)
  }

  return Promise.reject(error.response?.data)
}

export async function mutableInjectToken(config: AxiosRequestConfig) {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken()

    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}
