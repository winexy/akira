import {AxiosError, AxiosRequestConfig} from 'axios'
import replace from 'lodash/fp/replace'
import {auth} from 'shared/lib/firebase'
import {config} from 'shared/config'
import {$apiVersion, ApiVersionEnum} from '../model'

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

const removeTrailingSlash = (url: string) => replace(/\/$/, '', url)

export function mutableInjectBaseURL(axiosConfig: AxiosRequestConfig) {
  const version = $apiVersion.getState()
  const url =
    version === ApiVersionEnum.Dev ? config.api.dev_url : config.api.prod_url

  // eslint-disable-next-line no-param-reassign
  axiosConfig.baseURL = removeTrailingSlash(url)

  return axiosConfig
}
