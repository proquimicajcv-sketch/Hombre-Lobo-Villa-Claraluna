import { Player, DeckConfig, ActiveTab, GameMode, AccusationEntry } from '../types/game';

const PLAYER_ID_KEY = 'claraluna_online_player_id';
const PLAYER_NAME_KEY = 'claraluna_online_player_name';
const PLAYER_AVATAR_KEY = 'claraluna_online_player_avatar';

export interface SyncedRoomState {
  roomCode: string;
  hostId: string;
  gameMode: GameMode;
  activeTab: ActiveTab;
  deck: DeckConfig;
  players: Player[];
  nightNumber: number;
  dayNumber: number;
  accusations: AccusationEntry[];
  selectedPlayerId: string | null;
  gameStarted: boolean;
  actionTimeRemaining?: number;
  actionStartedAt?: number;
  waitingQueue?: Player[];
  restartVotes?: string[];
  lastUpdated: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'offline';

export const getStoredPlayerProfile = () => {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  const name = localStorage.getItem(PLAYER_NAME_KEY) || 'Aldeano';
  const avatarUrl =
    localStorage.getItem(PLAYER_AVATAR_KEY) ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB3dg_vQWq0VPRNKkvEA_k_pu5_xdAihlhNwXLe7JGvL95FSlraaMcQA7rjBeClL2Lj41iX8PuVch3QhgiT2VAvHGNXGXEwx8Be7Q4RVe4aLvqSaEuUJfQny8EKcL6eqDXf19EiQulag_ZCVIPZ0D55VrnFC65YV0CD0K5F3cgLdbgs9n6bB605HJXVyYpYRToU81tmUKK7hfVrNwd8zgfNpayxfvSWDMy9d8dVq-EahbAPjnANnHucOQ';

  return { id, name, avatarUrl };
};

export const saveStoredPlayerProfile = (name: string, avatarUrl?: string) => {
  if (name) localStorage.setItem(PLAYER_NAME_KEY, name.trim());
  if (avatarUrl) localStorage.setItem(PLAYER_AVATAR_KEY, avatarUrl);
};

export class MultiplayerService {
  private roomCode: string = 'LOB0-77';
  private playerId: string;
  private playerName: string;
  private playerAvatar: string;
  private sse: EventSource | null = null;
  private ws: WebSocket | null = null;
  private pollInterval: any = null;
  private pingInterval: any = null;
  private status: ConnectionStatus = 'disconnected';
  private onStateChange: ((state: SyncedRoomState, currentUserId: string) => void) | null = null;
  private onStatusChange: ((status: ConnectionStatus) => void) | null = null;
  private onRoomFull: ((suggestedRoom: string, message: string) => void) | null = null;
  private isDestroyed = false;

  constructor() {
    const profile = getStoredPlayerProfile();
    this.playerId = profile.id;
    this.playerName = profile.name;
    this.playerAvatar = profile.avatarUrl;

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      this.roomCode = roomParam.toUpperCase().trim();
    }
  }

  public init(
    onStateChange: (state: SyncedRoomState, currentUserId: string) => void,
    onStatusChange: (status: ConnectionStatus) => void,
    onRoomFull?: (suggestedRoom: string, message: string) => void
  ) {
    this.onStateChange = onStateChange;
    this.onStatusChange = onStatusChange;
    this.onRoomFull = onRoomFull || null;
    this.connect();
    this.startHeartbeat();
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public setRoomCode(code: string) {
    if (!code) return;
    const clean = code.toUpperCase().trim();
    if (clean !== this.roomCode) {
      this.roomCode = clean;
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', clean);
      window.history.replaceState({}, '', newUrl.toString());
      this.disconnect();
      this.connect();
    }
  }

  public setProfile(name: string, avatarUrl: string) {
    this.playerName = name.trim();
    this.playerAvatar = avatarUrl;
    saveStoredPlayerProfile(this.playerName, this.playerAvatar);
    this.sendAction('UPDATE_PLAYER', { name: this.playerName, avatarUrl: this.playerAvatar });
  }

  public toggleBotTakeover(targetPlayerId?: string) {
    return this.sendAction('TOGGLE_BOT_TAKEOVER', {
      targetPlayerId: targetPlayerId || this.playerId,
    });
  }

  public voteRestart() {
    return this.sendAction('VOTE_RESTART');
  }

  public fillNpcs(targetCount?: number) {
    return this.sendAction('FILL_NPCS', { targetCount });
  }

  public connect() {
    if (this.isDestroyed) return;
    this.setStatus('connecting');

    fetch(`/api/rooms/${this.roomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: this.playerId,
        name: this.playerName,
        avatarUrl: this.playerAvatar,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.full) {
          this.onRoomFull?.(data.suggestedRoom, data.message);
          if (data.room) this.handleNewState(data.room);
          return;
        }
        if (data.success && data.room) {
          this.handleNewState(data.room);
          this.setStatus('connected');
          this.setupRealtimeStreams();
        }
      })
      .catch((err) => {
        console.warn('Initial join fallback to polling', err);
        this.setStatus('offline');
        this.startPolling();
      });
  }

  private startHeartbeat() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.status === 'connected') {
        fetch(`/api/rooms/${this.roomCode}/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: this.playerId }),
        }).catch(() => {});
      }
    }, 6000);
  }

  private setupRealtimeStreams() {
    this.cleanupStreams();

    try {
      this.sse = new EventSource(
        `/api/rooms/${this.roomCode}/events?playerId=${encodeURIComponent(this.playerId)}`
      );

      this.sse.onmessage = (event) => {
        try {
          const state: SyncedRoomState = JSON.parse(event.data);
          this.handleNewState(state);
          this.setStatus('connected');
        } catch (e) {
          console.error('SSE parse error', e);
        }
      };

      this.sse.onerror = () => {
        this.startPolling();
      };
    } catch (e) {
      this.startPolling();
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.ws?.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            roomCode: this.roomCode,
            playerId: this.playerId,
            playerName: this.playerName,
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ROOM_UPDATE' && msg.room) {
            this.handleNewState(msg.room);
          }
        } catch (e) {
          // ignore
        }
      };
    } catch {
      // WS fallback handled by SSE
    }
  }

  private startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      fetch(`/api/rooms/${this.roomCode}?playerId=${encodeURIComponent(this.playerId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.room) {
            this.handleNewState(data.room);
            this.setStatus('connected');
          }
        })
        .catch(() => {
          this.setStatus('offline');
        });
    }, 2500);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private cleanupStreams() {
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }

  public disconnect() {
    this.cleanupStreams();
    this.stopPolling();
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.setStatus('disconnected');
  }

  private setStatus(status: ConnectionStatus) {
    if (this.status !== status) {
      this.status = status;
      this.onStatusChange?.(status);
    }
  }

  private handleNewState(state: SyncedRoomState) {
    const playersWithCurrentUser = state.players.map((p) => ({
      ...p,
      isCurrentUser: p.id === this.playerId,
    }));

    const completeState: SyncedRoomState = {
      ...state,
      players: playersWithCurrentUser,
    };

    this.onStateChange?.(completeState, this.playerId);
  }

  public async sendAction(action: string, payload: any = {}): Promise<boolean> {
    try {
      const res = await fetch(`/api/rooms/${this.roomCode}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: this.playerId,
          action,
          payload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          window.dispatchEvent(
            new CustomEvent('claraluna_toast_error', { detail: errData.error })
          );
        }
        return false;
      }
      const data = await res.json();
      if (data.success && data.room) {
        this.handleNewState(data.room);
      }
      return true;
    } catch (err) {
      console.error('Failed to send multiplayer action', action, err);
      return false;
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.disconnect();
  }
}

export const multiplayer = new MultiplayerService();
