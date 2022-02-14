/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React, {useEffect, useRef, useState} from 'react'
import {useStore} from 'effector-react'
import {useQuery, useMutation, useQueryClient} from 'react-query'
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
import debouncePromise from 'debounce-promise'
import ContentLoader from 'react-content-loader'
import {useShimmerColors} from 'shared/ui/shimmer'
import isNull from 'lodash/isNull'
import noop from 'lodash/noop'
import isUndefined from 'lodash/isUndefined'
import {Spin} from 'shared/ui/spin'
import produce from 'immer'
import parseISO from 'date-fns/parseISO'
import formatRelative from 'date-fns/formatRelative'
import {app} from '../../shared/lib/app-domain'

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

type Note = {
  uuid: string
  title: string
  content: string
  // eslint-disable-next-line camelcase
  author_uid: string
  // eslint-disable-next-line camelcase
  updated_at: string
  // eslint-disable-next-line camelcase
  created_at: string
}

type NotePatch = {
  title?: string
  content?: string
}

function useNotePageTitle(note: Note | undefined) {
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

const createDebugger = (tag: string) => (...args: any[]) =>
  console.debug(`[${tag}]`, ...args)

const debug = createDebugger('editor')

const patchNote = debouncePromise(
  ({noteId, patch}: {noteId: string; patch: NotePatch}) => {
    debug('patch-note', noteId, patch)
    return api.patch(`notes/${noteId}`, patch).then(res => res.data)
  },
  1000,
)

const NoteQuery = {
  One: (uuid: string) => ['notes', uuid],
}

const putCache = app.event<{id: string; content: string}>()

const $contentCache = app.store(new Map<string, string>())

$contentCache.on(putCache, (map, event) => {
  map.set(event.id, event.content)
  return map
})

const NotePage: React.FC<{uuid: string; className: string}> = ({
  uuid,
  className,
}) => {
  const editor = useEditor(undefined, {
    onSave() {
      debug('save')
    },
  })

  const [updatedAt, setUpdatedAt] = useState<string>()
  const contentCache = useStore($contentCache)

  const noteQuery = useQuery(
    NoteQuery.One(uuid),
    () => api.get<Note>(`notes/${uuid}`).then(res => res.data),
    {
      refetchOnMount: true,
      onSuccess(note) {
        debug('success query, hydrate content')
        editor.hydrate(note.content)
        setUpdatedAt(note.updated_at)
      },
      onSettled() {
        debug('note query fetched')
      },
    },
  )

  const queryClient = useQueryClient()

  useEffect(() => {
    debug('mount')

    const note = noteQuery.data

    if (isUndefined(note)) {
      return noop
    }

    if (noteQuery.isFetched) {
      debug('hydrate prefetched content')
      editor.hydrate(note.content)
    }

    return () => {
      debug('unmount')

      const content = contentCache.get(note.uuid)

      if (!isUndefined(content)) {
        debug('update query cache', content)

        queryClient.setQueryData(
          NoteQuery.One(note.uuid),
          produce(note, draft => {
            draft.content = content
          }),
        )
      }
    }
  }, [])

  const patchNoteMutation = useMutation(patchNote, {
    // eslint-disable-next-line camelcase
    onSuccess(response: {uuid: string; updated_at: string}) {
      setUpdatedAt(response.updated_at)
      debug('success patch', response)
    },
    onError(error) {
      debug('failed to patch', error)
    },
  })

  useNotePageTitle(noteQuery.data)

  function onTitleChange(title: string) {
    const note = noteQuery.data

    if (isNil(note)) {
      globalThis.console.warn('note is nil')
      return
    }

    patchNoteMutation.mutate({noteId: note.uuid, patch: {title}})
  }

  const onContentChange = (editorState: EditorState) => {
    if (isNil(uuid) || isNil(noteQuery.data)) {
      globalThis.console.warn('note is nil')
      return
    }

    const lastChangeType = editorState.getLastChangeType()

    if (isNull(lastChangeType)) {
      return
    }

    debug('call patch mutation', lastChangeType)

    const content = editor.toHtml(editorState)

    putCache({id: uuid, content})

    patchNoteMutation.mutate({
      noteId: uuid,
      patch: {content},
    })
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
        {patchNoteMutation.isLoading && (
          <div className=" flex items-center animate-pulse">
            <Spin className="w-4 h-4 text-gray-300 " />
            <span className="ml-3 text-sm text-gray-400">Saving</span>
          </div>
        )}
        {!patchNoteMutation.isLoading && !isUndefined(updatedAt) && (
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
        className="flex-1 pt-2 sm:pt-8 px-4 text-xl"
        onClick={() => editor.ref.current?.focus()}
      >
        <TextEditorProvider editor={editor}>
          <TextEditor onChange={onContentChange} />
        </TextEditorProvider>
      </div>
    </div>
  )
}

export default NotePage
