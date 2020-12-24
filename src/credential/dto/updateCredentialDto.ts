import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCredentialDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  iv: string;

  @IsString()
  @IsNotEmpty()
  data: string;
}

export class UpdateCredentialArrayDto {
  @Type(() => UpdateCredentialDto)
  @ValidateNested({ each: true })
  items: UpdateCredentialDto[];
}
