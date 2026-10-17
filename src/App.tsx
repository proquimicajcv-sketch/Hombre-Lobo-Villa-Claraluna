/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Player,
  DeckConfig,
  GameMode,
  AccusationEntry,
  RoleType,
} from './types/game';
import {
  INITIAL_25_PLAYERS,
  INITIAL_DECK,
  INITIAL_ACCUSATIONS,
  calculateBalancedDeck,
} from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LobbyScreen } from './components/LobbyScreen';
import { CardScreen } from './components/CardScreen';
import { NightScreen } from './components/NightScreen';
import { TrialScreen } from './components/TrialScreen';
import { QrModal } from './components/QrModal';
import { ProfileModal } from './components/ProfileModal';
import { JoinModal } from './components/JoinModal';
import { OfficialFichaCard } from './components/OfficialFichaCard';
import { playClickSound, playChurchBell, playCardWhoosh } from './utils/audio';
import {
  multiplayer,
  SyncedRoomState,
  ConnectionStatus,
  getStoredPlayerProfile,
} from './services/multiplayer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lobby-sala');
  const [gameMode, setGameMode] = useState<GameMode>('online');

  // Deck configuration starting at 9 players, configurable up to 25
  const [deck, setDeck] = useState<DeckConfig>(INITIAL_DECK);

  // Active player list based on deck.targetPlayers (from 9 up to 25)
  const [players, setPlayers] = useState<Player[]>(
    INITIAL_25_PLAYERS.slice(0, INITIAL_DECK.targetPlayers)
  );

  const [nightNumber, setNightNumber] = useState<number>(1);
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [accusations, setAccusations] = useState<AccusationEntry[]>(INITIAL_ACCUSATIONS);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewingFichaPlayer, setViewingFichaPlayer] = useState<Player | null>(null);

  // Real-Time Multiplayer State
  const [roomCode, setRoomCode] = useState<string>(multiplayer.getRoomCode());
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting');
  const [actionTimeRemaining, setActionTimeRemaining] = useState<number>(60);
  const [waitingQueue, setWaitingQueue] = useState<Player[]>([]);
  const [toastError, setToastError] = useState<string | null>(null);
  const [roomFullNotice, setRoomFullNotice] = useState<{
    suggestedRoom: string;
    message: string;
  } | null>(null);

  const currentUser = players.find((p) => p.isCurrentUser) || players[0];

  const handleSwitchRoom = (newCode: string) => {
    setRoomFullNotice(null);
    setRoomCode(newCode);
    multiplayer.setRoomCode(newCode);
  };

  // Initialize Multiplayer Synchronization
  useEffect(() => {
    // Check if player joined via URL room code and hasn't customized profile yet
    const hasJoinedBefore = localStorage.getItem('claraluna_player_has_joined');
    const params = new URLSearchParams(window.location.search);
    if (params.get('room') && !hasJoinedBefore) {
      setIsJoinModalOpen(true);
    }

    const handleToast = (e: any) => {
      setToastError(e.detail);
      setTimeout(() => setToastError(null), 5000);
    };
    window.addEventListener('claraluna_toast_error', handleToast);

    multiplayer.init(
      (synced: SyncedRoomState) => {
        setRoomCode(synced.roomCode);
        setGameMode(synced.gameMode);
        setDeck(synced.deck);
        setPlayers(synced.players);
        setActiveTab(synced.activeTab);
        setNightNumber(synced.nightNumber);
        setDayNumber(synced.dayNumber);
        if (synced.actionTimeRemaining !== undefined) {
          setActionTimeRemaining(synced.actionTimeRemaining);
        }
        if (synced.waitingQueue) {
          setWaitingQueue(synced.waitingQueue);
        }
        if (synced.accusations && synced.accusations.length > 0) {
          setAccusations(synced.accusations);
        }
      },
      (status: ConnectionStatus) => {
        setConnStatus(status);
      },
      (suggestedRoom: string, message: string) => {
        setRoomFullNotice({ suggestedRoom, message });
      }
    );

    return () => {
      window.removeEventListener('claraluna_toast_error', handleToast);
      multiplayer.destroy();
    };
  }, []);

  // Set player count from 7 up to 25
  const handleSetPlayerCount = (count: number) => {
    const clamped = Math.max(7, Math.min(25, count));
    const nextDeck = calculateBalancedDeck(clamped);
    setDeck(nextDeck);

    if (gameMode === 'online') {
      multiplayer.sendAction('UPDATE_DECK', { deck: nextDeck });
    } else {
      const sliced = INITIAL_25_PLAYERS.slice(0, clamped).map((p) => {
        const existing = players.find((ep) => ep.id === p.id);
        return existing || { ...p, isReady: true, isAlive: true };
      });
      setPlayers(sliced);
    }
  };

  const handleUpdateDeckCount = (
    role: keyof Omit<DeckConfig, 'targetPlayers'>,
    delta: number
  ) => {
    const nextVal = Math.max(0, deck[role] + delta);
    const updated = {
      ...deck,
      [role]: nextVal,
    };
    setDeck(updated);

    if (gameMode === 'online') {
      multiplayer.sendAction('UPDATE_DECK', { deck: updated });
    }
  };

  const handleAutoBalance = () => {
    const balanced = calculateBalancedDeck(deck.targetPlayers);
    setDeck(balanced);
    if (gameMode === 'online') {
      multiplayer.sendAction('UPDATE_DECK', { deck: balanced });
    }
  };

  const handleToggleMayor = (playerId: string) => {
    playClickSound();
    if (gameMode === 'online') {
      multiplayer.sendAction('TOGGLE_MAYOR', { targetPlayerId: playerId });
    } else {
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          isMayor: p.id === playerId ? !p.isMayor : false,
        }))
      );
    }
  };

  const handleSetLovers = (lover1Id: string, lover2Id: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === lover1Id) {
          return { ...p, isLover: true, loverId: lover2Id };
        }
        if (p.id === lover2Id) {
          return { ...p, isLover: true, loverId: lover1Id };
        }
        return p;
      })
    );
  };

  const handleToggleBotTakeover = (playerId: string) => {
    playClickSound();
    if (gameMode === 'online') {
      multiplayer.toggleBotTakeover(playerId);
    } else {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId ? { ...p, isBot: !p.isBot, disconnected: !p.isBot } : p
        )
      );
    }
  };

  // Deal cards secretly to all connected players (Min 7, Max 25 strict)
  const handleStartGame = () => {
    if (players.length < 7) {
      setToastError(
        `Regla de Villa Claraluna: Se requiere un mínimo de 7 jugadores activos (hay ${players.length}/7). Menos de eso ya no se puede iniciar.`
      );
      return;
    }
    if (players.length > 25) {
      setToastError('El número máximo de jugadores permitidos es 25.');
      return;
    }

    if (gameMode === 'online') {
      multiplayer.sendAction('START_GAME');
      return;
    }

    // Local fallback
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

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const hasMayor = players.some((p) => p.isMayor);

    const updatedPlayers = players.map((p, idx) => ({
      ...p,
      role: pool[idx] || 'villager',
      isAlive: true,
      votes: 0,
      isProtected: false,
      isMayor: hasMayor ? p.isMayor : idx === 0,
    }));

    setPlayers(updatedPlayers);
    setNightNumber(1);
    setDayNumber(1);
    setActiveTab('mi-carta');
  };

  const handleNightEnd = (
    victimId: string | null,
    saved: boolean,
    poisonedId: string | null,
    resurrectedId: string | null
  ) => {
    if (gameMode === 'online') {
      multiplayer.sendAction('NIGHT_END', {
        victimId,
        saved,
        poisonedId,
        resurrectedId,
      });
      return;
    }

    // Local fallback
    setPlayers((prev) => {
      let next = [...prev];

      if (victimId && !saved) {
        next = next.map((p) =>
          p.id === victimId ? { ...p, isAlive: false, deathCause: 'werewolf' as const } : p
        );

        const victim = next.find((p) => p.id === victimId);
        if (victim?.loverId) {
          next = next.map((p) =>
            p.id === victim.loverId
              ? { ...p, isAlive: false, deathCause: 'heartbreak' as const }
              : p
          );
        }
      }

      if (poisonedId) {
        next = next.map((p) =>
          p.id === poisonedId ? { ...p, isAlive: false, deathCause: 'witch_poison' as const } : p
        );
        const poisoned = next.find((p) => p.id === poisonedId);
        if (poisoned?.loverId) {
          next = next.map((p) =>
            p.id === poisoned.loverId
              ? { ...p, isAlive: false, deathCause: 'heartbreak' as const }
              : p
          );
        }
      }

      if (resurrectedId) {
        next = next.map((p) =>
          p.id === resurrectedId
            ? { ...p, isAlive: true, role: 'werewolf' as RoleType, deathCause: undefined }
            : p
        );
      }

      return next;
    });
  };

  const handleLynchPlayer = (playerId: string) => {
    if (gameMode === 'online') {
      multiplayer.sendAction('LYNCH_PLAYER', { playerId });
      return;
    }

    setPlayers((prev) => {
      let next = prev.map((p) =>
        p.id === playerId ? { ...p, isAlive: false, deathCause: 'lynched' as const } : p
      );

      const lynched = next.find((p) => p.id === playerId);
      if (lynched?.loverId) {
        next = next.map((p) =>
          p.id === lynched.loverId
            ? { ...p, isAlive: false, deathCause: 'heartbreak' as const }
            : p
        );
      }
      return next;
    });

    const condemned = players.find((p) => p.id === playerId);
    if (condemned) {
      setAccusations((prev) => [
        {
          id: `acc_lynch_${Date.now()}`,
          author: 'La Hoguera de la Plaza',
          target: condemned.name,
          message: `${condemned.name} fue sentenciado en el cadalso.`,
          timestamp: 'Justo ahora',
          severity: 'high',
        },
        ...prev,
      ]);
    }
  };

  const handleHunterShoot = (targetId: string) => {
    if (gameMode === 'online') {
      multiplayer.sendAction('HUNTER_SHOOT', { targetId });
      return;
    }

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === targetId ? { ...p, isAlive: false, deathCause: 'hunter_shot' } : p
      )
    );
    const target = players.find((p) => p.id === targetId);
    if (target) {
      setAccusations((prev) => [
        {
          id: `acc_hunter_${Date.now()}`,
          author: 'El Cazador Moribundo',
          target: target.name,
          message: `¡Un disparo certero de mosquete atravesó el pecho de ${target.name}!`,
          timestamp: 'Justo ahora',
          severity: 'high',
        },
        ...prev,
      ]);
    }
  };

  const handleCastVote = (targetId: string | null) => {
    if (gameMode === 'online') {
      multiplayer.sendAction('CAST_VOTE', {
        voterId: currentUser.id,
        targetId,
      });
    }
  };

  const handleStartNextNight = () => {
    if (gameMode === 'online') {
      multiplayer.sendAction('CHANGE_TAB', { activeTab: 'noche' });
    } else {
      setNightNumber((prev) => prev + 1);
      setDayNumber((prev) => prev + 1);
      setActiveTab('noche');
    }
  };

  const handleResetGame = () => {
    if (gameMode === 'online') {
      multiplayer.sendAction('RESTART_GAME');
      return;
    }

    const fresh = INITIAL_25_PLAYERS.slice(0, deck.targetPlayers);
    setPlayers(fresh);
    setDeck(calculateBalancedDeck(deck.targetPlayers));
    setNightNumber(1);
    setDayNumber(1);
    setActiveTab('lobby-sala');
  };

  const handleUpdateUserName = (newName: string) => {
    multiplayer.setProfile(newName, currentUser.avatarUrl);
    setPlayers((prev) =>
      prev.map((p) => (p.isCurrentUser ? { ...p, name: newName } : p))
    );
  };

  const handleJoinVillage = (name: string, avatarUrl: string) => {
    localStorage.setItem('claraluna_player_has_joined', 'true');
    multiplayer.setProfile(name, avatarUrl);
  };

  const handleUpdatePlayerName = (playerId: string, newName: string) => {
    if (gameMode === 'online') {
      multiplayer.sendAction('UPDATE_PLAYER', { name: newName });
    } else {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, name: newName } : p))
      );
    }
  };

  const handleShuffleRoles = () => {
    if (gameMode === 'online') {
      multiplayer.sendAction('START_GAME');
      return;
    }

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

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    setPlayers((prev) =>
      prev.map((p, idx) => ({
        ...p,
        role: pool[idx] || 'villager',
      }))
    );
  };

  const handleRandomizePlayerRole = (playerId: string) => {
    const availableRoles: RoleType[] = [
      'alfa_werewolf',
      'werewolf',
      'cupid',
      'little_girl',
      'mute_drunkard',
      'witch',
      'hunter',
      'doctor',
      'seer',
      'villager',
    ];
    const randomRole = availableRoles[Math.floor(Math.random() * availableRoles.length)];
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, role: randomRole } : p))
    );
  };

  const handleAssignPlayerRole = (playerId: string, role: RoleType) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, role } : p))
    );
  };

  const handleImportNames = (names: string[]) => {
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx < names.length && names[idx].trim()) {
          return { ...p, name: names[idx].trim() };
        }
        return p;
      })
    );
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (gameMode === 'online') {
      multiplayer.sendAction('CHANGE_TAB', { activeTab: tab });
    }
  };

  return (
    <div className="bg-[#0f131d] text-[#dfe2f1] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col min-h-screen selection:bg-[#dc2626] selection:text-white pb-20">
      <Header
        activeTab={activeTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenRoomCode={() => setIsQrOpen(true)}
        roomCode={roomCode}
        isOnline={connStatus === 'connected'}
        connectedCount={players.length}
        actionTimeRemaining={actionTimeRemaining}
      />

      {/* Floating Error/Warning Toast Banner */}
      {toastError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-3.5 rounded-xl bg-red-950/90 border border-red-500/60 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-red-400 text-[20px] shrink-0">
              warning
            </span>
            <span className="text-xs font-semibold leading-snug">{toastError}</span>
          </div>
          <button
            onClick={() => setToastError(null)}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col relative w-full pt-16 bg-[#0f131d]">
        {activeTab === 'lobby-sala' && (
          <LobbyScreen
            players={players}
            deck={deck}
            gameMode={gameMode}
            roomCode={roomCode}
            waitingQueue={waitingQueue}
            onSwitchRoom={handleSwitchRoom}
            onSetGameMode={(mode) => {
              setGameMode(mode);
              multiplayer.sendAction('SET_GAME_MODE', { gameMode: mode });
            }}
            onUpdateDeckCount={handleUpdateDeckCount}
            onSetPlayerCount={handleSetPlayerCount}
            onAutoBalance={handleAutoBalance}
            onOpenQr={() => setIsQrOpen(true)}
            onStartGame={handleStartGame}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
            onToggleMayor={handleToggleMayor}
            onToggleBotTakeover={handleToggleBotTakeover}
            onUpdatePlayerName={handleUpdatePlayerName}
            onShuffleRoles={handleShuffleRoles}
            onRandomizePlayerRole={handleRandomizePlayerRole}
            onAssignPlayerRole={handleAssignPlayerRole}
            onImportNames={handleImportNames}
          />
        )}

        {activeTab === 'mi-carta' && (
          <CardScreen
            players={players}
            currentPlayer={currentUser}
            gameMode={gameMode}
            onUpdatePlayerName={handleUpdatePlayerName}
            onRandomizePlayerRole={handleRandomizePlayerRole}
            onAssignPlayerRole={handleAssignPlayerRole}
            onShuffleAllRoles={handleShuffleRoles}
            onToggleMayor={handleToggleMayor}
            onImportNames={handleImportNames}
            onProceedToNight={() => {
              setActiveTab('noche');
              if (gameMode === 'online') {
                multiplayer.sendAction('CHANGE_TAB', { activeTab: 'noche' });
              }
            }}
          />
        )}

        {activeTab === 'noche' && (
          <NightScreen
            players={players}
            nightNumber={nightNumber}
            onNightEnd={handleNightEnd}
            onSetLovers={handleSetLovers}
            onGoToTrial={() => {
              setActiveTab('aldea-juicio');
              if (gameMode === 'online') {
                multiplayer.sendAction('CHANGE_TAB', { activeTab: 'aldea-juicio' });
              }
            }}
          />
        )}

        {activeTab === 'aldea-juicio' && (
          <TrialScreen
            players={players}
            dayNumber={dayNumber}
            accusations={accusations}
            onAddAccusation={(target, msg) => {
              const newAcc: AccusationEntry = {
                id: `acc_${Date.now()}`,
                author: currentUser.name,
                target,
                message: msg,
                timestamp: 'Ahora',
                severity: 'medium',
              };
              setAccusations((prev) => [newAcc, ...prev]);
              if (gameMode === 'online') {
                multiplayer.sendAction('ADD_ACCUSATION', { accusation: newAcc });
              }
            }}
            onLynchPlayer={handleLynchPlayer}
            onHunterShoot={handleHunterShoot}
            onStartNextNight={handleStartNextNight}
            onResetGame={handleResetGame}
            onCastVote={handleCastVote}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        player={currentUser}
        onUpdateName={handleUpdateUserName}
      />

      {/* Join Village Modal for QR / Invite link visitors */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinVillage}
        roomCode={roomCode}
        initialName={getStoredPlayerProfile().name}
        initialAvatar={currentUser.avatarUrl}
      />

      {/* Official QR Code Modal */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        roomCode={roomCode}
      />

      {/* Room Full Suggestion Dialog */}
      {roomFullNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#171b26] border border-amber-500/40 p-6 flex flex-col gap-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-300">
              <span className="material-symbols-outlined text-[28px]">meeting_room</span>
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-white">
                Sala Completa (25/25)
              </h3>
              <p className="text-xs text-[#e6bdb8] mt-1.5">
                {roomFullNotice.message}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleSwitchRoom(roomFullNotice.suggestedRoom)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg transition-colors cursor-pointer"
              >
                Abrir o Unirme a #{roomFullNotice.suggestedRoom}
              </button>
              <button
                onClick={() => setRoomFullNotice(null)}
                className="w-full py-2 rounded-xl bg-[#262a35] hover:bg-[#353944] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Permanecer en Espera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Management Bottom Sheet / Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-[#171b26] border border-white/10 p-6 flex flex-col gap-4 shadow-2xl animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/50 shadow-md shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={selectedPlayer.avatarUrl}
                  alt={selectedPlayer.name}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-['Playfair_Display'] text-lg font-bold text-white truncate">
                    {selectedPlayer.name}
                  </h3>
                  {selectedPlayer.isMayor && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                      Alcalde (x2)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  Estado: {selectedPlayer.isAlive ? '🟢 Vivo en la aldea' : '💀 Fallecido'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  handleToggleMayor(selectedPlayer.id);
                  setSelectedPlayer((prev) =>
                    prev ? { ...prev, isMayor: !prev.isMayor } : null
                  );
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  selectedPlayer.isMayor
                    ? 'bg-amber-950/60 border border-amber-400 text-amber-300'
                    : 'bg-amber-600 hover:bg-amber-500 text-black'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  workspace_premium
                </span>
                <span>
                  {selectedPlayer.isMayor
                    ? 'Destituir como Alcalde'
                    : 'Nombrar Alcalde (Voto Doble x2)'}
                </span>
              </button>

              <button
                onClick={() => {
                  handleToggleBotTakeover(selectedPlayer.id);
                  setSelectedPlayer((prev) =>
                    prev ? { ...prev, isBot: !prev.isBot, disconnected: !prev.isBot } : null
                  );
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  selectedPlayer.isBot
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                    : 'bg-[#262a35] hover:bg-[#353944] text-white border border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  smart_toy
                </span>
                <span>
                  {selectedPlayer.isBot
                    ? 'Desactivar Modo Guardián (Retomar Control)'
                    : 'Ceder al Guardián (IA Automática)'}
                </span>
              </button>

              <button
                onClick={() => {
                  playCardWhoosh();
                  setViewingFichaPlayer(selectedPlayer);
                }}
                className="w-full py-2.5 rounded-xl bg-[#262a35] hover:bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Ver Ficha Oficial (9:16)</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setSelectedPlayer(null);
                }}
                className="w-full py-2.5 rounded-xl bg-[#262a35] hover:bg-[#353944] text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official 9:16 Ficha Preview Modal */}
      {viewingFichaPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative flex flex-col items-center max-w-sm w-full">
            <button
              onClick={() => {
                playClickSound();
                setViewingFichaPlayer(null);
              }}
              className="self-end mb-2 w-9 h-9 rounded-full bg-[#262a35] hover:bg-[#353944] text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <OfficialFichaCard
              role={viewingFichaPlayer.role}
              player={viewingFichaPlayer}
              isFlipped={true}
              size="md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
