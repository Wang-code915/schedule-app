import { AppState } from '@/types';

const STORAGE_KEY = 'schedule_app_data';

export const loadState = (): AppState | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch {
    return null;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    console.error('Failed to save state');
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
