import {getAnalytics, logEvent as _logEvent} from 'firebase/analytics'
import {app} from './app'

const analytics = getAnalytics(app)

export function logEvent(eventName: string, eventParams?: Record<string, any>) {
  _logEvent(analytics, eventName, eventParams)
}
