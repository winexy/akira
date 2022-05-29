import {useQuery} from 'react-query'
import React, {useState, FC} from 'react'
import map from 'lodash/fp/map'
import {Button} from 'shared/ui/button'
import {List} from 'shared/ui/list'
import {WIP} from 'shared/ui/tag'
import {UniversalDrawer} from 'widgets/universal-drawer'
import {userApi} from 'entities/user'
import {shareTaskModel} from '../model'

const emailRegex = /\S+@\S+\.\S+/
const isEmail = (email: string) => emailRegex.test(email)

export const ShareManager: FC = () => {
  const [email, setEmail] = useState('')
  const findUserQuery = useQuery(
    ['findUser', {email}],
    () => userApi.findByEmail(email),
    {
      enabled: isEmail(email),
    },
  )

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
          value={email}
          className="
            flex-1 px-3 py-2
            shadow-inner rounded-md
            border
            focus:outline-none focus:outline-2
          "
          onChange={event => setEmail(event.target.value)}
        />
      </div>
      {findUserQuery.data && (
        <div className="mt-4 flex items-center">
          <span className="mr-4 flex-1 truncate">
            {findUserQuery.data.email}
          </span>
          <Button size="xs" className="ml-auto">
            Send invite
          </Button>
        </div>
      )}
      <h4 className="mt-4 font-bold text-lg">Members</h4>
      <List className="mt-2">
        {map(
          member => (
            <List.Item key={member}>{member}</List.Item>
          ),
          ['ellie', 'ed', 'adele'],
        )}
      </List>
    </UniversalDrawer>
  )
}
