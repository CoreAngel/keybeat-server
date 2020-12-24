export const configServiceMock = {
  get(key: string) {
    switch (key) {
      case 'JWT_SECRET':
        return 'superSecretJwtKey';
      case 'INVALID_ACTIONS_TIME':
        return 600;
      case 'BAN_TIME':
        return 3600;
    }
  },
};
