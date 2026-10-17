import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';
import {
  OFFICIAL_QR_CODE_URL,
  OFFICIAL_QR_CODE_FALLBACK_URL,
  getQrImageUrl,
} from '../utils/customCards';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(getQrImageUrl() || OFFICIAL_QR_CODE_URL);

  if (!isOpen) return null;

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard?.writeText(window.location.origin + '?room=' + roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageError = () => {
    // If raw CDN failed, try GitHub blob ?raw=true fallback
    if (imgSrc !== OFFICIAL_QR_CODE_FALLBACK_URL) {
      setImgSrc(OFFICIAL_QR_CODE_FALLBACK_URL);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-[#171b26] border border-[#ffb95f]/20 p-5 sm:p-6 flex flex-col items-center gap-4 shadow-2xl relative">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#e6bdb8] hover:text-white transition-colors"
          title="Cerrar"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <div className="w-12 h-12 rounded-xl bg-[#ffb95f]/10 border border-[#ffb95f]/30 flex items-center justify-center text-[#ffb95f]">
          <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
        </div>

        <div className="text-center">
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-white tracking-wide">
            Unirse a Villa Claraluna
          </h3>
          <p className="text-xs text-[#e6bdb8] mt-1">
            Escanea el código QR oficial con la cámara de tu móvil para ingresar a la aldea.
          </p>
        </div>

        {/* QR Code Container with Official User Image */}
        <div className="relative p-3 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center border-2 border-[#ffb95f]/40 max-w-[260px] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl gap-2 z-10">
              <span className="material-symbols-outlined text-3xl text-[#b8860b] animate-spin">
                progress_activity
              </span>
              <span className="text-[11px] font-bold text-gray-600">
                Cargando Código QR...
              </span>
            </div>
          )}

          <img
            src={imgSrc}
            alt="Código QR Villa Claraluna"
            className="w-56 h-56 object-contain rounded-lg transition-transform duration-200 hover:scale-[1.02]"
            onLoad={() => setIsLoading(false)}
            onError={handleImageError}
            crossOrigin="anonymous"
          />

          <div className="w-full pt-2 mt-1 border-t border-gray-200 flex items-center justify-between text-[11px] font-mono font-bold text-gray-800">
            <span className="flex items-center gap-1 text-[#991b1b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#991b1b] animate-pulse"></span>
              CLARALUNA
            </span>
            <span className="tracking-widest">SALA: {roomCode}</span>
          </div>
        </div>

        {/* Room Code & Copy Actions */}
        <div className="flex items-center gap-2 w-full mt-1">
          <div className="flex-1 px-3 py-2 rounded-lg bg-[#0f131d] border border-white/10 text-center font-mono text-sm font-bold text-[#4cd7f6] tracking-widest select-all">
            {roomCode}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-[#262a35] hover:bg-[#353944] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
              {copied ? 'done' : 'content_copy'}
            </span>
            <span>{copied ? '¡Copiado!' : 'Copiar Link'}</span>
          </button>
        </div>

        {/* Direct link helper */}
        <a
          href={imgSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#ffb95f] hover:underline flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
        >
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          <span>Abrir imagen del QR en tamaño completo</span>
        </a>
      </div>
    </div>
  );
};
