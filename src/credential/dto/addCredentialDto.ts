import { IsString, IsNotEmpty, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCredentialDto {
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  iv: string;

  @IsString()
  @IsNotEmpty()
  data: string;
}

export class AddCredentialArrayDto {
  @Type(() => AddCredentialDto)
  @ValidateNested({ each: true })
  items: AddCredentialDto[];
}
