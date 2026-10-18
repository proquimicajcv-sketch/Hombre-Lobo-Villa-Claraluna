import React from 'react';
import { Player, NightStep } from '../types/game';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { ArcaneSeal } from './ArcaneSeal';
import { OfficialCodexModal } from './OfficialCodexModal';
import { OfficialFichaCard } from './OfficialFichaCard';
import {
  playWolfHowl,
  playMysticChime,
  playChurchBell,
  playClickSound,
  playGavelStrike,
} from '../utils/audio';

interface NightScreenProps {
  players: Player[];
  nightNumber: number;
  onNightEnd: (
    victimId: string | null,
    saved: boolean,
    poisonedId: string | null,
    resurrectedId: string | null
  ) => void;
  onSetLovers: (lover1Id: string, lover2Id: string) => void;
  onGoToTrial: () => void;
}

export const NightScreen: React.FC<NightScreenProps> = ({
  players,
  nightNumber,
  onNightEnd,
  onSetLovers,
  onGoToTrial,
}) => {
  const [currentStep, setCurrentStep] = React.useState<NightStep>('sleep');

  // Cupid state
  const [selectedLovers, setSelectedLovers] = React.useState<string[]>([]);
  // Seer state
  const [seerTarget, setSeerTarget] = React.useState<Player | null>(null);
  const [seerRevealedRole, setSeerRevealedRole] = React.useState<string | null>(null);
  // Wolves state
  const [wolfTargetId, setWolfTargetId] = React.useState<string | null>(null);
  // Alfa resurrect state
  const [alfaTargetDeadId, setAlfaTargetDeadId] = React.useState<string | null>(null);
  const [alfaUsed, setAlfaUsed] = React.useState(false);
  // Little Girl peek state
  const [peekResult, setPeekResult] = React.useState<string | null>(null);
  // Witch state
  const [witchSavedVictim, setWitchSavedVictim] = React.useState(false);
  const [witchPoisonTargetId, setWitchPoisonTargetId] = React.useState<string | null>(null);
  // Doctor state
  const [doctorTargetId, setDoctorTargetId] = React.useState<string | null>(null);
  // Final Night report
  const [nightReport, setNightReport] = React.useState<{
    victims: Player[];
    saved: boolean;
    convertedWolf: Player | null;
    heartbrokenLover: Player | null;
  } | null>(null);

  const [isCodexOpen, setIsCodexOpen] = React.useState(false);
  const [codexRole, setCodexRole] = React.useState<'alfa_werewolf' | 'werewolf' | 'cupid' | 'little_girl' | 'mute_drunkard' | 'witch' | 'hunter' | 'doctor' | 'seer' | 'villager'>('alfa_werewolf');
  const [viewingFichaPlayer, setViewingFichaPlayer] = React.useState<Player | null>(null);

  const livingPlayers = players.filter((p) => p.isAlive);
  const deadPlayers = players.filter((p) => !p.isAlive);
  const hasAlfaAlive = livingPlayers.some((p) => p.role === 'alfa_werewolf');
  const hasCupidAlive = livingPlayers.some((p) => p.role === 'cupid');
  const hasSeerAlive = livingPlayers.some((p) => p.role === 'seer');
  const hasDoctorAlive = livingPlayers.some((p) => p.role === 'doctor');
  const hasWitchAlive = livingPlayers.some((p) => p.role === 'witch');
  const hasLittleGirlAlive = livingPlayers.some((p) => p.role === 'little_girl');

  const [stepTimer, setStepTimer] = React.useState<number>(120);

  const handleStepTransition = (nextStep: NightStep) => {
    playClickSound();
    setCurrentStep(nextStep);
    setStepTimer(120);

    if (nextStep === 'cupid') {
      playMysticChime();
    } else if (nextStep === 'seer') {
      playMysticChime();
    } else if (nextStep === 'werewolves') {
      playWolfHowl();
    } else if (nextStep === 'dawn') {
      playChurchBell();
      resolveDawn();
    }
  };

  // Two-minute maximum action countdown per night phase & bot auto-actions
  React.useEffect(() => {
    setStepTimer(120);
    const interval = setInterval(() => {
      setStepTimer((prev) => {
        if (prev <= 1) {
          if (currentStep === 'sleep') {
            if (nightNumber === 1 && hasCupidAlive) handleStepTransition('cupid');
            else if (hasSeerAlive) handleStepTransition('seer');
            else handleStepTransition('werewolves');
          } else if (currentStep === 'cupid') {
            if (hasSeerAlive) handleStepTransition('seer');
            else handleStepTransition('werewolves');
          } else if (currentStep === 'seer') {
            handleStepTransition('werewolves');
          } else if (currentStep === 'werewolves') {
            // Auto-resolve wolf attack if not chosen within 2 minutes
            if (!wolfTargetId) {
              const nonWolves = livingPlayers.filter(
                (p) => p.role !== 'werewolf' && p.role !== 'alfa_werewolf'
              );
              if (nonWolves.length > 0) {
                const autoTarget = nonWolves[Math.floor(Math.random() * nonWolves.length)];
                setWolfTargetId(autoTarget.id);
              }
            }
            if (hasAlfaAlive && deadPlayers.length > 0 && !alfaUsed) handleStepTransition('alfa_resurrect');
            else if (hasLittleGirlAlive) handleStepTransition('little_girl');
            else if (hasWitchAlive) handleStepTransition('witch');
            else if (hasDoctorAlive) handleStepTransition('doctor');
            else handleStepTransition('dawn');
          } else if (currentStep === 'alfa_resurrect') {
            if (hasLittleGirlAlive) handleStepTransition('little_girl');
            else if (hasWitchAlive) handleStepTransition('witch');
            else if (hasDoctorAlive) handleStepTransition('doctor');
            else handleStepTransition('dawn');
          } else if (currentStep === 'little_girl') {
            if (hasWitchAlive) handleStepTransition('witch');
            else if (hasDoctorAlive) handleStepTransition('doctor');
            else handleStepTransition('dawn');
          } else if (currentStep === 'witch') {
            if (hasDoctorAlive) handleStepTransition('doctor');
            else handleStepTransition('dawn');
          } else if (currentStep === 'doctor') {
            if (!doctorTargetId) {
              const randomProtect = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
              if (randomProtect) setDoctorTargetId(randomProtect.id);
            }
            handleStepTransition('dawn');
          } else if (currentStep === 'dawn') {
            onGoToTrial();
          }
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, nightNumber, livingPlayers.length, wolfTargetId, doctorTargetId]);

  const resolveDawn = () => {
    // Determine who was saved:
    const isSavedByDoctor = Boolean(wolfTargetId && wolfTargetId === doctorTargetId);
    const isSavedByWitch = witchSavedVictim;
    const isSaved = isSavedByDoctor || isSavedByWitch;

    const victimsList: Player[] = [];

    // 1. Werewolf kill
    if (wolfTargetId && !isSaved) {
      const v = players.find((p) => p.id === wolfTargetId);
      if (v) {
        victimsList.push(v);
        // Play wolf howl to announce that the beasts have claimed a victim
        setTimeout(() => {
          playWolfHowl();
        }, 800);
      }
    }

    // 2. Witch poison
    if (witchPoisonTargetId) {
      const p = players.find((p) => p.id === witchPoisonTargetId);
      if (p && !victimsList.some((v) => v.id === p.id)) {
        victimsList.push(p);
      }
    }

    // 3. Lover heartbreak check
    let heartbroken: Player | null = null;
    victimsList.forEach((v) => {
      if (v.loverId) {
        const otherLover = players.find((p) => p.id === v.loverId && p.isAlive);
        if (otherLover && !victimsList.some((x) => x.id === otherLover.id)) {
          heartbroken = otherLover;
          victimsList.push(otherLover);
        }
      }
    });

    // 4. Alfa converted wolf
    const converted = alfaTargetDeadId
      ? players.find((p) => p.id === alfaTargetDeadId) || null
      : null;

    setNightReport({
      victims: victimsList,
      saved: isSaved,
      convertedWolf: converted,
      heartbrokenLover: heartbroken,
    });

    onNightEnd(
      wolfTargetId && !isSaved ? wolfTargetId : null,
      isSaved,
      witchPoisonTargetId,
      alfaTargetDeadId
    );
  };

  const handleSelectLover = (playerId: string) => {
    playClickSound();
    if (selectedLovers.includes(playerId)) {
      setSelectedLovers(selectedLovers.filter((id) => id !== playerId));
    } else if (selectedLovers.length < 2) {
      const next = [...selectedLovers, playerId];
      setSelectedLovers(next);
      if (next.length === 2) {
        playMysticChime();
        onSetLovers(next[0], next[1]);
      }
    }
  };

  const handlePeekLittleGirl = () => {
    playClickSound();
    // 70% chance of spying safely and catching a wolf name, 30% chance of nothing
    const wolves = livingPlayers.filter((p) => p.role === 'werewolf' || p.role === 'alfa_werewolf');
    if (wolves.length > 0 && Math.random() > 0.3) {
      const spotted = wolves[Math.floor(Math.random() * wolves.length)];
      setPeekResult(`¡Lograste espiar entre los postigos! Viste a ${spotted.name} con ojos encendidos cazando en la plaza.`);
    } else {
      setPeekResult('La niebla era demasiado densa; solo escuchaste gruñidos y pisadas veloces.');
    }
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2f1] max-w-2xl mx-auto px-4 pt-2 pb-24">
      {/* Night Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0e18] via-[#101422] to-[#0f131d] border border-cyan-500/20 p-5 shadow-2xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#4cd7f6]">
            <span className="material-symbols-outlined text-[20px] animate-pulse">
              dark_mode
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest">
              Noche #{nightNumber} · Villa Claraluna
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Two-minute maximum action timer */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold shadow-sm transition-all ${
                stepTimer <= 10
                  ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                  : 'bg-black/60 border-amber-500/40 text-amber-300'
              }`}
              title="Tiempo máximo para ejercer acción nocturna (2 minutos)"
            >
              <span className="material-symbols-outlined text-[14px]">timer</span>
              <span>
                {Math.floor(stepTimer / 60)}:{String(stepTimer % 60).padStart(2, '0')} (Máx 2m)
              </span>
            </div>

            <button
              onClick={() => {
                playClickSound();
                setIsCodexOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer"
              title="Consultar fichas oficiales 9:16"
            >
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              <span>Fichas 9:16</span>
            </button>
            <button
              onClick={() => playWolfHowl()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/50 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-900/50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">pets</span>
              <span>Aullido</span>
            </button>
          </div>
        </div>

        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-white mt-1">
          {currentStep === 'sleep' && 'La Aldea Cae en Silencio'}
          {currentStep === 'cupid' && 'El Juramento de Cupido'}
          {currentStep === 'seer' && 'El Oráculo de la Vidente'}
          {currentStep === 'werewolves' && 'La Cacería de los Hombres Lobo'}
          {currentStep === 'alfa_resurrect' && 'El Ritual del Lobo Alfa'}
          {currentStep === 'little_girl' && 'La Curiosidad de la Niña Fizgona'}
          {currentStep === 'witch' && 'Las Redomas de la Bruja'}
          {currentStep === 'doctor' && 'La Guardia del Doctor'}
          {currentStep === 'dawn' && 'Amanecer en Villa Claraluna'}
        </h2>

        <p className="text-xs text-[#e6bdb8] mt-0.5">
          {currentStep === 'sleep' && 'La bruma plateada envuelve los tejados. Todos cierran los ojos.'}
          {currentStep === 'cupid' && 'Cupido elige a los dos amantes cuyos destinos quedarán entrelazados.'}
          {currentStep === 'seer' && 'Elige a un aldeano para contemplar su alma secreta.'}
          {currentStep === 'werewolves' && 'La manada se reúne en sombras para elegir a su presa.'}
          {currentStep === 'alfa_resurrect' && 'El Lobo Alfa puede resucitar a un muerto y transformarlo en lobo.'}
          {currentStep === 'little_girl' && '¿Se atreverá la Niña Fizgona a abrir los ojos para espiar?'}
          {currentStep === 'witch' && 'Usa la poción de curación o la poción de veneno de la bruja.'}
          {currentStep === 'doctor' && 'Aplica ungüentos sagrados para resguardar a un aldeano de las fauces.'}
          {currentStep === 'dawn' && 'El canto del gallo y las campanas despiertan a la asamblea.'}
        </p>
      </div>

      {/* STEP 1: SLEEP */}
      {currentStep === 'sleep' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-[#171b26] border border-white/5 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#262a35] flex items-center justify-center text-[#4cd7f6] shadow-inner">
              <span className="material-symbols-outlined text-[36px] animate-pulse">
                bedtime
              </span>
            </div>
            <p className="text-xs text-[#dfe2f1] max-w-sm">
              Cae la medianoche. Los habitantes reposan en sus lechos. Solo despertarán aquellos convocados por su linaje.
            </p>
            <button
              onClick={() => {
                if (nightNumber === 1 && hasCupidAlive) {
                  handleStepTransition('cupid');
                } else if (hasSeerAlive) {
                  handleStepTransition('seer');
                } else {
                  handleStepTransition('werewolves');
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#4cd7f6] hover:bg-[#38bdf8] text-[#001f26] font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2"
            >
              Iniciar Ronda Nocturna
            </button>
          </div>
        </div>
      )}

      {/* STEP: CUPID */}
      {currentStep === 'cupid' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-pink-400 font-bold">
              Selecciona 2 Aldeanos para ser Los Novios ({selectedLovers.length}/2):
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {livingPlayers.map((player) => {
              const isSelected = selectedLovers.includes(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => handleSelectLover(player.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-pink-950/70 border-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.4)] scale-[1.02]'
                      : 'bg-[#171b26] border-white/5 hover:border-pink-900/40'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border border-pink-400/40"
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">
                        ❤️
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white truncate max-w-full">
                    {player.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleStepTransition(hasSeerAlive ? 'seer' : 'werewolves')}
            disabled={selectedLovers.length < 2}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2 ${
              selectedLovers.length === 2
                ? 'bg-pink-600 hover:bg-pink-500 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            Cupido Duerme · Despertar a la Vidente
          </button>
        </div>
      )}

      {/* STEP: SEER */}
      {currentStep === 'seer' && (
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-[#4cd7f6] font-bold">
            Selecciona un sospechoso para inspeccionar su aura secreta:
          </span>

          <div className="grid grid-cols-3 gap-2">
            {livingPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => {
                  playMysticChime();
                  setSeerTarget(player);
                  const role = ROLE_DEFINITIONS[player.role];
                  setSeerRevealedRole(role.name + ` (${role.category})`);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  seerTarget?.id === player.id
                    ? 'bg-[#0c1f33] border-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.3)] scale-[1.02]'
                    : 'bg-[#171b26] border-white/5 hover:border-white/20'
                }`}
              >
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#4cd7f6]/40"
                />
                <span className="text-xs font-semibold text-white truncate max-w-full">
                  {player.name}
                </span>
              </button>
            ))}
          </div>

          {seerRevealedRole && seerTarget && (
            <div className="p-4 rounded-xl bg-[#0c1f33] border border-[#4cd7f6]/40 flex items-center justify-between gap-3 animate-fadeIn mt-2">
              <div className="flex items-center gap-3">
                <ArcaneSeal role={seerTarget.role} size="md" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#4cd7f6]">
                    Aura Revelada de {seerTarget.name}
                  </span>
                  <span className="font-['Playfair_Display'] text-base font-bold text-white">
                    {seerRevealedRole}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingFichaPlayer(seerTarget)}
                className="px-2.5 py-1.5 rounded-lg bg-[#262a35] hover:bg-[#353944] text-[11px] font-bold text-[#4cd7f6] border border-[#4cd7f6]/30 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                title="Ver ficha oficial 9:16"
              >
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                <span>Ficha 9:16</span>
              </button>
            </div>
          )}

          <button
            onClick={() => handleStepTransition('werewolves')}
            className="w-full py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2"
          >
            La Vidente Duerme · Despertar a los Hombres Lobo
          </button>
        </div>
      )}

      {/* STEP: WEREWOLVES */}
      {currentStep === 'werewolves' && (
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-[#ffb4ab] font-bold">
            Elige la presa que caerá bajo las garras de la manada:
          </span>

          <div className="grid grid-cols-3 gap-2">
            {livingPlayers.map((player) => {
              const isSelected = wolfTargetId === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => {
                    playClickSound();
                    setWolfTargetId(player.id);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/70 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-[1.02]'
                      : 'bg-[#171b26] border-white/5 hover:border-red-900/40'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border border-red-500/40"
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                        <span className="material-symbols-outlined text-[12px]">pets</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white truncate max-w-full">
                    {player.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (hasAlfaAlive && deadPlayers.length > 0 && !alfaUsed) {
                handleStepTransition('alfa_resurrect');
              } else if (hasLittleGirlAlive) {
                handleStepTransition('little_girl');
              } else if (hasWitchAlive) {
                handleStepTransition('witch');
              } else {
                handleStepTransition('doctor');
              }
            }}
            disabled={!wolfTargetId}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2 ${
              wolfTargetId
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            Presa Marcada · Continuar la Noche
          </button>
        </div>
      )}

      {/* STEP: ALFA WEREWOLF RESURRECTION */}
      {currentStep === 'alfa_resurrect' && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-300 text-[24px]">
              workspace_premium
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-200">
                Poder Secreto del Hombre Lobo Alfa
              </span>
              <span className="text-[11px] text-[#e6bdb8]">
                El Alfa puede elegir a un muerto y resucitarlo como Hombre Lobo para su manada.
              </span>
            </div>
          </div>

          <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
            Selecciona a un caído para transformarlo en lobo (opcional):
          </span>

          <div className="grid grid-cols-2 gap-2">
            {deadPlayers.map((player) => {
              const isSelected = alfaTargetDeadId === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => {
                    playWolfHowl();
                    setAlfaTargetDeadId(isSelected ? null : player.id);
                  }}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-900/60 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                      : 'bg-[#171b26] border-white/5 hover:border-red-500/30'
                  }`}
                >
                  <img
                    src={player.avatarUrl}
                    alt={player.name}
                    className="w-9 h-9 rounded-full object-cover grayscale"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white">{player.name}</span>
                    <span className="text-[10px] text-amber-300">
                      {isSelected ? '✓ Resucitar como Lobo' : 'Caído'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (alfaTargetDeadId) setAlfaUsed(true);
              handleStepTransition(
                hasLittleGirlAlive
                  ? 'little_girl'
                  : hasWitchAlive
                  ? 'witch'
                  : 'doctor'
              );
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2"
          >
            {alfaTargetDeadId ? 'Resucitar e Iniciar Transformación' : 'Omitir Resurrección Esta Noche'}
          </button>
        </div>
      )}

      {/* STEP: LITTLE GIRL PEEK */}
      {currentStep === 'little_girl' && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 flex flex-col items-center text-center gap-3">
            <span className="material-symbols-outlined text-purple-300 text-[36px]">
              visibility
            </span>
            <div>
              <h3 className="font-['Playfair_Display'] text-base font-bold text-white">
                El Espionaje de la Niña Fizgona
              </h3>
              <p className="text-xs text-[#e6bdb8] mt-0.5 max-w-sm">
                La niña puede entreabrir los ojos para intentar vislumbrar qué aldeanos se mueven en la sombra.
              </p>
            </div>

            {peekResult ? (
              <div className="p-3 rounded-lg bg-black/50 border border-purple-400 text-xs text-purple-200">
                {peekResult}
              </div>
            ) : (
              <button
                onClick={handlePeekLittleGirl}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Fizgonear a los Lobos
              </button>
            )}
          </div>

          <button
            onClick={() => handleStepTransition(hasWitchAlive ? 'witch' : 'doctor')}
            className="w-full py-3 px-4 rounded-xl bg-[#262a35] hover:bg-[#353944] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2"
          >
            La Niña Cierra los Ojos · Continuar
          </button>
        </div>
      )}

      {/* STEP: WITCH POTIONS */}
      {currentStep === 'witch' && (
        <div className="flex flex-col gap-3 animate-fadeIn">
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[22px]">
                science
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-200">Poción de Curación</span>
                <span className="text-[10px] text-[#e6bdb8]">Salva a la víctima de los lobos</span>
              </div>
            </div>
            <button
              onClick={() => {
                playMysticChime();
                setWitchSavedVictim(!witchSavedVictim);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                witchSavedVictim
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-[#262a35] text-emerald-300 hover:bg-[#353944]'
              }`}
            >
              {witchSavedVictim ? '✓ Curación Usada' : 'Usar Curación'}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-wider text-purple-300 font-bold">
              Poción de Veneno (opcional, elimina a un sospechoso):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {livingPlayers.map((player) => {
                const isPoisoned = witchPoisonTargetId === player.id;
                return (
                  <button
                    key={player.id}
                    onClick={() => {
                      playClickSound();
                      setWitchPoisonTargetId(isPoisoned ? null : player.id);
                    }}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isPoisoned
                        ? 'bg-purple-950/70 border-purple-500 text-purple-200'
                        : 'bg-[#171b26] border-white/5 hover:border-purple-900/30 text-white'
                    }`}
                  >
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-[11px] font-semibold truncate max-w-full">
                      {player.name}
                    </span>
                    {isPoisoned && (
                      <span className="text-[9px] text-purple-400 font-bold">Envenenar</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleStepTransition(hasDoctorAlive ? 'doctor' : 'dawn')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2"
          >
            La Bruja Guarda sus Frascos · Continuar
          </button>
        </div>
      )}

      {/* STEP: DOCTOR */}
      {currentStep === 'doctor' && (
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider text-[#4cd7f6] font-bold">
            Elige al aldeano al que aplicarás el bálsamo protector:
          </span>

          <div className="grid grid-cols-3 gap-2">
            {livingPlayers.map((player) => {
              const isSelected = doctorTargetId === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => {
                    playClickSound();
                    setDoctorTargetId(player.id);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.3)] scale-[1.02]'
                      : 'bg-[#171b26] border-white/5 hover:border-cyan-900/40'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#4cd7f6]/40"
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#03b5d3] text-black flex items-center justify-center text-[10px]">
                        <span className="material-symbols-outlined text-[12px]">medical_services</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white truncate max-w-full">
                    {player.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleStepTransition('dawn')}
            disabled={!doctorTargetId}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer mt-2 ${
              doctorTargetId
                ? 'bg-gradient-to-r from-[#ffb95f] to-[#ffddb8] text-[#2a1700]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            Amanecer en Villa Claraluna
          </button>
        </div>
      )}

      {/* STEP: DAWN */}
      {currentStep === 'dawn' && nightReport && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {nightReport.saved && nightReport.victims.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#09232c] border border-[#03b5d3]/50 flex flex-col items-center text-center gap-3 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-[#03b5d3]/20 text-[#4cd7f6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">health_and_safety</span>
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-white">
                  ¡El Sol Brilla en Villa Claraluna!
                </h3>
                <p className="text-xs text-[#e6bdb8] mt-1 max-w-sm">
                  Las oraciones y pociones fueron efectivas. ¡Ningún aldeano ha perecido esta noche!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {nightReport.victims.map((victim) => (
                <div
                  key={victim.id}
                  className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center gap-3 shadow-xl"
                >
                  <img
                    src={victim.avatarUrl}
                    alt={victim.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-500 filter grayscale"
                  />
                  <div className="flex flex-col">
                    <h3 className="font-['Playfair_Display'] text-lg font-bold text-white">
                      {victim.name} ha muerto
                    </h3>
                    <span className="text-xs text-red-200">
                      {victim.id === nightReport.heartbrokenLover?.id
                        ? '❤️ Falleció de tristeza tras la muerte de su amor.'
                        : 'Devorado por las bestias o envenenado antes del alba.'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {nightReport.convertedWolf && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/80 to-amber-950/80 border border-amber-400/50 flex items-center gap-3 shadow-lg">
              <ArcaneSeal role="alfa_werewolf" size="sm" />
              <div className="flex flex-col text-xs">
                <span className="font-bold text-amber-200">
                  ¡{nightReport.convertedWolf.name} ha resucitado como Hombre Lobo!
                </span>
                <span className="text-[#e6bdb8]">
                  El rito arcano del Lobo Alfa ha tenido éxito. Ahora sirve a la manada.
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              playChurchBell();
              onGoToTrial();
            }}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#ffb95f] via-[#d97706] to-[#ffb95f] text-[#2a1700] font-['Playfair_Display'] text-base font-bold shadow-[0_0_20px_rgba(255,185,95,0.3)] hover:shadow-[0_0_28px_rgba(255,185,95,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-[22px]">gavel</span>
            <span>Convocar al Juicio del Pueblo</span>
          </button>
        </div>
      )}

      {/* Official 9:16 Codex Modal */}
      <OfficialCodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
        initialRole={codexRole}
      />

      {/* Single Player 9:16 Ficha Preview Modal */}
      {viewingFichaPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative flex flex-col items-center max-w-sm w-full">
            <button
              onClick={() => {
                playClickSound();
                setViewingFichaPlayer(null);
              }}
              className="self-end mb-2 w-9 h-9 rounded-full bg-[#262a35] hover:bg-[#353944] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <OfficialFichaCard
              role={viewingFichaPlayer.role}
              player={viewingFichaPlayer}
              isFlipped={true}
              size="md"
            />
          </div>
        </div>
      )}
    </div>
  );
};
