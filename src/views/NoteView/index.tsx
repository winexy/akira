/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable jsx-a11y/heading-has-content */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Editor,
  EditorState,
  DefaultDraftBlockRenderMap,
  RichUtils,
  ContentState,
  ContentBlock,
  CompositeDecorator,
  DraftEntityMutability,
  DraftEditorCommand,
  getDefaultKeyBinding,
  KeyBindingUtil
} from 'draft-js'
import React from 'react'
import Immutable from 'immutable'
import clsx from 'clsx'
import {convertFromHTML, convertToHTML} from 'draft-convert'
import {PageView} from '@shared/ui/page-view'

export enum InlineStyle {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  UNDERLINE = 'UNDERLINE',
  ACCENT = 'ACCENT' // код нашего произвольного стиля
}

const INLINE_STYLES_CODES = Object.values(InlineStyle)

export enum EntityType {
  link = 'link'
}

export const customStyleMap = {
  [InlineStyle.ACCENT]: {
    backgroundColor: '#F7F6F3',
    color: '#A41E68'
  }
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
      case BlockType.default:
        return <p />
      default:
        return null
    }
  },
  entityToHTML: (entity, originalText) => {
    if (entity.type === EntityType.link) {
      return <a href={entity.data.url}>{originalText}</a>
    }
    return originalText
  }
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
      return createEntity(EntityType.link, 'MUTABLE', {url: node.href})
    }

    return undefined
  }
})

const Link: React.FC<LinkProps> = ({contentState, entityKey, children}) => {
  const editor = useEditorContext()
  /* Получаем url с помощью уникального ключа Entity */
  const {url} = contentState.getEntity(entityKey).getData()

  const handlerClick = () => {
    const newUrl = window.prompt('URL:', url)
    if (newUrl) {
      editor.setEntityData(entityKey, {url: newUrl})
    }
  }

  return (
    <a href={url} onClick={handlerClick}>
      {children}
    </a>
  )
}

function findLinkEntities(
  /* Блок в котором производилось последнее изменение */
  contentBlock: ContentBlock,
  /* Функция, которая должна быть вызвана с индексами фрагмента текста */
  callback: (start: number, end: number) => void,
  /* Текущая карта контента */
  contentState: ContentState
): void {
  /* Для каждого символа в блоке выполняем функцию фильтрации */
  contentBlock.findEntityRanges(character => {
    /* Получаем ключ Entity */
    const entityKey = character.getEntity()
    /* Проверяем что Entity относится к типу Entity-ссылок */
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === EntityType.link
    )
  }, callback)
}

const LinkDecorator = {
  strategy: findLinkEntities,
  component: Link
}

const decorator = new CompositeDecorator([LinkDecorator])

function useEditor(html?: string) {
  const [state, setState] = React.useState(() =>
    html
      ? EditorState.createWithContent(HTMLtoState(html), decorator)
      : EditorState.createEmpty(decorator)
  )

  const toggleBlockType = React.useCallback((blockType: BlockType) => {
    setState(currentState => RichUtils.toggleBlockType(currentState, blockType))
  }, [])

  const currentBlockType = React.useMemo(() => {
    const selection = state.getSelection()
    const content = state.getCurrentContent()
    const block = content.getBlockForKey(selection.getStartKey())

    return block.getType() as BlockType
  }, [state])

  const toggleInlineStyle = React.useCallback((inlineStyle: InlineStyle) => {
    setState(currentState =>
      RichUtils.toggleInlineStyle(currentState, inlineStyle)
    )
  }, [])

  const hasInlineStyle = React.useCallback(
    (inlineStyle: InlineStyle) => {
      /* Получаем иммутабельный Set с ключами стилей */
      const currentStyle = state.getCurrentInlineStyle()
      /* Проверяем содержится ли там переданный стиль */
      return currentStyle.has(inlineStyle)
    },
    [state]
  )

  const addEntity = React.useCallback(
    (
      entityType: EntityType,
      data: Record<string, string>,
      mutability: DraftEntityMutability
    ) => {
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
    url => {
      addEntity(EntityType.link, {url}, 'MUTABLE')
    },
    [addEntity]
  )

  const setEntityData = React.useCallback((entityKey, data) => {
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
    /* Проверяем нажата ли клавиша q + ctrl/cmd */
    if (e.keyCode === 81 && KeyBindingUtil.hasCommandModifier(e)) {
      return 'accent'
    }

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

export const TextEditorProvider: React.FC = ({children}) => {
  const editor = useEditor()

  return (
    <TextEditorContext.Provider value={editor}>
      {children}
    </TextEditorContext.Provider>
  )
}

export enum BlockType {
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

const customBlockRenderMap = Immutable.Map({
  [BlockType.cite]: {
    element: 'cite'
  }
})

const blockRenderMap = DefaultDraftBlockRenderMap.merge(customBlockRenderMap)

type LinkProps = {
  children: React.ReactNode
  contentState: ContentState
  entityKey: string
}

export type KeyCommand = DraftEditorCommand | 'accent'

const TextEditor: React.FC = () => {
  const editor = useEditorContext()

  const handlerAddLink = () => {
    const url = window.prompt('URL:')

    if (url) {
      editor.addLink(url)
    }
  }
  return (
    <>
      <div>
        {INLINE_STYLES_CODES.map(code => {
          const onClick = (e: React.MouseEvent) => {
            e.preventDefault()
            editor.toggleInlineStyle(code)
          }

          return (
            <button
              key={code}
              className={clsx(
                'mx-2',
                editor.hasInlineStyle(code) && 'text-red-500 font-bold'
              )}
              onClick={onClick}
            >
              {code}
            </button>
          )
        })}
        <button onClick={handlerAddLink}>Добавить ссылку</button>
        <button onClick={() => console.log(editor.toHtml())}>Print</button>
      </div>
      <Editor
        blockRenderMap={blockRenderMap}
        customStyleMap={customStyleMap}
        handleKeyCommand={editor.handleKeyCommand}
        editorState={editor.state}
        onChange={editor.onChange}
      />
    </>
  )
}

const NoteView: React.FC = () => {
  return (
    <PageView className="px-4">
      <TextEditorProvider>
        <TextEditor />
      </TextEditorProvider>
    </PageView>
  )
}

export default NoteView
