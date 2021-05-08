import {auth} from '@/firebase/firebase'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.AKIRA_API
})

api.interceptors.request.use(async config => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken()

    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export {api}
