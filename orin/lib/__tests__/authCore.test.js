import { createAuthService, EmailAlreadyRegisteredError } from '../authCore';

function accountMock(overrides = {}) {
  return {
    createAnonymousSession: jest.fn(),
    createEmailPasswordSession: jest.fn(),
    createVerification: jest.fn(),
    deleteSession: jest.fn(),
    get: jest.fn(),
    updateEmail: jest.fn(),
    ...overrides,
  };
}

describe('guest-first authentication', () => {
  it('reuses an existing account instead of creating another guest', async () => {
    const current = { $id: 'stable-user-id' };
    const account = accountMock({ get: jest.fn().mockResolvedValue(current) });

    await expect(createAuthService(account).ensureGuestSession()).resolves.toBe(current);
    expect(account.createAnonymousSession).not.toHaveBeenCalled();
  });

  it('creates one anonymous session when no session exists', async () => {
    const current = { $id: 'stable-user-id' };
    const account = accountMock({
      get: jest
        .fn()
        .mockRejectedValueOnce({ code: 401, type: 'general_unauthorized_scope' })
        .mockResolvedValueOnce(current),
      createAnonymousSession: jest.fn().mockResolvedValue({ userId: current.$id }),
    });

    await expect(createAuthService(account).ensureGuestSession()).resolves.toBe(current);
    expect(account.createAnonymousSession).toHaveBeenCalledTimes(1);
    expect(account.get).toHaveBeenCalledTimes(2);
  });

  it('does not hide network or server failures as a missing session', async () => {
    const error = { code: 500, type: 'general_server_error' };
    const account = accountMock({ get: jest.fn().mockRejectedValue(error) });

    await expect(createAuthService(account).ensureGuestSession()).rejects.toBe(error);
    expect(account.createAnonymousSession).not.toHaveBeenCalled();
  });

  it('upgrades the same guest account and then requests verification', async () => {
    const upgraded = { $id: 'stable-user-id', email: 'orin@example.com' };
    const account = accountMock({
      updateEmail: jest.fn().mockResolvedValue(upgraded),
      createVerification: jest.fn().mockResolvedValue({}),
    });

    await expect(
      createAuthService(account).upgradeGuestAccount({
        email: 'orin@example.com',
        password: 'long-enough-password',
        verificationUrl: 'https://orin.example/verify',
      }),
    ).resolves.toEqual({ user: upgraded, verificationSent: true });
    expect(account.updateEmail).toHaveBeenCalledWith({
      email: 'orin@example.com',
      password: 'long-enough-password',
    });
    expect(account.createVerification).toHaveBeenCalledWith({
      url: 'https://orin.example/verify',
    });
  });

  it('preserves the guest session when the email belongs to another account', async () => {
    const account = accountMock({
      updateEmail: jest.fn().mockRejectedValue({ code: 409, type: 'user_already_exists' }),
    });

    await expect(
      createAuthService(account).upgradeGuestAccount({
        email: 'used@example.com',
        password: 'long-enough-password',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
    expect(account.deleteSession).not.toHaveBeenCalled();
    expect(account.createEmailPasswordSession).not.toHaveBeenCalled();
    expect(account.createAnonymousSession).not.toHaveBeenCalled();
  });
});
