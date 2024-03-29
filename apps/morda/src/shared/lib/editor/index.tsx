/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable  */

import React, {FC, MouseEventHandler, useRef} from 'react'

import {
  EditorState,
  RichUtils,
  DraftEntityMutability,
  getDefaultKeyBinding,
  DefaultDraftBlockRenderMap,
  DraftEditorCommand,
  Editor,
  EditorProps,
  KeyBindingUtil,
  CompositeDecorator,
  DraftDecorator,
  ContentState,
} from 'draft-js'
import {convertFromHTML, convertToHTML} from 'draft-convert'
import Immutable from 'immutable'
import clsx from 'clsx'
// @ts-expect-error no type anotations
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin'
import PluginEditor, {EditorPlugin} from 'draft-js-plugins-editor'
import './index.css'

enum InlineStyle {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  UNDERLINE = 'UNDERLINE',
  ACCENT = 'ACCENT', // код нашего произвольного стиля
  CODE = 'CODE',
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
  default = 'unstyled',
}

enum EntityType {
  link = 'LINK',
}

const customStyleMap = {
  [InlineStyle.ACCENT]: {
    backgroundColor: '#F7F6F3',
    color: '#A41E68',
    borderRadius: 4,
    padding: '1px 4px',
    fontWeight: 600,
  },
  [BlockType.h2]: {
    color: 'red',
  },
  [InlineStyle.CODE]: {
    backgroundColor: 'var(--code-style-bg)',
    color: 'var(--code-style-color)',
    borderRadius: 6,
    padding: '2px 8px',
    fontWeight: 600,
  },
}

export const stateToHTML = convertToHTML<InlineStyle, BlockType>({
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
    switch (block.type) {
      case BlockType.h1:
        return <h1 />
      default:
        return null
    }
  },
  entityToHTML: (entity, originalText) => {
    if (entity.type === EntityType.link) {
      return <a href={entity.data.href}>{originalText}</a>
    }
    return originalText
  },
})

export const HTMLtoState = convertFromHTML<DOMStringMap, BlockType>({
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
  },
})

type UseEditorProps = {
  onSave?(editorState: EditorState): void
}

type LinkProps = {
  entityKey: string
  contentState: ContentState
  children: React.ReactNode
}

const Link: FC<LinkProps> = props => {
  const {href} = props.contentState.getEntity(props.entityKey).getData()

  const onClick: MouseEventHandler = event => {
    event.preventDefault()
    window.open(href, '_blank')
  }

  return (
    <a
      href={href}
      title={href}
      target="_blank"
      className={clsx(
        'text-blue-500 underline cursor-pointer',
        'hover:no-underline hover:text-blue-400 active:text-blue-600',
        'transition',
      )}
      onClick={onClick}
    >
      {props.children}
    </a>
  )
}

const findLinkEntities: DraftDecorator['strategy'] = (
  contentBlock,
  callback,
  contentState,
) => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    )
  }, callback)
}

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
])

function useEditor(html: string | undefined, props: UseEditorProps = {}) {
  const [state, setState] = React.useState(() =>
    html
      ? EditorState.createWithContent(HTMLtoState(html), decorator)
      : EditorState.createEmpty(decorator),
  )
  const ref = useRef<PluginEditor>(null)

  const toggleBlockType = React.useCallback((blockType: BlockType) => {
    setState(currentState => RichUtils.toggleBlockType(currentState, blockType))
  }, [])

  const hydrate = React.useCallback((html: string) => {
    setState(EditorState.createWithContent(HTMLtoState(html)))
  }, [])

  const currentBlockType = React.useMemo(() => {
    const selection = state.getSelection()
    const content = state.getCurrentContent()
    const block = content.getBlockForKey(selection.getStartKey())

    return block.getType() as BlockType
  }, [state])

  const toggleInlineStyle = React.useCallback((inlineStyle: InlineStyle) => {
    setState(currentState =>
      RichUtils.toggleInlineStyle(currentState, inlineStyle),
    )
  }, [])

  const hasInlineStyle = React.useCallback(
    (inlineStyle: InlineStyle) => {
      return state.getCurrentInlineStyle().has(inlineStyle)
    },
    [state],
  )

  const addEntity = React.useCallback(
    (
      entityType: EntityType,
      data: Record<string, string>,
      mutability: DraftEntityMutability,
    ) => {
      setState(currentState => {
        /* Получаем текущий контент */
        const contentState = currentState.getCurrentContent()
        /* Создаем Entity с данными */
        const contentStateWithEntity = contentState.createEntity(
          entityType,
          mutability,
          data,
        )
        /* Получаем уникальный ключ Entity */
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        /* Обьединяем текущее состояние с новым */
        const newState = EditorState.set(currentState, {
          currentContent: contentStateWithEntity,
        })
        /* Вставляем ссылку в указанное место */
        return RichUtils.toggleLink(
          newState,
          newState.getSelection(),
          entityKey,
        )
      })
    },
    [],
  )

  const addLink = React.useCallback(
    (href: string) => {
      addEntity(EntityType.link, {href}, 'MUTABLE')
    },
    [addEntity],
  )

  const setEntityData = React.useCallback(
    (entityKey: string, data: Record<string, any>) => {
      setState(currentState => {
        /* Получаем текущий контент */
        const content = currentState.getCurrentContent()
        /* Объединяем текущие данные Entity с новыми */
        const contentStateUpdated = content.mergeEntityData(entityKey, data)
        /* Обновляем состояние редактора с указанием типа изменения */
        return EditorState.push(
          currentState,
          contentStateUpdated,
          'apply-entity',
        )
      })
    },
    [],
  )

  const handleKeyCommand = React.useCallback(
    (command: KeyCommand, editorState: EditorState) => {
      const newState = RichUtils.handleKeyCommand(editorState, command)

      if (command === 'accent') {
        toggleInlineStyle(InlineStyle.ACCENT)
        return 'handled'
      }

      if (command === 'save') {
        props.onSave?.(state)
        return 'handled'
      }

      if (newState) {
        setState(newState)
        return 'handled'
      }

      return 'not-handled'
    },
    [toggleInlineStyle, props.onSave],
  )

  const handlerKeyBinding = React.useCallback((e: React.KeyboardEvent) => {
    if (
      e.keyCode === 83 /* `S` key */ &&
      KeyBindingUtil.hasCommandModifier(e)
    ) {
      return 'save'
    }

    return getDefaultKeyBinding(e)
  }, [])

  const toHtml = React.useCallback((state: EditorState) => {
    return stateToHTML(state.getCurrentContent())
  }, [])

  return React.useMemo(
    () => ({
      ref,
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
      hydrate,
      onChange: setState,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
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

type TextEditorProviderProps = {
  editor: EditorAPI
  children: React.ReactNode
}

const TextEditorProvider: React.FC<TextEditorProviderProps> = ({
  editor,
  children,
}) => {
  return (
    <TextEditorContext.Provider value={editor}>
      {children}
    </TextEditorContext.Provider>
  )
}

const customBlockRenderMap = Immutable.Map({
  [BlockType.cite]: {
    element: 'cite',
  },
})

const blockRenderMap = DefaultDraftBlockRenderMap.merge(customBlockRenderMap)

const plugins: Array<EditorPlugin> = [createMarkdownShortcutsPlugin()]

export type KeyCommand = DraftEditorCommand | 'accent' | 'save'

const blockStyleFn: EditorProps['blockStyleFn'] = (block): string => {
  const type = block.getType()

  switch (type) {
    case BlockType.h1:
      return 'editor-h1'
    case BlockType.h2:
      return 'editor-h2'
    case BlockType.blockquote:
      return 'editor-blockquote'
    case BlockType.list:
      return 'editor-list'
    default:
      return ''
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
  customStyleMap,
}
