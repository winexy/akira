/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React from 'react'
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

const NotePage: React.FC = () => {
  const {uuid} = useParams<{uuid: string}>()
  const noteQuery = useQuery(['notes', uuid], () =>
    api.get(`notes/${uuid}`).then(res => res.data)
  )

  if (noteQuery.isLoading) {
    return <PageView className="px-4">...fetching</PageView>
  }

  return (
    <PageView className="py-10 px-24">
      <h1 className="text-6xl font-bold">{noteQuery.data.title}</h1>
      <TextEditorProvider>
        <TextEditor />
      </TextEditorProvider>
    </PageView>
  )
}

export default NotePage
