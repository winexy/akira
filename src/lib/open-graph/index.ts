import {right, left, Either} from '@sweet-monads/either'
import filter from 'lodash/fp/filter'
import get from 'lodash/fp/get'
import map from 'lodash/fp/map'
import size from 'lodash/fp/size'
import pipe from 'lodash/fp/pipe'
import fromPairs from 'lodash/fp/fromPairs'

const prefix = 'og:'

const isOpenGraphMetaTag = (el: Element): el is HTMLMetaElement =>
  Boolean(
    el.tagName === 'META' && el.getAttribute('property')?.startsWith(prefix)
  )

const getName = (el: HTMLMetaElement) =>
  el.getAttribute('property')?.slice(size(prefix))

const getContent = (el: HTMLMetaElement) => el.getAttribute('content')

async function fetchHTML(url: string): Promise<Either<{code: string}, string>> {
  let response: Response

  try {
    response = await fetch(url)
  } catch (error) {
    return left({code: 'failed-to-fetch'})
  }

  try {
    const html = await response.text()

    return right(html)
  } catch (error) {
    return left({code: 'failed-to-parse-response'})
  }
}

function parse(html: string): Either<{code: string}, unknown> {
  let doc: Document
  try {
    const parser = new DOMParser()
    doc = parser.parseFromString(html, 'text/html')
  } catch (error) {
    return left({code: 'failed-to-parse-html'})
  }

  return pipe(
    get('head.children'),
    Array.from,
    filter(isOpenGraphMetaTag),
    map(el => [getName(el), getContent(el)]),
    fromPairs,
    right
  )(doc)
}

export const OpenGraph = {
  async of(url: string): Promise<Either<{code: string}, unknown>> {
    const result = await fetchHTML(url)
    return result.chain(parse)
  }
}
