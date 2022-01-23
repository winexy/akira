/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable  */

import React from 'react'

import {
  EditorState,
  RichUtils,
  DraftEntityMutability,
  getDefaultKeyBinding,
  DefaultDraftBlockRenderMap,
  DraftEditorCommand,
  ContentBlock
} from 'draft-js'
import {convertFromHTML, convertToHTML} from 'draft-convert'
import Immutable from 'immutable'
// @ts-expect-error no type anotations
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin'
import {EditorPlugin} from 'draft-js-plugins-editor'

enum InlineStyle {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  UNDERLINE = 'UNDERLINE',
  ACCENT = 'ACCENT' // код нашего произвольного стиля
}

enum BlockType {
  /* Заголовки */
  h1 = 'header-one',
  h2 = 'header-two',
  h3 = 'header-three',
  h4 = 'header-four',
  h5 = 'header-five',
  h6 = 'header-six',
  /* Цитата */
  blockquote = 'blockquote',
  /* Блок с кодом */
  code = 'code-block',
  /* Список */
  list = 'unordered-list-item',
  /* Нумерованный список */
  orderList = 'ordered-list-item',
  /* Сноска */
  cite = 'cite',
  /* Простой текст */
  default = 'unstyled'
}

enum EntityType {
  link = 'LINK'
}

const customStyleMap = {
  [InlineStyle.ACCENT]: {
    backgroundColor: '#F7F6F3',
    color: '#A41E68',
    borderRadius: 4,
    padding: '1px 4px',
    fontWeight: 600
  },
  [BlockType.h2]: {
    color: 'red'
  }
}

const stateToHTML = convertToHTML<InlineStyle, BlockType>({
  styleToHTML: style => {
    switch (style) {
      case InlineStyle.BOLD:
        return <strong />
      case InlineStyle.ITALIC:
        return <i />
      case InlineStyle.ACCENT:
        return (
          <span className="accent" style={customStyleMap[InlineStyle.ACCENT]} />
        )
      default:
        return null
    }
  },
  blockToHTML: block => {
    console.log(block)
    switch (block.type) {
      case BlockType.h1:
        return <h1 />
      default:
        return null
    }
  },
  entityToHTML: (entity, originalText) => {
    console.log({entity, originalText})
    if (entity.type === EntityType.link) {
      return <a href={entity.data.href}>{originalText}</a>
    }
    return originalText
  }
})

const HTMLtoState = convertFromHTML<DOMStringMap, BlockType>({
  htmlToStyle: (nodeName, node, currentStyle) => {
    if (nodeName === 'strong') {
      return currentStyle.add(InlineStyle.BOLD)
    }

    if (nodeName === 'span' && node.classList.contains('accent')) {
      return currentStyle.add(InlineStyle.ACCENT)
    }

    return currentStyle
  },
  htmlToBlock(nodeName, node) {
    switch (nodeName) {
      case 'h1':
        return BlockType.h1
      case 'div':
      case 'p':
        return BlockType.default
      default:
        return undefined
    }
  },
  htmlToEntity: (nodeName, node, createEntity) => {
    if (nodeName === 'a' && node.href) {
      return createEntity(EntityType.link, 'MUTABLE', {href: node.href})
    }

    return undefined
  }
})

function useEditor(html?: string) {
  const [state, setState] = React.useState(() =>
    html
      ? EditorState.createWithContent(HTMLtoState(html))
      : EditorState.createEmpty()
  )

  const toggleBlockType = React.useCallback((blockType: BlockType) => {
    console.log('toggleBlockType', blockType)
    setState(currentState => RichUtils.toggleBlockType(currentState, blockType))
  }, [])

  const currentBlockType = React.useMemo(() => {
    const selection = state.getSelection()
    const content = state.getCurrentContent()
    const block = content.getBlockForKey(selection.getStartKey())

    return block.getType() as BlockType
  }, [state])

  const toggleInlineStyle = React.useCallback((inlineStyle: InlineStyle) => {
    console.log('toggleInlineStyle', inlineStyle)
    setState(currentState =>
      RichUtils.toggleInlineStyle(currentState, inlineStyle)
    )
  }, [])

  const hasInlineStyle = React.useCallback(
    (inlineStyle: InlineStyle) => {
      return state.getCurrentInlineStyle().has(inlineStyle)
    },
    [state]
  )

  const addEntity = React.useCallback(
    (
      entityType: EntityType,
      data: Record<string, string>,
      mutability: DraftEntityMutability
    ) => {
      console.log('addEntity', entityType)
      setState(currentState => {
        /* Получаем текущий контент */
        const contentState = currentState.getCurrentContent()
        /* Создаем Entity с данными */
        const contentStateWithEntity = contentState.createEntity(
          entityType,
          mutability,
          data
        )
        /* Получаем уникальный ключ Entity */
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        /* Обьединяем текущее состояние с новым */
        const newState = EditorState.set(currentState, {
          currentContent: contentStateWithEntity
        })
        /* Вставляем ссылку в указанное место */
        return RichUtils.toggleLink(
          newState,
          newState.getSelection(),
          entityKey
        )
      })
    },
    []
  )

  const addLink = React.useCallback(
    href => {
      console.log('addLine', href)
      addEntity(EntityType.link, {href}, 'MUTABLE')
    },
    [addEntity]
  )

  const setEntityData = React.useCallback((entityKey, data) => {
    console.log('setEntityDate', entityKey)
    setState(currentState => {
      /* Получаем текущий контент */
      const content = currentState.getCurrentContent()
      /* Объединяем текущие данные Entity с новыми */
      const contentStateUpdated = content.mergeEntityData(entityKey, data)
      /* Обновляем состояние редактора с указанием типа изменения */
      return EditorState.push(currentState, contentStateUpdated, 'apply-entity')
    })
  }, [])

  const handleKeyCommand = React.useCallback(
    (command: KeyCommand, editorState: EditorState) => {
      console.log('handleKeyCommand', command)
      const newState = RichUtils.handleKeyCommand(editorState, command)

      if (command === 'accent') {
        toggleInlineStyle(InlineStyle.ACCENT)
        return 'handled'
      }

      if (newState) {
        setState(newState)
        return 'handled'
      }

      return 'not-handled'
    },
    [toggleInlineStyle]
  )

  const handlerKeyBinding = React.useCallback((e: React.KeyboardEvent) => {
    // const isCommandA = e.keyCode === 65 && KeyBindingUtil.hasCommandModifier(e)

    // if (isCommandA) {
    // return 'accent'
    // }

    return getDefaultKeyBinding(e)
  }, [])

  const toHtml = React.useCallback(() => {
    return stateToHTML(state.getCurrentContent())
  }, [state])

  return React.useMemo(
    () => ({
      state,
      toggleBlockType,
      currentBlockType,
      toggleInlineStyle,
      hasInlineStyle,
      addLink,
      setEntityData,
      handleKeyCommand,
      handlerKeyBinding,
      toHtml,
      onChange: setState
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  )
}

type EditorAPI = ReturnType<typeof useEditor>

const TextEditorContext = React.createContext<EditorAPI | undefined>(undefined)

function useEditorContext() {
  const context = React.useContext(TextEditorContext)

  if (context === undefined) {
    throw new Error('useEditorContext should be used withing TextEditorContext')
  }

  return context
}

const TextEditorProvider: React.FC = ({children}) => {
  const editor = useEditor(sessionStorage.getItem('editor') ?? '')

  return (
    <TextEditorContext.Provider value={editor}>
      {children}
    </TextEditorContext.Provider>
  )
}

const Heading: React.FC = props => {
  return <div style={{fontSize: 48}}>{props.children}</div>
}

const customBlockRenderMap = Immutable.Map({
  [BlockType.cite]: {
    element: 'cite'
  },
  [BlockType.h1]: {
    element: 'h1',
    wrapper: <Heading />
  }
})

const blockRenderMap = DefaultDraftBlockRenderMap.merge(customBlockRenderMap)

const plugins: Array<EditorPlugin> = [createMarkdownShortcutsPlugin()]

export type KeyCommand = DraftEditorCommand | 'accent'

function blockStyleFn(block: ContentBlock) {
  const type = block.getType()

  switch (type) {
    case BlockType.h1: {
      return 'editor-h1'
    }
    case BlockType.h2:
      return 'editor-h2'
  }
}

export type {EditorAPI}

export {
  blockStyleFn,
  plugins,
  blockRenderMap,
  customBlockRenderMap,
  useEditorContext,
  TextEditorProvider,
  useEditor,
  InlineStyle,
  BlockType,
  EntityType,
  customStyleMap
}
