import React from 'react';
import { RoleType } from '../types/game';

interface ArcaneSealProps {
  role: RoleType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

export const ArcaneSeal: React.FC<ArcaneSealProps> = ({
  role,
  size = 'md',
  showGlow = true,
  className = '',
}) => {
  const sizeClass = SIZE_MAP[size];

  const getSealContent = () => {
    switch (role) {
      case 'alfa_werewolf':
        return {
          glow: 'rgba(220, 38, 38, 0.6)',
          borderGrad: 'from-amber-300 via-red-600 to-purple-600',
          bgGrad: 'from-[#3a0709] via-[#200305] to-[#0a0102]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.8" />
              {/* Crown of the Alpha */}
              <path d="M34 26 L42 34 L50 20 L58 34 L66 26 L62 40 L38 40 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <circle cx="50" cy="22" r="2" fill="#ef4444" />
              {/* Alpha Direwolf */}
              <path
                d="M50 36 L58 48 L70 38 L65 52 L76 56 L64 66 L70 78 L56 74 L50 90 L44 74 L30 78 L36 66 L24 56 L35 52 L30 38 L42 48 Z"
                fill="url(#alfaGrad)"
                stroke="#fca5a5"
                strokeWidth="1.5"
              />
              <circle cx="43" cy="58" r="3" fill="#ff0000" />
              <circle cx="57" cy="58" r="3" fill="#ff0000" />
              <circle cx="43" cy="58" r="1.5" fill="#fff" />
              <circle cx="57" cy="58" r="1.5" fill="#fff" />
              <defs>
                <linearGradient id="alfaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7f1d1d" />
                  <stop offset="50%" stopColor="#450a0a" />
                  <stop offset="100%" stopColor="#1c0505" />
                </linearGradient>
              </defs>
            </svg>
          ),
        };

      case 'werewolf':
        return {
          glow: 'rgba(239, 68, 68, 0.45)',
          borderGrad: 'from-amber-400 via-red-600 to-amber-700',
          bgGrad: 'from-[#2e090c] via-[#1a0507] to-[#0d0203]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.8" />
              <path
                d="M50 18 L56 32 L68 22 L64 38 L76 34 L66 50 L74 62 L58 60 L50 82 L42 60 L26 62 L34 50 L24 34 L36 38 L32 22 L44 32 Z"
                fill="#450a0a"
                stroke="#fca5a5"
                strokeWidth="1.5"
              />
              <circle cx="43" cy="45" r="3" fill="#ff0000" />
              <circle cx="57" cy="45" r="3" fill="#ff0000" />
              <circle cx="43" cy="45" r="1.5" fill="#fff" />
              <circle cx="57" cy="45" r="1.5" fill="#fff" />
              <polygon points="46,55 50,64 48,55" fill="#ffffff" />
              <polygon points="54,55 50,64 52,55" fill="#ffffff" />
            </svg>
          ),
        };

      case 'cupid':
        return {
          glow: 'rgba(236, 72, 153, 0.45)',
          borderGrad: 'from-pink-300 via-rose-400 to-amber-200',
          bgGrad: 'from-[#300c22] via-[#1c0714] to-[#0c0309]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(244,114,182,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="#fb7185" strokeWidth="1" opacity="0.8" />
              <path d="M18 45 C15 32 26 24 38 32 C30 36 26 44 28 50 C22 48 18 45 18 45 Z" fill="#fbcfe8" opacity="0.85" />
              <path d="M82 45 C85 32 74 24 62 32 C70 36 74 44 72 50 C78 48 82 45 82 45 Z" fill="#fbcfe8" opacity="0.85" />
              <path d="M44 42 C38 34 26 40 32 52 L44 65 L56 52 C62 40 50 34 44 42 Z" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
              <path d="M56 42 C50 34 38 40 44 52 L56 65 L68 52 C74 40 62 34 56 42 Z" fill="#ec4899" stroke="#fff" strokeWidth="1" opacity="0.85" />
              <line x1="24" y1="72" x2="76" y2="28" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="76,28 68,28 76,36" fill="#fbbf24" />
            </svg>
          ),
        };

      case 'seer':
        return {
          glow: 'rgba(56, 189, 248, 0.45)',
          borderGrad: 'from-sky-300 via-indigo-400 to-amber-200',
          bgGrad: 'from-[#071c33] via-[#041122] to-[#02070e]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.6" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.8" />
              <path d="M20 50 Q50 22 80 50 Q50 78 20 50 Z" fill="none" stroke="#67e8f9" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="14" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="50" cy="50" r="7" fill="#082f49" />
              <circle cx="52" cy="48" r="3" fill="#ffffff" />
              <line x1="50" y1="18" x2="50" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="50" y1="72" x2="50" y2="82" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="18" y1="50" x2="28" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="72" y1="50" x2="82" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
            </svg>
          ),
        };

      case 'little_girl':
        return {
          glow: 'rgba(168, 85, 247, 0.45)',
          borderGrad: 'from-purple-300 via-fuchsia-400 to-amber-200',
          bgGrad: 'from-[#220d33] via-[#140620] to-[#08020d]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(192,132,252,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <rect x="22" y="24" width="8" height="52" rx="2" fill="#78350f" opacity="0.8" />
              <rect x="36" y="24" width="8" height="52" rx="2" fill="#92400e" opacity="0.8" />
              <rect x="56" y="24" width="8" height="52" rx="2" fill="#92400e" opacity="0.8" />
              <rect x="70" y="24" width="8" height="52" rx="2" fill="#78350f" opacity="0.8" />
              <ellipse cx="44" cy="48" rx="6" ry="4" fill="#ffffff" />
              <circle cx="45" cy="48" r="2.5" fill="#a855f7" />
              <ellipse cx="56" cy="48" rx="6" ry="4" fill="#ffffff" />
              <circle cx="55" cy="48" r="2.5" fill="#a855f7" />
              <circle cx="50" cy="74" r="8" fill="#fbbf24" opacity="0.85" />
            </svg>
          ),
        };

      case 'mute_drunkard':
        return {
          glow: 'rgba(245, 158, 11, 0.45)',
          borderGrad: 'from-amber-300 via-orange-400 to-yellow-200',
          bgGrad: 'from-[#2e1c07] via-[#1c1003] to-[#0d0701]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
              <rect x="34" y="38" width="28" height="34" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
              <path d="M62 44 C72 44 72 64 62 64" fill="none" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
              <ellipse cx="48" cy="38" rx="16" ry="6" fill="#fef3c7" />
              <circle cx="40" cy="35" r="4" fill="#fef3c7" />
              <circle cx="48" cy="33" r="5" fill="#ffffff" />
              <circle cx="56" cy="35" r="4" fill="#fef3c7" />
              <circle cx="50" cy="22" r="9" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="50" y="26" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">🤫</text>
            </svg>
          ),
        };

      case 'witch':
        return {
          glow: 'rgba(16, 185, 129, 0.45)',
          borderGrad: 'from-emerald-300 via-purple-500 to-amber-200',
          bgGrad: 'from-[#0b291d] via-[#051710] to-[#020b07]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
              <ellipse cx="50" cy="58" rx="24" ry="18" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <ellipse cx="50" cy="46" rx="20" ry="6" fill="#059669" />
              <circle cx="44" cy="38" r="3.5" fill="#34d399" opacity="0.9" />
              <circle cx="54" cy="34" r="4.5" fill="#a7f3d0" opacity="0.9" />
              <rect x="24" y="60" width="8" height="14" rx="2" fill="#10b981" stroke="#fff" strokeWidth="0.8" />
              <rect x="68" y="60" width="8" height="14" rx="2" fill="#a855f7" stroke="#fff" strokeWidth="0.8" />
            </svg>
          ),
        };

      case 'hunter':
        return {
          glow: 'rgba(217, 119, 6, 0.45)',
          borderGrad: 'from-amber-400 via-emerald-600 to-stone-400',
          bgGrad: 'from-[#1f2416] via-[#10140c] to-[#070905]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(217,119,6,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
              <circle cx="50" cy="50" r="26" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
              <line x1="50" y1="18" x2="50" y2="82" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="18" y1="50" x2="82" y2="50" stroke="#f59e0b" strokeWidth="1.5" />
              <path d="M30 70 Q50 30 70 70" fill="none" stroke="#ca8a04" strokeWidth="3" />
              <line x1="28" y1="28" x2="72" y2="72" stroke="#e2e8f0" strokeWidth="2" />
              <polygon points="72,72 64,68 68,64" fill="#94a3b8" />
            </svg>
          ),
        };

      case 'doctor':
        return {
          glow: 'rgba(6, 182, 212, 0.45)',
          borderGrad: 'from-cyan-300 via-teal-400 to-slate-200',
          bgGrad: 'from-[#07242d] via-[#041419] to-[#02090b]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <path d="M50 18 L76 28 C76 56 50 78 50 78 C50 78 24 56 24 28 Z" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
              <rect x="45" y="32" width="10" height="28" rx="2" fill="#ffffff" />
              <rect x="36" y="41" width="28" height="10" rx="2" fill="#ffffff" />
              <circle cx="50" cy="46" r="4" fill="#06b6d4" />
            </svg>
          ),
        };

      case 'villager':
      default:
        return {
          glow: 'rgba(249, 115, 22, 0.45)',
          borderGrad: 'from-amber-400 via-orange-500 to-yellow-600',
          bgGrad: 'from-[#2e1909] via-[#1a0d05] to-[#0c0502]',
          svg: (
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(249,115,22,0.7)]">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <path
                d="M50 20 C54 34 68 44 64 64 C60 76 40 76 36 64 C32 48 44 38 42 26 C46 22 50 20 50 20 Z"
                fill="#f97316"
              />
              <path
                d="M50 36 C52 46 60 52 58 64 C56 70 44 70 42 64 C40 54 48 48 46 40 C48 38 50 36 50 36 Z"
                fill="#fef08a"
              />
              <ellipse cx="50" cy="74" rx="22" ry="5" fill="#78350f" />
            </svg>
          ),
        };
    }
  };

  const seal = getSealContent();

  return (
    <div
      className={`relative rounded-full p-[2px] bg-gradient-to-tr ${seal.borderGrad} ${sizeClass} shrink-0 ${className} ${
        showGlow ? 'shadow-[0_0_16px_' + seal.glow + ']' : ''
      }`}
    >
      <div className={`w-full h-full rounded-full bg-gradient-to-b ${seal.bgGrad} flex items-center justify-center p-1 overflow-hidden relative shadow-inner`}>
        {seal.svg}
      </div>
    </div>
  );
};
