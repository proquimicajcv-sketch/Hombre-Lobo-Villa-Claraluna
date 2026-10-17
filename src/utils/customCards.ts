import { RoleType } from '../types/game';
import { DEFAULT_RAW_CARD_IMAGES } from '../data/defaultCustomCards';

const STORAGE_KEY = 'claraluna_custom_card_images';
const VAULT_KEY = 'claraluna_custom_card_images_vault';
const SESSION_KEY = 'claraluna_custom_card_images_session';
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

/**
 * Normalizes user-entered image URLs, particularly GitHub links.
 * Converts GitHub web viewer URLs (github.com/.../blob/...) to direct CDN RAW URLs
 * (raw.githubusercontent.com/...) and strips query parameters or unwanted prefixes.
 */
export const normalizeImageUrl = (url: string): string => {
  if (!url) return '';
  let trimmed = url.trim();

  // If it's a data URL, return as is
  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  try {
    // 1. Remove wrapping quotes if pasted by accident
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      trimmed = trimmed.slice(1, -1).trim();
    }

    // 2. GitHub blob or raw URL: https://github.com/:owner/:repo/(blob|raw)/:branch/:path
    const githubWebRegex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+)$/i;
    const match = trimmed.match(githubWebRegex);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      let rest = match[3];
      // strip query strings like ?raw=true
      rest = rest.split('?')[0].split('#')[0];
      // strip refs/heads/ if present
      rest = rest.replace(/^refs\/heads\//, '');
      return `https://raw.githubusercontent.com/${owner}/${repo}/${rest}`;
    }

    // 3. raw.githubusercontent.com with refs/heads/
    if (trimmed.includes('raw.githubusercontent.com') && trimmed.includes('/refs/heads/')) {
      trimmed = trimmed.replace('/refs/heads/', '/');
    }

    // 4. raw.githubusercontent.com with query params
    if (trimmed.includes('raw.githubusercontent.com')) {
      trimmed = trimmed.split('?')[0].split('#')[0];
    }
  } catch (e) {
    console.error('Error normalizing image URL', e);
  }

  return trimmed;
};

// Retrieve custom card images with multi-tier fallback (localStorage -> vault -> session -> defaults)
export const getCustomCardImages = (): Partial<Record<RoleType, string>> => {
  let images: Partial<Record<RoleType, string>> = {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      images = { ...images, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading from primary storage', e);
  }

  // Vault fallback if primary was empty or wiped
  if (Object.keys(images).length === 0) {
    try {
      const vaultRaw = localStorage.getItem(VAULT_KEY);
      if (vaultRaw) {
        images = { ...images, ...JSON.parse(vaultRaw) };
        localStorage.setItem(STORAGE_KEY, vaultRaw);
      }
    } catch {
      // ignore
    }
  }

  // Session fallback
  if (Object.keys(images).length === 0) {
    try {
      const sessionRaw = sessionStorage.getItem(SESSION_KEY);
      if (sessionRaw) {
        images = { ...images, ...JSON.parse(sessionRaw) };
        localStorage.setItem(STORAGE_KEY, sessionRaw);
        localStorage.setItem(VAULT_KEY, sessionRaw);
      }
    } catch {
      // ignore
    }
  }

  // Merge with defaults
  const merged: Partial<Record<RoleType, string>> = {
    ...DEFAULT_RAW_CARD_IMAGES,
    ...images,
  };

  // Run normalization across all entries so any existing or restored URLs work properly
  const normalizedMap: Partial<Record<RoleType, string>> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v && typeof v === 'string') {
      normalizedMap[k as RoleType] = normalizeImageUrl(v);
    }
  }

  return normalizedMap;
};

// Save a custom card image with multi-tier redundancy and automatic normalization
export const setCustomCardImage = (role: RoleType, imageUrl: string) => {
  try {
    const current = getCustomCardImages();
    const normalized = normalizeImageUrl(imageUrl);

    if (normalized) {
      current[role] = normalized;
    } else {
      delete current[role];
    }
    const serialized = JSON.stringify(current);

    // Save across all storage tiers
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(VAULT_KEY, serialized);
    sessionStorage.setItem(SESSION_KEY, serialized);

    // Notify all app components
    window.dispatchEvent(new Event('claraluna_custom_cards_updated'));
  } catch (e) {
    console.error('Error saving custom card image', e);
  }
};

// Clear custom card images
export const clearCustomCardImages = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VAULT_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('claraluna_custom_cards_updated'));
  } catch (e) {
    console.error('Error clearing custom card images', e);
  }
};

// Export all custom cards as a downloadable JSON backup file
export const exportCardsBackup = () => {
  const data = getCustomCardImages();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `villa-claraluna-cartas-raw-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import custom cards from a JSON string or object
export const importCardsBackup = (jsonInput: string): boolean => {
  try {
    const parsed = JSON.parse(jsonInput);
    if (typeof parsed !== 'object' || parsed === null) return false;
    const current = getCustomCardImages();
    const merged = { ...current, ...parsed };

    // Normalize each URL
    const normalizedMap: Partial<Record<RoleType, string>> = {};
    for (const [k, v] of Object.entries(merged)) {
      if (v && typeof v === 'string') {
        normalizedMap[k as RoleType] = normalizeImageUrl(v);
      }
    }

    const serialized = JSON.stringify(normalizedMap);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(VAULT_KEY, serialized);
    sessionStorage.setItem(SESSION_KEY, serialized);

    window.dispatchEvent(new Event('claraluna_custom_cards_updated'));
    return true;
  } catch (e) {
    console.error('Error importing cards JSON', e);
    return false;
  }
};

// Get JSON string of cards for easy copy-pasting
export const getCardsJsonString = (): string => {
  return JSON.stringify(getCustomCardImages(), null, 2);
};

// Visibility settings
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
