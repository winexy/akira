import React, {useState} from 'react'
import {MainView} from '@/views/MainView'
import {Tasks} from '@components/Tasks'
import {useTasksQuery} from '@modules/tasks/hooks'
import {TaskForm} from '@components/TaskForm/TaskForm'
import {akira} from '@lib/akira'
import {useMutation} from 'react-query'
import {
  AddTaskButton,
  useAddTaskControl
} from '@modules/tasks/components/AddTaskButton'

export const TasksView: React.FC = () => {
  const {data: tasks = [], isLoading} = useTasksQuery()
  const addTaskControl = useAddTaskControl()

  const createTaskMutation = useMutation((title: string) => {
    return akira.tasks.create(title)
  })

  return (
    <MainView>
      <TaskForm
        ref={addTaskControl.formRef}
        onSubmit={createTaskMutation.mutate}
        onVisibilityChange={addTaskControl.onFormVisiblityChange}
      />
      <div className="px-4 text-gray-600">
        <h2 className="flex items-center font-bold text-3xl">Tasks</h2>
      </div>
      <section className="mt-4 pb-4">
        <Tasks isPending={isLoading} tasks={tasks} />
      </section>
      {addTaskControl.isVisible && (
        <div className="z-20 fixed bottom-0 right-0 p-4">
          <AddTaskButton onClick={addTaskControl.onAddIntent} />
        </div>
      )}
    </MainView>
  )
}
