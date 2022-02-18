/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React, {FC, useEffect, useState} from 'react'
import {useStore} from 'effector-react'
import {useQuery, useQueryClient} from 'react-query'
import {
  customStyleMap,
  useEditorContext,
  TextEditorProvider,
  blockRenderMap,
  plugins,
  blockStyleFn,
  useEditor,
} from 'shared/lib/editor'
import {api} from 'shared/api'
import isNil from 'lodash/isNil'
import isError from 'lodash/isError'
import {EditableHeading} from 'shared/ui/editable-heading'
import {EditorState} from 'draft-js'
import clsx from 'clsx'
import ContentLoader from 'react-content-loader'
import {useShimmerColors} from 'shared/ui/shimmer'
import isNull from 'lodash/isNull'
import noop from 'lodash/noop'
import isUndefined from 'lodash/isUndefined'
import {Spin} from 'shared/ui/spin'
import produce from 'immer'
import parseISO from 'date-fns/parseISO'
import formatRelative from 'date-fns/formatRelative'
import {app} from 'shared/lib/app-domain'
import {forward} from 'effector'
import entries from 'lodash/entries'
import localforage from 'localforage'
import {noteApi, noteModel} from 'entities/note'
import {createDebugger} from 'shared/lib/debugger'

const TextEditor: React.FC<{onChange(editorState: EditorState): void}> = ({
  onChange,
}) => {
  const editor = useEditorContext()

  function handleChange(editorState: EditorState) {
    editor.onChange(editorState)
    onChange(editorState)
  }

  return (
    <Editor
      ref={editor.ref}
      plugins={plugins}
      blockRenderMap={blockRenderMap}
      customStyleMap={customStyleMap}
      blockStyleFn={blockStyleFn}
      handleKeyCommand={editor.handleKeyCommand}
      keyBindingFn={editor.handlerKeyBinding}
      editorState={editor.state}
      onChange={handleChange}
    />
  )
}

function useNotePageTitle(note: noteModel.Note | undefined) {
  useEffect(() => {
    if (isNil(note)) {
      return
    }

    const {title} = document

    document.title = note.title

    // eslint-disable-next-line consistent-return
    return () => {
      document.title = title
    }
  }, [note])
}

const debug = createDebugger('editor')

type UpdateEvent = {
  id: string
  content: string
}

type UpdateParams = {
  id: string
  patch: noteModel.NotePatch
}

const writeCache = app.event<noteModel.Note>()
const forceSave = app.event<noteModel.Note>()
const commit = app.event<string>()

const enqueueUpdateFx = app.effect((event: UpdateEvent) => {
  return new Promise<UpdateEvent>((resolve, reject) => {
    debug('enqueue')

    const startUpdate = () => {
      debug('startUpdate')
      unwatchEnqueueUpdate()
      unwatchForceSave()
      resolve(event)
    }

    const abort = () => {
      debug('abort')
      clearTimeout(timeoutId)
      unwatchEnqueueUpdate()
      unwatchForceSave()
      reject()
    }

    const timeoutId = setTimeout(startUpdate, 2000)
    const unwatchEnqueueUpdate = enqueueUpdateFx.watch(abort)
    const unwatchForceSave = forceSave.watch(abort)
  })
})

const updateNoteFx = app.effect((event: UpdateParams) => {
  debug('update', event)
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

    debug('read notes from storage', value)

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
        debug('synced', id)
      }
    }
  },
)

const $isCacheRead = app.store(false).on(readCacheStorageFx.finally, () => true)

const $contentCache = app
  .store(new Map<string, CacheValue>())
  .on(readCacheStorageFx.doneData, (_, entries) => new Map(entries))
  .on(writeCache, (map, note) => {
    return produce(map, draft => {
      draft.set(note.uuid, {
        synced: false,
        note,
      })
    })
  })
  .on(commit, (map, id) => {
    const cache = map.get(id)

    debug('commited', id)

    if (cache) {
      return produce(map, draft => {
        draft.set(id, {...cache, synced: true})
      })
    }

    return map
  })

const persistContentCacheFx = app.effect((map: Map<string, CacheValue>) => {
  localforage
    .setItem('notes-map', entries(map))
    .then(() => debug('saved to storage', map))
    .catch(() => debug('failed to write to storage'))
})

forward({
  from: $contentCache,
  to: persistContentCacheFx,
})

forward({
  from: readCacheStorageFx.doneData,
  to: syncPersistedCacheFx,
})

type Props = {
  id: string
  className: string
}

const NotePage: React.FC<Props> = ({id, className}) => {
  const contentCache = useStore($contentCache)

  const editor = useEditor(undefined, {
    onSave() {
      const cache = contentCache.get(id)

      if (isUndefined(cache)) {
        debug('nothing to save, skip force save')
      } else {
        debug('force save')
        forceSave(cache.note)
      }
    },
  })

  const noteQuery = useQuery(
    noteModel.NoteQuery.One(id),
    () => {
      debug('fetch note query')
      return noteApi.fetchNote(id)
    },
    {
      refetchOnMount: true,
      onSuccess(note) {
        debug('success query, hydrate content')
        editor.hydrate(note.content)
        setUpdatedAt(note.updated_at)
      },
      onSettled() {
        debug('note query settled')
      },
      initialData() {
        const cache = contentCache.get(id)

        if (cache) {
          debug('set initial data', id, cache)
          return cache.note
        }

        debug('no cache skip initial data', id)

        return undefined
      },
    },
  )

  const [updatedAt, setUpdatedAt] = useState<string | undefined>(
    noteQuery.data?.updated_at,
  )

  useEffect(() => {
    const unwatchDone = updateNoteFx.doneData.watch(response => {
      debug('success update')
      setUpdatedAt(response.updated_at)
    })

    const unwatchFail = updateNoteFx.failData.watch(() => {
      debug('failed to update')
    })

    return () => {
      unwatchDone()
      unwatchFail()
    }
  }, [])

  const queryClient = useQueryClient()

  useEffect(() => {
    debug('mount')

    const note = noteQuery.data

    if (isUndefined(note)) {
      return noop
    }

    if (noteQuery.isFetched || noteQuery.isSuccess) {
      debug('hydrate prefetched content')
      editor.hydrate(note.content)
    }

    return () => {
      debug('unmount')

      const cachedNote = contentCache.get(note.uuid)

      if (!isUndefined(cachedNote)) {
        debug('update query cache', cachedNote)

        queryClient.setQueryData(
          noteModel.NoteQuery.One(note.uuid),
          produce(note, draft => {
            draft.content = cachedNote.note.content
          }),
        )
      }
    }
  }, [])

  const isPending = useStore(updateNoteFx.pending)

  useNotePageTitle(noteQuery.data)

  function onTitleChange(title: string) {
    const note = noteQuery.data

    if (isNil(note)) {
      return
    }

    writeCache({...note, title})

    updateNoteFx({
      id: note.uuid,
      patch: {title},
    }).then(() => {
      const notes = queryClient.getQueryData<Array<noteModel.NotePreview>>(
        noteModel.NoteQuery.Preview(),
      )

      if (isUndefined(notes)) {
        return
      }

      queryClient.setQueryData(
        noteModel.NoteQuery.Preview(),
        produce(notes, draft => {
          const index = draft.findIndex(n => n.uuid === note.uuid)
          notes[index].title = title
        }),
      )
    })
  }

  const onContentChange = (editorState: EditorState) => {
    if (isNil(id) || isNil(noteQuery.data)) {
      globalThis.console.warn('note is nil')
      return
    }

    const lastChangeType = editorState.getLastChangeType()

    if (isNull(lastChangeType)) {
      return
    }

    debug('content changed', lastChangeType)

    const content = editor.toHtml(editorState)

    writeCache({...noteQuery.data, content})
    enqueueUpdateFx({id, content})
  }

  const {backgroundColor, foregroundColor} = useShimmerColors()

  if (noteQuery.isLoading) {
    return (
      <div className="px-8 py-6 w-full text-left">
        <ContentLoader
          speed={2}
          width="100%"
          height="100%"
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        >
          <rect x="0" y="0" width="360" height="60" rx="8" ry="8" />
          <rect x="0" y="92" width="520" height="40" rx="8" ry="8" />
          <rect x="0" y="142" width="400" height="40" rx="8" ry="8" />
          <rect x="0" y="192" width="340" height="40" rx="8" ry="8" />
          <rect x="0" y="242" width="80%" height="160" rx="8" ry="8" />
          <rect x="0" y="412" width="380" height="40" rx="8" ry="8" />
          <rect x="0" y="462" width="340" height="40" rx="8" ry="8" />
        </ContentLoader>
      </div>
    )
  }

  if (noteQuery.isError || isNil(noteQuery.data)) {
    return (
      <div className="px-4 py-6">
        Failed to load note.{' '}
        {isError(noteQuery.error) && noteQuery.error.message}
      </div>
    )
  }

  return (
    <div className={clsx('py-6 flex flex-col relative', className)}>
      <div className="absolute right-0 top-0 mr-8 mt-6">
        {isPending && (
          <div className=" flex items-center animate-pulse">
            <Spin className="w-4 h-4 text-gray-300 " />
            <span className="ml-3 text-sm text-gray-400">Saving</span>
          </div>
        )}
        {!isPending && !isUndefined(updatedAt) && (
          <div className="text-gray-400 text-sm">
            {formatRelative(parseISO(updatedAt), new Date())}
          </div>
        )}
      </div>
      <div className="px-4">
        <EditableHeading
          className="text-4xl sm:text-6xl font-bold"
          value={noteQuery.data.title}
          onChange={onTitleChange}
        />
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        className="flex-1 pt-2 sm:pt-4 px-4 text-xl"
        onClick={() => editor.ref.current?.focus()}
      >
        <TextEditorProvider editor={editor}>
          <TextEditor onChange={onContentChange} />
        </TextEditorProvider>
      </div>
    </div>
  )
}

function wrap(Component: FC<Props>): FC<Props> {
  return props => {
    const isCacheRead = useStore($isCacheRead)

    useEffect(() => {
      if (!isCacheRead) {
        readCacheStorageFx()
      }
    }, [isCacheRead])

    if (isCacheRead) {
      return <Component {...props} />
    }

    return null
  }
}

export default wrap(NotePage)
