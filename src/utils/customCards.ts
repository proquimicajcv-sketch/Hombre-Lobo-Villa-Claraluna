import { RoleType } from '../types/game';

const STORAGE_KEY = 'claraluna_custom_card_images';
const SETTINGS_KEY = 'claraluna_card_visibility_settings';

export interface CardVisibilitySettings {
  hideSealsOnCustom: boolean; // default true: always hide seal when custom card uploaded
  hideSealsAlways: boolean; // hide seals on all cards for maximum art visibility
  cleanArtMode: boolean; // hide big text boxes to let art shine
  fitMode: 'cover' | 'contain'; // card image fitting
}

const DEFAULT_SETTINGS: CardVisibilitySettings = {
  hideSealsOnCustom: true,
  hideSealsAlways: false,
  cleanArtMode: false,
  fitMode: 'cover',
};

export const getCustomCardImages = (): Partial<Record<RoleType, string>> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setCustomCardImage = (role: RoleType, imageUrl: string) => {
  try {
    const current = getCustomCardImages();
    if (imageUrl.trim()) {
      current[role] = imageUrl.trim();
    } else {
      delete current[role];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('claraluna_custom_cards_updated'));
  } catch (e) {
    console.error('Error saving custom card image', e);
  }
};

export const clearCustomCardImages = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('claraluna_custom_cards_updated'));
  } catch (e) {
    console.error('Error clearing custom card images', e);
  }
};

export const getCardVisibilitySettings = (): CardVisibilitySettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const updateCardVisibilitySettings = (
  patch: Partial<CardVisibilitySettings>
): CardVisibilitySettings => {
  try {
    const current = getCardVisibilitySettings();
    const updated = { ...current, ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('claraluna_card_settings_updated'));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
};
