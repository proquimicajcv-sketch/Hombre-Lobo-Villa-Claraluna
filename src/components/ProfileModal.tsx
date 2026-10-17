import React from 'react';
import { Player } from '../types/game';
import { playClickSound } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onUpdateName: (newName: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  player,
  onUpdateName,
}) => {
  const [name, setName] = React.useState(player.name.replace(' (Tú)', ''));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdateName(name.trim() + ' (Tú)');
      playClickSound();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-[#171b26] border border-white/10 p-6 flex flex-col gap-4 shadow-2xl relative">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#e6bdb8] hover:text-white"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={player.avatarUrl}
              alt={player.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#ffb4ab] shadow-lg"
            />
            {player.isHost && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ffb95f] text-[#2a1700] flex items-center justify-center text-xs">
                <span className="material-symbols-outlined text-[12px]">crown</span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-white">
              Identidad de Aldeano
            </h3>
            <span className="text-xs text-[#4cd7f6] font-medium">
              Anfitrión del Consejo · #LOB0-77
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
          <div>
            <label className="text-xs text-[#e6bdb8] font-semibold block mb-1">
              Nombre en la Aldea
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0f131d] border border-white/10 text-white font-medium focus:outline-none focus:border-[#4cd7f6] text-sm"
              placeholder="Tu nombre..."
              maxLength={20}
            />
          </div>

          <div className="p-3 rounded-lg bg-[#1c1f2a] border border-white/5 text-xs text-[#e6bdb8] space-y-1">
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className="text-[#4cd7f6] font-semibold">Listo para la hoguera</span>
            </div>
            <div className="flex justify-between">
              <span>Privacidad:</span>
              <span className="text-white">Rol oculto e impenetrable</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 mt-1 cursor-pointer"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};
