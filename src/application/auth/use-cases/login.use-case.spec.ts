import { LoginUseCase } from './login.use-case';
import { AppErrors } from '@application/exceptions/application.exception';

describe('LoginUseCase', () => {
  const users = {
    findByEmailWithRolesAndPermissions: jest.fn(),
  };
  const refreshTokens = { save: jest.fn() };
  const hasher = { compare: jest.fn(), hash: jest.fn() };
  const tokens = {
    issuePair: jest.fn().mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      accessExpiresIn: 900,
      refreshExpiresAt: new Date(Date.now() + 86400000),
      jti: 'jti-1',
    }),
  };
  const permissionCache = { set: jest.fn() };
  const config = { get: jest.fn().mockReturnValue(60) };

  const useCase = new LoginUseCase(
    users as never,
    refreshTokens as never,
    hasher as never,
    tokens as never,
    permissionCache as never,
    config as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('throws when user not found', async () => {
    users.findByEmailWithRolesAndPermissions.mockResolvedValue(null);
    await expect(useCase.execute('a@b.com', 'pass')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('returns tokens on valid credentials', async () => {
    users.findByEmailWithRolesAndPermissions.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'hash',
      roleNames: ['ADMIN'],
      permissionCodes: ['USER_READ'],
    });
    hasher.compare.mockResolvedValue(true);

    const result = await useCase.execute('a@b.com', 'pass');
    expect(result.accessToken).toBe('access');
    expect(refreshTokens.save).toHaveBeenCalled();
    expect(permissionCache.set).toHaveBeenCalled();
  });

  it('throws on invalid password', async () => {
    users.findByEmailWithRolesAndPermissions.mockResolvedValue({
      id: 1,
      passwordHash: 'hash',
    });
    hasher.compare.mockResolvedValue(false);
    await expect(useCase.execute('a@b.com', 'wrong')).rejects.toEqual(
      AppErrors.UNAUTHORIZED('Invalid email or password.'),
    );
  });
});
