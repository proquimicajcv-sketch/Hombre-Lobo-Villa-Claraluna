import { RoleType } from '../types/game';

/**
 * Respaldo permanente de fábrica para URLs RAW de GitHub / Vercel.
 * Si se añaden URLs aquí, se cargarán de forma predeterminada en todas las partidas
 * incluso en navegadores nuevos o tras borrar la memoria caché.
 */
export const DEFAULT_RAW_CARD_IMAGES: Partial<Record<RoleType, string>> = {
  // alfa_werewolf: '',
  // werewolf: '',
  // cupid: '',
  // little_girl: '',
  // mute_drunkard: '',
  // witch: '',
  // hunter: '',
  // doctor: '',
  // seer: '',
  // villager: '',
};
