import {Editor, EditorState} from 'draft-js'
import React, {useState} from 'react'
import {MainView} from '../MainView'

export const NoteView: React.FC = () => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )

  return (
    <MainView>
      <Editor editorState={editorState} onChange={setEditorState} />
    </MainView>
  )
}
