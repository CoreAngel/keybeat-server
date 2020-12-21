import { LoginDto } from '../dto/loginDto';
import { validate } from 'class-validator';
import { RegisterDto } from '../dto/registerDto';
import { ResetPasswordDto } from '../dto/resetPasswordDto';
import { ResetToptDto } from '../dto/resetToptDto';

describe('Dto Auth Validate', () => {
  describe('login', () => {
    it('valid data', async () => {
      const loginDto = new LoginDto();
      loginDto.login = 'login';
      loginDto.password = 'password';
      loginDto.token = '123123';

      const errors = await validate(loginDto);
      expect(errors.length).toBe(0);
    });

    it('empty strings', async () => {
      const loginDto = new LoginDto();
      loginDto.login = '';
      loginDto.password = '';
      loginDto.token = '';

      const errors = await validate(loginDto);
      expect(errors.length).toBe(3);
    });

    it('wrong types', async () => {
      const loginDto = new LoginDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      loginDto.login = 2;
      loginDto.password = undefined;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      loginDto.token = new LoginDto();

      const errors = await validate(loginDto);
      expect(errors.length).toBe(3);
    });

    it('token too long', async () => {
      const loginDto = new LoginDto();
      loginDto.login = 'login';
      loginDto.password = 'password';
      loginDto.token = '1231234';

      const errors = await validate(loginDto);
      expect(errors.length).toBe(1);
    });
  });

  describe('register', () => {
    it('valid data', async () => {
      const registerDto = new RegisterDto();
      registerDto.name = 'name';
      registerDto.login = 'login';
      registerDto.password = 'password';
      registerDto.salt = 'salt';

      const errors = await validate(registerDto);
      expect(errors.length).toBe(0);
    });

    it('empty strings', async () => {
      const registerDto = new RegisterDto();
      registerDto.name = '';
      registerDto.login = '';
      registerDto.password = '';
      registerDto.salt = '';

      const errors = await validate(registerDto);
      expect(errors.length).toBe(4);
    });

    it('wrong types', async () => {
      const registerDto = new RegisterDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      registerDto.name = 2;
      registerDto.login = null;
      registerDto.password = undefined;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      registerDto.salt = new RegisterDto();

      const errors = await validate(registerDto);
      expect(errors.length).toBe(4);
    });
  });

  describe('Reset Password', () => {
    it('valid data', async () => {
      const resetPasswordDto = new ResetPasswordDto();
      resetPasswordDto.password = 'password';
      resetPasswordDto.newPassword = 'newPassword';
      resetPasswordDto.salt = 'salt';

      const errors = await validate(resetPasswordDto);
      expect(errors.length).toBe(0);
    });

    it('empty strings', async () => {
      const resetPasswordDto = new ResetPasswordDto();
      resetPasswordDto.password = '';
      resetPasswordDto.newPassword = '';
      resetPasswordDto.salt = '';

      const errors = await validate(resetPasswordDto);
      expect(errors.length).toBe(3);
    });

    it('wrong types', async () => {
      const resetPasswordDto = new ResetPasswordDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      resetPasswordDto.password = 2;
      resetPasswordDto.newPassword = undefined;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      resetPasswordDto.salt = new ResetPasswordDto();

      const errors = await validate(resetPasswordDto);
      expect(errors.length).toBe(3);
    });
  });

  describe('Reset Topt', () => {
    it('valid data', async () => {
      const resetToptDto = new ResetToptDto();
      resetToptDto.login = 'login';
      resetToptDto.resetToken = 'token';

      const errors = await validate(resetToptDto);
      expect(errors.length).toBe(0);
    });

    it('empty strings', async () => {
      const resetToptDto = new ResetToptDto();
      resetToptDto.login = '';
      resetToptDto.resetToken = '';

      const errors = await validate(resetToptDto);
      expect(errors.length).toBe(2);
    });

    it('wrong types', async () => {
      const resetToptDto = new ResetToptDto();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      resetToptDto.login = 2;
      resetToptDto.resetToken = undefined;

      const errors = await validate(resetToptDto);
      expect(errors.length).toBe(2);
    });
  });
});
