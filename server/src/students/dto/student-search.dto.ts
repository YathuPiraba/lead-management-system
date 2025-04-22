import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['hold', 'active', 'lead', 'reject'])
  status?: 'hold' | 'active' | 'lead' | 'reject';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class StudentResponseDto {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  department_of_study: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  lastContact?: string;
}

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  itemsPerPage: number;
};
