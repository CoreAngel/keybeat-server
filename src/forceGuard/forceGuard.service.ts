import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidActionEntity } from './invalidAction.entity';
import { Repository } from 'typeorm';
import { BanEntity } from './ban.entity';
import { ActionType } from './actionType.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ForceGuardService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(InvalidActionEntity)
    private readonly invalidActionRepository: Repository<InvalidActionEntity>,
    @InjectRepository(BanEntity)
    private readonly banRepository: Repository<BanEntity>,
  ) {}
  async addActionWithBanCheck(ip: string, type: ActionType, actionsToBan: number) {
    await this.addInvalidAction(ip, type);
    const count = await this.countInvalidActions(ip, type);
    if (count >= actionsToBan) {
      await this.addBan(ip, type);
    }
  }

  async addInvalidAction(ip: string, type: ActionType) {
    const action = await this.invalidActionRepository.create({ ip, type });
    await this.invalidActionRepository.save(action);
  }

  async addBan(ip: string, type: ActionType) {
    const action = await this.banRepository.create({ ip, type });
    await this.banRepository.save(action);
  }

  async countInvalidActions(ip: string, type: ActionType): Promise<number> {
    const timeOffset = this.configService.get<number>('INVALID_ACTIONS_TIME');
    const toTimestamp = Date.now() - timeOffset * 1000;
    const date = new Date(toTimestamp);
    return await this.invalidActionRepository
      .createQueryBuilder()
      .where('ip = :ip and type = :type and date > :date', { ip, type, date })
      .orderBy('date', 'DESC')
      .getCount();
  }

  async checkIsBaned(ip: string, type: ActionType) {
    const timeOffset = this.configService.get<number>('BAN_TIME');
    const result = await this.banRepository
      .createQueryBuilder()
      .where('ip = :ip and type = :type', { ip, type })
      .orderBy('date', 'DESC')
      .getOne();

    if (!result) {
      return;
    }

    const isBanned = Date.now() < result.date.getTime() + timeOffset * 1000;
    if (isBanned) {
      throw new HttpException('Your ip is banned', HttpStatus.UNAUTHORIZED);
    }
  }
}
