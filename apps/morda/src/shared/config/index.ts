export const config = {
  app: {
    // @ts-ignore
    version: __VERSION__,
  },
  env: {
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
  },
  api: {
    dev_url: import.meta.env.VITE_AKIRA_DEV_API,
    prod_url: import.meta.env.VITE_AKIRA_PROD_API,
  },
  webPush: {
    vapidKey: import.meta.env.VITE_VAPID_KEY,
  },
  auth: {
    use_mock: import.meta.env.VITE_USE_MOCK_AUTH,
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
  },
}

if (config.env.dev) {
  config.api.dev_url = config.api.dev_url.replace(
    'localhost',
    window.location.hostname,
  )
}
