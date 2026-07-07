import { ID, Permission, Role } from 'react-native-appwrite';
import { account } from './appwrite';

export const authService = {
  async register(email, password, name) {
    const user = await account.create({userId: ID.unique(), email, password, name});
    await account.createEmailPasswordSession({email, password});
    return user;
  },

  async login(email, password) {
    try {
      await account.createEmailPasswordSession({email, password});
    }
    catch{
      console.log("Error:", error);
    }
  },

  async logout() {
    try{
      await account.deleteSession({ sessionId: 'current' });
      console.log('You are logged out!')
    } catch (error) {
      console.log("Error:", error);
    }
  },

  async getCurrentUser() {
    return account.get();
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

