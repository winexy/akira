import {api} from 'shared/api'

enum ShareAccess {
  CanView = 1,
  CanComment = 2,
  CanEdit = 4,
}

function share(taskId: string, userId: string, access = ShareAccess.CanView) {
  return api
    .post('/share-task', {
      task_id: taskId,
      user_id: userId,
      access,
    })
    .then(r => r.data)
}

export const shareTaskApi = {
  share,
}
