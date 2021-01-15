import { validate } from 'class-validator';
import { AddCredentialArrayDto, AddCredentialDto } from '../dto/addCredentialDto';
import { DeleteCredentialArrayDto, DeleteCredentialDto } from '../dto/deleteCredentialDto';
import { UpdateCredentialArrayDto, UpdateCredentialDto } from '../dto/updateCredentialDto';
import { SynchronizeCredentialDto } from '../dto/synchronizeCredentialDto';

describe('Dto Credential Validate', () => {
  describe('addCredentialDto', () => {
    it('valid data', async () => {
      const addCredentialDto = new AddCredentialDto();
      addCredentialDto.id = 1;
      addCredentialDto.data = 'data';

      const addCredentialDto2 = new AddCredentialDto();
      addCredentialDto2.id = 2;
      addCredentialDto2.data = 'data';

      const addCredentialArrayDto = new AddCredentialArrayDto();
      addCredentialArrayDto.items = [addCredentialDto, addCredentialDto2];

      const errors = await validate(addCredentialArrayDto);
      expect(errors.length).toBe(0);
    });

    it('empty array', async () => {
      const addCredentialArrayDto = new AddCredentialArrayDto();
      addCredentialArrayDto.items = [];

      const errors = await validate(addCredentialArrayDto);
      expect(errors.length).toBe(0);
    });

    it('invalid types', async () => {
      const addCredentialDto = new AddCredentialDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      addCredentialDto.id = 'qwerty';

      const addCredentialDto2 = new AddCredentialDto();
      addCredentialDto2.id = 2;
      addCredentialDto2.data = 'data';

      const addCredentialArrayDto = new AddCredentialArrayDto();
      addCredentialArrayDto.items = [addCredentialDto, addCredentialDto2];

      const errors = await validate(addCredentialArrayDto);
      expect(errors.length).toBe(1);
    });
  });

  describe('deleteCredentialDto', () => {
    it('valid data', async () => {
      const deleteCredentialDto = new DeleteCredentialDto();
      deleteCredentialDto.id = 'qwerty';

      const deleteCredentialDto2 = new DeleteCredentialDto();
      deleteCredentialDto2.id = 'qwerty';

      const deleteCredentialArrayDto = new DeleteCredentialArrayDto();
      deleteCredentialArrayDto.items = [deleteCredentialDto, deleteCredentialDto2];

      const errors = await validate(deleteCredentialArrayDto);
      expect(errors.length).toBe(0);
    });

    it('empty array', async () => {
      const deleteCredentialArrayDto = new DeleteCredentialArrayDto();
      deleteCredentialArrayDto.items = [];

      const errors = await validate(deleteCredentialArrayDto);
      expect(errors.length).toBe(0);
    });

    it('invalid types', async () => {
      const deleteCredentialDto = new DeleteCredentialDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deleteCredentialDto.id = 1;

      const deleteCredentialDto2 = new DeleteCredentialDto();
      deleteCredentialDto2.id = 'qwerty';

      const deleteCredentialArrayDto = new DeleteCredentialArrayDto();
      deleteCredentialArrayDto.items = [deleteCredentialDto, deleteCredentialDto2];

      const errors = await validate(deleteCredentialArrayDto);
      expect(errors.length).toBe(1);
    });
  });

  describe('updateCredentialDto', () => {
    it('valid data', async () => {
      const updateCredentialDto = new UpdateCredentialDto();
      updateCredentialDto.id = 'qwerty';
      updateCredentialDto.data = 'data';

      const updateCredentialDto2 = new UpdateCredentialDto();
      updateCredentialDto2.id = 'qwerty';
      updateCredentialDto2.data = 'data';

      const updateCredentialArrayDto = new UpdateCredentialArrayDto();
      updateCredentialArrayDto.items = [updateCredentialDto, updateCredentialDto2];

      const errors = await validate(updateCredentialArrayDto);
      expect(errors.length).toBe(0);
    });

    it('empty array', async () => {
      const updateCredentialArrayDto = new UpdateCredentialArrayDto();
      updateCredentialArrayDto.items = [];

      const errors = await validate(updateCredentialArrayDto);
      expect(errors.length).toBe(0);
    });

    it('invalid types', async () => {
      const updateCredentialDto = new UpdateCredentialDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateCredentialDto.id = 1;

      const updateCredentialDto2 = new UpdateCredentialDto();
      updateCredentialDto2.id = 'qwerty';
      updateCredentialDto2.data = 'data';

      const updateCredentialArrayDto = new UpdateCredentialArrayDto();
      updateCredentialArrayDto.items = [updateCredentialDto, updateCredentialDto2];

      const errors = await validate(updateCredentialArrayDto);
      expect(errors.length).toBe(1);
    });
  });

  describe('synchronizeCredentialDto', () => {
    it('valid data', async () => {
      const synchronizeCredentialDto = new SynchronizeCredentialDto();
      synchronizeCredentialDto.lastSynchronizedDate = 12345;
      synchronizeCredentialDto.ids = ['qwerty1', 'qwerty2'];

      const errors = await validate(synchronizeCredentialDto);
      expect(errors.length).toBe(0);
    });

    it('empty fields', async () => {
      const synchronizeCredentialDto = new SynchronizeCredentialDto();
      synchronizeCredentialDto.lastSynchronizedDate = null;
      synchronizeCredentialDto.ids = [];

      const errors = await validate(synchronizeCredentialDto);
      expect(errors.length).toBe(1);
    });

    it('invalid types', async () => {
      const synchronizeCredentialDto = new SynchronizeCredentialDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      synchronizeCredentialDto.lastSynchronizedDate = '12345';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      synchronizeCredentialDto.ids = [2, new Date()];

      const errors = await validate(synchronizeCredentialDto);
      expect(errors.length).toBe(2);
    });
  });
});
