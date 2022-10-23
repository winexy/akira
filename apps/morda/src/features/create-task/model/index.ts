import {createEvent, createStore, createStoreObject} from 'effector'
import {TaskList} from 'modules/lists/types.d'

export const $title = createStore('')
export const $description = createStore('')
export const $date = createStore(new Date())
export const $dueDate = createStore<Date | null>(null)
export const $selectedTags = createStore(new Set<number>())
export const $selectedList = createStore<TaskList | null>(null)

export const onTitleChange = createEvent<string>()
export const onDescriptionChange = createEvent<string>()
export const onDateChange = createEvent<Date>()
export const onDueDateChange = createEvent<Date>()
export const onListChange = createEvent<TaskList | null>()
export const onTagsToggle = createEvent<number>()
export const resetForm = createEvent()

$title.on(onTitleChange, (_, title) => title).on(resetForm, () => '')
$description.on(onDescriptionChange, (_, desc) => desc).on(resetForm, () => '')
$date.on(onDateChange, (_, date) => date).on(resetForm, () => new Date())
$dueDate.on(onDueDateChange, (_, dueDate) => dueDate).on(resetForm, () => null)

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const newSet = new Set(set)

  if (newSet.has(value)) {
    newSet.delete(value)
  } else {
    newSet.add(value)
  }

  return newSet
}

$selectedTags.on(onTagsToggle, toggleSet).on(resetForm, () => new Set())
$selectedList.on(onListChange, (_, list) => list).on(resetForm, () => null)
