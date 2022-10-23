import clsx from 'clsx'
import * as React from 'react'

import './index.css'

type Props = {
  HtmlTag: React.ElementType
  className?: string
}

export const TagsGrid: React.FC<Props> = ({HtmlTag, className, children}) => {
  return <HtmlTag className={clsx('tags-grid', className)}>{children}</HtmlTag>
}
