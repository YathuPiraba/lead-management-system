import { Body, Controller, Post } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AddStudentCallLogDto } from './dto/add-student-call-log.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('add-student-call-log')
  async addStudentAndCallLog(@Body() data: AddStudentCallLogDto) {
    const result = await this.studentsService.addStudentAndCallLog(data);

    return {
      data: result,
      message: 'Student and Call Log added successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }
}
