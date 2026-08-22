export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('That email already belongs to an account. Your guest progress is still safe.');
    this.name = 'EmailAlreadyRegisteredError';
    this.code = 'email_already_registered';
    this.preservesGuestSession = true;
  }
}

function isMissingSession(error) {
  return error?.code === 401;
}

function isEmailConflict(error) {
  return error?.code === 409 || error?.type === 'user_already_exists';
}

export function createAuthService(account) {
  return {
    async ensureGuestSession() {
      try {
        return await account.get();
      } catch (error) {
        if (!isMissingSession(error)) throw error;
      }

      await account.createAnonymousSession();
      return account.get();
    },

    async upgradeGuestAccount({ email, password, verificationUrl }) {
      let user;
      try {
        user = await account.updateEmail({ email, password });
      } catch (error) {
        if (isEmailConflict(error)) throw new EmailAlreadyRegisteredError();
        throw error;
      }

      if (!verificationUrl) return { user, verificationSent: false };
      await account.createVerification({ url: verificationUrl });
      return { user, verificationSent: true };
    },

    login(email, password) {
      return account.createEmailPasswordSession({ email, password });
    },

    logout() {
      return account.deleteSession({ sessionId: 'current' });
    },

    getCurrentUser() {
      return account.get();
    },
  };
}
