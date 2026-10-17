import React, { useState, useEffect } from 'react';
import { RoleType, Player } from '../types/game';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { ArcaneSeal } from './ArcaneSeal';
import {
  getCustomCardImages,
  getCardVisibilitySettings,
  CardVisibilitySettings,
} from '../utils/customCards';

interface OfficialFichaCardProps {
  role: RoleType;
  player?: Partial<Player>;
  isFlipped?: boolean;
  onFlip?: () => void;
  showBackOnly?: boolean;
  showFrontOnly?: boolean;
  interactive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  customImageUrl?: string;
  showSeal?: boolean;
  forceCleanArt?: boolean;
}

const ROLE_NUMBERS: Record<RoleType, string> = {
  alfa_werewolf: '№ CLARA-01',
  werewolf: '№ CLARA-02',
  cupid: '№ CLARA-03',
  little_girl: '№ CLARA-04',
  mute_drunkard: '№ CLARA-05',
  witch: '№ CLARA-06',
  hunter: '№ CLARA-07',
  doctor: '№ CLARA-08',
  seer: '№ CLARA-09',
  villager: '№ CLARA-10',
};

export const OfficialFichaCard: React.FC<OfficialFichaCardProps> = ({
  role,
  player,
  isFlipped = true,
  onFlip,
  showBackOnly = false,
  showFrontOnly = false,
  interactive = true,
  className = '',
  size = 'md',
  customImageUrl,
  showSeal,
  forceCleanArt,
}) => {
  const [customImage, setCustomImage] = useState<string | undefined>(customImageUrl);
  const [visibilitySettings, setVisibilitySettings] = useState<CardVisibilitySettings>(
    getCardVisibilitySettings()
  );
  const [isCleanArtMode, setIsCleanArtMode] = useState<boolean>(
    forceCleanArt ?? visibilitySettings.cleanArtMode
  );

  useEffect(() => {
    if (customImageUrl) {
      setCustomImage(customImageUrl);
      return;
    }
    const updateState = () => {
      const stored = getCustomCardImages();
      setCustomImage(stored[role]);
      setVisibilitySettings(getCardVisibilitySettings());
    };
    updateState();

    window.addEventListener('claraluna_custom_cards_updated', updateState);
    window.addEventListener('claraluna_card_settings_updated', updateState);
    return () => {
      window.removeEventListener('claraluna_custom_cards_updated', updateState);
      window.removeEventListener('claraluna_card_settings_updated', updateState);
    };
  }, [role, customImageUrl]);

  const roleInfo = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.villager;
  const isWolfSide = roleInfo.allegiance === 'werewolves';
  const serialNo = ROLE_NUMBERS[role] || '№ CLARA-00';

  // Rule: If custom image is uploaded, NEVER show the seal medallion unless explicitly overridden with showSeal === true.
  // Also respect hideSealsAlways from settings.
  const shouldRenderSeal =
    showSeal !== undefined
      ? showSeal
      : customImage
      ? false
      : !visibilitySettings.hideSealsAlways;

  // Determine size constraints
  const sizeClasses = {
    sm: 'max-w-[220px]',
    md: 'max-w-[320px]',
    lg: 'max-w-[360px]',
  }[size];

  const effectiveFlipped = showBackOnly ? false : showFrontOnly ? true : isFlipped;

  return (
    <div
      onClick={interactive ? onFlip : undefined}
      className={`w-full ${sizeClasses} aspect-[9/16] perspective-1000 ${
        interactive ? 'cursor-pointer select-none' : ''
      } ${className}`}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          effectiveFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ========================================================
            CARD BACK (SEALED STATE) - EXACT 9:16 RATIO
            ======================================================== */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-b from-[#181a24] via-[#0e111a] to-[#070910] border-2 border-[#b8860b]/60 p-4 flex flex-col justify-between shadow-[0_0_35px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Subtle ornate background texture */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #b8860b 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Corner gothic brackets */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#b8860b]/80 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#b8860b]/80 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#b8860b]/80 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#b8860b]/80 rounded-br-sm pointer-events-none" />

          {/* Top Bar Header */}
          <div className="relative z-10 w-full flex items-center justify-between text-[#ffb95f] text-[10px] font-mono tracking-widest font-bold border-b border-[#b8860b]/30 pb-2">
            <span>✦ VILLA CLARALUNA</span>
            <span>FICHA OFICIAL 9:16 ✦</span>
          </div>

          {/* Center Sealed Medallion */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 my-auto text-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#ffb95f]/70 bg-[#0a0d16]/95 flex items-center justify-center relative shadow-[0_0_30px_rgba(255,185,95,0.3)]">
              {/* Outer spinning ring */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-dashed border-[#ffb4ab]/60 flex items-center justify-center animate-spin"
                style={{ animationDuration: '35s' }}
              >
                <span className="material-symbols-outlined text-[#ffb4ab] text-[36px] sm:text-[42px] opacity-90">
                  token
                </span>
              </div>
              {/* Center occult glyph */}
              <span className="material-symbols-outlined text-[#ffb95f] text-[28px] absolute animate-pulse">
                auto_awesome
              </span>
            </div>

            <div className="px-2">
              <span className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold text-white tracking-wide block">
                Ficha Sagrada
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#4cd7f6] mt-0.5 block">
                Villa Claraluna
              </span>
              <p className="text-[11px] text-[#e6bdb8] mt-1.5 max-w-[220px] leading-snug">
                El velo protege tu verdadera naturaleza. Toca para voltear y revelar tu rol.
              </p>
            </div>
          </div>

          {/* Bottom Flip Action Button */}
          <div className="relative z-10 w-full text-center py-2 px-3 rounded-xl bg-black/70 border border-[#b8860b]/40 flex items-center justify-center gap-1.5 text-xs text-[#ffb95f] font-semibold">
            <span className="material-symbols-outlined text-[16px] animate-bounce">
              touch_app
            </span>
            <span>Toca para voltear ficha (9:16)</span>
          </div>
        </div>

        {/* ========================================================
            CARD FRONT (REVEALED ROLE) - EXACT 9:16 RATIO
            HIGH VISIBILITY & CLEAN ARTWORK MODE
            ======================================================== */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.95)] border-2 overflow-hidden ${
            isWolfSide
              ? 'bg-gradient-to-b from-[#2a0709] via-[#160406] to-[#0a0203] border-red-500 shadow-[0_0_35px_rgba(220,38,38,0.4)]'
              : 'bg-gradient-to-b from-[#0c1826] via-[#07101c] to-[#03080e] border-[#4cd7f6] shadow-[0_0_35px_rgba(76,215,246,0.35)]'
          }`}
        >
          {/* Custom Illustration Layer: 100% VISIBLE, NO WASHED-OUT OPACITY */}
          {customImage ? (
            <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
              <img
                src={customImage}
                alt={roleInfo.name}
                className={`w-full h-full ${
                  visibilitySettings.fitMode === 'contain'
                    ? 'object-contain'
                    : 'object-cover'
                } opacity-100 transition-all`}
              />
              {/* Very soft top and bottom vignette to keep texts readable without obscuring center art */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/85" />
            </div>
          ) : (
            /* Default Arcane Background */
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: isWolfSide
                  ? `radial-gradient(circle at 50% 50%, #dc2626 1px, transparent 1px)`
                  : `radial-gradient(circle at 50% 50%, #38bdf8 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />
          )}

          {/* Corner gothic brackets for card elegance */}
          <div
            className={`absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 rounded-tl-sm pointer-events-none z-20 ${
              isWolfSide ? 'border-red-400' : 'border-[#4cd7f6]'
            }`}
          />
          <div
            className={`absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 rounded-tr-sm pointer-events-none z-20 ${
              isWolfSide ? 'border-red-400' : 'border-[#4cd7f6]'
            }`}
          />
          <div
            className={`absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 rounded-bl-sm pointer-events-none z-20 ${
              isWolfSide ? 'border-red-400' : 'border-[#4cd7f6]'
            }`}
          />
          <div
            className={`absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 rounded-br-sm pointer-events-none z-20 ${
              isWolfSide ? 'border-red-400' : 'border-[#4cd7f6]'
            }`}
          />

          {/* Top Bar with Category, Allegiance & Clean Mode Button */}
          <div className="relative z-20 flex items-center justify-between pb-1.5 border-b border-white/20 bg-black/40 backdrop-blur-md rounded-lg px-2 pt-1">
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm ${roleInfo.categoryColor}`}
            >
              {roleInfo.category}
            </span>

            <div className="flex items-center gap-2">
              {/* Quick toggle to hide/show rules overlay and let art shine 100% */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCleanArtMode(!isCleanArtMode);
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isCleanArtMode
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-amber-300'
                }`}
                title={isCleanArtMode ? 'Mostrar Poder Arcano' : 'Modo Tarjeta Limpia (Solo Arte)'}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {isCleanArtMode ? 'visibility_off' : 'visibility'}
                </span>
                <span>{isCleanArtMode ? 'Arte Puro' : 'Poder'}</span>
              </button>

              <div className="flex items-center gap-1 text-[10px] font-mono text-white font-bold">
                <span className="hidden sm:inline">{serialNo}</span>
                <span className={isWolfSide ? 'text-red-400' : 'text-[#4cd7f6]'}>
                  {isWolfSide ? '🐺 FIERAS' : '🛡️ VILLA'}
                </span>
              </div>
            </div>
          </div>

          {/* Special Status Ribbons (Mayor or Lovers) */}
          <div className="relative z-20 flex flex-col gap-1 my-1">
            {player?.isMayor && (
              <div className="py-1 px-2.5 rounded-lg bg-amber-500/30 backdrop-blur-md border border-amber-400 flex items-center justify-center gap-1.5 text-[10px] text-amber-200 font-bold shadow-md">
                <span className="material-symbols-outlined text-[15px] text-amber-300">
                  workspace_premium
                </span>
                <span>✦ ALCALDE DE LA VILLA · VOTO DOBLE (x2) ✦</span>
              </div>
            )}
            {player?.isLover && (
              <div className="py-1 px-2.5 rounded-lg bg-pink-500/30 backdrop-blur-md border border-pink-400 flex items-center justify-center gap-1.5 text-[10px] text-pink-200 font-bold shadow-md">
                <span className="material-symbols-outlined text-[15px] text-pink-300 animate-pulse">
                  favorite
                </span>
                <span>✦ ENAMORADO(A) · VÍNCULO ETERNO ✦</span>
              </div>
            )}
          </div>

          {/* Central Section: Center is completely unobstructed if custom card is present!
              If no custom card, renders ArcaneSeal medallion if shouldRenderSeal is true. */}
          <div className="relative z-20 flex flex-col items-center text-center my-auto px-1">
            {/* ONLY RENDER ARCANE SEAL WHEN shouldRenderSeal IS TRUE (NEVER IF CUSTOM CARD IS LOADED) */}
            {shouldRenderSeal && (
              <div className="mb-2 transition-all">
                <ArcaneSeal role={role} size="xl" showGlow={true} />
              </div>
            )}

            {/* Role Title with rich readable drop shadow */}
            <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold text-white tracking-wide leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              {roleInfo.name}
            </h3>

            {/* Mystical Quote (hidden in clean mode to give maximum image presence) */}
            {!isCleanArtMode && (
              <p className="text-[11px] italic text-[#ffb4ab] mt-1 px-1 font-serif line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                {roleInfo.quote}
              </p>
            )}

            {/* Role Ability Box: High-visibility frosted parchment (collapsible) */}
            {!isCleanArtMode ? (
              <div className="mt-2 p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/20 text-[11px] text-[#dfe2f1] text-left leading-relaxed shadow-[0_4px_25px_rgba(0,0,0,0.85)] w-full">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#ffb95f]">
                    Poder Arcano & Reglas:
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCleanArtMode(true);
                    }}
                    className="text-[9px] text-[#4cd7f6] hover:underline"
                  >
                    Ocultar texto
                  </button>
                </div>
                <p className="line-clamp-4 font-sans text-xs text-zinc-100 font-medium">
                  {roleInfo.details}
                </p>
              </div>
            ) : (
              /* Minimal floating badge in clean mode */
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCleanArtMode(false);
                }}
                className="mt-2 py-1 px-3 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-amber-400/60 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-105"
              >
                <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                <span>Ver Poder Arcano & Reglas</span>
              </button>
            )}
          </div>

          {/* Bottom Card Footer with crisp high visibility */}
          <div className="relative z-20 flex items-center justify-between text-[10px] text-white pt-2 border-t border-white/20 bg-black/50 backdrop-blur-md rounded-lg px-2 pb-1 mt-1">
            <span className="uppercase font-bold tracking-wider truncate max-w-[140px] text-[#ffb4ab]">
              {player?.name || 'Villa Claraluna'}
            </span>
            <span className="flex items-center gap-1 text-[#4cd7f6] font-semibold">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>{customImage ? 'Ficha Personalizada' : 'Ficha Oficial 9:16'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
