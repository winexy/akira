/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */
const noop = () => {}

function NetworkFirst(request, {onSuccess = noop}) {
  self.console.log(`[sw] nework first :: ${request.url}`)

  return fetch(request)
    .then(response => {
      onSuccess(response)
      return response
    })
    .catch(error => {
      return caches.match(request).then(response => response)
    })
}

function CacheFirst(request, {onFetchSuccess = noop}) {
  self.console.log(`[sw] cache first :: ${request.url}`)

  return caches.match(request).then(response => {
    return (
      response ||
      fetch(request).then(response => {
        onFetchSuccess(response)
        return response
      })
    )
  })
}

function putToCache(event, request, response) {
  const clone = response.clone()

  event.waitUntil(
    caches.open('app').then(cache => {
      cache.put(request, clone)
    }),
  )
}

self.addEventListener('install', event => {
  const appCache = caches.open('app')
  event.waitUntil(appCache)
})

self.addEventListener('fetch', event => {
  const {request} = event

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  const accept = request.headers.get('Accept')

  if (accept.includes('text/html')) {
    event.respondWith(
      NetworkFirst(request, {
        onSuccess(response) {
          putToCache(event, request, response)
        },
      }),
    )
    return
  }

  if (
    accept.includes('text/css') ||
    accept.includes('text/javascript') ||
    accept.includes('image')
  ) {
    event.respondWith(
      CacheFirst(request, {
        onFetchSuccess(response) {
          putToCache(event, request, response)
        },
      }),
    )
    return
  }

  self.console.log(`[sw] skip :: ${accept}, ${request.url}`)
})
