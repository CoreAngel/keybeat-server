import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from './token.entity';
import { TokenPayload } from './tokenPayload';

@Injectable()
export class TokenService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
  ) {}

  async createToken(user: UserEntity) {
    const payload: TokenPayload = { userId: user.id };
    return this.jwtService.sign(payload);
  }

  async addToken(user: UserEntity, ip: string, token: string): Promise<TokenEntity> {
    const newToken = this.tokenRepository.create({
      userId: user.id,
      ip,
      token,
      active: true,
    });
    return await this.tokenRepository.save(newToken);
  }

  async findToken(userId: number, token: string): Promise<TokenEntity | undefined> {
    return await this.tokenRepository.findOne({ userId, token });
  }

  async cancelToken(token: TokenEntity) {
    await this.tokenRepository.update(token, { active: false });
  }
}
