import React, { useState } from 'react';
import { Player, DeckConfig, GameMode, RoleType } from '../types/game';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { ArcaneSeal } from './ArcaneSeal';
import { PasteRosterModal } from './PasteRosterModal';
import { OfficialCodexModal } from './OfficialCodexModal';
import {
  playClickSound,
  playCardWhoosh,
  playChurchBell,
  playDiceShuffle,
} from '../utils/audio';

interface LobbyScreenProps {
  players: Player[];
  deck: DeckConfig;
  gameMode: GameMode;
  roomCode?: string;
  waitingQueue?: Player[];
  onSwitchRoom?: (roomCode: string) => void;
  onSetGameMode: (mode: GameMode) => void;
  onUpdateDeckCount: (role: keyof Omit<DeckConfig, 'targetPlayers'>, delta: number) => void;
  onSetPlayerCount: (count: number) => void;
  onAutoBalance: () => void;
  onOpenQr: () => void;
  onStartGame: () => void;
  onSelectPlayer: (player: Player) => void;
  onToggleMayor: (playerId: string) => void;
  onToggleBotTakeover?: (playerId: string) => void;
  onUpdatePlayerName: (playerId: string, newName: string) => void;
  onShuffleRoles: () => void;
  onRandomizePlayerRole: (playerId: string) => void;
  onAssignPlayerRole: (playerId: string, role: RoleType) => void;
  onImportNames: (names: string[]) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  players,
  deck,
  gameMode,
  roomCode = 'LOB0-77',
  waitingQueue = [],
  onSwitchRoom,
  onSetGameMode,
  onUpdateDeckCount,
  onSetPlayerCount,
  onAutoBalance,
  onOpenQr,
  onStartGame,
  onSelectPlayer,
  onToggleMayor,
  onToggleBotTakeover,
  onUpdatePlayerName,
  onShuffleRoles,
  onRandomizePlayerRole,
  onAssignPlayerRole,
  onImportNames,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isConjuring, setIsConjuring] = React.useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [showRolesInLocalMode, setShowRolesInLocalMode] = useState(false);
  const [justShuffled, setJustShuffled] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [codexRole, setCodexRole] = useState<RoleType>('alfa_werewolf');

  const totalCards =
    deck.werewolves +
    deck.alfa_werewolf +
    deck.doctor +
    deck.seer +
    deck.cupid +
    deck.little_girl +
    deck.mute_drunkard +
    deck.witch +
    deck.hunter +
    deck.villagers;

  const isBalanced = totalCards === deck.targetPlayers;
  const difference = totalCards - deck.targetPlayers;

  const currentMayor = players.find((p) => p.isMayor);

  const handleCopyInvite = () => {
    playClickSound();
    navigator.clipboard?.writeText(window.location.origin + '?room=' + roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerStart = () => {
    if (!isBalanced || isConjuring) return;
    setIsConjuring(true);
    playCardWhoosh();
    setTimeout(() => {
      playChurchBell();
      onStartGame();
      setIsConjuring(false);
    }, 1200);
  };

  const handleShuffleClick = () => {
    playDiceShuffle();
    onShuffleRoles();
    setJustShuffled(true);
    setTimeout(() => setJustShuffled(false), 2400);
  };

  // List of roles to configure in Deck Builder
  const deckRoleKeys: { key: keyof Omit<DeckConfig, 'targetPlayers'>; roleType: RoleType }[] = [
    { key: 'alfa_werewolf', roleType: 'alfa_werewolf' },
    { key: 'werewolves', roleType: 'werewolf' },
    { key: 'cupid', roleType: 'cupid' },
    { key: 'little_girl', roleType: 'little_girl' },
    { key: 'mute_drunkard', roleType: 'mute_drunkard' },
    { key: 'witch', roleType: 'witch' },
    { key: 'hunter', roleType: 'hunter' },
    { key: 'doctor', roleType: 'doctor' },
    { key: 'seer', roleType: 'seer' },
    { key: 'villagers', roleType: 'villager' },
  ];

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Atmospheric Hero Visual with responsive height and safe padding */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-[#0a0e18]">
        <img
          alt="Villa Claraluna iluminada por la luna llena entre niebla espesa"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-125 scale-105 transition-transform duration-700"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-Bz5EG53-ZvrwtrzZE0X5k2zyA_omv1Toge0BHrcoFqUFP9vpc7eETVWjBoLwAr8Yt9Hz0l5StzOTrHFZ-LxglN2AgKiMDl77IHzpQ0hYcn2rilpARKMykZMh9ZwdBBBYP44259nqTCrv92V1FoQCNA22XCxINsFrYy0KZfEr4McC2b50ofUN2aN99fA9kMK9v35Nmo61Ytk2FGmWvhtPhBKSGiURjSd9VavhGAxzv6bg1h-bxH_BOg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f131d] via-[#0f131d]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0f131d_95%)]"></div>

        <div className="absolute bottom-3 left-4 right-4 flex flex-col max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 text-[#4cd7f6] mb-1">
            <span className="material-symbols-outlined text-[16px] animate-pulse">
              nights_stay
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#4cd7f6] font-bold">
              Fase de Preparación
            </span>
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl text-white font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight">
            Hombre Lobo: <span className="text-[#ffb4ab] italic">Villa Claraluna</span>
          </h1>
          <p className="text-xs text-[#e6bdb8] line-clamp-1 mt-0.5">
            Reúne al consejo, ajusta los linajes y enciende la hoguera.
          </p>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5 relative z-10 pb-12 max-w-2xl mx-auto w-full pt-2">
        {/* Mode Selector Segmented Control */}
        <div className="p-1 rounded-full bg-[#0a0e18] flex items-center shadow-lg shadow-black/40 border border-white/5">
          <button
            onClick={() => {
              playClickSound();
              onSetGameMode('local');
            }}
            className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs transition-all duration-300 font-semibold cursor-pointer ${
              gameMode === 'local'
                ? 'bg-[#262a35] text-[#ffb95f] shadow-md font-bold ring-1 ring-[#ffb95f]/30'
                : 'text-[#e6bdb8]/70 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">phone_android</span>
            <span>Pasa el Móvil</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              onSetGameMode('online');
            }}
            className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs transition-all duration-300 font-semibold cursor-pointer ${
              gameMode === 'online'
                ? 'bg-[#262a35] text-[#ffb4ab] shadow-md font-bold ring-1 ring-[#ffb4ab]/30'
                : 'text-[#e6bdb8]/70 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">cell_tower</span>
            <span>Online Sincro</span>
          </button>
        </div>

        {/* Player Capacity Stepper (9 to 25 players) */}
        <div className="p-4 rounded-xl bg-[#171b26] border border-white/5 shadow-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">
                groups
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Capacidad de la Villa
                </span>
                <span className="text-[11px] text-[#e6bdb8]">
                  Desde 7 hasta 25 habitantes máximo (Mínimo estricto 7)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  if (deck.targetPlayers > 7) {
                    onSetPlayerCount(deck.targetPlayers - 1);
                  }
                }}
                disabled={deck.targetPlayers <= 7}
                className="w-8 h-8 rounded-lg bg-[#262a35] hover:bg-[#353944] disabled:opacity-40 text-white flex items-center justify-center text-sm font-bold active:scale-95 transition-all cursor-pointer"
              >
                -
              </button>
              <div className="px-3 py-1 rounded-lg bg-[#0a0e18] border border-white/5 min-w-[54px] text-center">
                <span className="font-['Playfair_Display'] text-lg text-[#4cd7f6] font-bold">
                  {deck.targetPlayers}
                </span>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  if (deck.targetPlayers < 25) {
                    onSetPlayerCount(deck.targetPlayers + 1);
                  }
                }}
                disabled={deck.targetPlayers >= 25}
                className="w-8 h-8 rounded-lg bg-[#262a35] hover:bg-[#353944] disabled:opacity-40 text-white flex items-center justify-center text-sm font-bold active:scale-95 transition-all cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-1 shrink-0">
              Frecuentes:
            </span>
            {[7, 9, 12, 15, 18, 20, 25].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  playClickSound();
                  onSetPlayerCount(preset);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  deck.targetPlayers === preset
                    ? 'bg-[#4cd7f6] text-[#001f26] shadow-sm'
                    : 'bg-[#262a35] text-[#e6bdb8] hover:text-white'
                }`}
              >
                {preset} hab.
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODE 1: PASA EL MÓVIL - EDICIÓN FÁCIL DE NOMBRES Y ROLES */}
        {/* ======================================================== */}
        {gameMode === 'local' && (
          <div className="p-4 rounded-xl bg-gradient-to-b from-[#1c1f2a] to-[#141722] border-2 border-[#ffb95f]/30 shadow-lg flex flex-col gap-3.5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#ffb95f]/20 border border-[#ffb95f]/40 flex items-center justify-center text-[#ffb95f] shrink-0">
                  <span className="material-symbols-outlined text-[22px]">screen_rotation</span>
                </div>
                <div>
                  <h3 className="font-['Playfair_Display'] text-base font-bold text-[#ffb95f]">
                    Modo Presencial: Pasa el Móvil
                  </h3>
                  <p className="text-[11px] text-[#e6bdb8]">
                    Edita los nombres fácilmente y reparte roles al azar con un solo toque.
                  </p>
                </div>
              </div>

              {/* Toggle to show/mask roles */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowRolesInLocalMode(!showRolesInLocalMode);
                }}
                className="self-start sm:self-auto px-2.5 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#353944] text-xs font-semibold text-[#dfe2f1] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showRolesInLocalMode ? 'visibility_off' : 'visibility'}
                </span>
                <span>{showRolesInLocalMode ? 'Ocultar Roles' : 'Ver Roles'}</span>
              </button>
            </div>

            {/* Quick Actions Bar: Randomize all roles button & Paste roster button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleShuffleClick}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px] animate-bounce">
                  casino
                </span>
                <span>Barajar Roles al Azar 🎲</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setIsPasteModalOpen(true);
                }}
                className="py-3 px-4 rounded-xl bg-[#262a35] hover:bg-[#353944] border border-white/10 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-[#4cd7f6]">
                  content_paste
                </span>
                <span>Pegar Lista de Nombres</span>
              </button>
            </div>

            {justShuffled && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-400/50 flex items-center gap-2 text-xs text-emerald-200 animate-fadeIn">
                <span className="material-symbols-outlined text-[18px] text-emerald-400">
                  check_circle
                </span>
                <span className="font-semibold">
                  ¡Los roles han sido barajados y asignados al azar para los {players.length} jugadores!
                </span>
              </div>
            )}

            {/* Inline Roster Table with Direct Text Inputs */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold px-1">
                <span>Lista de Aldeanos ({players.length})</span>
                <span>Rol & Acciones</span>
              </div>

              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                {players.map((player, idx) => {
                  const roleDef = ROLE_DEFINITIONS[player.role];
                  return (
                    <div
                      key={player.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        player.isMayor
                          ? 'bg-amber-950/30 border-amber-500/50 shadow-sm'
                          : 'bg-[#171b26] border-white/5 hover:border-white/20'
                      }`}
                    >
                      {/* Left: Index + Avatar + Inline Name Input */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-[11px] font-mono text-zinc-500 font-bold w-4 text-center">
                          {idx + 1}
                        </span>

                        <div className="relative shrink-0">
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                          />
                          {player.isMayor && (
                            <span
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-bold"
                              title="Alcalde (Voto x2)"
                            >
                              ★
                            </span>
                          )}
                        </div>

                        {/* Direct Inline Editable Name Input */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => onUpdatePlayerName(player.id, e.target.value)}
                            placeholder={`Jugador ${idx + 1}`}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f131d] border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-[#ffb95f] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Right: Role indicator badge / randomizer */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {showRolesInLocalMode ? (
                          <div className="flex items-center gap-1.5">
                            <ArcaneSeal role={player.role} size="sm" />
                            <select
                              value={player.role}
                              onChange={(e) =>
                                onAssignPlayerRole(player.id, e.target.value as RoleType)
                              }
                              className="px-2 py-1 rounded bg-[#0a0e18] border border-white/10 text-[11px] text-white font-bold focus:outline-none"
                            >
                              {deckRoleKeys.map((dr) => (
                                <option key={dr.roleType} value={dr.roleType}>
                                  {ROLE_DEFINITIONS[dr.roleType].name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-zinc-400 bg-[#0a0e18] px-2 py-1 rounded border border-white/5">
                            🔒 Rol Oculto
                          </span>
                        )}

                        {/* Reroll this individual role */}
                        <button
                          onClick={() => {
                            playDiceShuffle();
                            onRandomizePlayerRole(player.id);
                          }}
                          className="w-7 h-7 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[#ffb95f] flex items-center justify-center text-xs transition-colors cursor-pointer"
                          title="Cambiar rol al azar para este habitante"
                        >
                          🎲
                        </button>

                        {/* Toggle Mayor button */}
                        <button
                          onClick={() => onToggleMayor(player.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${
                            player.isMayor
                              ? 'bg-amber-500 text-black font-bold shadow-sm'
                              : 'bg-[#262a35] text-zinc-400 hover:text-amber-300'
                          }`}
                          title={player.isMayor ? 'Alcalde activo' : 'Nombrar Alcalde'}
                        >
                          👑
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Alcalde / Encargado de la Villa Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#2a1d0b] via-[#1a1206] to-[#0f131d] border border-amber-500/30 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-[#ffb95f] shrink-0">
              <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#ffddb8] uppercase tracking-wider">
                  Alcalde de la Villa
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-300 font-bold uppercase">
                  Voto Doble (x2)
                </span>
              </div>
              <span className="text-xs text-white font-semibold truncate">
                {currentMayor?.name || 'Ninguno asignado'}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-[#ffb95f] font-medium text-right max-w-[120px]">
            Toca 👑 para nombrarlo
          </span>
        </div>

        {/* Room Code & Share Widget (Available for both mobile scan & sync) */}
        <div className="p-3.5 rounded-xl bg-[#171b26] border border-white/5 shadow-md flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#e6bdb8] font-semibold">
                {gameMode === 'online' ? 'Código del Aquelarre (Online)' : 'Código de Sala / QR Móvil'}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-['Playfair_Display'] text-xl text-[#4cd7f6] tracking-widest font-bold">
                  {roomCode}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping"></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyInvite}
                className="px-3 py-2 rounded-lg bg-[#262a35] hover:bg-[#353944] text-white flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
                  {copied ? 'done' : 'share'}
                </span>
                <span>{copied ? '¡Copiado!' : 'Invitar'}</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenQr();
                }}
                className="px-3 py-2 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[#ffb95f] flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Ver código QR oficial"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                <span>QR</span>
              </button>
            </div>
          </div>

          {/* Quick Room Switcher (LOB0-77 <-> LOBO-67) */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-[11px] text-zinc-400">
              Salas oficiales:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playClickSound();
                  onSwitchRoom?.('LOB0-77');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  roomCode === 'LOB0-77'
                    ? 'bg-[#4cd7f6] text-black shadow-sm'
                    : 'bg-[#262a35] hover:bg-[#353944] text-white'
                }`}
              >
                #LOB0-77
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onSwitchRoom?.('LOBO-67');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  roomCode === 'LOBO-67'
                    ? 'bg-[#4cd7f6] text-black shadow-sm'
                    : 'bg-[#262a35] hover:bg-[#353944] text-white'
                }`}
              >
                #LOBO-67
              </button>
            </div>
          </div>

          {/* Overflow Room 77 Notice & Waiting List Option */}
          {players.length >= 25 && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/80 via-[#262a35] to-amber-950/80 border border-amber-500/50 text-xs text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-amber-400 animate-pulse">
                  meeting_room
                </span>
                <div>
                  <span className="font-bold text-white block">
                    Sala #{roomCode} al máximo de capacidad (25/25)
                  </span>
                  <span className="text-[11px] text-amber-200/90">
                    Los nuevos aldeanos pueden permanecer en lista de espera o abrir la sala <strong>#LOBO-67</strong>.
                  </span>
                </div>
              </div>
              <button
                onClick={() => onSwitchRoom?.(roomCode === 'LOB0-77' ? 'LOBO-67' : 'LOB0-77')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                Abrir o Pasar a #{roomCode === 'LOB0-77' ? 'LOBO-67' : 'LOB0-77'}
              </button>
            </div>
          )}

          {/* Waiting Queue List if any players are in queue */}
          {waitingQueue && waitingQueue.length > 0 && (
            <div className="p-3 rounded-xl bg-[#1c1f2a] border border-amber-500/30 shadow-md flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                  <span>Aldeanos en Espera ({waitingQueue.length} en cola de #{roomCode})</span>
                </div>
                <button
                  onClick={() => onSwitchRoom?.('LOBO-67')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
                >
                  Abrir Sala #LOBO-67
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {waitingQueue.map((wq, i) => (
                  <div
                    key={wq.id || i}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0a0e18] border border-white/5 text-[11px] shrink-0"
                  >
                    <span className="text-amber-400 font-bold">#{i + 1}</span>
                    <img
                      src={wq.avatarUrl}
                      alt={wq.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-zinc-300 font-medium truncate max-w-[90px]">
                      {wq.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Villagers in Waiting Grid (Online Sincro mode) */}
        {gameMode === 'online' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">
                  group
                </span>
                <span className="text-xs uppercase tracking-wider font-bold text-white">
                  Aldeanos en Espera (Mín 7 - Máx 25)
                </span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                players.length >= 7 ? 'text-[#4cd7f6] bg-[#03b5d3]/15 border-[#4cd7f6]/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}>
                {players.length} / {deck.targetPlayers} Conectados
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1 rounded-xl bg-[#0a0e18]/40 border border-white/5">
              {players.map((player) => (
                <div
                  key={player.id}
                  onClick={() => onSelectPlayer(player)}
                  className={`p-2 rounded-lg border flex flex-col items-center gap-1.5 relative overflow-hidden shadow-sm transition-all cursor-pointer group ${
                    player.isMayor
                      ? 'bg-amber-950/40 border-amber-500/50'
                      : 'bg-[#1c1f2a] border-white/5 hover:border-[#4cd7f6]/40'
                  }`}
                >
                  <div className="absolute top-1 right-1 flex items-center gap-0.5">
                    {player.isBot && (
                      <span
                        className="text-amber-300 text-[10px] font-bold bg-black/70 px-1 rounded"
                        title="Modo Guardián (Bot automático por desconexión)"
                      >
                        🤖
                      </span>
                    )}
                    {player.isMayor && (
                      <span
                        className="text-[#ffb95f] material-symbols-outlined text-[14px]"
                        title="Alcalde de la Villa (Voto Doble)"
                      >
                        workspace_premium
                      </span>
                    )}
                    {player.isHost && (
                      <span
                        className="text-[#ffb95f] material-symbols-outlined text-[14px]"
                        title="Anfitrión"
                      >
                        crown
                      </span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-[#262a35] overflow-hidden shadow-inner flex items-center justify-center relative ring-1 ring-white/10 group-hover:ring-[#4cd7f6]/50">
                    <img
                      className="w-full h-full object-cover"
                      src={player.avatarUrl}
                      alt={player.name}
                      referrerPolicy="no-referrer"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#1c1f2a] ${
                        player.isBot ? 'bg-amber-400' : 'bg-[#4cd7f6]'
                      }`}
                    ></span>
                  </div>
                  <span className="text-xs text-[#dfe2f1] font-semibold truncate max-w-full text-center">
                    {player.name}
                  </span>
                  {player.isBot && (
                    <span className="text-[8px] text-amber-300 bg-amber-500/20 px-1 rounded font-bold uppercase tracking-wider">
                      Guardián
                    </span>
                  )}
                  {player.isMayor && (
                    <span className="text-[9px] text-[#ffddb8] font-bold uppercase tracking-wider">
                      Alcalde (x2)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deck Building / Ajuste de Roles Section */}
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">style</span>
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-white">
                Creador de Baraja
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setIsCodexOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-all border border-amber-400/40 cursor-pointer shadow-sm"
                title="Ver todas las fichas oficiales en formato 9:16"
              >
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                <span>Fichas 9:16</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onAutoBalance();
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#262a35] hover:bg-[#353944] text-[#ffb95f] text-xs font-semibold transition-all active:scale-95 border border-[#ffb95f]/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                <span>Balancear Auto ({deck.targetPlayers}p)</span>
              </button>
            </div>
          </div>

          {/* Role Cards with AI-style Arcane Seals */}
          <div className="flex flex-col gap-2.5">
            {deckRoleKeys.map(({ key, roleType }) => {
              const info = ROLE_DEFINITIONS[roleType];
              const count = deck[key];

              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-[#171b26] border border-white/5 flex items-center justify-between gap-3 shadow-sm hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ArcaneSeal role={roleType} size="md" />

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {info.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${info.categoryColor}`}
                        >
                          {info.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#e6bdb8] truncate max-w-xs sm:max-w-md">
                        {info.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        playClickSound();
                        setCodexRole(roleType);
                        setIsCodexOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#262a35] hover:bg-amber-950/60 text-[10px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ver ficha oficial 9:16"
                    >
                      <span className="material-symbols-outlined text-[12px]">visibility</span>
                      <span className="hidden sm:inline">Ficha 9:16</span>
                    </button>

                    <button
                      onClick={() => {
                        playClickSound();
                        onUpdateDeckCount(key, -1);
                      }}
                      disabled={count <= 0}
                      className="w-8 h-8 rounded-lg bg-[#262a35] hover:bg-[#353944] disabled:opacity-40 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-['Playfair_Display'] text-base font-bold text-white">
                      {count}
                    </span>
                    <button
                      onClick={() => {
                        playClickSound();
                        onUpdateDeckCount(key, 1);
                      }}
                      className="w-8 h-8 rounded-lg bg-[#262a35] hover:bg-[#353944] text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balance Status Indicator Card */}
        <div className="p-3.5 rounded-xl bg-[#1c1f2a] border border-white/5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5">
            <span
              className={`material-symbols-outlined text-[22px] ${
                isBalanced
                  ? 'text-[#4cd7f6]'
                  : difference > 0
                  ? 'text-red-400'
                  : 'text-[#ffb95f]'
              }`}
            >
              {isBalanced ? 'balance' : difference > 0 ? 'warning' : 'hourglass_empty'}
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-[#dfe2f1] font-semibold">
                {isBalanced
                  ? 'Repartición en Equilibrio'
                  : difference > 0
                  ? `Sobran ${difference} cartas en la baraja`
                  : `Faltan ${Math.abs(difference)} cartas para ${deck.targetPlayers} jugadores`}
              </span>
              <span className="text-[11px] text-[#e6bdb8]">
                {isBalanced
                  ? `Adecuado para ${deck.targetPlayers} sospechosos de Villa Claraluna`
                  : 'Ajusta los roles para continuar'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#0a0e18] px-3 py-1 rounded-full border border-white/5 shadow-inner">
            <span
              className={`font-['Playfair_Display'] text-base font-bold ${
                isBalanced
                  ? 'text-[#4cd7f6]'
                  : difference > 0
                  ? 'text-red-400'
                  : 'text-[#ffb95f]'
              }`}
            >
              {totalCards}
            </span>
            <span className="text-xs text-[#e6bdb8]">/ {deck.targetPlayers}</span>
          </div>
        </div>

        {/* Main Glorious Action Button */}
        <div className="flex flex-col gap-2 pt-1">
          {players.length < 7 && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0">info</span>
              <span>
                <strong>Regla de Villa Claraluna:</strong> Se requiere un mínimo de <strong>7 jugadores activos</strong> para iniciar (Actualmente: {players.length}/7). Invita a más aldeanos compartiendo el enlace o código QR.
              </span>
            </div>
          )}

          <button
            onClick={handleTriggerStart}
            disabled={!isBalanced || isConjuring || players.length < 7}
            className={`w-full py-4 px-6 rounded-xl text-white font-['Playfair_Display'] text-lg font-bold text-center transition-all flex items-center justify-center gap-3 relative overflow-hidden cursor-pointer ${
              isBalanced && !isConjuring && players.length >= 7
                ? 'bg-gradient-to-r from-[#bf0715] via-[#dc2626] to-[#bf0715] shadow-[0_0_28px_rgba(220,38,38,0.45)] hover:shadow-[0_0_36px_rgba(220,38,38,0.65)] active:scale-[0.98]'
                : 'bg-zinc-800 text-zinc-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none"></div>
            {isConjuring ? (
              <>
                <span className="material-symbols-outlined text-[24px] animate-spin">
                  cyclone
                </span>
                <span className="tracking-wide">Conjurando Destinos...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[24px] animate-pulse">
                  history_edu
                </span>
                <span className="tracking-wide">
                  {gameMode === 'local' ? 'Comenzar y Pasar el Móvil' : 'Comenzar Partida'}
                </span>
              </>
            )}
          </button>
          <span className="text-center text-[10px] text-[#e6bdb8] tracking-widest uppercase font-semibold">
            Los roles se distribuirán de forma secreta e irrevocable
          </span>
        </div>
      </div>

      {/* Paste Roster Modal */}
      <PasteRosterModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onImportNames={onImportNames}
        maxCount={deck.targetPlayers}
      />

      {/* Official 9:16 Codex Modal */}
      <OfficialCodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        initialRole={codexRole}
      />
    </div>
  );
};
