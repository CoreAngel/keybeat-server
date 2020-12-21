import { IsNotEmpty, IsString } from 'class-validator';

export class ResetToptDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  resetToken: string;
}
