import { IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  departmentOfStudy: string;

  @IsString()
  status: 'hold' | 'active' | 'lead' | 'reject'; // 'lead', 'active', 'inactive', 'reject'
}
