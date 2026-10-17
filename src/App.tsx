/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { OfficialFichaCard } from './components/OfficialFichaCard';
import { playClickSound, playChurchBell, playCardWhoosh } from './utils/audio';

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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewingFichaPlayer, setViewingFichaPlayer] = useState<Player | null>(null);

  const currentUser = players.find((p) => p.isCurrentUser) || players[0];

  // Set player count from 9 up to 25
  const handleSetPlayerCount = (count: number) => {
    const clamped = Math.max(9, Math.min(25, count));
    const nextDeck = calculateBalancedDeck(clamped);
    setDeck(nextDeck);

    // Update players array
    const sliced = INITIAL_25_PLAYERS.slice(0, clamped).map((p, idx) => {
      // Retain custom names/mayor status if already customized
      const existing = players.find((ep) => ep.id === p.id);
      return existing || { ...p, isReady: true, isAlive: true };
    });
    setPlayers(sliced);
  };

  const handleUpdateDeckCount = (
    role: keyof Omit<DeckConfig, 'targetPlayers'>,
    delta: number
  ) => {
    setDeck((prev) => {
      const nextVal = Math.max(0, prev[role] + delta);
      return {
        ...prev,
        [role]: nextVal,
      };
    });
  };

  const handleAutoBalance = () => {
    setDeck(calculateBalancedDeck(deck.targetPlayers));
  };

  const handleToggleMayor = (playerId: string) => {
    playClickSound();
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        isMayor: p.id === playerId ? !p.isMayor : false,
      }))
    );
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

  // Deal cards secretly to all connected players
  const handleStartGame = () => {
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

    // Ensure there is at least one Mayor elected (default host if none selected)
    const hasMayor = players.some((p) => p.isMayor);

    const updatedPlayers = players.map((p, idx) => ({
      ...p,
      role: pool[idx] || 'villager',
      isAlive: true,
      votes: 0,
      isProtected: false,
      isMayor: hasMayor ? p.isMayor : idx === 0, // ensure Mayor is appointed
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
    setPlayers((prev) => {
      let next = [...prev];

      // Handle Wolf victim
      if (victimId && !saved) {
        next = next.map((p) =>
          p.id === victimId ? { ...p, isAlive: false, deathCause: 'werewolf' as const } : p
        );

        // Check lover heartbreak
        const victim = next.find((p) => p.id === victimId);
        if (victim?.loverId) {
          next = next.map((p) =>
            p.id === victim.loverId
              ? { ...p, isAlive: false, deathCause: 'heartbreak' as const }
              : p
          );
        }
      }

      // Handle Witch poison
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

      // Handle Alfa Werewolf resurrection & conversion
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
    setPlayers((prev) => {
      let next = prev.map((p) =>
        p.id === playerId ? { ...p, isAlive: false, deathCause: 'lynched' as const } : p
      );

      // Check lover heartbreak
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

  const handleStartNextNight = () => {
    setNightNumber((prev) => prev + 1);
    setDayNumber((prev) => prev + 1);
    setActiveTab('noche');
  };

  const handleResetGame = () => {
    const fresh = INITIAL_25_PLAYERS.slice(0, deck.targetPlayers);
    setPlayers(fresh);
    setDeck(calculateBalancedDeck(deck.targetPlayers));
    setNightNumber(1);
    setDayNumber(1);
    setActiveTab('lobby-sala');
  };

  const handleUpdateUserName = (newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.isCurrentUser ? { ...p, name: newName } : p))
    );
  };

  const handleUpdatePlayerName = (playerId: string, newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: newName } : p))
    );
  };

  const handleShuffleRoles = () => {
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

  return (
    <div className="bg-[#0f131d] text-[#dfe2f1] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col min-h-screen selection:bg-[#dc2626] selection:text-white pb-20">
      <Header
        activeTab={activeTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenRoomCode={() => setIsQrOpen(true)}
      />

      <main className="flex-1 flex flex-col relative w-full pt-16 bg-[#0f131d]">
        {activeTab === 'lobby-sala' && (
          <LobbyScreen
            players={players}
            deck={deck}
            gameMode={gameMode}
            onSetGameMode={setGameMode}
            onUpdateDeckCount={handleUpdateDeckCount}
            onSetPlayerCount={handleSetPlayerCount}
            onAutoBalance={handleAutoBalance}
            onOpenQr={() => setIsQrOpen(true)}
            onStartGame={handleStartGame}
            onSelectPlayer={(p) => setSelectedPlayer(p)}
            onToggleMayor={handleToggleMayor}
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
            onSelectPlayerCard={(p) => setSelectedPlayer(p)}
            onProceedToNight={() => setActiveTab('noche')}
            onUpdatePlayerName={handleUpdatePlayerName}
            onRandomizePlayerRole={handleRandomizePlayerRole}
            onAssignPlayerRole={handleAssignPlayerRole}
            onShuffleAllRoles={handleShuffleRoles}
            onToggleMayor={handleToggleMayor}
            onImportNames={handleImportNames}
          />
        )}

        {activeTab === 'noche' && (
          <NightScreen
            players={players}
            nightNumber={nightNumber}
            onNightEnd={handleNightEnd}
            onSetLovers={handleSetLovers}
            onGoToTrial={() => setActiveTab('aldea-juicio')}
          />
        )}

        {activeTab === 'aldea-juicio' && (
          <TrialScreen
            players={players}
            dayNumber={dayNumber}
            accusations={accusations}
            onAddAccusation={(target, msg, isGesture) => {
              setAccusations((prev) => [
                {
                  id: `acc_${Date.now()}`,
                  author: currentUser.name,
                  target,
                  message: msg,
                  timestamp: 'Justo ahora',
                  severity: 'medium',
                  isGesture,
                },
                ...prev,
              ]);
            }}
            onLynchPlayer={handleLynchPlayer}
            onHunterShoot={handleHunterShoot}
            onStartNextNight={handleStartNextNight}
            onResetGame={handleResetGame}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        roomCode="LOB0-77"
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        player={currentUser}
        onUpdateName={handleUpdateUserName}
      />

      {/* Player Inspect / Appoint Mayor Sheet */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-[#171b26] border border-white/10 p-5 flex flex-col gap-3 shadow-2xl relative">
            <button
              onClick={() => {
                playClickSound();
                setSelectedPlayer(null);
              }}
              className="absolute top-4 right-4 text-[#e6bdb8] hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3">
              <img
                src={selectedPlayer.avatarUrl}
                alt={selectedPlayer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#4cd7f6]"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-['Playfair_Display'] text-lg font-bold text-white">
                    {selectedPlayer.name}
                  </span>
                  {selectedPlayer.isMayor && (
                    <span className="text-[#ffb95f] material-symbols-outlined text-[16px]">
                      workspace_premium
                    </span>
                  )}
                  {selectedPlayer.isHost && (
                    <span className="text-[#ffb95f] material-symbols-outlined text-[16px]">
                      crown
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#4cd7f6] font-semibold">
                  {selectedPlayer.isMayor
                    ? 'Alcalde de Villa Claraluna (Voto Doble)'
                    : 'Aldeano Confirmado'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#e6bdb8] mt-1">
              Participante para el concejo de esta noche. Su rol se mantendrá en estricto secreto.
            </p>

            <div className="flex flex-col gap-2 pt-2">
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
