import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';
import { CreateCallLogDto } from '../../call-logs/dto/create-call-log.dto';

export class AddStudentCallLogDto {
  @ValidateNested()
  @Type(() => CreateStudentDto)
  student: CreateStudentDto;

  @ValidateNested()
  @Type(() => CreateCallLogDto)
  callLog: CreateCallLogDto;
}
