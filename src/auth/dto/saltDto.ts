import { IsString, IsNotEmpty, Length } from 'class-validator';

export class SaltDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @Length(6, 6)
  token: string;
}
