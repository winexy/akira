import clsx from 'clsx'
import * as React from 'react'

import './TagsGrid.css'

type Props = {
  HtmlTag: React.ElementType
  className?: string
}

export const TagsGrid: React.FC<Props> = ({HtmlTag, children}) => {
  return <HtmlTag className={clsx('tags-grid')}>{children}</HtmlTag>
}
