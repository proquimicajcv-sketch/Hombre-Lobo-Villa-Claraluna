import React from 'react';
import { Player, AccusationEntry } from '../types/game';
import { ROLE_DEFINITIONS } from '../data/initialData';
import { ArcaneSeal } from './ArcaneSeal';
import { OfficialCodexModal } from './OfficialCodexModal';
import { OfficialFichaCard } from './OfficialFichaCard';
import {
  playChurchBell,
  playGavelStrike,
  playClickSound,
} from '../utils/audio';

interface TrialScreenProps {
  players: Player[];
  dayNumber: number;
  accusations: AccusationEntry[];
  onAddAccusation: (targetName: string, text: string, isGesture?: boolean) => void;
  onLynchPlayer: (playerId: string) => void;
  onHunterShoot: (targetId: string) => void;
  onStartNextNight: () => void;
  onResetGame: () => void;
  onCastVote?: (targetId: string | null) => void;
}

export const TrialScreen: React.FC<TrialScreenProps> = ({
  players,
  dayNumber,
  accusations,
  onAddAccusation,
  onLynchPlayer,
  onHunterShoot,
  onStartNextNight,
  onResetGame,
  onCastVote,
}) => {
  const [selectedTargetId, setSelectedTargetId] = React.useState<string | null>(null);
  const [votedPlayerId, setVotedPlayerId] = React.useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = React.useState(60);
  const [isTimerRunning, setIsTimerRunning] = React.useState(true);
  const [customAccusation, setCustomAccusation] = React.useState('');
  const [hunterShooting, setHunterShooting] = React.useState<Player | null>(null);
  const [isCodexOpen, setIsCodexOpen] = React.useState(false);
  const [viewingFichaPlayer, setViewingFichaPlayer] = React.useState<Player | null>(null);

  // Current user
  const currentUser = players.find((p) => p.isCurrentUser) || players[0];
  const isMuteDrunkard = currentUser.role === 'mute_drunkard';
  const mayorPlayer = players.find((p) => p.isMayor && p.isAlive);

  // 1-Minute Maximum Countdown timer
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            playChurchBell();
            setIsTimerRunning(false);
            // 60-second limit reached: auto execute candidate with highest votes
            const highestCandidate = [...players]
              .filter((p) => p.isAlive)
              .sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
            if (highestCandidate && (highestCandidate.votes || 0) > 0) {
              onLynchPlayer(highestCandidate.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, players]);

  const livingPlayers = players.filter((p) => p.isAlive);
  const deadPlayers = players.filter((p) => !p.isAlive);

  // Victory checks
  const livingWolves = livingPlayers.filter(
    (p) => p.role === 'werewolf' || p.role === 'alfa_werewolf'
  );
  const livingTown = livingPlayers.filter(
    (p) => p.role !== 'werewolf' && p.role !== 'alfa_werewolf'
  );

  // Lovers special victory: if only the 2 lovers are alive
  const loversAlive = livingPlayers.filter((p) => p.isLover);
  const isLoversVictory =
    livingPlayers.length === 2 &&
    loversAlive.length === 2 &&
    loversAlive[0].loverId === loversAlive[1].id;

  const isWerewolfVictory =
    !isLoversVictory &&
    livingWolves.length >= livingTown.length &&
    livingWolves.length > 0;
  const isVillageVictory = !isLoversVictory && livingWolves.length === 0;
  const isGameOver = isLoversVictory || isWerewolfVictory || isVillageVictory;

  // Calculate vote totals (Alcalde has 2x votes!)
  const getVotesForPlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (player?.votes && player.votes > 0) {
      return player.votes;
    }
    if (votedPlayerId === playerId) {
      return currentUser.isMayor ? 2 : 1;
    }
    return 0;
  };

  const handleVote = (playerId: string) => {
    playClickSound();
    const nextTarget = votedPlayerId === playerId ? null : playerId;
    setVotedPlayerId(nextTarget);
    onCastVote?.(nextTarget);
  };

  const handleExecuteLynch = () => {
    const target = livingPlayers.find((p) => p.id === (votedPlayerId || selectedTargetId));
    if (!target) return;

    playGavelStrike();
    setTimeout(() => {
      playChurchBell();
    }, 400);

    // If target is the Hunter, trigger dying retaliation shot
    if (target.role === 'hunter') {
      setHunterShooting(target);
    } else {
      onLynchPlayer(target.id);
    }
  };

  const handleConfirmHunterShot = (shotTargetId: string) => {
    if (!hunterShooting) return;
    playGavelStrike();
    onHunterShoot(shotTargetId);
    onLynchPlayer(hunterShooting.id);
    setHunterShooting(null);
  };

  const handleQuickGesture = (gestureText: string) => {
    if (!selectedTargetId) return;
    const target = players.find((p) => p.id === selectedTargetId);
    if (!target) return;
    onAddAccusation(target.name, gestureText, true);
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2f1] max-w-2xl mx-auto px-4 pt-2 pb-24">
      {/* Game Over Banner */}
      {isGameOver && (
        <div className="mb-5 p-6 rounded-2xl bg-gradient-to-b from-[#1c1f2a] to-[#0a0e18] border-2 border-[#ffb4ab]/50 shadow-[0_0_30px_rgba(255,180,171,0.2)] text-center flex flex-col items-center gap-3 animate-fadeIn">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isLoversVictory
                ? 'bg-pink-950/60 border-2 border-pink-500 text-pink-400'
                : isVillageVictory
                ? 'bg-amber-950/60 border-2 border-amber-500 text-amber-400'
                : 'bg-red-950/60 border-2 border-red-500 text-red-400'
            }`}
          >
            <span className="material-symbols-outlined text-[36px]">
              {isLoversVictory ? 'favorite' : isVillageVictory ? 'emoji_events' : 'pets'}
            </span>
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-white">
            {isLoversVictory
              ? '¡Triunfo del Amor Secreto!'
              : isVillageVictory
              ? '¡Victoria para Villa Claraluna!'
              : '¡La Manada de Lobos Conquista la Villa!'}
          </h2>

          <p className="text-xs text-[#e6bdb8] max-w-sm">
            {isLoversVictory
              ? 'Los dos amantes unidos por Cupido han sobrevivido a la sospecha y a los colmillos. Reinarán juntos sobre las cenizas.'
              : isVillageVictory
              ? 'Todas las bestias han sido ajusticiadas en la hoguera. Los supervivientes reconstruirán Villa Claraluna en paz.'
              : 'El Lobo Alfa y su manada superan en número al concejo. La noche eterna cae para siempre.'}
          </p>

          <button
            onClick={() => {
              playClickSound();
              onResetGame();
            }}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-red-600/40 transition-all cursor-pointer mt-2"
          >
            Regresar al Lobby y Jugar Otra Vez
          </button>
        </div>
      )}

      {/* Hunter Dying Shot Modal */}
      {hunterShooting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-[#171b26] border-2 border-amber-500/50 p-5 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <ArcaneSeal role="hunter" size="md" />
              <div>
                <h3 className="font-['Playfair_Display'] text-lg font-bold text-amber-300">
                  ¡Último Disparo del Cazador!
                </h3>
                <p className="text-xs text-[#e6bdb8]">
                  {hunterShooting.name} ha sido condenado. Antes de exhalar su alma, dispara su mosquete a un sospechoso:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mt-2">
              {livingPlayers
                .filter((p) => p.id !== hunterShooting.id)
                .map((target) => (
                  <button
                    key={target.id}
                    onClick={() => handleConfirmHunterShot(target.id)}
                    className="p-2.5 rounded-xl bg-[#262a35] hover:bg-amber-950/60 border border-white/5 hover:border-amber-400 flex items-center gap-2 transition-all cursor-pointer text-left"
                  >
                    <img
                      src={target.avatarUrl}
                      alt={target.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-white truncate">
                      {target.name}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Trial Header with Astrolabe Timer */}
      <div className="relative rounded-2xl overflow-hidden bg-[#171b26] border border-white/5 p-4 shadow-xl mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb95f] text-[20px]">
              local_fire_department
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffb95f]">
              Día #{dayNumber} · El Tribunal de Villa Claraluna
            </span>
          </div>

          <div className="flex items-center gap-2">
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

            {/* Timer Widget */}
            <div className="flex items-center gap-2 bg-[#0a0e18] px-3 py-1 rounded-full border border-white/5">
              <span className="material-symbols-outlined text-[16px] text-[#ffb95f]">
                hourglass_top
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {Math.floor(timerSeconds / 60)}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </span>
              <button
                onClick={() => {
                  playClickSound();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="text-[#ffb95f] hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isTimerRunning ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <h2 className="font-['Playfair_Display'] text-xl font-bold text-white mt-1">
          Juicio por Linchamiento
        </h2>

        {mayorPlayer && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-300">
            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
            <span>
              Alcalde activo: <strong className="text-white">{mayorPlayer.name}</strong> (su voto vale doble x2)
            </span>
          </div>
        )}
      </div>

      {/* Living Aldeanos for voting */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-white">
            Habitantes Vivos ({livingPlayers.length})
          </span>
          <span className="text-[10px] text-[#ffb4ab]">
            Toca para seleccionar y votar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {livingPlayers.map((player) => {
            const isVoted = votedPlayerId === player.id;
            const isSelected = selectedTargetId === player.id;
            const voteScore = getVotesForPlayer(player.id);

            return (
              <div
                key={player.id}
                onClick={() => {
                  playClickSound();
                  setSelectedTargetId(player.id);
                }}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all cursor-pointer relative ${
                  isVoted
                    ? 'bg-red-950/60 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.35)]'
                    : isSelected
                    ? 'bg-[#262a35] border-[#ffb95f]'
                    : 'bg-[#1c1f2a] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    {player.isMayor && (
                      <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[9px] font-bold">
                        x2
                      </span>
                    )}
                    {isVoted && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {player.name}
                    </span>
                    <span className="text-[10px] text-[#e6bdb8]">
                      {player.isMayor ? 'Alcalde (Voto x2)' : isVoted ? 'Tu Voto' : 'Sospechoso'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(player.id);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                      isVoted
                        ? 'bg-red-600 text-white'
                        : 'bg-[#262a35] text-[#ffb95f] hover:bg-[#353944]'
                    }`}
                  >
                    {isVoted ? 'Votado' : 'Acusar'}
                  </button>
                  <span className="text-[10px] font-mono font-bold text-white/70">
                    {voteScore} {voteScore === 1 ? 'Punto' : 'Puntos'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dead players graveyard strip */}
      {deadPlayers.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-[#0a0e18] border border-white/5 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
            Fallecidos en la Niebla de Villa Claraluna ({deadPlayers.length})
          </span>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {deadPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-[#171b26]/50 border border-white/5 shrink-0 opacity-60"
              >
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="w-7 h-7 rounded-full object-cover grayscale"
                />
                <span className="text-xs text-zinc-400 line-through">
                  {player.name}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">
                  ({ROLE_DEFINITIONS[player.role]?.name || 'Aldeano'})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lynching Action Button */}
      {!isGameOver && (
        <div className="mb-4">
          <button
            onClick={handleExecuteLynch}
            disabled={!votedPlayerId && !selectedTargetId}
            className={`w-full py-4 px-6 rounded-xl font-['Playfair_Display'] text-base font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              votedPlayerId || selectedTargetId
                ? 'bg-gradient-to-r from-red-800 via-red-600 to-red-800 hover:shadow-red-600/40 active:scale-[0.99]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">gavel</span>
            <span>
              Dictar Sentencia y Linchar a{' '}
              {players.find((p) => p.id === (votedPlayerId || selectedTargetId))?.name || 'Sospechoso'}
            </span>
          </button>
        </div>
      )}

      {/* Special Mute Drunkard Gestures Bar or Standard Accusations */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-white">
            {isMuteDrunkard
              ? 'Lenguaje Mímico del Borracho Mudo'
              : 'Rumores & Testimonios del Concejo'}
          </span>
          {isMuteDrunkard && (
            <span className="text-[10px] text-amber-400 font-bold">
              ¡Solo puedes comunicarte con señas!
            </span>
          )}
        </div>

        {/* Input box */}
        {!isMuteDrunkard && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customAccusation}
              onChange={(e) => setCustomAccusation(e.target.value)}
              placeholder={
                selectedTargetId
                  ? `Acusar a ${players.find((p) => p.id === selectedTargetId)?.name}...`
                  : 'Selecciona a un sospechoso arriba para acusar...'
              }
              className="flex-1 px-3 py-2 rounded-xl bg-[#171b26] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ffb95f]"
            />
            <button
              onClick={() => {
                if (customAccusation.trim() && selectedTargetId) {
                  const target = players.find((p) => p.id === selectedTargetId);
                  if (target) {
                    onAddAccusation(target.name, customAccusation.trim());
                    setCustomAccusation('');
                  }
                }
              }}
              disabled={!customAccusation.trim() || !selectedTargetId}
              className="px-3 py-2 rounded-xl bg-[#262a35] hover:bg-[#353944] disabled:opacity-40 text-xs font-bold text-[#ffb95f] transition-colors cursor-pointer"
            >
              Testificar
            </button>
          </div>
        )}

        {/* Quick suspicion / mímica gestures */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(isMuteDrunkard
            ? [
                '🤫 (Pone dedo en labios y señala con terror)',
                '👉🐺 (Imita garras afiladas y aullido mudo)',
                '🍺 (Ofrece un brindis y niega con la cabeza)',
                '😱 (Señala hacia la arboleda temblando)',
              ]
            : [
                'Merodeaba fuera de su cabaña',
                'No miró a los ojos al despertar',
                'Sus manos huelen a sangre',
              ]
          ).map((phrase) => (
            <button
              key={phrase}
              onClick={() => handleQuickGesture(phrase)}
              disabled={!selectedTargetId}
              className="px-2.5 py-1 rounded-full bg-[#1c1f2a] hover:bg-[#262a35] disabled:opacity-30 border border-white/5 text-[10px] text-[#e6bdb8] whitespace-nowrap transition-colors cursor-pointer"
            >
              + {phrase}
            </button>
          ))}
        </div>

        {/* Accusations Feed */}
        <div className="flex flex-col gap-2 mt-1">
          {accusations.map((acc) => (
            <div
              key={acc.id}
              className={`p-3 rounded-xl border flex flex-col gap-1 text-xs ${
                acc.isGesture
                  ? 'bg-amber-950/30 border-amber-500/30'
                  : 'bg-[#171b26] border-white/5'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-[#ffb4ab]">
                  {acc.author} contra <span className="text-white underline">{acc.target}</span>
                </span>
                <span className="text-zinc-500 font-mono">{acc.timestamp}</span>
              </div>
              <p className="text-[#dfe2f1] text-[11px] italic">
                "{acc.message}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Button to proceed to next night if still playing */}
      {!isGameOver && (
        <div className="mt-5">
          <button
            onClick={onStartNextNight}
            className="w-full py-3 px-4 rounded-xl bg-[#171b26] hover:bg-[#262a35] border border-white/10 text-xs font-bold text-[#4cd7f6] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">nights_stay</span>
            <span>El Sol se Oculta · Comenzar Noche #{dayNumber + 1}</span>
          </button>
        </div>
      )}

      {/* Official 9:16 Codex Modal */}
      <OfficialCodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
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
