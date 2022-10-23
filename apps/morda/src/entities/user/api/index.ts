import {api} from 'shared/api'

type PublicUser = {
  uid: string
  email: string
}

function findByEmail(email: string): Promise<PublicUser> {
  return api
    .get('/users/find', {
      params: {email},
    })
    .then(r => r.data)
}

export const userApi = {
  findByEmail,
}
