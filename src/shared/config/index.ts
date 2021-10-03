export const config = {
  app: {
    // @ts-ignore
    version: __VERSION__
  },
  api: {
    url: import.meta.env.VITE_AKIRA_API
  }
}

if (import.meta.env.DEV) {
  config.api.url = config.api.url.replace('localhost', window.location.hostname)
}
