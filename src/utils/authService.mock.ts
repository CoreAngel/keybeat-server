export const authServiceMock = {
  crateUri: jest.fn(),
  generateQR: jest.fn(),
  hashPassword: jest.fn(),
  generateToptKeys: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  resetTopt: jest.fn(),
  verifyUser: jest.fn(),
  verifyPassword: jest.fn(),
  verifyToken: jest.fn(),
  verifyToptReset: jest.fn(),
};
