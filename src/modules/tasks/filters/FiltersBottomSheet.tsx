import React from 'react'
import {Button} from 'shared/ui/button'
import {Checkbox} from 'shared/ui/checkbox'
import {RefreshIcon, XIcon} from '@heroicons/react/solid'
import {Tag} from 'shared/ui/tag'
import format from 'date-fns/format'
import {bottomSheetModel, BottomSheet} from 'shared/ui/bottom-sheet'
import {taskTagModel} from 'entities/task-tag'
import {exhaustiveCheck} from 'shared/lib/utils'
import {TagsGrid} from 'shared/ui/tags-grid'
import {DatePickerSheet} from 'shared/ui/datepicker-sheet'
import {DatePicker} from 'shared/ui/datepicker'
import {FiltersState, FilterAction} from '.'

type Props = {
  canReset: boolean
  state: FiltersState
  tags: taskTagModel.TaskTag[]
  onChange(action: FilterAction): void
}

const filterTypes = ['completed', 'notCompleted', 'important'] as const

function matchFilterTitle(filterType: typeof filterTypes[number]) {
  switch (filterType) {
    case 'completed':
      return 'Completed'
    case 'notCompleted':
      return 'Not Completed'
    case 'important':
      return 'Important'
    default:
      return exhaustiveCheck(filterType)
  }
}

export const FiltersBottomSheet: React.FC<Props> = ({
  canReset,
  state,
  tags,
  onChange,
}) => {
  return (
    <>
      <BottomSheet.Standalone name="filters" className="px-4 pb-6 pt-4">
        <h2 className="flex items-center justify-between font-bold text-2xl">
          Filters
          {canReset && (
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => {
                onChange({type: 'reset'})
                bottomSheetModel.hideBottomSheet()
              }}
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              reset
            </Button>
          )}
        </h2>
        <ul className="mt-4 space-y-1">
          {filterTypes.map(filterType => (
            <li className="" key={filterType}>
              <label
                className="
                px-3 py-2 
                flex items-center 
                font-semibold text-lg 
                rounded select-none
                transition ease-in duration-75
                active:bg-gray-100 dark:active:bg-gray-600
              "
              >
                <Checkbox
                  className="mr-3"
                  isChecked={state[filterType]}
                  size="sm"
                  onChange={() => {
                    onChange({type: filterType})
                  }}
                />
                {matchFilterTitle(filterType)}
              </label>
            </li>
          ))}
        </ul>
        <TagsGrid HtmlTag="ul">
          {tags.map(tag => (
            <li key={tag.id}>
              <Tag
                variant={state.tags.has(tag.id) ? 'purple' : 'gray'}
                onClick={() => onChange({type: 'tags', tagId: tag.id})}
              >
                {tag.name}
                {state.tags.has(tag.id) && <XIcon className="ml-2 w-3 h-3" />}
              </Tag>
            </li>
          ))}
        </TagsGrid>
        <div className="mt-4">
          <h2
            className="font-semibold"
            onClick={() => bottomSheetModel.showBottomSheet('datepicker')}
          >
            Date from: {state.dateFrom && format(state.dateFrom, 'dd.MM.yy')}
          </h2>
        </div>
        <Button
          className="mt-6 w-full"
          variant="blue"
          size="md"
          onClick={() => bottomSheetModel.hideBottomSheet()}
        >
          Apply
        </Button>
      </BottomSheet.Standalone>
      <DatePickerSheet title="Select date from" date={state.dateFrom}>
        <DatePicker
          date={state.dateFrom}
          maxDate={new Date()}
          onChange={date =>
            onChange({
              type: 'date-from',
              date,
            })
          }
        />
      </DatePickerSheet>
    </>
  )
}
