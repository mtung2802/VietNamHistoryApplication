import AsyncStorage from '@react-native-async-storage/async-storage';

export const USER_SESSION_KEY = 'currentUser';

export interface SessionUser {
  id: string;
  uid?: string;
  username?: string;
  name?: string;
  displayName?: string;
  email?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
  photo?: string;
  totalScore?: number;
  level?: number;
  [key: string]: unknown;
}

export const getUserSession = async (): Promise<SessionUser | null> => {
  const raw = await AsyncStorage.getItem(USER_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    await AsyncStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
};

export const saveUserSession = async (user: SessionUser): Promise<void> => {
  await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
};

export const clearUserSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_SESSION_KEY);
};
