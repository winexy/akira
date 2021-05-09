import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common'
import {TasksService} from './tasks.service'
import {AuthGuard} from '../auth.guard'
import {CreateTaskDto} from './create-task.dto'
import {FujiPipe} from '../pipes/fuji.pipe'
import {createTaskDtoSchema} from './schemas'
import {User} from 'src/decorators/user.decorator'
import {TaskT} from './task.model'

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new FujiPipe(createTaskDtoSchema)) taskDto: CreateTaskDto) {
    return this.taskService.create(taskDto)
  }

  @Get()
  findAll(@User() user: UserRecord) {
    return this.taskService.findAllByUID(user.uid)
  }

  @Get(':id')
  async findOne(@User() user: UserRecord, @Param('id') id: TaskT['id']) {
    const task = await this.taskService.findOne(id, user.uid)

    if (task.isLeft()) {
      throw task.value
    }

    return task.value
  }

  @Patch(':id/complete/toggle')
  async toggleCompleted(
    @User() user: UserRecord,
    @Param('id') taskId: TaskT['id']
  ) {
    const task = await this.taskService.toggleCompleted(taskId, user.uid)

    if (task.isLeft()) {
      throw task.value
    }

    return task.value
  }
}
