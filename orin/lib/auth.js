import { Permission, Role } from 'react-native-appwrite';
import { account } from './appwrite';
import { createAuthService } from './authCore';

const accountAuth = createAuthService(account);

export const authService = {
  ...accountAuth,

  async register(email, password, name) {
    await accountAuth.ensureGuestSession();
    const { user } = await accountAuth.upgradeGuestAccount({ email, password });
    if (name?.trim()) return account.updateName({ name: name.trim() });
    return user;
  },
};

export async function getCurrentUserId() {
  const user = await authService.getCurrentUser();
  return user.$id;
}

export function userDocumentPermissions(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}
