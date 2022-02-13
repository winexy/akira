/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React, {useEffect} from 'react'
import {useQuery, useMutation} from 'react-query'
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
import isString from 'lodash/isString'
import {EditableHeading} from 'shared/ui/editable-heading'
import {EditorState} from 'draft-js'
import clsx from 'clsx'
import debouncePromise from 'debounce-promise'
import ContentLoader from 'react-content-loader'
import {useShimmerColors} from 'shared/ui/shimmer'
import isNull from 'lodash/isNull'
import {Spin} from 'shared/ui/spin'

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

const NotePage: React.FC<{uuid: string; className: string}> = ({
  uuid,
  className,
}) => {
  const editor = useEditor()
  const noteQuery = useQuery(
    NoteQuery.One(uuid),
    () => api.get<Note>(`notes/${uuid}`).then(res => res.data),
    {
      onSuccess(note) {
        debug('success query, hydrate content')
        editor.hydrate(note.content)
      },
    },
  )

  useEffect(() => {
    const content = noteQuery.data?.content

    if (noteQuery.isFetched && isString(content)) {
      debug('hydrate prefetched content')
      editor.hydrate(content)
    }
  }, [])

  const patchNoteMutation = useMutation(patchNote)

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

    if (isNull(editorState.getLastChangeType())) {
      return
    }

    debug('call patch mutation')

    const html = editor.toHtml(editorState)

    patchNoteMutation.mutate({
      noteId: uuid,
      patch: {content: html},
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
      {patchNoteMutation.isLoading && (
        <div className="absolute right-0 top-0 mr-8 mt-6 flex items-center animate-pulse">
          <Spin className="w-4 h-4 text-gray-300 " />
          <span className="ml-3 text-sm text-gray-400">Saving</span>
        </div>
      )}
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
