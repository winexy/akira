export const config = {
  app: {
    // @ts-ignore
    version: __VERSION__
  },
  env: {
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  },
  api: {
    dev_url: import.meta.env.VITE_AKIRA_DEV_API,
    prod_url: import.meta.env.VITE_AKIRA_PROD_API
  },
  webPush: {
    vapidKey: import.meta.env.VITE_VAPID_KEY
  }
}

if (config.env.dev) {
  config.api.dev_url = config.api.dev_url.replace(
    'localhost',
    window.location.hostname
  )
}
