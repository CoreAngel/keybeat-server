export const inputRegisterUser = {
  name: 'name',
  login: 'userLogin',
  password: 'secretPassword',
  salt: 'salt',
};

export const userEntity = (hashPassword, generateToptKeys) => ({
  ...inputRegisterUser,
  id: 0,
  password: hashPassword,
  ...generateToptKeys,
  lastModified: 11111,
});

export const generateToptKeysMock = {
  toptSecret: 'toptSecret',
  toptReset: 'toptReset',
};

export const userEntityMock = userEntity('hashedPassword', generateToptKeysMock);
