import { Body, Controller, HttpCode, HttpException, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerDto';
import { LoginDto } from './dto/loginDto';
import { TokenService } from '../token/token.service';
import { Token } from '../decorators/token.decorator';
import { TokenEntity } from '../token/token.entity';
import JwtGuard from './jwt.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity } from '../user/user.entity';
import { ResetPasswordDto } from './dto/resetPasswordDto';
import { ResetToptDto } from './dto/resetToptDto';
import { ActionType } from '../forceGuard/actionType.enum';
import { UnauthorizedException } from '../forceGuard/unauthorized.exception';
import { IpAddress } from '../decorators/ipAddress.decorator';
import { SaltDto } from './dto/saltDto';

interface RegisterResponse {
  uri: string;
  secret: string;
  reset: string;
}

interface LoginResponse {
  name: string;
  auth: string;
}

interface SaltResponse {
  salt: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly tokenService: TokenService) {}

  @Post('register')
  async register(@Body() createUser: RegisterDto): Promise<RegisterResponse> {
    const user = await this.authService.register(createUser);
    const uri = this.authService.crateUri(user.name, 'KeyBeat', user.toptSecret);
    return {
      uri,
      secret: user.toptSecret,
      reset: user.toptReset,
    };
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginUser: LoginDto, @IpAddress() ip: string): Promise<LoginResponse> {
    const user = await this.authService.verifyUser(loginUser.login);
    if (!user) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN);
    }
    const isMatching = await this.authService.verifyPassword(loginUser.password, user.password);
    if (!isMatching) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN);
    }
    const isValid = await this.authService.verifyToken(loginUser.token, user.toptSecret);
    if (!isValid) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN);
    }

    const tokenJwt = await this.tokenService.createToken(user);
    await this.tokenService.addToken(user, ip, tokenJwt);
    return {
      name: user.name,
      auth: tokenJwt,
    };
  }

  @HttpCode(200)
  @Post('salt')
  async salt(@Body() saltDto: SaltDto): Promise<SaltResponse> {
    const user = await this.authService.verifyUser(saltDto.login);
    if (!user) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN);
    }
    const isValid = await this.authService.verifyToken(saltDto.token, user.toptSecret);
    if (!isValid) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.LOGIN);
    }

    return {
      salt: user.salt,
    };
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@Token() token: TokenEntity): Promise<void> {
    await this.tokenService.cancelToken(token);
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Patch('reset/password')
  async resetPassword(@User() user: UserEntity, @Body() resetDto: ResetPasswordDto): Promise<void> {
    const isMatching = await this.authService.verifyPassword(resetDto.password, user.password);
    if (!isMatching) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.RESET_PASSWORD);
    }
    const status = await this.authService.resetPassword(user, resetDto.newPassword, resetDto.salt);
    if (!status) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @HttpCode(200)
  @Patch('reset/2fa')
  async reset2Fa(@Body() resetDto: ResetToptDto): Promise<RegisterResponse> {
    const user = await this.authService.verifyUser(resetDto.login);
    if (!user) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.RESET_2FA);
    }
    const isValid = await this.authService.verifyToptReset(user, resetDto.resetToken);
    if (!isValid) {
      throw new UnauthorizedException('Wrong credentials provided', ActionType.RESET_2FA);
    }
    const { toptReset, toptSecret } = await this.authService.generateToptKeys();
    const status = await this.authService.resetTopt(user, toptSecret, toptReset);
    if (!status) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const uri = this.authService.crateUri(user.name, 'KeyBeat', toptSecret);
    return {
      uri,
      secret: toptSecret,
      reset: toptReset,
    };
  }
}
