import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getUserById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne(id);
  }

  getUserByName(login: string): Promise<User | undefined> {
    return this.userRepository.findOne({ login });
  }
}
