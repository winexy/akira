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
  useEditor
} from 'shared/lib/editor'
import {api} from 'shared/api'
import isNil from 'lodash/isNil'
import isError from 'lodash/isError'
import {EditableHeading} from 'shared/ui/editable-heading'
import {EditorState} from 'draft-js'
import clsx from 'clsx'

const TextEditor: React.FC<{onChange(): void}> = ({onChange}) => {
  const editor = useEditorContext()

  function handleChange(editorState: EditorState) {
    console.log('handleChange')
    editor.onChange(editorState)
    onChange()
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

const f = ({noteId, patch}: {noteId: string; patch: NotePatch}) => {
  return api.patch(`notes/${noteId}`, patch).then(res => res.data)
}

const NotePage: React.FC<{uuid: string; className: string}> = ({
  uuid,
  className
}) => {
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

  const patchNoteMutation = useMutation(f)

  useNotePageTitle(noteQuery.data)

  function onTitleChange(title: string) {
    const note = noteQuery.data

    if (isNil(note)) {
      globalThis.console.warn('note is nil')
      return
    }

    patchNoteMutation.mutate({noteId: note.uuid, patch: {title}})
  }

  const onContentChange = () => {
    if (isNil(uuid)) {
      globalThis.console.warn('note is nil')
      return
    }

    const html = editor.toHtml()

    console.log({html})

    patchNoteMutation.mutate({
      noteId: uuid,
      patch: {content: html}
    })
  }

  if (noteQuery.isLoading) {
    return <div className="px-4 py-6">...fetching</div>
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
    <div className={clsx('py-6 flex flex-col', className)}>
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
