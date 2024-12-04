import { Body, Controller, Post } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AddStudentCallLogDto } from './dto/add-student-call-log.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('add-student-call-log')
  async addStudentAndCallLog(@Body() data: AddStudentCallLogDto) {
    return this.studentsService.addStudentAndCallLog(data);
  }
}
