import { Injectable } from '@nestjs/common';
import { AddCredentialDto } from './dto/addCredentialDto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { format } from 'date-fns';
import { CredentialEntity } from './credential.entity';
import { UpdateCredentialDto } from './dto/updateCredentialDto';
import { DeleteCredentialDto } from './dto/deleteCredentialDto';

@Injectable()
export class CredentialService {
  constructor(
    @InjectRepository(CredentialEntity)
    private credentialRepository: Repository<CredentialEntity>,
  ) {}

  async addCredentials(credentials: AddCredentialDto[], userId: number, timestamp: Date) {
    const promises = credentials.map(
      async ({ id, data }): Promise<{ id: string; uuid: string }> => {
        const credentialObject = this.credentialRepository.create({
          userId,
          data,
          lastModified: timestamp,
        });
        const { id: uuid } = await this.credentialRepository.save(credentialObject);
        return { id, uuid };
      },
    );
    return await Promise.all(promises);
  }

  async updateCredentials(credentials: UpdateCredentialDto[], userId: number, timestamp: Date) {
    const promises = credentials.map(
      async ({ id, data }): Promise<void> => {
        await this.credentialRepository.update({ id, userId }, { data, lastModified: timestamp });
      },
    );
    await Promise.all(promises);
  }

  async deleteCredentials(credentials: DeleteCredentialDto[], userId: number) {
    const promises = credentials.map(
      async ({ id }): Promise<void> => {
        await this.credentialRepository.delete({ id, userId });
      },
    );
    await Promise.all(promises);
  }

  async findModifiedCredentials(userId: number, date: Date): Promise<CredentialEntity[]> {
    return await this.credentialRepository.find({
      where: {
        userId,
        lastModified: MoreThan(format(date, 'yyyy-mm-dd HH:MM:ss')),
      },
    });
  }

  async checkCredentialsExists(ids: string[], userId: number): Promise<string[]> {
    const existsCredentials = await this.credentialRepository.find({ userId });
    const existIds = existsCredentials.map((item) => item.id);
    return ids.filter((item) => !existIds.includes(item));
  }
}
