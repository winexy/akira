import map from 'lodash/fp/map'
import React, {FC} from 'react'
import {Button} from 'shared/ui/button'
import {List} from 'shared/ui/list'
import {WIP} from 'shared/ui/tag'
import {UniversalDrawer} from 'widgets/universal-drawer'
import {shareTaskModel} from '../model/index'

export const ShareManager: FC = () => {
  return (
    <UniversalDrawer
      name={shareTaskModel.SHARE_MANAGER_KEY}
      className="p-4 md:w-96"
    >
      <h2 className="flex items-center font-bold text-2xl">
        Share your task <WIP className="ml-auto" />
      </h2>
      <p className="mt-1 text-gray-500">
        Invite your team to collaborate on this task
      </p>
      <h3 className="mt-2 font-bold text-lg">Invite team members</h3>
      <div className="mt-2 flex">
        <input
          placeholder="teammate@example.com"
          className="
            flex-1 mr-4 px-3
            shadow-inner rounded-md
            border
            focus:outline-none focus:outline-2
          "
        />
        <Button size="xs" className="ml-auto">
          Send invite
        </Button>
      </div>
      <h4 className="mt-4 font-bold text-lg">Members</h4>
      <List className="mt-2">
        {map(
          member => (
            <List.Item>{member}</List.Item>
          ),
          ['ellie', 'ed', 'adele'],
        )}
      </List>
    </UniversalDrawer>
  )
}
