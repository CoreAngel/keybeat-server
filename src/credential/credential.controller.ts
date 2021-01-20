import { Body, Controller, Delete, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import JwtGuard from '../auth/jwt.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity } from '../user/user.entity';
import { CredentialService } from './credential.service';
import { AddCredentialArrayDto } from './dto/addCredentialDto';
import { UpdateCredentialArrayDto } from './dto/updateCredentialDto';
import { UserService } from '../user/user.service';
import { DeleteCredentialArrayDto } from './dto/deleteCredentialDto';
import { SynchronizeCredentialDto } from './dto/synchronizeCredentialDto';

interface AddCredentialResponse {
  items: {
    id: string;
    uuid: string;
  }[];
}

interface SynchronizeCredentialResponse {
  date: number;
  modified: {
    id: string;
    data: string;
  }[];
  deleted: string[];
}

@Controller('credential')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService, private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @HttpCode(201)
  @Post()
  async addCredential(
    @User() user: UserEntity,
    @Body() { items }: AddCredentialArrayDto,
  ): Promise<AddCredentialResponse> {
    const date = new Date();
    const mappedIds = await this.credentialService.addCredentials(items, user.id, date);
    if (items.length > 0) {
      await this.userService.updateModificationDate(user, date);
    }
    return {
      items: mappedIds,
    };
  }

  @UseGuards(JwtGuard)
  @HttpCode(204)
  @Patch()
  async updateCredential(@User() user: UserEntity, @Body() { items }: UpdateCredentialArrayDto): Promise<void> {
    const date = new Date();
    await this.credentialService.updateCredentials(items, user.id, date);
    if (items.length > 0) {
      await this.userService.updateModificationDate(user, date);
    }
  }

  @UseGuards(JwtGuard)
  @HttpCode(204)
  @Delete()
  async deleteCredential(@User() user: UserEntity, @Body() { items }: DeleteCredentialArrayDto): Promise<void> {
    const date = new Date();
    await this.credentialService.deleteCredentials(items, user.id);
    if (items.length > 0) {
      await this.userService.updateModificationDate(user, date);
    }
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('sync')
  async synchronizeCredential(
    @User() user: UserEntity,
    @Body() { ids, lastSynchronizedDate }: SynchronizeCredentialDto,
  ): Promise<SynchronizeCredentialResponse> {
    const dateNow = new Date();
    const synchroDate = new Date(lastSynchronizedDate);
    if (user.lastModified.getTime() <= lastSynchronizedDate) {
      return {
        date: dateNow.getTime(),
        modified: [],
        deleted: [],
      };
    }
    const modifiedItem = await this.credentialService.findModifiedCredentials(user.id, synchroDate);
    const modifiedItemFiltered = modifiedItem.map(({ id, data }) => ({ id, data }));
    const deletedItemIds = await this.credentialService.checkCredentialsExists(ids, user.id);
    return {
      date: dateNow.getTime(),
      modified: modifiedItemFiltered,
      deleted: deletedItemIds,
    };
  }
}
