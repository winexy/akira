import {nanoid} from 'nanoid'
import React, {
  createContext,
  useState,
  useContext,
  useLayoutEffect
} from 'react'
import {MainView} from '../MainView'

type ParentRef = string | null

type NoteType = {
  id: string
  type: 'note'
  children: string[]
  meta: {}
  parent: ParentRef
}

type NoteTextType = {
  id: string
  type: 'text'
  content: string
  children: string[]
  parent: ParentRef
  meta: {}
}

type NoteHeadingType = {
  id: string
  type: 'heading'
  content: string
  children: string[]
  parent: ParentRef
  meta: {
    level: 1 | 2 | 3
  }
}

type NodeLike = NoteType | NoteTextType | NoteHeadingType

const findByNodeId = (nodeId: string) => {
  return document.querySelector(`[data-node-id="${nodeId}"]`)
}

const TextNode: React.FC<{node: NoteTextType}> = ({node}) => {
  const context = useNoteContext()

  return (
    <p
      data-node-id={node.id}
      data-node-type="text-node"
      contentEditable
      className="focus:outline-none"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: node.content
      }}
      onFocus={() => context.onFocus(node)}
      onBlur={event => {
        context.onUpdate(node, {
          content: event.target.textContent ?? ''
        })

        context.onBlur()
      }}
      onKeyDown={event => {
        // eslint-disable-next-line default-case
        switch (event.key) {
          case 'Enter': {
            event.preventDefault()
            context.onEnter(node)
            break
          }
          case 'ArrowDown': {
            context.onArrowDown(node)
            break
          }
          case 'ArrowUp': {
            context.onArrowUp(node)
            break
          }
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
  const root = context.hashTable[context.noteTree.id]

  return (
    <div className="px-4">
      {root.children.map(nodeId => (
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
    meta: {},
    parent: null
  }
}

function NoteText({
  content = '',
  children = [],
  parent = null
}: Partial<NoteTextType>): NoteTextType {
  return {
    id: nanoid(),
    type: 'text',
    content,
    children,
    meta: {},
    parent
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
    },
    parent: null,
    children: []
  }
}

const textId = nanoid()
const rootId = nanoid()

const defaultNoteTree: NoteType = {
  id: rootId,
  type: 'note',
  children: [textId],
  meta: {},
  parent: null
}

function useNote() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [noteTree, setNoteTree] = useState<NoteType>(() => {
    return defaultNoteTree
  })

  const [hashTable, setHashTable] = useState<Record<string, NodeLike>>({
    [textId]: {
      id: textId,
      type: 'text',
      content: 'Hello World',
      children: [],
      meta: {},
      parent: rootId
    },
    [rootId]: noteTree
  })

  function onUpdate(node: NodeLike, patch: {content: string}) {
    const newNode = {
      ...node,
      content: patch.content
    }

    setHashTable({
      ...hashTable,
      [node.id]: newNode
    })
  }

  function onEnter(node: NodeLike) {
    const textNode = NoteText({parent: node.parent})

    const update = {
      ...hashTable,
      [textNode.id]: textNode
    }

    if (node.parent) {
      const parent = hashTable[node.parent]
      const index = parent.children.indexOf(node.id)

      const newParent: NodeLike = {
        ...parent,
        children: [
          ...parent.children.slice(0, index + 1),
          textNode.id,
          ...parent.children.slice(index + 1)
        ]
      }

      update[node.parent] = newParent
    }

    setHashTable(update)
    setActiveNodeId(textNode.id)
  }

  function onArrowDown(node: NodeLike) {
    if (node.parent) {
      const parent = hashTable[node.parent]
      const index = parent.children.indexOf(node.id)

      if (index < parent.children.length - 1) {
        const nextIndex = index + 1
        const nextNode = parent.children[nextIndex]

        setActiveNodeId(nextNode)
      } else {
        window.console.warn(
          'lower boundary focus navigation is not supported yet'
        )
      }
    }
  }

  function onArrowUp(node: NodeLike) {
    if (node.parent) {
      const parent = hashTable[node.parent]
      const index = parent.children.indexOf(node.id)

      if (index > 0) {
        const prevIndex = index - 1
        const prevNode = parent.children[prevIndex]

        setActiveNodeId(prevNode)
      } else {
        window.console.warn(
          'upper boundary focus navigation is not supported yet'
        )
      }
    }
  }

  function onFocus(node: NodeLike) {
    setActiveNodeId(node.id)
  }

  function onBlur() {
    setActiveNodeId(null)
  }

  useLayoutEffect(() => {
    if (activeNodeId) {
      const node = findByNodeId(activeNodeId)

      if (node !== null && node instanceof HTMLElement) {
        node.focus()
      }
    }
  }, [activeNodeId])

  return {
    noteTree,
    hashTable,
    onUpdate,
    onEnter,
    onArrowDown,
    onFocus,
    onBlur,
    onArrowUp
  }
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
