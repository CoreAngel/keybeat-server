import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class SynchronizeCredentialDto {
  @IsInt()
  @Min(0)
  lastSynchronizedDate: number;

  @IsString({ each: true })
  @IsNotEmpty()
  ids: string[];
}
