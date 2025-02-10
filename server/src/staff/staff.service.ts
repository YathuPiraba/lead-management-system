import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Staff } from './staff.entity';
import { Lead } from '../leads/lead.entity';
import { User } from '../users/user.entity';
import { StaffResponseDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getStaffStats() {
    const totalStaff = await this.userRepository.count({
      where: {
        role: { id: 2 },
      },
    });

    // Calculate average performance using only existing staff records
    const staffPerformance = await this.staffRepository
      .createQueryBuilder('staff')
      .innerJoin('staff.user', 'user')
      .where('user.role.id = :roleId', { roleId: 2 })
      .andWhere('staff.status = :status', { status: 'Active' })
      .getMany();

    const performanceMap = {
      High: 100,
      Medium: 70,
      Low: 40,
    };

    const averagePerformance =
      staffPerformance.length > 0
        ? staffPerformance.reduce(
            (acc, staff) => acc + performanceMap[staff.performance],
            0,
          ) / staffPerformance.length
        : 0;

    const totalLeads = await this.leadRepository.count();

    return {
      totalStaff,
      averagePerformance: Math.round(averagePerformance),
      totalLeads,
    };
  }

  async getAllStaffMembers(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ data: StaffResponseDto[]; pagination: any }> {
    try {
      // First get all users with role_id = 2
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('role.id = :roleId', { roleId: 2 });

      if (search) {
        queryBuilder.andWhere(
          '(user.firstName ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      const total = await queryBuilder.getCount();

      const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      // Try to get staff data if available
      let staffData = [];
      try {
        staffData = await this.staffRepository.find({
          relations: ['user'],
          where: {
            user: {
              id: In(users.map((u) => u.id)),
            },
          },
        });
      } catch (error) {
        console.error('Error fetching staff data:', error);
        // Continue without staff data
      }

      // Create a map of staff records
      const staffMap = new Map(
        staffData.map((staff) => [staff.user.id, staff]),
      );

      // Map users to response DTO
      const formattedStaff = users.map((user) => {
        const staffRecord = staffMap.get(user.id);
        return {
          id: user.id,
          staffId: staffRecord?.id || null,
          status: staffRecord?.status || 'N/A',
          performance: staffRecord?.performance || 'N/A',
          assignedLeads: staffRecord?.assignedLeads || 0,
          user: {
            id: user.id,
            name: user.firstName || 'N/A',
            email: user.email || 'N/A',
            phone: user.contactNo?.toString() || 'N/A',
          },
        };
      });

      return {
        data: formattedStaff,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error('Error in getAllStaffMembers:', error);
      return { data: [], pagination: {} };
    }
  }

  async getStaffMemberById(id: number): Promise<StaffResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
          role: { id: 2 },
        },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundException(`Staff member with ID ${id} not found`);
      }

      let staffRecord = null;
      try {
        staffRecord = await this.staffRepository.findOne({
          where: { user: { id } },
          relations: ['user'],
        });
      } catch (error) {
        console.error('Error fetching staff record:', error);
        // Continue without staff record
      }

      return {
        id: user.id,
        staffId: staffRecord?.id || null,
        status: staffRecord?.status || 'N/A',
        performance: staffRecord?.performance || 'N/A',
        assignedLeads: staffRecord?.assignedLeads || 0,
        user: {
          id: user.id,
          name: user.firstName || 'N/A',
          email: user.email || 'N/A',
          phone: user.contactNo?.toString() || 'N/A',
        },
      };
    } catch (error) {
      console.error('Error in getStaffMemberById:', error);
      throw error;
    }
  }
}
