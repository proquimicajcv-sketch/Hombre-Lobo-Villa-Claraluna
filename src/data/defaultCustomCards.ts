import { RoleType } from '../types/game';

/**
 * Respaldo permanente de fábrica para URLs RAW de GitHub / Vercel.
 * Se cargarán de forma predeterminada en todas las partidas
 * (pasa el móvil, online sincro, compendio, etc.) incluso en navegadores nuevos
 * o tras reiniciar el dispositivo.
 */
export const DEFAULT_RAW_CARD_IMAGES: Partial<Record<RoleType, string>> = {
  alfa_werewolf:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Hombre%20Lobo%20Alfa.jfif',
  werewolf:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Hombre%20Lobo.jfif',
  cupid:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Cupido.jfif',
  little_girl:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Fizg%C3%B3n%20(a).jfif',
  mute_drunkard:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Borracho.jfif',
  witch:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Bruja.jfif',
  hunter:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Cazador.jfif',
  doctor:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/M%C3%A9dico.jfif',
  seer:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Vidente.jfif',
  villager:
    'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/Aldeanos.jfif',
};

/**
 * Imagen oficial del Código QR de Villa Claraluna proporcionada por el usuario
 */
export const OFFICIAL_QR_CODE_URL =
  'https://raw.githubusercontent.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/main/cartas/C%C3%B3digo%20QR%20VillaCL.png';

export const OFFICIAL_QR_CODE_FALLBACK_URL =
  'https://github.com/proquimicajcv-sketch/Hombre-Lobo-Villa-Claraluna/blob/main/cartas/C%C3%B3digo%20QR%20VillaCL.png?raw=true';
