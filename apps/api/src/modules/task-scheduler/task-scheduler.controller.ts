import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  NotImplementedException,
  UseGuards
} from '@nestjs/common'
import {FujiPipe} from '../../pipes/fuji.pipe'
import {AuthGuard} from '../../auth.guard'
import {TaskSchedulerService} from './task-scheduler.service'
import {
  scheduleTaskSchema,
  ScheduleTaskDto,
  ScheduledTask
} from './scheduled-task.model'
import {User} from 'src/decorators/user.decorator'

@Controller('task-scheduler')
@UseGuards(AuthGuard)
export class TaskSchedulerController {
  constructor(private readonly taskSchedulerService: TaskSchedulerService) {}

  @Post('schedule')
  async create(
    @User('uid') uid: UID,
    @Body(FujiPipe.of(scheduleTaskSchema))
    dto: ScheduleTaskDto
  ): Promise<ScheduledTask> {
    const result = await this.taskSchedulerService.create(uid, dto)

    if (result.isLeft()) {
      throw result.value
    }

    return result.value
  }

  @Get('week')
  findWeekTasks(@User('uid') uid: UID) {
    return this.taskSchedulerService.findWeekTasks(uid)
  }

  @Get()
  findAll() {
    throw new NotImplementedException()
  }

  @Get(':id')
  findOne() {
    throw new NotImplementedException()
  }

  @Patch(':id')
  update() {
    throw new NotImplementedException()
  }

  @Delete(':id')
  remove() {
    throw new NotImplementedException()
  }
}
