import {forward} from 'effector'
import {noteApi, noteModel} from 'entities/note'
import produce from 'immer'
import localforage from 'localforage'
import {isUndefined} from 'lodash'
import entries from 'lodash/entries'
import {app} from 'shared/lib/app-domain'
import {createDebugger, Invariant} from 'shared/lib/debugger'

const debug = createDebugger('note-update-queue', {
  enabled: true,
})

type UpdateEvent = {
  id: string
  content: string
}

type UpdateParams = {
  id: string
  patch: noteModel.NotePatch
}

const writeCache = app.event<UpdateParams>()
const forceSave = app.event<noteModel.Note>()
const putCache = app.event<noteModel.Note>()
const commit = app.event<string>()

const enqueueUpdateFx = app.effect((event: UpdateEvent) => {
  return new Promise<UpdateEvent>((resolve, reject) => {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    debug('🔜 enqueue')

    const startUpdate = () => {
      unwatchEnqueueUpdate()
      unwatchForceSave()
      resolve(event)
    }

    const abort = () => {
      debug('🔻 abort')
      clearTimeout(timeoutId)
      unwatchEnqueueUpdate()
      unwatchForceSave()
      reject()
    }

    const timeoutId = setTimeout(startUpdate, 2000)
    const unwatchEnqueueUpdate = enqueueUpdateFx.watch(abort)
    const unwatchForceSave = forceSave.watch(abort)
    /* eslint-enable @typescript-eslint/no-use-before-define */
  })
})

const updateNoteFx = app.effect((event: UpdateParams) => {
  debug('✔️ startUpdate', event)
  return noteApi.patchNote({
    noteId: event.id,
    patch: event.patch,
  })
})

forward({
  from: enqueueUpdateFx.doneData,
  to: updateNoteFx.prepend(note => ({
    id: note.id,
    patch: {content: note.content},
  })),
})

forward({
  from: forceSave,
  to: updateNoteFx.prepend(note => ({
    id: note.uuid,
    patch: {content: note.content},
  })),
})

forward({
  from: updateNoteFx.doneData,
  to: commit.prepend(event => event.uuid),
})

type CacheValue = {
  synced: boolean
  note: noteModel.Note
}

const readCacheStorageFx = app.effect(
  async (): Promise<Array<[string, CacheValue]>> => {
    const value = await localforage.getItem('notes-map')

    debug('🧐 read notes from storage', value)

    if (Array.isArray(value)) {
      return value
    }

    return []
  },
)

const syncPersistedCacheFx = app.effect(
  async (entries: Array<[string, CacheValue]>) => {
    // eslint-disable-next-line no-restricted-syntax
    for await (const [id, noteCache] of entries) {
      if (!noteCache.synced) {
        await updateNoteFx({id, patch: {content: noteCache.note.content}})
        debug('👌 synced', id)
      }
    }
  },
)

const $isCacheRead = app.store(false).on(readCacheStorageFx.finally, () => true)

const $notesCache = app
  .store(new Map<string, CacheValue>())
  .on(readCacheStorageFx.doneData, (_, entries) => new Map(entries))
  .on(putCache, (cache, note) => {
    return produce(cache, draft => {
      draft.set(note.uuid, {
        synced: true,
        note,
      })
    })
  })
  .on(writeCache, (cache, event) => {
    const record = cache.get(event.id)

    if (isUndefined(record)) {
      throw Invariant('cache is missing pre-written note')
    }

    return produce(cache, draft => {
      draft.set(event.id, {
        synced: false,
        note: {
          ...record.note,
          ...event.patch,
        },
      })
    })
  })
  .on(commit, (cache, id) => {
    const record = cache.get(id)

    if (record) {
      return produce(cache, draft => {
        draft.set(id, {...record, synced: true})
      })
    }

    return cache
  })

const persistContentCacheFx = app.effect((map: Map<string, CacheValue>) => {
  localforage
    .setItem('notes-map', entries(map))
    .then(() => debug('📖 saved to storage', map))
    .catch(() => debug('❌ 📖 failed to write to storage'))
})

forward({
  from: $notesCache,
  to: persistContentCacheFx,
})

forward({
  from: readCacheStorageFx.doneData,
  to: syncPersistedCacheFx,
})

export const noteUpdateQueueModel = {
  $isCacheRead,
  $notesCache,
  putCache,
  writeCache,
  forceSave,
  updateNoteFx,
  enqueueUpdateFx,
  persistContentCacheFx,
  readCacheStorageFx,
}
