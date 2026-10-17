import React, { useState } from 'react';
import { RoleType } from '../types/game';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { OfficialFichaCard } from './OfficialFichaCard';
import { playClickSound, playCardWhoosh } from '../utils/audio';
import {
  getCustomCardImages,
  setCustomCardImage,
  clearCustomCardImages,
  getCardVisibilitySettings,
  updateCardVisibilitySettings,
  CardVisibilitySettings,
} from '../utils/customCards';

interface OfficialCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: RoleType;
}

const ALL_ROLES: RoleType[] = [
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

export const OfficialCodexModal: React.FC<OfficialCodexModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'alfa_werewolf',
}) => {
  const [selectedRole, setSelectedRole] = useState<RoleType>(initialRole);
  const [isFlipped, setIsFlipped] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'wolves' | 'village'>('all');
  const [showImageManager, setShowImageManager] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [customImages, setCustomImages] = useState<Partial<Record<RoleType, string>>>(
    getCustomCardImages()
  );
  const [visibilitySettings, setVisibilitySettings] = useState<CardVisibilitySettings>(
    getCardVisibilitySettings()
  );

  const reloadImages = () => {
    setCustomImages(getCustomCardImages());
    setVisibilitySettings(getCardVisibilitySettings());
  };

  const handleToggleHideSealsAlways = () => {
    playClickSound();
    const updated = updateCardVisibilitySettings({
      hideSealsAlways: !visibilitySettings.hideSealsAlways,
    });
    setVisibilitySettings(updated);
  };

  const handleToggleFitMode = () => {
    playClickSound();
    const nextFit = visibilitySettings.fitMode === 'cover' ? 'contain' : 'cover';
    const updated = updateCardVisibilitySettings({
      fitMode: nextFit,
    });
    setVisibilitySettings(updated);
  };

  const handleToggleCleanArt = () => {
    playClickSound();
    const updated = updateCardVisibilitySettings({
      cleanArtMode: !visibilitySettings.cleanArtMode,
    });
    setVisibilitySettings(updated);
  };

  const handleSaveUrl = () => {
    if (!customUrlInput.trim()) return;
    playClickSound();
    setCustomCardImage(selectedRole, customUrlInput.trim());
    setCustomUrlInput('');
    reloadImages();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        playClickSound();
        setCustomCardImage(selectedRole, dataUrl);
        reloadImages();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    playClickSound();
    setCustomCardImage(selectedRole, '');
    reloadImages();
  };

  const handleClearAll = () => {
    playClickSound();
    clearCustomCardImages();
    reloadImages();
  };

  if (!isOpen) return null;

  const filteredRoles = ALL_ROLES.filter((r) => {
    const def = ROLE_DEFINITIONS[r];
    if (filter === 'wolves') return def.allegiance === 'werewolves';
    if (filter === 'village') return def.allegiance === 'village';
    return true;
  });

  const handleSelectRole = (r: RoleType) => {
    playCardWhoosh();
    setSelectedRole(r);
    setIsFlipped(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] rounded-2xl bg-[#121622] border border-[#b8860b]/40 flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171b26]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#ffb95f]">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Compendio de Fichas Oficiales (9:16)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  OFICIAL
                </span>
              </h2>
              <p className="text-xs text-[#e6bdb8]">
                Fichas reglamentarias de Villa Claraluna en proporción sagrada 9:16.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#262a35] hover:bg-[#353944] text-[#e6bdb8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-2.5 bg-[#0f131d] border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setFilter('all');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todas (10)
            </button>
            <button
              onClick={() => {
                playClickSound();
                setFilter('wolves');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filter === 'wolves'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fieras de la Luna (2)
            </button>
            <button
              onClick={() => {
                playClickSound();
                setFilter('village');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filter === 'village'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Villa & Aliados (8)
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setShowImageManager(!showImageManager);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                showImageManager
                  ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                  : 'bg-[#262a35] hover:bg-[#353944] text-amber-300'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
              <span>{showImageManager ? 'Ocultar Creador' : 'Vincular mis Cartas'}</span>
            </button>

            <button
              onClick={() => {
                playCardWhoosh();
                setIsFlipped(!isFlipped);
              }}
              className="px-3 py-1 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">flip</span>
              <span>{isFlipped ? 'Ver Reverso' : 'Ver Anverso'}</span>
            </button>
          </div>
        </div>

        {/* Custom Card Artwork Manager Panel */}
        {showImageManager && (
          <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-[#181d2a] to-[#121622] border-b border-amber-500/30 text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">brush</span>
                <span className="font-bold text-white">
                  Vincular Ilustración para: <span className="text-amber-300 underline">{ROLE_DEFINITIONS[selectedRole]?.name}</span>
                </span>
                {customImages[selectedRole] && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    Activa
                  </span>
                )}
              </div>

              {customImages[selectedRole] && (
                <button
                  onClick={handleRemoveImage}
                  className="text-[11px] text-red-300 hover:text-red-200 underline cursor-pointer"
                >
                  Quitar ilustración de este rol
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-300 mb-2">
              Puedes pegar un enlace directo a tu imagen (desde tu repositorio de <strong>GitHub</strong>, despliegue en <strong>Vercel</strong>, o Imgur) o subir tu imagen 9:16 desde tu dispositivo. Se mantendrá el espacio superior y el sello de Poder Arcano.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="https://raw.githubusercontent.com/.../mi-carta.png o https://mi-app.vercel.app/..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl()}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e111a] border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSaveUrl}
                disabled={!customUrlInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-bold text-xs cursor-pointer transition-colors shrink-0"
              >
                Guardar URL
              </button>

              <label className="px-3 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#353944] text-white font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-[15px]">upload_file</span>
                <span>Subir archivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Visibility & Seal display options */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Al subir tu carta, los sellos se ocultan para máxima visibilidad de tu arte.</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleHideSealsAlways}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    visibilitySettings.hideSealsAlways
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-sm'
                      : 'bg-[#262a35] hover:bg-[#353944] text-amber-300 border-amber-500/30'
                  }`}
                  title="Oculta los medallones de sellos en todas las cartas para no tapar ninguna ilustración"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {visibilitySettings.hideSealsAlways ? 'visibility_off' : 'visibility'}
                  </span>
                  <span>
                    {visibilitySettings.hideSealsAlways
                      ? 'Sellos Ocultos en Todas'
                      : 'Ocultar Sellos en Todas las Cartas'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFitMode}
                  className="px-2.5 py-1 rounded-lg bg-[#262a35] hover:bg-[#353944] border border-white/10 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Cambia entre llenar el marco 9:16 o mostrar la imagen completa"
                >
                  <span className="material-symbols-outlined text-[13px]">aspect_ratio</span>
                  <span>Modo: {visibilitySettings.fitMode === 'cover' ? 'Llenar 9:16' : 'Completa'}</span>
                </button>

                {Object.keys(customImages).length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Restablecer todas
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Area: Left Role List, Right 9:16 Card View */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-6 items-center md:items-start justify-center">
          {/* Role selector carousel / list */}
          <div className="w-full md:w-56 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[380px] pb-2 md:pb-0 shrink-0">
            {filteredRoles.map((r) => {
              const info = ROLE_DEFINITIONS[r];
              const isSelected = selectedRole === r;
              const hasCustom = !!customImages[r];
              return (
                <button
                  key={r}
                  onClick={() => handleSelectRole(r)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer shrink-0 w-44 md:w-full ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/70 to-[#1e2330] border-amber-400 shadow-md scale-[1.02]'
                      : 'bg-[#171b26] border-white/5 hover:border-white/20 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        info.allegiance === 'werewolves' ? 'bg-red-500' : 'bg-cyan-400'
                      }`}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate leading-tight">
                        {info.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        {info.category}
                      </span>
                    </div>
                  </div>
                  {hasCustom && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                      🖼️
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Official 9:16 Card Display */}
          <div className="flex flex-col items-center justify-center shrink-0 w-full max-w-[280px] sm:max-w-[310px]">
            <OfficialFichaCard
              role={selectedRole}
              isFlipped={isFlipped}
              onFlip={() => {
                playCardWhoosh();
                setIsFlipped(!isFlipped);
              }}
              size="md"
            />
            <div className="flex flex-col items-center gap-1 mt-2.5">
              <button
                type="button"
                onClick={handleToggleCleanArt}
                className={`py-1 px-3 rounded-full border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md ${
                  visibilitySettings.cleanArtMode
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold scale-105'
                    : 'bg-[#262a35] hover:bg-[#353944] text-amber-300 border-amber-500/40'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {visibilitySettings.cleanArtMode ? 'visibility_off' : 'visibility'}
                </span>
                <span>
                  {visibilitySettings.cleanArtMode
                    ? '✦ Modo Arte Limpio Activo ✦'
                    : '👁️ Ver Arte 100% Limpio (Sin Textos)'}
                </span>
              </button>
              <p className="text-[11px] text-[#ffb95f] text-center flex items-center justify-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">touch_app</span>
                <span>Toca la ficha para voltear anverso/reverso</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
