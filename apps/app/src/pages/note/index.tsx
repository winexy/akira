/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React, {useEffect} from 'react'
import {PageView} from 'shared/ui/page-view'
import {useQuery} from 'react-query'
import {useParams} from 'react-router'
import {
  customStyleMap,
  useEditorContext,
  TextEditorProvider,
  blockRenderMap,
  plugins,
  blockStyleFn
} from 'shared/lib/editor'
import {api} from 'shared/api'
import isNil from 'lodash/isNil'
import isError from 'lodash/isError'

const TextEditor: React.FC = () => {
  const editor = useEditorContext()

  return (
    <Editor
      plugins={plugins}
      blockRenderMap={blockRenderMap}
      customStyleMap={customStyleMap}
      blockStyleFn={blockStyleFn}
      handleKeyCommand={editor.handleKeyCommand}
      keyBindingFn={editor.handlerKeyBinding}
      editorState={editor.state}
      onChange={editor.onChange}
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
  const noteQuery = useQuery(['notes', uuid], () =>
    api.get<Note>(`notes/${uuid}`).then(res => res.data)
  )

  useNotePageTitle(noteQuery.data)

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
      <h1 className="text-6xl font-bold">{noteQuery.data.title}</h1>
      <TextEditorProvider>
        <div className="mt-8 text-xl">
          <TextEditor />
        </div>
      </TextEditorProvider>
    </PageView>
  )
}

export default NotePage
