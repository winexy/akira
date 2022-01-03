import React from 'react'
import {Link} from 'react-router-dom'
import {ChevronRightIcon} from '@heroicons/react/solid'
import {Button} from 'shared/ui/button'

export const NewListLink = () => (
  <Link to="/lists/new">
    <Button size="md" className="w-full">
      Create new list <ChevronRightIcon className="ml-auto w-6 h-6" />
    </Button>
  </Link>
)
