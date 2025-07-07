import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async findById(id: string, withRelations = true): Promise<User | null> {
    const options = withRelations
      ? { where: { id }, relations: ['role', 'organization', 'staff'] }
      : { where: { id } };

    return this.userRepository.findOne(options);
  }

  async findByEmail(email: string, withRelations = true): Promise<User | null> {
    const options = withRelations
      ? { where: { email }, relations: ['role', 'organization', 'staff'] }
      : { where: { email } };

    return this.userRepository.findOne(options);
  }

  async findByUsername(
    username: string,
    withRelations = true,
  ): Promise<User | null> {
    const options = withRelations
      ? { where: { username }, relations: ['role', 'organization', 'staff'] }
      : { where: { username } };

    return this.userRepository.findOne(options);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['role', 'organization', 'staff'],
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async softDelete(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}
