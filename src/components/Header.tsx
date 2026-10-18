import React from 'react';
import { ActiveTab } from '../types/game';
import { toggleMute, getMuteState, playClickSound } from '../utils/audio';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenProfile: () => void;
  onOpenRoomCode: () => void;
  roomCode?: string;
  isOnline?: boolean;
  connectedCount?: number;
  actionTimeRemaining?: number;
}

const TAB_SUBTITLES: Record<ActiveTab, string> = {
  'lobby-sala': 'LOBBY / SALA',
  'mi-carta': 'MI DESTINO / ROL',
  'noche': 'LA NOCHE / CAÍDA',
  'aldea-juicio': 'CONSEJO / JUICIO',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenProfile,
  onOpenRoomCode,
  roomCode = 'LOB0-77',
  isOnline = true,
  connectedCount,
  actionTimeRemaining,
}) => {
  const [isMuted, setIsMuted] = React.useState(getMuteState());

  const handleToggleSound = () => {
    const nextMuted = toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      playClickSound();
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0f131d]/85 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-white/5">
      <div className="h-16 px-4 flex items-center justify-between max-w-4xl mx-auto">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            alt="Logo Hombre Lobo Aldea Maldita"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqkCpEicqhCMmp7LuiZi7vFkFXeM2adErIjz_Bfen2cypytF5lVglROKffFvttmU3ejHpTmZZLIC71ikfsDRMNJvV8xJjwvR5VGb99bqqvS-6hoOlmf9h5UGJvsAzseYoS8oXpcSm1pUMa2-kcPkB9ta9s8czxkLh4jYXnJWnVF_qXnwn5TQ71Fi21giSspwwxKrCRieTo6o357Sa28BV5K1Dl9pQSuUNtiKxGsOeSjNloOnRCvyhPbg"
            onError={(e) => {
              // Graceful CSS fallback container
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-['Playfair_Display'] text-[20px] font-bold text-[#ffb4ab] tracking-wide truncate leading-none">
              Villa Claraluna
            </span>
            <span className="text-[10px] text-[#e6bdb8] truncate uppercase tracking-widest mt-1 leading-none font-semibold">
              {TAB_SUBTITLES[activeTab]}
            </span>
          </div>
        </div>

        {/* Right Controls: Action Timer, Room Tag, Sound, Profile */}
        <div className="flex items-center gap-2">
          {/* Two-minute maximum action timer (visible during active gameplay) */}
          {activeTab !== 'lobby-sala' && actionTimeRemaining !== undefined && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold shadow-sm transition-all ${
                actionTimeRemaining <= 10
                  ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse'
                  : actionTimeRemaining <= 20
                  ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                  : 'bg-[#171b26] border-white/10 text-white'
              }`}
              title="Tiempo máximo para ejercer acción (2 minutos)"
            >
              <span className="material-symbols-outlined text-[13px] text-amber-400">
                timer
              </span>
              <span>
                {Math.floor(actionTimeRemaining / 60)}:
                {String(actionTimeRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Room Pill */}
          <button
            onClick={() => {
              playClickSound();
              onOpenRoomCode();
            }}
            className="px-2.5 py-1 rounded-full bg-[#262a35]/90 flex items-center gap-1.5 shadow-inner hover:bg-[#353944] transition-colors cursor-pointer border border-[#4cd7f6]/20"
            title="Ver código de sala y QR oficial"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-[#4cd7f6] animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
            <span className="text-[11px] text-[#4cd7f6] tracking-wider font-bold">
              #{roomCode}
            </span>
            {connectedCount !== undefined && connectedCount > 0 && (
              <span className="text-[9px] bg-[#4cd7f6]/20 text-[#4cd7f6] px-1 rounded-full font-bold ml-0.5">
                {connectedCount}
              </span>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#e6bdb8] hover:text-[#dfe2f1] hover:bg-[#262a35] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            className="w-8 h-8 rounded-full bg-[#ffb4ab] flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(255,180,171,0.25)] hover:ring-2 hover:ring-[#ffb4ab]/50 transition-all cursor-pointer"
            title="Perfil de Jugador"
          >
            <span className="material-symbols-outlined text-[#690005] text-[18px]">
              person
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
