import React from 'react';
import { playClickSound } from '../utils/audio';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard?.writeText(window.location.origin + '?room=' + roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-[#171b26] border border-white/10 p-6 flex flex-col items-center gap-4 shadow-2xl relative">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#e6bdb8] hover:text-white"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="w-12 h-12 rounded-xl bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 flex items-center justify-center text-[#4cd7f6]">
          <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
        </div>

        <div className="text-center">
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-white">
            Unirse al Aquelarre
          </h3>
          <p className="text-xs text-[#e6bdb8] mt-1">
            Escanea este sello con la cámara o comparte el código secreto.
          </p>
        </div>

        {/* QR Pattern visual */}
        <div className="p-4 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center">
          <svg className="w-44 h-44 text-black" viewBox="0 0 100 100" fill="currentColor">
            {/* Realistic SVG QR code mock pattern with room code markers */}
            <rect x="5" y="5" width="25" height="25" rx="3" fill="#000" />
            <rect x="9" y="9" width="17" height="17" fill="#fff" />
            <rect x="13" y="13" width="9" height="9" fill="#000" />

            <rect x="70" y="5" width="25" height="25" rx="3" fill="#000" />
            <rect x="74" y="9" width="17" height="17" fill="#fff" />
            <rect x="78" y="13" width="9" height="9" fill="#000" />

            <rect x="5" y="70" width="25" height="25" rx="3" fill="#000" />
            <rect x="9" y="74" width="17" height="17" fill="#fff" />
            <rect x="13" y="78" width="9" height="9" fill="#000" />

            <rect x="35" y="10" width="8" height="8" fill="#000" />
            <rect x="48" y="10" width="6" height="6" fill="#000" />
            <rect x="35" y="24" width="12" height="6" fill="#000" />
            <rect x="54" y="20" width="8" height="8" fill="#000" />

            <rect x="10" y="38" width="6" height="10" fill="#000" />
            <rect x="22" y="44" width="10" height="6" fill="#000" />
            <rect x="40" y="40" width="20" height="20" fill="#dc2626" rx="2" />
            <circle cx="50" cy="50" r="4" fill="#fff" />

            <rect x="68" y="38" width="8" height="8" fill="#000" />
            <rect x="80" y="44" width="10" height="8" fill="#000" />
            <rect x="44" y="68" width="8" height="16" fill="#000" />
            <rect x="58" y="76" width="12" height="8" fill="#000" />
            <rect x="76" y="72" width="16" height="6" fill="#000" />
            <rect x="84" y="84" width="8" height="8" fill="#000" />
          </svg>
          <span className="text-[11px] font-mono font-bold tracking-widest text-black mt-2">
            ROOM: {roomCode}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full mt-1">
          <div className="flex-1 px-3 py-2 rounded-lg bg-[#0f131d] border border-white/5 text-center font-mono text-sm font-bold text-[#4cd7f6] tracking-widest">
            {roomCode}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-[#262a35] hover:bg-[#353944] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
              {copied ? 'done' : 'content_copy'}
            </span>
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
