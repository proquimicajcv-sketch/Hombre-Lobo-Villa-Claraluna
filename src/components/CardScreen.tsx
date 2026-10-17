import React, { useState } from 'react';
import { Player, GameMode, RoleType } from '../types/game';
import { OfficialFichaCard } from './OfficialFichaCard';
import { EditNamesModal } from './EditNamesModal';
import { OfficialCodexModal } from './OfficialCodexModal';
import { PasteRosterModal } from './PasteRosterModal';
import {
  playCardWhoosh,
  playMysticChime,
  playClickSound,
  playDiceShuffle,
} from '../utils/audio';

interface CardScreenProps {
  players: Player[];
  currentPlayer: Player;
  gameMode: GameMode;
  onSelectPlayerCard?: (player: Player) => void;
  onProceedToNight: () => void;
  onUpdatePlayerName?: (playerId: string, newName: string) => void;
  onRandomizePlayerRole?: (playerId: string) => void;
  onAssignPlayerRole?: (playerId: string, role: RoleType) => void;
  onShuffleAllRoles?: () => void;
  onToggleMayor?: (playerId: string) => void;
  onImportNames?: (names: string[]) => void;
}

export const CardScreen: React.FC<CardScreenProps> = ({
  players,
  currentPlayer,
  gameMode,
  onSelectPlayerCard,
  onProceedToNight,
  onUpdatePlayerName,
  onRandomizePlayerRole,
  onAssignPlayerRole,
  onShuffleAllRoles,
  onToggleMayor,
  onImportNames,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHandover, setIsHandover] = useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = useState(
    Math.max(
      0,
      players.findIndex((p) => p.id === currentPlayer.id)
    )
  );

  // Modals
  const [isEditNamesOpen, setIsEditNamesOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);

  // Inline name editing for active player
  const [isEditingCurrentName, setIsEditingCurrentName] = useState(false);
  const [inlineName, setInlineName] = useState('');

  // In Online Sincro mode, each player can ONLY ever see their own secret card!
  const activePlayer =
    gameMode === 'online'
      ? currentPlayer
      : players[activePlayerIndex] || currentPlayer || players[0];

  const handleFlip = () => {
    // Only card whoosh - NO wolf howl ever!
    playCardWhoosh();
    setIsFlipped(!isFlipped);
  };

  const handleNextPlayer = () => {
    playClickSound();
    setIsFlipped(false);
    const nextIndex = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextIndex);
    setIsHandover(true);
    if (onSelectPlayerCard) {
      onSelectPlayerCard(players[nextIndex]);
    }
  };

  const handlePrevPlayer = () => {
    playClickSound();
    setIsFlipped(false);
    const prevIndex = (activePlayerIndex - 1 + players.length) % players.length;
    setActivePlayerIndex(prevIndex);
    setIsHandover(true);
    if (onSelectPlayerCard) {
      onSelectPlayerCard(players[prevIndex]);
    }
  };

  const handleRandomizeCurrent = () => {
    playDiceShuffle();
    if (onRandomizePlayerRole && activePlayer) {
      onRandomizePlayerRole(activePlayer.id);
    }
  };

  const startInlineEdit = () => {
    setInlineName(activePlayer.name);
    setIsEditingCurrentName(true);
  };

  const saveInlineEdit = () => {
    if (inlineName.trim() && onUpdatePlayerName) {
      onUpdatePlayerName(activePlayer.id, inlineName.trim());
    }
    setIsEditingCurrentName(false);
  };

  // ========================================================
  // PRIVACY HANDOVER SCREEN (MODO PASA EL MÓVIL)
  // ========================================================
  if (gameMode === 'local' && isHandover) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[70vh] px-4 py-8 max-w-md mx-auto text-center text-[#dfe2f1] animate-fadeIn">
        <div className="w-20 h-20 rounded-2xl bg-amber-950/40 border-2 border-amber-500/40 flex items-center justify-center text-[#ffb95f] mb-4 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
          <span className="material-symbols-outlined text-[42px] animate-pulse">
            screen_rotation
          </span>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
          Pantalla de Privacidad · Modo Pasa el Móvil
        </span>
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-white mt-1">
          Entrega el móvil a:
        </h2>

        {/* Current Player Display with Quick Inline Edit */}
        <div className="my-3 px-5 py-3 rounded-2xl bg-[#171b26] border border-amber-500/50 flex items-center gap-3 shadow-lg">
          <img
            src={activePlayer.avatarUrl}
            alt={activePlayer.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#4cd7f6]"
          />
          {isEditingCurrentName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={inlineName}
                onChange={(e) => setInlineName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveInlineEdit();
                }}
                className="px-2 py-1 rounded bg-[#0f131d] border border-[#4cd7f6] text-white text-base font-bold font-['Playfair_Display'] focus:outline-none"
              />
              <button
                onClick={saveInlineEdit}
                className="p-1 rounded bg-[#4cd7f6] text-black hover:bg-[#38bdf8] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-['Playfair_Display'] text-2xl font-bold text-[#ffb4ab]">
                {activePlayer.name}
              </span>
              <button
                onClick={startInlineEdit}
                className="text-zinc-400 hover:text-[#4cd7f6] cursor-pointer"
                title="Editar nombre"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-[#e6bdb8] max-w-xs mb-5">
          Por favor, no mires la pantalla hasta que <b>{activePlayer.name}</b> tenga el dispositivo en sus manos.
        </p>

        {/* Reveal Button (Plays neutral chime - NO wolf howl) */}
        <button
          onClick={() => {
            playMysticChime();
            setIsHandover(false);
          }}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          <span>Soy {activePlayer.name} · Ver mi carta</span>
        </button>

        {/* Quick mobile controls during handover */}
        <div className="flex items-center justify-center gap-3 mt-4 w-full">
          <button
            onClick={() => {
              playClickSound();
              setIsEditNamesOpen(true);
            }}
            className="text-xs text-[#4cd7f6] hover:underline flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>Editar Todos los Nombres ({players.length})</span>
          </button>
          <span className="text-zinc-600">·</span>
          <button
            onClick={handleRandomizeCurrent}
            className="text-xs text-[#ffb95f] hover:underline flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">casino</span>
            <span>Rol al Azar</span>
          </button>
        </div>

        {/* Modals in handover screen */}
        <EditNamesModal
          isOpen={isEditNamesOpen}
          onClose={() => setIsEditNamesOpen(false)}
          players={players}
          onUpdatePlayerName={onUpdatePlayerName || (() => {})}
          onRandomizePlayerRole={onRandomizePlayerRole || (() => {})}
          onAssignPlayerRole={onAssignPlayerRole || (() => {})}
          onShuffleAllRoles={onShuffleAllRoles || (() => {})}
          onToggleMayor={onToggleMayor || (() => {})}
          onOpenPasteModal={() => setIsPasteOpen(true)}
        />
        <PasteRosterModal
          isOpen={isPasteOpen}
          onClose={() => setIsPasteOpen(false)}
          onImportNames={onImportNames || (() => {})}
          maxCount={25}
        />
      </div>
    );
  }

  // ========================================================
  // REVEALED CARD SCREEN (9:16 OFFICIAL FICHA)
  // ========================================================
  return (
    <div className="flex flex-col items-center w-full px-3 pt-3 pb-24 max-w-lg mx-auto text-[#dfe2f1]">
      {/* Top Header Badge */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#4cd7f6] font-bold">
            Villa Claraluna · Ficha Oficial
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Formato 9:16
          </span>
        </div>
        <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold text-white mt-0.5">
          Tu Carta del Destino
        </h2>
      </div>

      {/* Player Header Bar: Private badge in Online Sincro, or Pass-the-phone navigation in Local mode */}
      {gameMode === 'online' ? (
        <div className="w-full mb-3 p-3 rounded-2xl bg-[#171b26] border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentPlayer.avatarUrl}
              alt={currentPlayer.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-sm"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-white truncate font-['Playfair_Display']">
                {currentPlayer.name}
              </span>
              <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                <span>Tu Rol Secreto (Solo tú puedes verlo)</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
              🟢 En Línea
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full mb-3 p-2 rounded-xl bg-[#171b26] border border-white/10 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={handlePrevPlayer}
              className="p-1 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[#e6bdb8] transition-colors cursor-pointer"
              title="Jugador anterior"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            </button>

            <img
              src={activePlayer.avatarUrl}
              alt={activePlayer.name}
              className="w-8 h-8 rounded-full object-cover border border-[#4cd7f6] shrink-0"
            />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {activePlayer.name}
                </span>
                <button
                  onClick={startInlineEdit}
                  className="text-zinc-400 hover:text-[#4cd7f6] cursor-pointer shrink-0"
                  title="Editar este nombre"
                >
                  <span className="material-symbols-outlined text-[13px]">edit</span>
                </button>
              </div>
              <span className="text-[10px] text-[#e6bdb8]">
                Jugador {activePlayerIndex + 1} de {players.length}
              </span>
            </div>
          </div>

          {/* Action buttons: Random Role & Next Player */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleRandomizeCurrent}
              className="px-2 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Asignar rol al azar a este jugador"
            >
              <span className="material-symbols-outlined text-[14px]">casino</span>
              <span className="hidden sm:inline">Rol al azar</span>
            </button>

            <button
              onClick={handleNextPlayer}
              className="px-2.5 py-1 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[11px] font-semibold text-[#ffb95f] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Siguiente</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          THE OFFICIAL 9:16 FICHA CARD (Interactive Tarot flip)
          ======================================================== */}
      <div className="w-full flex items-center justify-center my-1">
        <OfficialFichaCard
          role={activePlayer.role}
          player={activePlayer}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          size="md"
        />
      </div>

      {/* Control Buttons below Ficha */}
      <div className="w-full max-w-[320px] flex flex-col gap-2 mt-3">
        {/* Flip toggle */}
        <button
          onClick={handleFlip}
          className="w-full py-2.5 px-4 rounded-xl bg-[#262a35] hover:bg-[#353944] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isFlipped ? 'visibility_off' : 'visibility'}
          </span>
          <span>{isFlipped ? 'Ocultar mi carta' : 'Ver mi ficha oficial (9:16)'}</span>
        </button>

        {/* Quick Toolbar: Random Role, Edit All Names, Codex */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={handleRandomizeCurrent}
            className="py-2 px-2 rounded-xl bg-[#1a1e2c] border border-purple-500/40 hover:border-purple-400 text-purple-200 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Rol al azar para este jugador"
          >
            <span className="material-symbols-outlined text-[15px]">casino</span>
            <span>Rol Azar</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsEditNamesOpen(true);
            }}
            className="py-2 px-2 rounded-xl bg-[#1a1e2c] border border-white/10 hover:border-[#4cd7f6] text-[#4cd7f6] text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Editar todos los nombres de los jugadores"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>Nombres</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsCodexOpen(true);
            }}
            className="py-2 px-2 rounded-xl bg-[#1a1e2c] border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Ver todas las fichas oficiales 9:16"
          >
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span>Fichas 9:16</span>
          </button>
        </div>

        {/* Proceed to Night button */}
        <button
          onClick={() => {
            playClickSound();
            onProceedToNight();
          }}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#171b26] via-[#262a35] to-[#171b26] border border-[#4cd7f6]/30 hover:border-[#4cd7f6] text-[#4cd7f6] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">dark_mode</span>
          <span>Proceder a la Noche en Villa Claraluna</span>
        </button>
      </div>

      {/* Modals */}
      <EditNamesModal
        isOpen={isEditNamesOpen}
        onClose={() => setIsEditNamesOpen(false)}
        players={players}
        onUpdatePlayerName={onUpdatePlayerName || (() => {})}
        onRandomizePlayerRole={onRandomizePlayerRole || (() => {})}
        onAssignPlayerRole={onAssignPlayerRole || (() => {})}
        onShuffleAllRoles={onShuffleAllRoles || (() => {})}
        onToggleMayor={onToggleMayor || (() => {})}
        onOpenPasteModal={() => setIsPasteOpen(true)}
      />

      <OfficialCodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        initialRole={activePlayer.role}
      />

      <PasteRosterModal
        isOpen={isPasteOpen}
        onClose={() => setIsPasteOpen(false)}
        onImportNames={onImportNames || (() => {})}
        maxCount={25}
      />
    </div>
  );
};
