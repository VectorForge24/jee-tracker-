import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, BrainCircuit, Clock } from 'lucide-react';

const formatTime = (totalSeconds, showHours = false) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (showHours || h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const ScrollPicker = ({ max, value, onChange, label }) => {
  const containerRef = useRef(null);
  useEffect(() => { if (containerRef.current) containerRef.current.scrollTop = value * 48; }, []);
  const handleScroll = (e) => { const val = Math.round(e.target.scrollTop / 48); if (val >= 0 && val <= max) onChange(val); };
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-extrabold tracking-widest text-slate-400 mb-2 uppercase">{label}</span>
      <div ref={containerRef} className="h-[144px] w-20 md:w-24 bg-white/10 dark:bg-slate-800/50 rounded-2xl overflow-y-auto snap-y snap-mandatory relative shadow-inner border border-white/20 dark:border-white/5 backdrop-blur-md" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }} onScroll={handleScroll}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        <div className="h-[48px]"></div>
        {Array.from({ length: max + 1 }).map((_, i) => (<div key={i} className={`h-[48px] flex items-center justify-center snap-center text-3xl font-black transition-colors ${value === i ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>{String(i).padStart(2, '0')}</div>))}
        <div className="h-[48px]"></div>
      </div>
    </div>
  );
};

export default function TimerView({ themeToggle, timerMode, setTimerMode, pomodoroType, setPomodoroType, timeLeft, setTimeLeft, totalTime, setTotalTime, isRunning, setIsRunning }) {
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(0);
  const [inputS, setInputS] = useState(0);

  useEffect(() => {
    if (timerMode === 'Countdown') {
      setInputH(Math.floor(totalTime / 3600)); setInputM(Math.floor((totalTime % 3600) / 60)); setInputS(totalTime % 60);
    }
  }, []);

  const handleModeChange = (mode) => {
    if (timerMode === mode) return;
    setIsRunning(false); setTimerMode(mode);
    if (mode === 'Pomodoro') { const t = pomodoroType === 'Focus' ? 1500 : pomodoroType === 'Short' ? 300 : 900; setTimeLeft(t); setTotalTime(t); } 
    else if (mode === 'Stopwatch') { setTimeLeft(0); setTotalTime(0); } 
    else if (mode === 'Countdown') { const t = inputH * 3600 + inputM * 60 + inputS; setTimeLeft(t); setTotalTime(t); }
  };

  const handlePomodoroChange = (type) => {
    if (pomodoroType === type) return;
    setIsRunning(false); setPomodoroType(type);
    const t = type === 'Focus' ? 1500 : type === 'Short' ? 300 : 900; setTimeLeft(t); setTotalTime(t);
  };

  const handleScrollChange = (type, val) => {
    let newH = inputH, newM = inputM, newS = inputS;
    if(type === 'H') { setInputH(val); newH = val; } if(type === 'M') { setInputM(val); newM = val; } if(type === 'S') { setInputS(val); newS = val; }
    if (timerMode === 'Countdown' && !isRunning) { const newTime = newH * 3600 + newM * 60 + newS; setTimeLeft(newTime); setTotalTime(newTime); }
  };

  const handleToggle = () => { if (timerMode === 'Countdown' && timeLeft === 0) return; setIsRunning(!isRunning); };
  const handleReset = () => {
    setIsRunning(false);
    if (timerMode === 'Pomodoro') setTimeLeft(pomodoroType === 'Focus' ? 1500 : pomodoroType === 'Short' ? 300 : 900);
    else if (timerMode === 'Stopwatch') setTimeLeft(0); else setTimeLeft(totalTime);
  };

  const isCompleted = timeLeft === 0 && !isRunning && totalTime > 0 && timerMode !== 'Stopwatch';
  const showPickers = timerMode === 'Countdown' && !isRunning && !isCompleted && timeLeft === totalTime;
  const glowClass = isRunning ? 'bg-blue-500 opacity-40' : isCompleted ? 'bg-red-500 opacity-40' : 'bg-transparent opacity-0';
  const textColorClass = isCompleted ? 'text-red-500 dark:text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-slate-800 dark:text-white drop-shadow-md';

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl h-full w-full flex flex-col transition-colors duration-300 relative rounded-[32px] shadow-2xl border border-white/20 overflow-hidden mb-2 mr-2">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-300/40 dark:border-slate-700/50 shrink-0">
        <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white tracking-tight select-none">Focus Timer</h2>
        {themeToggle}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center relative">
        <div className="relative flex w-[350px] bg-slate-300/30 dark:bg-black/30 backdrop-blur-xl p-1.5 rounded-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/5 z-10 mb-8">
          <div className="absolute top-1.5 bottom-1.5 rounded-full bg-white/90 dark:bg-white/20 shadow-md border border-white/60 dark:border-white/30 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
               style={{ width: 'calc(33.33% - 4px)', transform: `translateX(${['Pomodoro', 'Stopwatch', 'Countdown'].indexOf(timerMode) * 100}%)` }}></div>
          {['Pomodoro', 'Stopwatch', 'Countdown'].map(mode => (
            <button key={mode} onClick={() => handleModeChange(mode)} className={`relative flex-1 flex justify-center items-center py-1.5 text-sm z-10 transition-all duration-300 ${timerMode === mode ? 'text-slate-900 dark:text-white font-black drop-shadow-sm scale-105' : 'text-slate-500/60 dark:text-slate-300/50 font-bold hover:text-slate-600/80 dark:hover:text-slate-300/70'}`}>
              {mode === 'Pomodoro' ? <BrainCircuit size={16} className="mr-1.5"/> : mode === 'Stopwatch' ? <TimerIcon size={16} className="mr-1.5"/> : <Clock size={16} className="mr-1.5"/>}
              {mode}
            </button>
          ))}
        </div>

        {timerMode === 'Pomodoro' && (
          <div className="flex gap-4 mb-8 z-10">
            {['Focus', 'Short', 'Long'].map(type => (
              <button key={type} onClick={() => handlePomodoroChange(type)} className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all border ${pomodoroType === type ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40 backdrop-blur-md shadow-lg scale-105' : 'bg-white/30 dark:bg-black/20 text-slate-600 dark:text-slate-400 border-white/20 hover:bg-white/50 dark:hover:bg-white/10'}`}>
                {type === 'Focus' ? 'Deep Work' : type === 'Short' ? 'Short Break' : 'Long Break'}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center items-center w-full relative mb-12">
          <div className={`absolute w-72 h-72 md:w-[450px] md:h-[450px] rounded-full blur-[80px] transition-all duration-1000 pointer-events-none ${glowClass}`}></div>
          {showPickers ? (
            <div className="relative z-10 flex items-center gap-2 md:gap-4">
              <ScrollPicker max={24} value={inputH} onChange={(v) => handleScrollChange('H', v)} label="Hours" />
              <span className="text-3xl font-black text-slate-400 dark:text-slate-600 pb-2">:</span>
              <ScrollPicker max={59} value={inputM} onChange={(v) => handleScrollChange('M', v)} label="Minutes" />
              <span className="text-3xl font-black text-slate-400 dark:text-slate-600 pb-2">:</span>
              <ScrollPicker max={59} value={inputS} onChange={(v) => handleScrollChange('S', v)} label="Seconds" />
            </div>
          ) : (
            <div className={`relative z-10 text-[5rem] md:text-[8rem] font-black ${textColorClass} tabular-nums tracking-tighter leading-none transition-colors duration-500`}>
              {formatTime(timeLeft, timerMode === 'Stopwatch' || timerMode === 'Countdown' || timeLeft >= 3600)}
            </div>
          )}
          <p className={`text-sm font-bold mt-8 uppercase tracking-[0.3em] z-10 transition-colors duration-500 ${isCompleted ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
            {timerMode === 'Stopwatch' ? 'Elapsed Time' : isCompleted ? (timerMode === 'Countdown' ? "Time's up!" : 'Grind Complete') : isRunning ? 'Focusing...' : 'Time Remaining'}
          </p>
        </div>

        <div className="flex items-center gap-8 pb-12 z-10">
          <button onClick={handleReset} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md w-14 h-14 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform shadow-lg border border-white/20"><RotateCcw size={24} /></button>
          <button onClick={handleToggle} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 ${isRunning ? 'bg-amber-500/90 text-white shadow-amber-500/50 backdrop-blur-md border border-white/20' : 'bg-blue-600/90 text-white shadow-blue-600/50 backdrop-blur-md border border-white/20'}`}>
            {isRunning ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-2" />}
          </button>
          <div className="w-14 h-14"></div> 
        </div>
      </div>
    </div>
  );
}