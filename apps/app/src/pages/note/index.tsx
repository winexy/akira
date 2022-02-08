/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React, {useEffect} from 'react'
import {PageView} from 'shared/ui/page-view'
import {useQuery, useMutation} from 'react-query'
import {useParams} from 'react-router'
import {
  customStyleMap,
  useEditorContext,
  TextEditorProvider,
  blockRenderMap,
  plugins,
  blockStyleFn,
  useEditor
} from 'shared/lib/editor'
import {api} from 'shared/api'
import isNil from 'lodash/isNil'
import isError from 'lodash/isError'
import debounce from 'lodash/debounce'
import {EditableHeading} from 'shared/ui/editable-heading'
import {EditorState} from 'draft-js'

const TextEditor: React.FC<{onChange(): void}> = ({onChange}) => {
  const editor = useEditorContext()

  function handleChange(editorState: EditorState) {
    editor.onChange(editorState)
    onChange()
  }

  return (
    <Editor
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

const NotePage: React.FC = () => {
  const {uuid} = useParams<{uuid: string}>()
  const editor = useEditor()
  const noteQuery = useQuery(
    ['notes', uuid],
    () => api.get<Note>(`notes/${uuid}`).then(res => res.data),
    {
      onSuccess(note) {
        editor.hydrate(note.content)
      }
    }
  )

  const patchNoteMutation = useMutation(
    ({noteId, patch}: {noteId: string; patch: NotePatch}) => {
      return api.patch(`notes/${noteId}`, patch).then(res => res.data)
    }
  )

  useNotePageTitle(noteQuery.data)

  function onTitleChange(title: string) {
    const note = noteQuery.data

    if (isNil(note)) {
      globalThis.console.warn('note is nil')
      return
    }

    patchNoteMutation.mutate({noteId: note.uuid, patch: {title}})
  }

  const onContentChange = debounce(() => {
    const note = noteQuery.data

    if (isNil(note)) {
      globalThis.console.warn('note is nil')
      return
    }

    const html = editor.toHtml()

    patchNoteMutation.mutate({
      noteId: note.uuid,
      patch: {content: html}
    })
  }, 3000)

  if (noteQuery.isLoading) {
    return <PageView className="px-4">...fetching</PageView>
  }

  if (noteQuery.isError || isNil(noteQuery.data)) {
    return (
      <PageView className="px-4">
        Failed to load note.{' '}
        {isError(noteQuery.error) && noteQuery.error.message}
      </PageView>
    )
  }

  return (
    <PageView withBackNavigation className="py-10 px-24">
      <EditableHeading
        className="text-6xl"
        value={noteQuery.data.title}
        onChange={onTitleChange}
      />
      <div className="mt-8 text-xl">
        <TextEditorProvider editor={editor}>
          <TextEditor onChange={onContentChange} />
        </TextEditorProvider>
      </div>
    </PageView>
  )
}

export default NotePage
