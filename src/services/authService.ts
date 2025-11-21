import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@users';
const CURRENT_USER_KEY = '@current_user';

export interface User {
  username: string;
  password: string;
}

export const authService = {
  async signUp(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      if (users.some(user => user.username === username)) {
        return { success: false, error: 'Username already exists' };
      }

      users.push({ username, password });
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to sign up' };
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        return { success: false, error: 'Invalid username or password' };
      }

      await AsyncStorage.setItem(CURRENT_USER_KEY, username);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to login' };
    }
  },

  async getCurrentUser(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CURRENT_USER_KEY);
    } catch (error) {
      return null;
    }
  },

  async getAllUsers(): Promise<string[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      return users.map(user => user.username);
    } catch (error) {
      return [];
    }
  },

  async verifyPassword(username: string, password: string): Promise<boolean> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      return users.some(user => user.username === username && user.password === password);
    } catch (error) {
      return false;
    }
  },

  async switchUser(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, username);
    } catch (error) {
      throw new Error('Failed to switch user');
    }
  },

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
    }
  },
};

