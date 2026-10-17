import React, { useState } from 'react';
import { Player, RoleType } from '../types/game';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { playClickSound, playDiceShuffle } from '../utils/audio';

interface EditNamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onUpdatePlayerName: (playerId: string, newName: string) => void;
  onRandomizePlayerRole: (playerId: string) => void;
  onAssignPlayerRole: (playerId: string, role: RoleType) => void;
  onShuffleAllRoles: () => void;
  onToggleMayor: (playerId: string) => void;
  onOpenPasteModal: () => void;
}

const AVAILABLE_ROLES: RoleType[] = [
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

export const EditNamesModal: React.FC<EditNamesModalProps> = ({
  isOpen,
  onClose,
  players,
  onUpdatePlayerName,
  onRandomizePlayerRole,
  onAssignPlayerRole,
  onShuffleAllRoles,
  onToggleMayor,
  onOpenPasteModal,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  if (!isOpen) return null;

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setTempName(p.name);
  };

  const saveEdit = (playerId: string) => {
    if (tempName.trim()) {
      onUpdatePlayerName(playerId, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-[#121622] border border-amber-500/30 flex flex-col shadow-2xl overflow-hidden relative text-[#dfe2f1]">
        {/* Modal Header */}
        <div className="p-4 bg-[#171b26] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#ffb95f]">
              <span className="material-symbols-outlined text-[24px]">edit_note</span>
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-lg font-bold text-white flex items-center gap-2">
                <span>Edición Rápida de Aldeanos y Roles</span>
              </h2>
              <p className="text-xs text-[#e6bdb8]">
                Modo Móvil · Modifica nombres y asigna roles al azar para los {players.length} jugadores.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-[#262a35] hover:bg-[#353944] text-[#e6bdb8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Global Action Toolbar */}
        <div className="p-3 bg-[#0f131d] border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[160px]">
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#171b26] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#4cd7f6]"
            />
            <span className="material-symbols-outlined text-[16px] text-zinc-500 absolute left-2 top-2">
              search
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playDiceShuffle();
                onShuffleAllRoles();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-900 to-indigo-900 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Barajar todos los roles al azar"
            >
              <span className="material-symbols-outlined text-[16px] animate-spin-slow">
                casino
              </span>
              <span>Barajar Todos</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onOpenPasteModal();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#353944] border border-white/10 text-[#4cd7f6] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Pegar lista desde portapapeles"
            >
              <span className="material-symbols-outlined text-[16px]">content_paste</span>
              <span>Pegar Lista</span>
            </button>
          </div>
        </div>

        {/* Scrollable Player List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 divide-y divide-white/5">
          {filteredPlayers.map((player, idx) => {
            const roleDef = ROLE_DEFINITIONS[player.role] || ROLE_DEFINITIONS.villager;
            const isEditing = editingId === player.id;

            return (
              <div
                key={player.id}
                className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2 rounded-xl bg-[#171b26]/70 hover:bg-[#171b26] border border-white/5 transition-all"
              >
                {/* Left: Avatar + Index + Name Input */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-5 text-center text-xs font-mono font-bold text-zinc-400">
                    {idx + 1}
                  </span>

                  <img
                    src={player.avatarUrl}
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#4cd7f6]/40 shrink-0"
                  />

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        autoFocus
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(player.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full px-2.5 py-1 rounded-lg bg-[#0f131d] border border-[#4cd7f6] text-xs text-white font-bold focus:outline-none"
                      />
                      <button
                        onClick={() => saveEdit(player.id)}
                        className="p-1 rounded bg-[#4cd7f6] text-black hover:bg-[#38bdf8] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-bold text-white truncate">
                        {player.name}
                      </span>
                      {player.isMayor && (
                        <span
                          className="material-symbols-outlined text-[15px] text-amber-400 shrink-0"
                          title="Alcalde (Voto Doble)"
                        >
                          workspace_premium
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(player)}
                        className="text-zinc-400 hover:text-[#4cd7f6] cursor-pointer shrink-0"
                        title="Editar nombre"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Role & Random Button */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Role Selector dropdown */}
                  <select
                    value={player.role}
                    onChange={(e) => {
                      playClickSound();
                      onAssignPlayerRole(player.id, e.target.value as RoleType);
                    }}
                    className={`text-[11px] font-bold py-1 px-2 rounded-lg border appearance-none cursor-pointer focus:outline-none ${
                      roleDef.allegiance === 'werewolves'
                        ? 'bg-red-950/80 border-red-500 text-red-200'
                        : 'bg-slate-900 border-sky-500/50 text-sky-200'
                    }`}
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r} value={r} className="bg-[#121622] text-white">
                        {ROLE_DEFINITIONS[r].name}
                      </option>
                    ))}
                  </select>

                  {/* Single Player Role at Random */}
                  <button
                    onClick={() => {
                      playDiceShuffle();
                      onRandomizePlayerRole(player.id);
                    }}
                    className="p-1.5 rounded-lg bg-[#262a35] hover:bg-amber-900/60 border border-white/10 hover:border-amber-400 text-amber-400 transition-colors cursor-pointer"
                    title="Asignar rol al azar a este jugador"
                  >
                    <span className="material-symbols-outlined text-[16px]">casino</span>
                  </button>

                  {/* Mayor Toggle */}
                  <button
                    onClick={() => {
                      playClickSound();
                      onToggleMayor(player.id);
                    }}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      player.isMayor
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                        : 'bg-[#262a35] border-white/10 text-zinc-400 hover:text-amber-300'
                    }`}
                    title={player.isMayor ? 'Quitar Alcalde' : 'Hacer Alcalde (Voto Doble)'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      workspace_premium
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#171b26] border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {players.length} jugadores configurados
          </span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#001f26] text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Listo · Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
