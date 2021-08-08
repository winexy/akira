import {nanoid} from 'nanoid'
import React, {createContext, useState, useContext} from 'react'
import {MainView} from '../MainView'

type NoteType = {
  id: string
  type: 'note'
  children: string[]
  meta: {}
}

type NoteTextType = {
  id: string
  type: 'text'
  content: string
  children: []
  meta: {}
}

type NoteHeadingType = {
  id: string
  type: 'heading'
  content: string
  meta: {
    level: 1 | 2 | 3 | 4 | 5 | 6
  }
}

type NodeLike = NoteTextType | NoteHeadingType

const TextNode: React.FC<{node: NoteTextType}> = ({node}) => {
  const context = useNoteContext()

  return (
    <p
      data-node-id={node.id}
      contentEditable
      className="focus:outline-none"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: node.content
      }}
      onBlur={event => {
        context.onUpdate(node, {
          content: event.target.textContent ?? ''
        })
      }}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          event.preventDefault()
          context.onEnter()
        }
      }}
    />
  )
}

const HeadingNode: React.FC<{node: NoteHeadingType}> = ({node}) => {
  const HeadingTag = (`h${node.meta.level}` as unknown) as React.ElementType

  return (
    <HeadingTag className="font-semibold text-3xl">{node.content}</HeadingTag>
  )
}

const RenderNode: React.FC<{nodeId: string}> = ({nodeId}) => {
  const context = useNoteContext()
  const node = context.hashTable[nodeId]

  switch (node.type) {
    case 'text':
      return <TextNode key={nodeId} node={node} />
    case 'heading':
      return <HeadingNode key={nodeId} node={node} />
    default: {
      window.console.warn('Unsupported node type', node!.type)
      return null
    }
  }
}

const NoteComponent: React.FC = () => {
  const context = useNoteContext()

  return (
    <div className="px-4">
      {context.noteTree.children.map(nodeId => (
        <RenderNode key={nodeId} nodeId={nodeId} />
      ))}
    </div>
  )
}

function Note(children: NoteType['children']): NoteType {
  return {
    id: nanoid(),
    type: 'note',
    children,
    meta: {}
  }
}

function NoteText(
  content: string,
  children: NoteTextType['children'] = []
): NoteTextType {
  return {
    id: nanoid(),
    type: 'text',
    content,
    children,
    meta: {}
  }
}

function NoteHeading(
  content: string,
  level: NoteHeadingType['meta']['level']
): NoteHeadingType {
  return {
    id: nanoid(),
    type: 'heading',
    content,
    meta: {
      level
    }
  }
}

function useNote() {
  const textId = nanoid()
  const [hashTable, setHashTable] = useState<Record<string, NodeLike>>({
    [textId]: {
      id: textId,
      type: 'text',
      content: 'Hello World',
      children: [],
      meta: {}
    }
  })

  const [noteTree, setNoteTree] = useState(() => {
    return {
      id: nanoid(),
      type: 'note',
      children: [textId]
    }
  })

  function onUpdate(node: NodeLike, patch: {content: string}) {
    setHashTable({
      ...hashTable,
      [node.id]: {
        ...node,
        content: patch.content
      }
    })
  }

  function onEnter() {
    const textNode = NoteText('')

    setHashTable({
      ...hashTable,
      [textNode.id]: textNode
    })
    setNoteTree({
      ...noteTree,
      children: [...noteTree.children, textNode.id]
    })

    requestAnimationFrame(() => {
      const node = document.querySelector(`[data-node-id="${textNode.id}"]`)

      if (node !== null && node instanceof HTMLElement) {
        node.focus()
      } else {
        console.log('cant find node')
      }
    })
  }

  return {noteTree, hashTable, onUpdate, onEnter}
}

const NoteContext = createContext<ReturnType<typeof useNote> | null>(null)

function useNoteContext(): NonNullable<ReturnType<typeof useNote>> {
  const context = useContext(NoteContext)

  if (context === null) {
    throw new Error('useNoteContext should be used within NoteContext.Provider')
  }

  return context
}

export const NoteView: React.FC = () => {
  const context = useNote()

  return (
    <MainView>
      <NoteContext.Provider value={context}>
        <NoteComponent />
      </NoteContext.Provider>
    </MainView>
  )
}
