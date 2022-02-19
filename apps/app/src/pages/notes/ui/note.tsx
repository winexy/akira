/* eslint-disable @typescript-eslint/no-use-before-define */
import Editor from 'draft-js-plugins-editor'
import React, {useEffect, useState} from 'react'
import {useStore} from 'effector-react'
import {useQueryClient} from 'react-query'
import {
  customStyleMap,
  useEditorContext,
  TextEditorProvider,
  blockRenderMap,
  plugins,
  blockStyleFn,
  useEditor,
} from 'shared/lib/editor'
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
import parseISO from 'date-fns/parseISO'
import formatRelative from 'date-fns/formatRelative'
import {noteModel} from 'entities/note'
import {noteUpdateQueueModel, withCacheRead} from 'features/note-update-queue'
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

type Props = {
  id: string
  className: string
}

const NotePage: React.FC<Props> = ({id, className}) => {
  const notesCache = useStore(noteUpdateQueueModel.$notesCache)
  const cachedNote = notesCache.get(id)

  const editor = useEditor(undefined, {
    onSave() {
      const cache = notesCache.get(id)

      if (isUndefined(cache)) {
        debug('nothing to save, skip force save')
      } else {
        debug('✋ force save')
        noteUpdateQueueModel.forceSave(cache.note)
      }
    },
  })

  const noteQuery = noteModel.useNoteQuery(id, {
    onSuccess(note) {
      debug('✅  🏗 success query, hydrate content')
      editor.hydrate(note.content)
      setUpdatedAt(note.updated_at)
      noteUpdateQueueModel.putCache(note)
    },
    initialData() {
      const cache = notesCache.get(id)

      if (cache) {
        debug('❕ set initial data', id, cache)
        return cache.note
      }

      debug('❕ no cache skip initial data', id)

      return undefined
    },
  })

  const [updatedAt, setUpdatedAt] = useState<string | undefined>(
    noteQuery.data?.updated_at,
  )

  useEffect(() => {
    const unwatchDone = noteUpdateQueueModel.updateNoteFx.doneData.watch(
      response => {
        debug('✅ success update')
        setUpdatedAt(response.updated_at)
      },
    )

    const unwatchFail = noteUpdateQueueModel.updateNoteFx.failData.watch(() => {
      debug('❌ failed to update')
    })

    return () => {
      unwatchDone()
      unwatchFail()
    }
  }, [])

  const queryClient = useQueryClient()

  useEffect(() => {
    debug('🏔 mount')

    const note = noteQuery.data

    if (isUndefined(note)) {
      return noop
    }

    if (noteQuery.isFetched || noteQuery.isSuccess) {
      debug('🏗 hydrate prefetched content')
      editor.hydrate(note.content)
    }

    return () => {
      debug('🌋 unmount')

      const cachedNote = notesCache.get(note.uuid)

      if (!isUndefined(cachedNote)) {
        debug('🔄  📖 update query cache', cachedNote)

        noteModel.updateNoteQueryData({
          noteId: note.uuid,
          queryClient,
          mutate(draft) {
            draft.content = cachedNote.note.content
          },
        })
      }
    }
  }, [])

  const isPending = useStore(noteUpdateQueueModel.updateNoteFx.pending)

  useNotePageTitle(cachedNote?.note)

  async function onTitleChange(title: string) {
    const note = noteQuery.data

    if (isNil(note)) {
      return
    }

    noteUpdateQueueModel.writeCache({
      id: note.uuid,
      patch: {title},
    })

    await noteUpdateQueueModel.updateNoteFx({
      id: note.uuid,
      patch: {title},
    })

    noteModel.updateNotesPreviewQueryData({
      noteId: note.uuid,
      queryClient,
      title,
    })
  }

  const onContentChange = (editorState: EditorState) => {
    const note = noteQuery.data

    if (isNil(id) || isNil(note)) {
      globalThis.console.warn('note is nil')
      return
    }

    const lastChangeType = editorState.getLastChangeType()

    if (isNull(lastChangeType)) {
      return
    }

    debug('🔀 content changed', lastChangeType)

    const content = editor.toHtml(editorState)

    noteUpdateQueueModel.writeCache({
      id: note.uuid,
      patch: {content},
    })

    noteUpdateQueueModel.enqueueUpdateFx({id, content})
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

export default withCacheRead(NotePage)
