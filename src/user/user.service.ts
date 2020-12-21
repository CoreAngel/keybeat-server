import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUserById(id: number): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne(id);
  }

  async getUserByLogin(login: string): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne({ login });
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const newUser = await this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  async updatePassword({ id, password, salt }: UserEntity): Promise<boolean> {
    const result = await this.userRepository.update({ id }, { password, salt });
    return result.affected > 0;
  }

  async updateTopt({ id, toptSecret, toptReset }: UserEntity): Promise<boolean> {
    const result = await this.userRepository.update({ id }, { toptSecret, toptReset });
    return result.affected > 0;
  }

  async updateModificationDate({ id }: UserEntity, timestamp: Date): Promise<boolean> {
    const result = await this.userRepository.update({ id }, { lastModified: timestamp });
    return result.affected > 0;
  }
}
