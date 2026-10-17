import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(express.json());

// Game Types
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
  isMayor?: boolean;
  isLover?: boolean;
  loverId?: string;
  isProtected?: boolean;
  inspected?: boolean;
  deathCause?: 'werewolf' | 'lynched' | 'heartbreak' | 'witch_poison' | 'hunter_shot';
  deathNight?: number;
  lastPing?: number;
  isBot?: boolean;
  disconnected?: boolean;
}

export interface DeckConfig {
  targetPlayers: number;
  alfa_werewolf: number;
  werewolves: number;
  doctor: number;
  seer: number;
  cupid: number;
  little_girl: number;
  mute_drunkard: number;
  witch: number;
  hunter: number;
  villagers: number;
}

export interface AccusationEntry {
  id: string;
  author: string;
  target: string;
  message: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface RoomState {
  roomCode: string;
  hostId: string;
  gameMode: 'local' | 'online';
  activeTab: 'lobby-sala' | 'mi-carta' | 'noche' | 'aldea-juicio';
  deck: DeckConfig;
  players: Player[];
  nightNumber: number;
  dayNumber: number;
  accusations: AccusationEntry[];
  selectedPlayerId: string | null;
  gameStarted: boolean;
  actionStartedAt: number; // Timestamp of current phase start for 60s timer
  actionTimeRemaining: number; // 0 to 60 seconds
  votes: Record<string, string>; // voterId -> targetId
  nightVotes: {
    wolfVotes: Record<string, string>;
    victimId: string | null;
    saved: boolean;
    poisonedId: string | null;
    healedId: string | null;
    inspectedRole?: { targetId: string; role: RoleType };
    loversChosen?: [string, string];
  };
  waitingQueue: Player[];
  restartVotes: string[]; // Player IDs who voted to restart the game
  lastUpdated: number;
}

export const MIN_PLAYERS = 7;
export const MAX_PLAYERS = 25;
export const ACTION_TIMEOUT_SECONDS = 60;

export const NPC_ROSTER = [
  {
    name: 'Elena (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAa6ORFhSHL4JXpo1BOFCH-WxHK6UU4Jn0hY9td8o9dTGeq16d5kD0uHGTZ6nEq3U5qS1c7v28DkQiJYTp5NNujCiuZc22CY4_n9aAUocIJSN8piqwoZtHnJ1AGfc-fHOI-5ksC8OrTvC6eKY2g_OizEOM7kmP5wlo226hFv8GH_GEUC2cVbzX-hjVaKvUOz09Bu6OMfsG7fAD0CVog1WRcYMFOVsARAJLoGt3IExGqz_E0MLa_vtpfHw',
  },
  {
    name: 'Carlos (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCf8WMjwM0R1LQOjZIkJSH0v3PGMkHiZ4lWRyWkPT8TNleYqqYliKP_XcfA-f6_nvZuDasv9pVG1nVWqHPkzBWMLUrlTdNss1pcynTwv1uKvLXi7v49yBd7G2dBFLqTQ--QcqIbuMVZzw0SY3NEL_TbAeZOtmCcfdb9NYV9jOU16i6_9x_JZWIdAH57f2LD63e0ZrzjtsQkX_cFF1VR2bAVL6xMmo8KKpkIUTZTrjXoFyr07VnATEAuTw',
  },
  {
    name: 'Sofía (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBaICa67tp_F1zq7jF0la9-_z3o_4-Z7vXybzykIwKtMApDmubWimEfbrQDHXHHbX71VVAjgHoESXIwauPKJY6Eqr5Vob21mwRijtJcrjHL-i6qD-WOjGseGb4D71mI21TvRWBk6bSORD3J-UNp8p7wu0iP72FA2hkXTlRDDbEhGwsQL_eJaqwHqD3KnOzdSsfMXzeKtgh4pWASBA3otJKTTcg-DvyYzqMmSyLuTm13WmBO6dAD6IvWgg',
  },
  {
    name: 'Lucas (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDff9aW54Ydo9Z4jcwvyEUNrW1N17etUUDMDCeFGIjFFHtq6qySRJGVUOuiOcB1_8sSfBjmOfqlKQZ39pzgfcqWpZDI2-YORLStnmcj24fYpGaJ0D0s32UWr1RIY20cfXz81QTNOLFipvPgkIBWtxw2mLl4sTpaCH19DNqRzrKPvy4SGRpTQ-_--fHsVeiMK9A1doyV1TkUn8SIeER7CEF7iaSlxrx1g2q8F_A5XWeZWneykYMkNTiTmQ',
  },
  {
    name: 'Valentina (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBxTc4Gu7_y7t7MSDGq025fdCzK_YHfd-A68LFh72fJS_X3jBCY9HHkJbd6ER191WSO9bDGDaBLzkZ6bsryycNUSHxu9sFsIZczXuTeKLvt4aN885G_u-Cep_SCMhcM1-wM3h6TTjYqTrln7LI9HglRLYLzOGYmZsS9QhcW_uQ0J_2YF8ANrRzciCGb6E2KHZ2hpbQZ-5IwDy0wNhhg_m6Z2k9QjHXB-xhKEfgpFGVlQzQ17DY3D1PZsw',
  },
  {
    name: 'Diego (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdzZCrKyduA1z9yTtMkduPe4lSuLaPtz7B3AagyQ_Ym6xZp_gJfmlAj5cOG9-TzJQiViNBVqzlXUQwQs3fkiVgiURbAJJmQK8TJZUYEzz7TL3ApS8wfJAb86JpG1C_JmWfxYhm8Nj2PpiSoPidgqKuCNn1NOP8h4FJWVt6LJGALLBlVxB225vjPg010x-nPlh1XPgfR1IiI7AzrBmYdsoZpa5OVEGMa1lTNtfonouJCVkm1q-v-utxpw',
  },
  {
    name: 'Lucía (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBcccqgFMA3JwxKZR_whHrnNJmguLjpK7L-1-HWYDeAJzLMmArXImXSVD-Wj7lqGbkvMCskuEGXAsdAgnINS7VilhoUMp7Utcgp8oalGk16Cz4ZD-Ux_UN2aCsKPBD_OyxOIxsKV4ElF7SFb4g5_e1-IEKKfYK3lbsGf8kBxCPRpjfTVdVN943qhsbCndVvSvpReaIkY8gJDRjcfYRDh-InSoN3Of2oTnLToD1fG5ONeA1HqMj1AYuQ',
  },
  {
    name: 'Marcos (NPC)',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDI4FIIMSEIayraAoUY1t_KMyzzrUom3xQV2HK0-xZ3l8T-mYUreyayk3PdAj8kMb2htvt2i0lFL1fyoNAfHUIWZWOyzNkBNcNE6I6b87QDdHXgDhZ_4UhoCM4sLXG5qVtsbo6HecvxiBW6kXGg9qR2p5qnCP4ptPeAx3GhBzumaiX22oxB3XF5ViYsvuYpkQd40kg8E4Ad_3SGu2jVNFJUgQWdDDTLDy37dfTukjRueyGiXzWRw3DdEw',
  },
];

export function calculateBalancedDeck(count: number): DeckConfig {
  const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count));

  // 1 Niña Fizgona, 1 Médico, 1 Bruja mínimos
  const little_girl = 1;
  const doctor = 1;
  const witch = 1;

  // ~20% de Lobos (al menos 2: 1 Lobo Alfa + Lobos comunes)
  const totalWolves = Math.max(2, Math.round(clamped * 0.2));
  const alfa_werewolf = 1;
  const werewolves = totalWolves - 1;

  // ~30% de Aldeanos comunes
  let villagers = Math.max(2, Math.round(clamped * 0.3));

  // Restante: Vidente, Cupido, Cazador, Borracho Mudo
  let remaining = clamped - (totalWolves + little_girl + doctor + witch + villagers);

  let seer = 0;
  let cupid = 0;
  let hunter = 0;
  let mute_drunkard = 0;

  if (remaining > 0) { seer = 1; remaining--; }
  if (remaining > 0) { cupid = 1; remaining--; }
  if (remaining > 0) { hunter = 1; remaining--; }
  if (remaining > 0) { mute_drunkard = 1; remaining--; }

  if (remaining > 0) {
    villagers += remaining;
  } else if (remaining < 0) {
    villagers = Math.max(1, villagers + remaining);
  }

  const sum = werewolves + alfa_werewolf + doctor + seer + cupid + little_girl + mute_drunkard + witch + hunter + villagers;
  if (sum !== clamped) {
    villagers += (clamped - sum);
  }

  return {
    werewolves,
    alfa_werewolf,
    doctor,
    seer,
    cupid,
    little_girl,
    mute_drunkard,
    witch,
    hunter,
    villagers,
    targetPlayers: clamped,
  };
}

// In-memory room store with room isolation
const rooms = new Map<string, RoomState>();
const sseClients = new Map<string, Set<Response>>();
const wsRooms = new Map<string, Set<WebSocket>>();

const getOrCreateRoom = (roomCode: string, initialHostName?: string): RoomState => {
  const code = (roomCode || 'LOB0-77').toUpperCase().trim();
  let room = rooms.get(code);
  if (!room) {
    const hostId = `p_host_${Date.now()}`;
    const initialPlayers: Player[] = [
      {
        id: hostId,
        name: initialHostName || (code.startsWith('NPC-') ? 'Tú (Jugador)' : 'Anfitrión'),
        isHost: true,
        isCurrentUser: true,
        isMayor: true,
        avatarUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB3dg_vQWq0VPRNKkvEA_k_pu5_xdAihlhNwXLe7JGvL95FSlraaMcQA7rjBeClL2Lj41iX8PuVch3QhgiT2VAvHGNXGXEwx8Be7Q4RVe4aLvqSaEuUJfQny8EKcL6eqDXf19EiQulag_ZCVIPZ0D55VrnFC65YV0CD0K5F3cgLdbgs9n6bB605HJXVyYpYRToU81tmUKK7hfVrNwd8zgfNpayxfvSWDMy9d8dVq-EahbAPjnANnHucOQ',
        role: 'villager',
        isAlive: true,
        isReady: true,
        votes: 0,
        lastPing: Date.now(),
      },
    ];

    // If it's a dedicated NPC room (NPC-1, NPC-2, etc.), auto-fill with 6 NPCs to meet 7 players minimum
    if (code.startsWith('NPC-')) {
      for (let i = 0; i < 6; i++) {
        const t = NPC_ROSTER[i % NPC_ROSTER.length];
        initialPlayers.push({
          id: `p_npc_init_${i}`,
          name: t.name,
          avatarUrl: t.avatarUrl,
          role: 'villager',
          isAlive: true,
          isReady: true,
          votes: 0,
          isBot: true,
          disconnected: false,
          lastPing: Date.now(),
        });
      }
    }

    room = {
      roomCode: code,
      hostId,
      gameMode: 'online',
      activeTab: 'lobby-sala',
      deck: calculateBalancedDeck(initialPlayers.length >= MIN_PLAYERS ? initialPlayers.length : MIN_PLAYERS),
      players: initialPlayers,
      nightNumber: 1,
      dayNumber: 1,
      accusations: [
        {
          id: 'init_1',
          author: 'Crónicas de Villa Claraluna',
          target: 'La Aldea',
          message: code.startsWith('NPC-')
            ? '🏛️ Aquelarre en solitario con aldeanos autómatas (NPCs). ¡El Guardián dirige la partida!'
            : 'El aquelarre se ha abierto. Se requiere un mínimo de 7 jugadores (máx 25).',
          timestamp: 'Justo ahora',
          severity: 'low',
        },
      ],
      selectedPlayerId: null,
      gameStarted: false,
      actionStartedAt: Date.now(),
      actionTimeRemaining: ACTION_TIMEOUT_SECONDS,
      votes: {},
      nightVotes: {
        wolfVotes: {},
        victimId: null,
        saved: false,
        poisonedId: null,
        healedId: null,
      },
      waitingQueue: [],
      restartVotes: [],
      lastUpdated: Date.now(),
    };
    rooms.set(code, room);
  }
  return room;
};

// Sanitize room data for client: ONLY player's own card is visible!
// Host is virtual/system and CANNOT peek at others' cards.
const sanitizeRoomForPlayer = (room: RoomState, playerId?: string): RoomState => {
  const player = room.players.find((p) => p.id === playerId);
  const isWolf = player?.role === 'werewolf' || player?.role === 'alfa_werewolf';

  const sanitizedPlayers = room.players.map((p) => {
    // Before game starts, everyone is presented neutrally as villager
    if (!room.gameStarted) {
      return { ...p, role: 'villager' as RoleType };
    }
    // Player always sees their own real secret role
    if (p.id === playerId) {
      return p;
    }
    // Fellow werewolves see each other
    if (isWolf && (p.role === 'werewolf' || p.role === 'alfa_werewolf')) {
      return p;
    }
    // Lovers see each other
    if (player?.isLover && player.loverId === p.id) {
      return p;
    }
    // For all other players, mask role as villager
    return {
      ...p,
      role: 'villager' as RoleType,
    };
  });

  return {
    ...room,
    players: sanitizedPlayers,
  };
};

// Broadcast room update
const broadcastRoom = (room: RoomState) => {
  room.lastUpdated = Date.now();
  const code = room.roomCode;

  // SSE Broadcast
  const sseSet = sseClients.get(code);
  if (sseSet && sseSet.size > 0) {
    for (const res of sseSet) {
      try {
        const playerId = (res as any).playerId;
        const payload = sanitizeRoomForPlayer(room, playerId);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (err) {
        sseSet.delete(res);
      }
    }
  }

  // WS Broadcast
  const wsSet = wsRooms.get(code);
  if (wsSet && wsSet.size > 0) {
    for (const ws of wsSet) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const playerId = (ws as any).playerId;
          const payload = sanitizeRoomForPlayer(room, playerId);
          ws.send(JSON.stringify({ type: 'ROOM_UPDATE', room: payload }));
        } catch (err) {
          wsSet.delete(ws);
        }
      } else {
        wsSet.delete(ws);
      }
    }
  }
};

// ============================================================================
// BOT ENGINE & DISCONNECTION TAKEOVER
// If a player disconnects, system marks isBot = true immediately and executes
// their actions automatically so the game continues without pause.
// If 1-minute timer expires, system auto-resolves pending decisions.
// ============================================================================
setInterval(() => {
  const now = Date.now();

  rooms.forEach((room) => {
    let changed = false;

    // 1. Detect disconnects in active game: if player ping > 8s and not marked as bot yet
    if (room.gameStarted) {
      room.players.forEach((p) => {
        if (!p.isBot && p.lastPing && now - p.lastPing > 8000) {
          p.isBot = true;
          p.disconnected = true;
          changed = true;
          room.accusations.unshift({
            id: `bot_takeover_${now}_${p.id}`,
            author: 'Sistema Guardián',
            target: p.name,
            message: `⚠️ ${p.name} se ha desconectado. El Guardián toma su rol de inmediato para que la partida continúe sin pausas.`,
            timestamp: 'Ahora',
            severity: 'medium',
          });
        }
      });
    }

    // 2. 1-Minute Action Timer check
    if (room.gameStarted) {
      const elapsedSec = Math.floor((now - room.actionStartedAt) / 1000);
      const remaining = Math.max(0, ACTION_TIMEOUT_SECONDS - elapsedSec);
      if (room.actionTimeRemaining !== remaining) {
        room.actionTimeRemaining = remaining;
        changed = true;
      }

      // 3. Bot fast auto-pilot: If all deciding players in current phase are bots,
      // auto-act within 5s instead of forcing humans to wait 60 seconds
      if (room.activeTab === 'noche') {
        const livingWolves = room.players.filter(
          (p) => p.isAlive && (p.role === 'werewolf' || p.role === 'alfa_werewolf')
        );
        const allWolvesAreBots = livingWolves.length > 0 && livingWolves.every((w) => w.isBot);
        if (allWolvesAreBots && !room.nightVotes.victimId && elapsedSec >= 5) {
          const livingNonWolves = room.players.filter(
            (p) => p.isAlive && p.role !== 'werewolf' && p.role !== 'alfa_werewolf'
          );
          if (livingNonWolves.length > 0) {
            const randomVictim =
              livingNonWolves[Math.floor(Math.random() * livingNonWolves.length)];
            room.nightVotes.victimId = randomVictim.id;
            room.accusations.unshift({
              id: `bot_wolf_${now}`,
              author: 'Guardián (Lobos Bot)',
              target: randomVictim.name,
              message: `🐺 La manada acechó entre las sombras y eligió a su víctima.`,
              timestamp: 'Ahora',
              severity: 'medium',
            });
            changed = true;
          }
        }
      }

      // If 1 minute expired without host/player completing action, execute bot fallback!
      if (remaining === 0) {
        room.actionStartedAt = now;
        room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;

        if (room.activeTab === 'noche') {
          // Auto-resolve wolf attack if not chosen
          const livingNonWolves = room.players.filter(
            (p) => p.isAlive && p.role !== 'werewolf' && p.role !== 'alfa_werewolf'
          );
          if (!room.nightVotes.victimId && livingNonWolves.length > 0) {
            const randomVictim =
              livingNonWolves[Math.floor(Math.random() * livingNonWolves.length)];
            room.nightVotes.victimId = randomVictim.id;
          }

          // Advance night to day
          const victimId = room.nightVotes.victimId;
          const saved = room.nightVotes.saved;
          const poisonedId = room.nightVotes.poisonedId;

          let nextPlayers = [...room.players];
          if (victimId && !saved) {
            nextPlayers = nextPlayers.map((p) =>
              p.id === victimId ? { ...p, isAlive: false, deathCause: 'werewolf' } : p
            );
            const victim = nextPlayers.find((p) => p.id === victimId);
            if (victim?.loverId) {
              nextPlayers = nextPlayers.map((p) =>
                p.id === victim.loverId
                  ? { ...p, isAlive: false, deathCause: 'heartbreak' }
                  : p
              );
            }
          }
          if (poisonedId) {
            nextPlayers = nextPlayers.map((p) =>
              p.id === poisonedId ? { ...p, isAlive: false, deathCause: 'witch_poison' } : p
            );
          }

          room.players = nextPlayers;
          room.dayNumber += 1;
          room.activeTab = 'aldea-juicio';
          room.actionStartedAt = now;
          room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
          room.nightVotes = {
            wolfVotes: {},
            victimId: null,
            saved: false,
            poisonedId: null,
            healedId: null,
          };
          room.accusations.unshift({
            id: `timer_day_${now}`,
            author: 'El Alba (1 min cumplido)',
            target: 'Todos',
            message: 'El minuto nocturno ha concluido. El gallo canta y la villa despierta.',
            timestamp: 'Ahora',
            severity: 'high',
          });
          changed = true;
        } else if (room.activeTab === 'aldea-juicio') {
          // If voting timer expires, resolve votes or lynch candidate with highest votes
          const tallies: Record<string, number> = {};
          const mayor = room.players.find((p) => p.isMayor);
          for (const [voter, target] of Object.entries(room.votes)) {
            const weight = voter === mayor?.id ? 2 : 1;
            tallies[target] = (tallies[target] || 0) + weight;
          }

          let highestTarget = '';
          let maxVotes = 0;
          for (const [target, count] of Object.entries(tallies)) {
            if (count > maxVotes) {
              maxVotes = count;
              highestTarget = target;
            }
          }

          if (highestTarget && maxVotes > 0) {
            room.players = room.players.map((p) =>
              p.id === highestTarget ? { ...p, isAlive: false, deathCause: 'lynched' } : p
            );
            const condemned = room.players.find((p) => p.id === highestTarget);
            if (condemned?.loverId) {
              room.players = room.players.map((p) =>
                p.id === condemned.loverId
                  ? { ...p, isAlive: false, deathCause: 'heartbreak' }
                  : p
              );
            }
            room.accusations.unshift({
              id: `timer_lynch_${now}`,
              author: 'El Cadalso (Tiempo Agotado)',
              target: condemned?.name || '',
              message: `El minuto de votación ha terminado. ${condemned?.name} fue ejecutado con ${maxVotes} votos.`,
              timestamp: 'Ahora',
              severity: 'high',
            });
          }

          room.votes = {};
          room.players.forEach((p) => (p.votes = 0));
          room.nightNumber += 1;
          room.activeTab = 'noche';
          room.actionStartedAt = now;
          room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
          changed = true;
        }
      }
    }

    if (changed) {
      broadcastRoom(room);
    }
  });
}, 1000);

// ============================================================================
// REST API
// ============================================================================
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Ping endpoint to keep player active
app.post('/api/rooms/:roomCode/ping', (req: Request, res: Response) => {
  const code = req.params.roomCode.toUpperCase();
  const { playerId } = req.body;
  const room = rooms.get(code);
  if (room && playerId) {
    const p = room.players.find((pl) => pl.id === playerId);
    if (p) {
      p.lastPing = Date.now();
      if (p.isBot && p.disconnected) {
        // Player returned!
        p.isBot = false;
        p.disconnected = false;
        room.accusations.unshift({
          id: `reconnect_${Date.now()}`,
          author: 'Aquelarre',
          target: p.name,
          message: `🟢 ¡${p.name} se ha reconectado y retoma su rol!`,
          timestamp: 'Ahora',
          severity: 'low',
        });
        broadcastRoom(room);
      }
    }
  }
  res.json({ success: true, timestamp: Date.now() });
});

// Get room status
app.get('/api/rooms/:roomCode', (req: Request, res: Response) => {
  const code = req.params.roomCode.toUpperCase();
  const playerId = req.query.playerId as string | undefined;
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ room: sanitizeRoomForPlayer(room, playerId) });
});

// Join or register in room
app.post('/api/rooms/:roomCode/join', (req: Request, res: Response) => {
  const code = req.params.roomCode.toUpperCase();
  const { playerId, name, avatarUrl } = req.body;
  const room = getOrCreateRoom(code, name);

  // Check if player is already inside
  let player = room.players.find((p) => p.id === playerId);
  if (player) {
    if (name) player.name = name;
    if (avatarUrl) player.avatarUrl = avatarUrl;
    player.lastPing = Date.now();
    player.isBot = false;
    player.disconnected = false;
    broadcastRoom(room);
    return res.json({
      success: true,
      player,
      room: sanitizeRoomForPlayer(room, player.id),
    });
  }

  const defaultAvatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAa6ORFhSHL4JXpo1BOFCH-WxHK6UU4Jn0hY9td8o9dTGeq16d5kD0uHGTZ6nEq3U5qS1c7v28DkQiJYTp5NNujCiuZc22CY4_n9aAUocIJSN8piqwoZtHnJ1AGfc-fHOI-5ksC8OrTvC6eKY2g_OizEOM7kmP5wlo226hFv8GH_GEUC2cVbzX-hjVaKvUOz09Bu6OMfsG7fAD0CVog1WRcYMFOVsARAJLoGt3IExGqz_E0MLa_vtpfHw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCf8WMjwM0R1LQOjZIkJSH0v3PGMkHiZ4lWRyWkPT8TNleYqqYliKP_XcfA-f6_nvZuDasv9pVG1nVWqHPkzBWMLUrlTdNss1pcynTwv1uKvLXi7v49yBd7G2dBFLqTQ--QcqIbuMVZzw0SY3NEL_TbAeZOtmCcfdb9NYV9jOU16i6_9x_JZWIdAH57f2LD63e0ZrzjtsQkX_cFF1VR2bAVL6xMmo8KKpkIUTZTrjXoFyr07VnATEAuTw',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBaICa67tp_F1zq7jF0la9-_z3o_4-Z7vXybzykIwKtMApDmubWimEfbrQDHXHHbX71VVAjgHoESXIwauPKJY6Eqr5Vob21mwRijtJcrjHL-i6qD-WOjGseGb4D71mI21TvRWBk6bSORD3J-UNp8p7wu0iP72FA2hkXTlRDDbEhGwsQL_eJaqwHqD3KnOzdSsfMXzeKtgh4pWASBA3otJKTTcg-DvyYzqMmSyLuTm13WmBO6dAD6IvWgg',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDff9aW54Ydo9Z4jcwvyEUNrW1N17etUUDMDCeFGIjFFHtq6qySRJGVUOuiOcB1_8sSfBjmOfqlKQZ39pzgfcqWpZDI2-YORLStnmcj24fYpGaJ0D0s32UWr1RIY20cfXz81QTNOLFipvPgkIBWtxw2mLl4sTpaCH19DNqRzrKPvy4SGRpTQ-_--fHsVeiMK9A1doyV1TkUn8SIeER7CEF7iaSlxrx1g2q8F_A5XWeZWneykYMkNTiTmQ',
  ];

  // RULE: Once game has started, no new players can join
  if (room.gameStarted) {
    const suggestedRoom = code === 'LOB0-77' ? 'LOBO-67' : 'NPC-1';
    return res.json({
      success: false,
      gameInProgress: true,
      suggestedRoom,
      message: `La partida en la sala #${code} ya ha comenzado y las puertas del aquelarre están cerradas. No se admiten nuevos participantes en este aquelarre. Puedes abrir o unirte a la sala #${suggestedRoom}.`,
      room: sanitizeRoomForPlayer(room, playerId),
    });
  }

  // Room capacity check (max 25 active players)
  if (room.players.length >= MAX_PLAYERS) {
    const suggestedRoom =
      code === 'LOB0-77' || code === '77' || code === 'SALA-77' ? 'LOBO-67' : 'LOB0-77';

    let queuePlayer = room.waitingQueue.find((p) => p.id === playerId);
    if (!queuePlayer) {
      queuePlayer = {
        id: playerId || `p_wait_${Date.now()}`,
        name: name || `Aldeano en Espera #${room.waitingQueue.length + 1}`,
        avatarUrl: avatarUrl || defaultAvatars[room.waitingQueue.length % defaultAvatars.length],
        role: 'villager',
        isAlive: true,
        isReady: true,
        votes: 0,
        lastPing: Date.now(),
      };
      room.waitingQueue.push(queuePlayer);
      broadcastRoom(room);
    }

    const queuePosition = room.waitingQueue.findIndex((p) => p.id === queuePlayer?.id) + 1;

    return res.json({
      success: false,
      full: true,
      inQueue: true,
      queuePosition,
      suggestedRoom,
      message: `La sala #${code} está completa (25/25 jugadores). Has quedado en lista de espera (Turno #${queuePosition}) o puedes abrir/unirte a la sala #${suggestedRoom}.`,
      room: sanitizeRoomForPlayer(room, playerId),
    });
  }

  // Add new player
  const newId = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const isFirst = room.players.length === 0;

  player = {
    id: newId,
    name: name || `Aldeano #${room.players.length + 1}`,
    isHost: isFirst,
    isCurrentUser: true,
    avatarUrl: avatarUrl || defaultAvatars[room.players.length % defaultAvatars.length],
    role: 'villager',
    isAlive: true,
    isReady: true,
    votes: 0,
    lastPing: Date.now(),
  };
  room.players.push(player);

  // Auto-adjust deck to current player count if within range
  if (room.players.length >= MIN_PLAYERS && room.players.length <= MAX_PLAYERS) {
    room.deck = calculateBalancedDeck(room.players.length);
  }

  room.accusations.unshift({
    id: `join_${Date.now()}`,
    author: 'Aquelarre',
    target: player.name,
    message: `¡${player.name} ha llegado a Villa Claraluna! (${room.players.length}/25)`,
    timestamp: 'Ahora',
    severity: 'low',
  });

  broadcastRoom(room);
  res.json({
    success: true,
    player,
    room: sanitizeRoomForPlayer(room, player.id),
  });
});

// Perform game action
app.post('/api/rooms/:roomCode/action', (req: Request, res: Response) => {
  const code = req.params.roomCode.toUpperCase();
  const { playerId, action, payload } = req.body;
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  switch (action) {
    case 'UPDATE_PLAYER': {
      const p = room.players.find((pl) => pl.id === playerId);
      if (p) {
        if (payload.name !== undefined) p.name = payload.name;
        if (payload.avatarUrl !== undefined) p.avatarUrl = payload.avatarUrl;
        if (payload.isReady !== undefined) p.isReady = payload.isReady;
        p.lastPing = Date.now();
      }
      break;
    }

    case 'TOGGLE_READY': {
      const p = room.players.find((pl) => pl.id === playerId);
      if (p) {
        p.isReady = !p.isReady;
        p.lastPing = Date.now();
      }
      break;
    }

    case 'TOGGLE_MAYOR': {
      const targetId = payload.targetPlayerId;
      room.players.forEach((p) => {
        p.isMayor = p.id === targetId ? !p.isMayor : false;
      });
      break;
    }

    case 'TOGGLE_BOT_TAKEOVER': {
      const targetId = payload.targetPlayerId || playerId;
      const p = room.players.find((pl) => pl.id === targetId);
      if (p) {
        p.isBot = !p.isBot;
        p.disconnected = p.isBot;
        room.accusations.unshift({
          id: `bot_toggle_${Date.now()}`,
          author: 'Sistema Guardián',
          target: p.name,
          message: p.isBot
            ? `🤖 Modo Guardián activado para ${p.name}. La IA tomará sus decisiones.`
            : `🟢 ${p.name} retoma el control manual de su rol.`,
          timestamp: 'Ahora',
          severity: 'low',
        });
      }
      break;
    }

    case 'UPDATE_DECK': {
      if (payload.deck) {
        room.deck = { ...room.deck, ...payload.deck };
      }
      break;
    }

    case 'SET_GAME_MODE': {
      if (payload.gameMode) {
        room.gameMode = payload.gameMode;
      }
      break;
    }

    case 'CHANGE_TAB': {
      if (payload.activeTab) {
        room.activeTab = payload.activeTab;
        room.actionStartedAt = Date.now();
        room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
      }
      break;
    }

    case 'START_GAME': {
      // RULE: Minimum 7 active players and maximum 25
      if (room.players.length < MIN_PLAYERS) {
        return res.status(400).json({
          error: `Se requiere un mínimo de ${MIN_PLAYERS} jugadores activos para iniciar la partida. Actualmente hay ${room.players.length}.`,
        });
      }
      if (room.players.length > MAX_PLAYERS) {
        return res.status(400).json({
          error: `El máximo permitido es de ${MAX_PLAYERS} jugadores.`,
        });
      }

      // Calculate balanced deck according to the user's ratio formula:
      // ~20% wolves, ~30% villagers, 1 little_girl, 1 doctor, 1 witch min.
      room.deck = calculateBalancedDeck(room.players.length);
      const deck = room.deck;

      const pool: RoleType[] = [];
      for (let i = 0; i < deck.alfa_werewolf; i++) pool.push('alfa_werewolf');
      for (let i = 0; i < deck.werewolves; i++) pool.push('werewolf');
      for (let i = 0; i < deck.doctor; i++) pool.push('doctor');
      for (let i = 0; i < deck.seer; i++) pool.push('seer');
      for (let i = 0; i < deck.cupid; i++) pool.push('cupid');
      for (let i = 0; i < deck.little_girl; i++) pool.push('little_girl');
      for (let i = 0; i < deck.mute_drunkard; i++) pool.push('mute_drunkard');
      for (let i = 0; i < deck.witch; i++) pool.push('witch');
      for (let i = 0; i < deck.hunter; i++) pool.push('hunter');
      for (let i = 0; i < deck.villagers; i++) pool.push('villager');

      // Shuffle pool with Fisher-Yates
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const hasMayor = room.players.some((p) => p.isMayor);

      room.players = room.players.map((p, idx) => ({
        ...p,
        role: pool[idx] || 'villager',
        isAlive: true,
        votes: 0,
        isProtected: false,
        inspected: false,
        deathCause: undefined,
        deathNight: undefined,
        isMayor: hasMayor ? p.isMayor : idx === 0,
      }));

      room.gameStarted = true;
      room.nightNumber = 1;
      room.dayNumber = 1;
      room.activeTab = 'mi-carta';
      room.actionStartedAt = Date.now();
      room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
      room.votes = {};
      room.nightVotes = {
        wolfVotes: {},
        victimId: null,
        saved: false,
        poisonedId: null,
        healedId: null,
      };

      room.accusations.unshift({
        id: `start_${Date.now()}`,
        author: 'El Heraldo',
        target: 'Todos',
        message: '¡Las cartas del destino han sido repartidas! Tienes 1 minuto por acción para decidir.',
        timestamp: 'Ahora',
        severity: 'high',
      });
      break;
    }

    case 'NIGHT_END': {
      const { victimId, saved, poisonedId, resurrectedId } = payload;
      let players = [...room.players];

      if (victimId && !saved) {
        players = players.map((p) =>
          p.id === victimId ? { ...p, isAlive: false, deathCause: 'werewolf' } : p
        );
        const victim = players.find((p) => p.id === victimId);
        if (victim?.loverId) {
          players = players.map((p) =>
            p.id === victim.loverId ? { ...p, isAlive: false, deathCause: 'heartbreak' } : p
          );
        }
      }

      if (poisonedId) {
        players = players.map((p) =>
          p.id === poisonedId ? { ...p, isAlive: false, deathCause: 'witch_poison' } : p
        );
        const poisoned = players.find((p) => p.id === poisonedId);
        if (poisoned?.loverId) {
          players = players.map((p) =>
            p.id === poisoned.loverId ? { ...p, isAlive: false, deathCause: 'heartbreak' } : p
          );
        }
      }

      if (resurrectedId) {
        players = players.map((p) =>
          p.id === resurrectedId
            ? { ...p, isAlive: true, role: 'werewolf', deathCause: undefined }
            : p
        );
      }

      room.players = players;
      room.dayNumber += 1;
      room.activeTab = 'aldea-juicio';
      room.actionStartedAt = Date.now();
      room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
      break;
    }

    case 'CAST_VOTE': {
      const { voterId, targetId } = payload;
      if (targetId) {
        room.votes[voterId] = targetId;
      } else {
        delete room.votes[voterId];
      }

      const tallies: Record<string, number> = {};
      const mayor = room.players.find((p) => p.isMayor);
      for (const [voter, target] of Object.entries(room.votes)) {
        const weight = voter === mayor?.id ? 2 : 1;
        tallies[target] = (tallies[target] || 0) + weight;
      }
      room.players.forEach((p) => {
        p.votes = tallies[p.id] || 0;
      });
      break;
    }

    case 'LYNCH_PLAYER': {
      const targetId = payload.playerId;
      room.players = room.players.map((p) =>
        p.id === targetId ? { ...p, isAlive: false, deathCause: 'lynched' } : p
      );
      const lynched = room.players.find((p) => p.id === targetId);
      if (lynched?.loverId) {
        room.players = room.players.map((p) =>
          p.id === lynched.loverId ? { ...p, isAlive: false, deathCause: 'heartbreak' } : p
        );
      }

      if (lynched) {
        room.accusations.unshift({
          id: `lynch_${Date.now()}`,
          author: 'La Plaza del Juicio',
          target: lynched.name,
          message: `${lynched.name} fue ejecutado en el cadalso.`,
          timestamp: 'Ahora',
          severity: 'high',
        });
      }
      room.votes = {};
      room.players.forEach((p) => (p.votes = 0));
      room.actionStartedAt = Date.now();
      room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
      break;
    }

    case 'HUNTER_SHOOT': {
      const targetId = payload.targetId;
      room.players = room.players.map((p) =>
        p.id === targetId ? { ...p, isAlive: false, deathCause: 'hunter_shot' } : p
      );
      const target = room.players.find((p) => p.id === targetId);
      if (target) {
        room.accusations.unshift({
          id: `hunter_${Date.now()}`,
          author: 'El Cazador',
          target: target.name,
          message: `¡El cazador disparó su último tiro contra ${target.name}!`,
          timestamp: 'Ahora',
          severity: 'high',
        });
      }
      break;
    }

    case 'ADD_ACCUSATION': {
      if (payload.accusation) {
        room.accusations.unshift(payload.accusation);
      }
      break;
    }

    case 'FILL_NPCS': {
      if (room.gameStarted) break;
      const targetCount = payload.targetCount ? Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, payload.targetCount)) : MIN_PLAYERS;
      const needed = Math.max(0, targetCount - room.players.length);
      for (let i = 0; i < needed; i++) {
        const template = NPC_ROSTER[(room.players.length + i) % NPC_ROSTER.length];
        room.players.push({
          id: `p_npc_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
          name: `${template.name.replace(' (NPC)', '')} (NPC)`,
          avatarUrl: template.avatarUrl,
          role: 'villager',
          isAlive: true,
          isReady: true,
          votes: 0,
          isBot: true,
          disconnected: false,
          lastPing: Date.now(),
        });
      }
      room.deck = calculateBalancedDeck(room.players.length);
      room.accusations.unshift({
        id: `fill_npc_${Date.now()}`,
        author: 'Sistema Guardián',
        target: 'La Aldea',
        message: `🤖 Se han añadido aldeanos NPC hasta completar ${room.players.length} habitantes. ¡El aquelarre está listo!`,
        timestamp: 'Ahora',
        severity: 'low',
      });
      break;
    }

    case 'VOTE_RESTART': {
      if (!room.restartVotes) room.restartVotes = [];
      const voterId = playerId;
      if (room.restartVotes.includes(voterId)) {
        room.restartVotes = room.restartVotes.filter((id) => id !== voterId);
      } else {
        room.restartVotes.push(voterId);
      }

      const totalPlayers = room.players.length;
      const neededVotes = Math.ceil(totalPlayers * 0.5);

      if (room.restartVotes.length >= neededVotes) {
        room.gameStarted = false;
        room.activeTab = 'lobby-sala';
        room.nightNumber = 1;
        room.dayNumber = 1;
        room.restartVotes = [];
        room.votes = {};
        room.actionStartedAt = Date.now();
        room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
        room.players = room.players.map((p) => ({
          ...p,
          isAlive: true,
          votes: 0,
          isProtected: false,
          inspected: false,
          deathCause: undefined,
          deathNight: undefined,
        }));
        room.accusations.unshift({
          id: `restart_vote_success_${Date.now()}`,
          author: 'El Consejo de Villa Claraluna',
          target: 'Todos',
          message: `🔄 ¡El 50% o más de los jugadores (${room.restartVotes.length}/${totalPlayers}) ha votado reiniciar! Se abre una nueva partida.`,
          timestamp: 'Ahora',
          severity: 'high',
        });
      } else {
        const voter = room.players.find((p) => p.id === voterId);
        room.accusations.unshift({
          id: `vote_rst_${Date.now()}`,
          author: 'Petición de Reinicio',
          target: voter?.name || 'Aldeano',
          message: `🗳️ ${voter?.name || 'Un aldeano'} ha votado reiniciar (${room.restartVotes.length}/${neededVotes} necesarios para el 50%).`,
          timestamp: 'Ahora',
          severity: 'low',
        });
      }
      break;
    }

    case 'RESTART_GAME': {
      room.gameStarted = false;
      room.activeTab = 'lobby-sala';
      room.nightNumber = 1;
      room.dayNumber = 1;
      room.votes = {};
      room.restartVotes = [];
      room.actionStartedAt = Date.now();
      room.actionTimeRemaining = ACTION_TIMEOUT_SECONDS;
      room.players = room.players.map((p) => ({
        ...p,
        isAlive: true,
        votes: 0,
        isProtected: false,
        inspected: false,
        deathCause: undefined,
        deathNight: undefined,
      }));
      room.accusations.unshift({
        id: `restart_${Date.now()}`,
        author: 'Campanario',
        target: 'Todos',
        message: '¡El aquelarre ha recomenzado! Todos los aldeanos vuelven a la vida.',
        timestamp: 'Ahora',
        severity: 'low',
      });
      break;
    }
  }

  broadcastRoom(room);
  res.json({ success: true, room: sanitizeRoomForPlayer(room, playerId) });
});

// SSE endpoint
app.get('/api/rooms/:roomCode/events', (req: Request, res: Response) => {
  const code = req.params.roomCode.toUpperCase();
  const playerId = req.query.playerId as string | undefined;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  (res as any).playerId = playerId;

  let sseSet = sseClients.get(code);
  if (!sseSet) {
    sseSet = new Set();
    sseClients.set(code, sseSet);
  }
  sseSet.add(res);

  const room = getOrCreateRoom(code);
  res.write(`data: ${JSON.stringify(sanitizeRoomForPlayer(room, playerId))}\n\n`);

  const pingTimer = setInterval(() => {
    res.write(': ping\n\n');
  }, 10000);

  req.on('close', () => {
    clearInterval(pingTimer);
    sseSet?.delete(res);
    // If player drops connection during active game, trigger bot takeover immediately
    if (playerId && room.gameStarted) {
      const stillConnected = Array.from(sseSet || []).some(
        (c) => (c as any).playerId === playerId
      );
      if (!stillConnected) {
        const p = room.players.find((pl) => pl.id === playerId);
        if (p && !p.isBot) {
          p.isBot = true;
          p.disconnected = true;
          room.accusations.unshift({
            id: `dc_${Date.now()}`,
            author: 'Sistema Guardián',
            target: p.name,
            message: `⚠️ ${p.name} se ha desconectado. El Guardián toma su rol de inmediato para que la partida continúe sin pausas.`,
            timestamp: 'Ahora',
            severity: 'medium',
          });
          broadcastRoom(room);
        }
      }
    }
  });
});

// WebSocket Upgrade Handling
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url?.split('?')[0];
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', (ws: WebSocket) => {
  let joinedRoomCode = '';
  let joinedPlayerId = '';

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'JOIN_ROOM') {
        joinedRoomCode = (data.roomCode || 'LOB0-77').toUpperCase();
        joinedPlayerId = data.playerId;
        (ws as any).playerId = data.playerId;

        let wsSet = wsRooms.get(joinedRoomCode);
        if (!wsSet) {
          wsSet = new Set();
          wsRooms.set(joinedRoomCode, wsSet);
        }
        wsSet.add(ws);

        const room = getOrCreateRoom(joinedRoomCode, data.playerName);
        const p = room.players.find((pl) => pl.id === joinedPlayerId);
        if (p) {
          p.lastPing = Date.now();
          p.isBot = false;
          p.disconnected = false;
        }
        ws.send(JSON.stringify({ type: 'ROOM_UPDATE', room: sanitizeRoomForPlayer(room, data.playerId) }));
      }
    } catch (e) {
      console.error('WS Message parsing error', e);
    }
  });

  ws.on('close', () => {
    if (joinedRoomCode) {
      const wsSet = wsRooms.get(joinedRoomCode);
      wsSet?.delete(ws);

      const room = rooms.get(joinedRoomCode);
      if (room && joinedPlayerId && room.gameStarted) {
        const stillInWs = Array.from(wsSet || []).some(
          (client) => (client as any).playerId === joinedPlayerId
        );
        if (!stillInWs) {
          const p = room.players.find((pl) => pl.id === joinedPlayerId);
          if (p && !p.isBot) {
            p.isBot = true;
            p.disconnected = true;
            room.accusations.unshift({
              id: `ws_dc_${Date.now()}`,
              author: 'Sistema Guardián',
              target: p.name,
              message: `⚠️ ${p.name} se ha desconectado. El Guardián toma su rol de inmediato para que la partida continúe sin pausas.`,
              timestamp: 'Ahora',
              severity: 'medium',
            });
            broadcastRoom(room);
          }
        }
      }
    }
  });
});

// Vite or Static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Villa Claraluna Real-Time Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
