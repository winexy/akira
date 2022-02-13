import React from 'react'
import clsx from 'clsx'
import {Portal} from 'shared/ui/portal'
import {useStore} from 'effector-react'
import {$notifications} from './store'

export const NotificationManager: React.FC = () => {
  const notifications = useStore($notifications)

  return (
    <Portal to="notifications-root">
      <div
        className={clsx(
          'fixed bottom-0 right-0 left-0 p-4 pointer-events-none',
        )}
        style={{zIndex: 100000}}
      >
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={clsx(
              'w-full px-4 py-2 bg-white rounded border-l-8 border-red-500',
              'shadow-xl',
            )}
          >
            <h2 className={clsx('font-semibold text-red-500')}>
              {notification.title}
            </h2>
            <p className="mt-1 text-sm">{notification.message}</p>
          </div>
        ))}
      </div>
    </Portal>
  )
}
