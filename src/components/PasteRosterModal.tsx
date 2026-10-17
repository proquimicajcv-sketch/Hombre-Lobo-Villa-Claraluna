import React, { useState } from 'react';
import { playClickSound, playCardWhoosh } from '../utils/audio';

interface PasteRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportNames: (names: string[]) => void;
  maxCount: number;
}

export const PasteRosterModal: React.FC<PasteRosterModalProps> = ({
  isOpen,
  onClose,
  onImportNames,
  maxCount,
}) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const parsedNames = text
    .split(/[\n,;]+/)
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const handleApply = () => {
    if (parsedNames.length > 0) {
      playCardWhoosh();
      onImportNames(parsedNames);
      onClose();
    }
  };

  const handleSetSample = () => {
    playClickSound();
    setText(
      'Profe Jorge\nMateo\nElena\nCarlos\nSofía\nLucas\nValentina\nDiego\nLucía\nMarcos\nBeatriz\nRodrigo'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-[#171b26] border border-white/10 p-5 flex flex-col gap-3 shadow-2xl relative">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#e6bdb8] hover:text-white"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 flex items-center justify-center text-[#4cd7f6]">
            <span className="material-symbols-outlined text-[22px]">content_paste</span>
          </div>
          <div>
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-white">
              Pegar Lista de Nombres
            </h3>
            <p className="text-[11px] text-[#e6bdb8]">
              Pega una lista desde WhatsApp, Excel, o Classroom (un nombre por línea).
            </p>
          </div>
        </div>

        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Ejemplo:\nProfe Jorge\nElena\nCarlos\nSofía\nLucas...`}
          className="w-full p-3 rounded-xl bg-[#0f131d] border border-white/10 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#4cd7f6] resize-none"
        />

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#4cd7f6] font-semibold">
            {parsedNames.length} nombre{parsedNames.length === 1 ? '' : 's'} detectado{parsedNames.length === 1 ? '' : 's'}
            {parsedNames.length > maxCount && ` (se usarán los primeros ${maxCount})`}
          </span>
          <button
            onClick={handleSetSample}
            className="text-[11px] text-[#ffb95f] hover:underline"
          >
            Cargar ejemplo
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#262a35] hover:bg-[#353944] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={parsedNames.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-[#4cd7f6] hover:bg-[#38bdf8] disabled:opacity-40 text-xs font-bold text-[#001f26] transition-all shadow-md cursor-pointer"
          >
            Aplicar Nombres
          </button>
        </div>
      </div>
    </div>
  );
};
