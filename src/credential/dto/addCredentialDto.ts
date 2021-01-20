import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCredentialDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  data: string;
}

export class AddCredentialArrayDto {
  @Type(() => AddCredentialDto)
  @ValidateNested({ each: true })
  items: AddCredentialDto[];
}
