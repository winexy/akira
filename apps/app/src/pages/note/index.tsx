/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React from 'react'
import {PageView} from 'shared/ui/page-view'
import {
  customStyleMap,
  useEditorContext,
  TextEditorProvider,
  blockRenderMap,
  plugins,
  blockStyleFn
} from 'shared/lib/editor'

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
  return (
    <PageView className="px-4">
      <TextEditorProvider>
        <TextEditor />
      </TextEditorProvider>
    </PageView>
  )
}

export default NotePage
