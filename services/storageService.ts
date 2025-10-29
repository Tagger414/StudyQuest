
import { UserData } from '../types';

const USER_DATA_KEY = 'studyQuestUserData';

export const saveUserData = (data: UserData): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(USER_DATA_KEY, serializedData);
  } catch (error) {
    console.error('Error saving user data to local storage:', error);
  }
};

export const loadUserData = (): UserData | null => {
  try {
    const serializedData = localStorage.getItem(USER_DATA_KEY);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading user data from local storage:', error);
    return null;
  }
};
