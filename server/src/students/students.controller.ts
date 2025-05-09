import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AddStudentCallLogDto } from './dto/add-student-call-log.dto';
import { StudentSearchDto } from './dto/student-search.dto';

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

  @Get('stats')
  async getDashboardStats() {
    const totalStudents = await this.studentsService.countTotalStudents();
    const activeStudents =
      await this.studentsService.countStudentsByStatus('active');
    const newLeads = await this.studentsService.countStudentsByStatus('lead');
    const conversionRate = await this.studentsService.calculateConversionRate();

    const result = { totalStudents, activeStudents, newLeads, conversionRate };

    return {
      data: result,
      message: 'Student stats fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }

  @Get('list')
  async getStudents(@Query() queryParams: StudentSearchDto) {
    const result =
      await this.studentsService.getStudentsWithLastContact(queryParams);
    return {
      data: result,
      message: 'Students details fetched successfully',
      status: 200,
      code: 'SUCCESS',
    };
  }
}
