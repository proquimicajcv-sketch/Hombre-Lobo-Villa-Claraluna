export type RoleType =
  | 'werewolf'
  | 'alfa_werewolf'
  | 'doctor'
  | 'seer'
  | 'cupid'
  | 'little_girl'
  | 'mute_drunkard'
  | 'witch'
  | 'hunter'
  | 'villager';

export type Allegiance = 'werewolves' | 'village' | 'lovers';

export interface RoleInfo {
  type: RoleType;
  name: string;
  category: string;
  categoryColor: string;
  description: string;
  details: string;
  quote: string;
  allegiance: Allegiance;
  sealColor: string;
}

export interface Player {
  id: string;
  name: string;
  isHost?: boolean;
  isCurrentUser?: boolean;
  avatarUrl: string;
  role: RoleType;
  isAlive: boolean;
  isReady: boolean;
  votes: number;
  isMayor?: boolean; // Alcalde with double vote weight (x2)
  isLover?: boolean; // Cupid's chosen lovers
  loverId?: string; // id of their beloved
  isProtected?: boolean; // Doctor protected
  inspected?: boolean; // Seer inspected
  isBot?: boolean; // Automated by system if player disconnects
  disconnected?: boolean; // Whether original player lost connection
  deathCause?: 'werewolf' | 'lynched' | 'heartbreak' | 'witch_poison' | 'hunter_shot';
  deathNight?: number;
}

export interface DeckConfig {
  werewolves: number;
  alfa_werewolf: number;
  doctor: number;
  seer: number;
  cupid: number;
  little_girl: number;
  mute_drunkard: number;
  witch: number;
  hunter: number;
  villagers: number;
  targetPlayers: number; // 7 to 25
}

export type ActiveTab = 'lobby-sala' | 'mi-carta' | 'noche' | 'aldea-juicio';

export type GameMode = 'online' | 'local';

export type NightStep =
  | 'sleep'
  | 'cupid'
  | 'seer'
  | 'werewolves'
  | 'alfa_resurrect'
  | 'little_girl'
  | 'witch'
  | 'doctor'
  | 'dawn';

export interface AccusationEntry {
  id: string;
  author: string;
  target: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  isGesture?: boolean;
}
