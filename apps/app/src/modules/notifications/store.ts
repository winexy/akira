import {app} from 'shared/lib/app-domain'
import {forward, sample} from 'effector'
import {nanoid} from 'nanoid'

type Level = 'error'

type Notification = {
  id: string
  title: string
  message: string
  level: Level
}

type NotificationParams = {
  title: string
  message: string
  level: Level
}

export const pushNotification = app.event<NotificationParams>()
export const addNotification = app.event<Notification>()

export const removeNotification = app.effect({
  handler(notification: Notification): Promise<Notification> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(notification)
      }, 3000)
    })
  }
})

export const $notifications = app.store<Array<Notification>>([])

sample({
  clock: pushNotification,
  fn: params => ({
    id: nanoid(),
    ...params
  }),
  target: addNotification
})

forward({
  from: addNotification,
  to: removeNotification
})

$notifications
  .on(addNotification, (state, notification) => {
    return [...state, notification]
  })
  .on(removeNotification.doneData, (state, notification) => {
    return state.filter(n => n.id !== notification.id)
  })
