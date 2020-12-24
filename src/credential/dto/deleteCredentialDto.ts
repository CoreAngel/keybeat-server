import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteCredentialDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class DeleteCredentialArrayDto {
  @Type(() => DeleteCredentialDto)
  @ValidateNested({ each: true })
  items: DeleteCredentialDto[];
}
