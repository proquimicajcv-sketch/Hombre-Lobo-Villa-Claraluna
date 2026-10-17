import React, { useState } from 'react';
import { playClickSound } from '../utils/audio';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (name: string, avatarUrl: string) => void;
  roomCode: string;
  initialName?: string;
  initialAvatar?: string;
}

const PRESET_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3dg_vQWq0VPRNKkvEA_k_pu5_xdAihlhNwXLe7JGvL95FSlraaMcQA7rjBeClL2Lj41iX8PuVch3QhgiT2VAvHGNXGXEwx8Be7Q4RVe4aLvqSaEuUJfQny8EKcL6eqDXf19EiQulag_ZCVIPZ0D55VrnFC65YV0CD0K5F3cgLdbgs9n6bB605HJXVyYpYRToU81tmUKK7hfVrNwd8zgfNpayxfvSWDMy9d8dVq-EahbAPjnANnHucOQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAa6ORFhSHL4JXpo1BOFCH-WxHK6UU4Jn0hY9td8o9dTGeq16d5kD0uHGTZ6nEq3U5qS1c7v28DkQiJYTp5NNujCiuZc22CY4_n9aAUocIJSN8piqwoZtHnJ1AGfc-fHOI-5ksC8OrTvC6eKY2g_OizEOM7kmP5wlo226hFv8GH_GEUC2cVbzX-hjVaKvUOz09Bu6OMfsG7fAD0CVog1WRcYMFOVsARAJLoGt3IExGqz_E0MLa_vtpfHw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCf8WMjwM0R1LQOjZIkJSH0v3PGMkHiZ4lWRyWkPT8TNleYqqYliKP_XcfA-f6_nvZuDasv9pVG1nVWqHPkzBWMLUrlTdNss1pcynTwv1uKvLXi7v49yBd7G2dBFLqTQ--QcqIbuMVZzw0SY3NEL_TbAeZOtmCcfdb9NYV9jOU16i6_9x_JZWIdAH57f2LD63e0ZrzjtsQkX_cFF1VR2bAVL6xMmo8KKpkIUTZTrjXoFyr07VnATEAuTw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBaICa67tp_F1zq7jF0la9-_z3o_4-Z7vXybzykIwKtMApDmubWimEfbrQDHXHHbX71VVAjgHoESXIwauPKJY6Eqr5Vob21mwRijtJcrjHL-i6qD-WOjGseGb4D71mI21TvRWBk6bSORD3J-UNp8p7wu0iP72FA2hkXTlRDDbEhGwsQL_eJaqwHqD3KnOzdSsfMXzeKtgh4pWASBA3otJKTTcg-DvyYzqMmSyLuTm13WmBO6dAD6IvWgg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDff9aW54Ydo9Z4jcwvyEUNrW1N17etUUDMDCeFGIjFFHtq6qySRJGVUOuiOcB1_8sSfBjmOfqlKQZ39pzgfcqWpZDI2-YORLStnmcj24fYpGaJ0D0s32UWr1RIY20cfXz81QTNOLFipvPgkIBWtxw2mLl4sTpaCH19DNqRzrKPvy4SGRpTQ-_--fHsVeiMK9A1doyV1TkUn8SIeER7CEF7iaSlxrx1g2q8F_A5XWeZWneykYMkNTiTmQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDI4FIIMSEIayraAoUY1t_KMyzzrUom3xQV2HK0-xZ3l8T-mYUreyayk3PdAj8kMb2htvt2i0lFL1fyoNAfHUIWZWOyzNkBNcNE6I6b87QDdHXgDhZ_4UhoCM4sLXG5qVtsbo6HecvxiBW6kXGg9qR2p5qnCP4ptPeAx3GhBzumaiX22oxB3XF5ViYsvuYpkQd40kg8E4Ad_3SGu2jVNFJUgQWdDDTLDy37dfTukjRueyGiXzWRw3DdEw',
];

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  roomCode,
  initialName = '',
  initialAvatar = PRESET_AVATARS[0],
}) => {
  const [name, setName] = useState(initialName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    playClickSound();
    onJoin(name.trim(), selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-[#171b26] border border-[#ffb95f]/30 p-5 sm:p-6 flex flex-col gap-4 shadow-2xl relative">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#e6bdb8] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#ffb95f]/10 border border-[#ffb95f]/30 mx-auto flex items-center justify-center text-[#ffb95f] mb-2">
            <span className="material-symbols-outlined text-[28px]">groups</span>
          </div>
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-white tracking-wide">
            Unirse a la Aldea Online
          </h3>
          <p className="text-xs text-[#e6bdb8] mt-1">
            Sala secreta: <span className="font-mono text-[#4cd7f6] font-bold">#{roomCode}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-zinc-300 font-bold block mb-1">
              Tu Nombre de Jugador:
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={20}
              placeholder="Ej. Mateo, Sofía, Lucas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e111a] border border-[#ffb95f]/30 text-white text-sm focus:outline-none focus:border-[#ffb95f] placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-zinc-300 font-bold block mb-2">
              Elige tu Retrato de Aldeano:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AVATARS.map((url, idx) => {
                const isSelected = selectedAvatar === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedAvatar(url);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#ffb95f] scale-105 shadow-[0_0_12px_rgba(255,185,95,0.5)]'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Retrato" className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#ffb95f] text-black flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-black font-extrabold text-sm tracking-wide shadow-lg disabled:opacity-40 transition-all cursor-pointer mt-1"
          >
            Entrar al Aquelarre en Vivo
          </button>
        </form>
      </div>
    </div>
  );
};
