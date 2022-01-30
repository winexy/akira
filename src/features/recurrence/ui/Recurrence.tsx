import clsx from 'clsx'
import React, {useState} from 'react'
import {useMutation, useQueryClient} from 'react-query'
import {ChevronLeftIcon} from '@heroicons/react/solid'
import {api} from 'shared/api'
import {List} from 'shared/ui/list'
import {TaskQuery} from 'modules/tasks/config'
import {BottomSheet, bottomSheetModel} from 'shared/ui/bottom-sheet'
import {Button} from 'shared/ui/button'
import {Picker} from 'shared/ui/picker'
import {
  makeRecurrencePayload,
  RecurrenceParams,
  makeCustomRule,
  CustomRecurrenceType
} from '../lib/make-recurrence-payload'
import {matchRecurrenceType} from '../lib/match-recurrence-type'
import {RecurrenceEnum, recurrenceTypes} from '../model'

type Props = {
  taskId: string
}

enum ViewMode {
  Options = 'options',
  Custom = 'custom'
}

const config = {
  valueGroups: {
    interval: 1,
    type: RecurrenceEnum.Daily
  },
  optionGroups: {
    interval: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: [RecurrenceEnum.Daily, RecurrenceEnum.Weekly, RecurrenceEnum.Monthly]
  }
}

const CustomRecurrence: React.FC<{
  onBack(): void
  onSave(customType: CustomRecurrenceType, customInterval: number): void
}> = ({onBack, onSave}) => {
  const [customInterval, setCustomInterval] = useState(1)
  const [customType, setCustomType] = useState<CustomRecurrenceType>(
    RecurrenceEnum.Daily
  )

  return (
    <>
      <div className="relative flex justify-center items-center text-center py-3">
        <button
          className="absolute left-4 w-10 h-10"
          type="button"
          onClick={onBack}
        >
          <ChevronLeftIcon width={24} height={24} />
        </button>
        <h2 className="font-semibold text-2xl">Repeat every</h2>
      </div>
      <div className="text-white">
        <div className="grid grid-cols-2">
          <Picker
            selectedValue={customInterval}
            onValueChange={setCustomInterval}
          >
            {config.optionGroups.interval.map(interval => (
              <Picker.Item key={interval} value={interval}>
                {interval}
              </Picker.Item>
            ))}
          </Picker>
          <Picker selectedValue={customType} onValueChange={setCustomType}>
            {config.optionGroups.type.map(type => (
              <Picker.Item key={type} value={type}>
                {matchRecurrenceType(type)}
              </Picker.Item>
            ))}
          </Picker>
        </div>
        <div className="p-4">
          <Button
            size="md"
            className="w-full"
            onClick={() => {
              onSave(customType, customInterval)
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

export const Recurrence: React.FC<Props> = ({taskId}) => {
  const [viewMode, setViewMode] = useState(ViewMode.Options)

  const queryClient = useQueryClient()
  const makeRecurringTaskMutation = useMutation(
    (params: RecurrenceParams) => {
      return api.post(`recurrence/${taskId}`, params)
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(TaskQuery.One(taskId))
      }
    }
  )

  const onSelect = (type: RecurrenceEnum) => {
    if (type === RecurrenceEnum.Custom) {
      setViewMode(ViewMode.Custom)
    } else {
      makeRecurringTaskMutation.mutate(makeRecurrencePayload(type))
      bottomSheetModel.hideBottomSheet('repeat-patterns')
    }
  }

  const onCustomRuleSave = (
    customType: CustomRecurrenceType,
    customInterval: number
  ) => {
    bottomSheetModel.hideBottomSheet('repeat-patterns')
    makeRecurringTaskMutation.mutate(makeCustomRule(customType, customInterval))
  }

  return (
    <BottomSheet.Standalone name="repeat-patterns">
      {viewMode === ViewMode.Options ? (
        <>
          <div className="text-center py-3">
            <h2 className="font-semibold text-2xl">Repeat</h2>
          </div>
          <List>
            {recurrenceTypes.map(type => (
              <List.Item
                key={type}
                className={clsx('px-4 py-3 font-semibold')}
                onClick={() => onSelect(type)}
              >
                {matchRecurrenceType(type)}
              </List.Item>
            ))}
          </List>
        </>
      ) : (
        <CustomRecurrence
          onBack={() => setViewMode(ViewMode.Options)}
          onSave={onCustomRuleSave}
        />
      )}
    </BottomSheet.Standalone>
  )
}
