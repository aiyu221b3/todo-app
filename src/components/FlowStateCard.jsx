import React, { useState } from 'react';

const FlowStateCard = ({ todos, addTodo, completeHeadTask }) => {
    const [isFlowing, setIsFlowing] = useState(false);
    const [selectedMinutes, setSelectedMinutes] = useState(45);
    const [customMinutes, setCustomMinutes] = useState('');

    // Timer State
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // in seconds
    const [activeTaskId, setActiveTaskId] = useState(null); // Track which task we are timing

    // Queue Logic: First uncompleted task
    const queue = todos.filter(t => !t.completed);
    const headTask = queue[0];
    const queueCount = Math.max(0, queue.length - 1);

    // Effect: Auto-reset timer if the active task is no longer the head task (e.g. completed via list)
    React.useEffect(() => {
        if (isRunning && activeTaskId && headTask?.id !== activeTaskId) {
            setIsRunning(false);
            setIsPaused(false);
            setTimeLeft(null);
            setActiveTaskId(null);
        }
    }, [headTask, isRunning, activeTaskId]);

    React.useEffect(() => {
        let interval;
        if (isRunning && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            setIsPaused(false);
            // Optional: Notification or sound here
        }
        return () => clearInterval(interval);
    }, [isRunning, isPaused, timeLeft]);

    const handleStartFlow = () => {
        setIsFlowing(true);
    };

    const handleBeginTask = () => {
        const minutes = customMinutes ? parseInt(customMinutes) : selectedMinutes;
        setTimeLeft(minutes * 60);
        setIsRunning(true);
        setIsPaused(false);
        setActiveTaskId(headTask?.id);
    };

    const handleComplete = () => {
        completeHeadTask();
        setIsRunning(false); // Reset timer state for next task
        setIsPaused(false);
        setTimeLeft(null);
        setActiveTaskId(null);
    };

    const togglePause = () => {
        if (isRunning) {
            setIsPaused(!isPaused);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const val = e.target.value.trim();
            if (val) {
                addTodo(val, true); // True = Urgent (Prepend)
                e.target.value = '';
            }
        }
    }

    const handleMinuteChange = (e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setCustomMinutes(val);
            if (val) setSelectedMinutes(parseInt(val));
        }
    }

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };


    return (
        <div className="relative z-20 px-6 py-4 perspective-1000 h-[440px]">
            <div className={`relative w-full h-full transition-all duration-700 transform preserve-3d ${isFlowing ? 'rotate-y-180' : ''}`}>

                {/* FRONT: Call to Action */}
                {/* FRONT: Call to Action */}
                <div className="absolute w-full h-full backface-hidden">
                    <div className="glow-border-wrapper h-full">
                        <div className="glass-card rounded-[1.75rem] p-8 relative overflow-hidden h-full flex flex-col justify-center">
                            <div className="relative z-10">
                                <span className="inline-block px-4 py-1.5 bg-orange-100/50 dark:bg-white/5 border border-transparent dark:border-white/10 text-orange-700 dark:text-slate-300 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md">
                                    Deep Work Mode
                                </span>
                                <h2 className="font-display text-4xl leading-tight text-slate-900 dark:text-white mb-6">
                                    Ready to enter<br />your <span className="flow-text">flow state</span>?
                                </h2>
                                <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm mb-8 font-medium">
                                    <span className="material-symbols-rounded text-orange-500 dark:text-indigo-300 mr-2 text-xl">
                                        <span className="dark:hidden">auto_awesome</span>
                                        <span className="hidden dark:inline">bedtime</span>
                                    </span>
                                    Recommended: 45 mins
                                </div>

                                <button
                                    onClick={handleStartFlow}
                                    className="w-full py-4 rounded-2xl flex items-center justify-center font-crimson font-bold text-lg hover:scale-[1.02] transition-transform active:scale-95 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_15px_30px_-5px_rgba(249,115,22,0.4)] dark:silver-btn dark:text-slate-900 dark:shadow-none"
                                >
                                    <span className="material-symbols-rounded mr-2 fill-current">play_arrow</span>
                                    Get into Flow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK: Active Task (Queue Head) */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="glow-border-wrapper h-full">
                        <div className="glass-card rounded-[1.75rem] p-6 relative overflow-hidden h-full flex flex-col items-center text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">

                            {/* Header Label */}
                            <div className="flex flex-col items-center justify-center w-full mb-6 mt-4">
                                <span className={`text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase font-sans transition-all duration-300 ${isRunning ? 'text-orange-500' : ''}`}>
                                    {isRunning ? (isPaused ? 'Paused' : 'Focusing on') : 'Current Task'}
                                </span>
                            </div>

                            {/* Task Area - Display Only */}
                            <div className="w-full px-2 mb-6 flex-grow flex flex-col items-center justify-center min-h-[100px]">
                                {headTask ? (
                                    <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                        <h2 className="font-display text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight break-words text-center mb-2 capitalize drop-shadow-sm">
                                            {headTask.text}
                                        </h2>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center opacity-60">
                                        <span className="material-symbols-rounded text-4xl mb-2 text-slate-300">inbox</span>
                                        <p className="text-slate-400 font-medium text-sm">All caught up!</p>
                                        <p className="text-slate-300 text-xs mt-1">Add tasks below to start flow</p>
                                    </div>
                                )}
                            </div>

                            {/* Duration Selectors OR Timer Display */}
                            <div className="flex items-center justify-center gap-3 mb-8 w-full px-4 h-12">
                                {!isRunning ? (
                                    <>
                                        {[25, 45, 60].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => { setSelectedMinutes(m); setCustomMinutes(''); }}
                                                className={`w-14 h-10 rounded-[1rem] flex items-center justify-center text-sm font-bold transition-all shadow-sm ${selectedMinutes === m
                                                    ? 'bg-slate-900 text-white shadow-md scale-105'
                                                    : 'bg-white text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {m}m
                                            </button>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder="..."
                                            value={customMinutes}
                                            onChange={handleMinuteChange}
                                            className={`w-10 h-10 rounded-[1rem] text-sm font-bold text-center transition-all bg-white text-slate-500 border-none shadow-sm focus:ring-2 focus:ring-slate-200 outline-none placeholder-slate-300`}
                                        />
                                    </>
                                ) : (
                                    <div
                                        onClick={togglePause}
                                        className={`cursor-pointer font-display text-4xl text-slate-800 dark:text-white font-bold tracking-widest animate-in fade-in slide-in-from-bottom-2 select-none transition-opacity ${isPaused ? 'opacity-50 animate-pulse' : ''}`}
                                        title="Click to pause/resume"
                                    >
                                        {timeLeft !== null && formatTime(timeLeft)}
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={isRunning ? handleComplete : handleBeginTask}
                                disabled={!headTask}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center font-crimson font-bold text-lg transition-all 
                                    ${!headTask
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_15px_30px_-5px_rgba(249,115,22,0.4)] hover:scale-[1.02] active:scale-95 dark:silver-btn dark:text-slate-900 dark:shadow-none'
                                    }`}
                            >
                                <span className={`material-symbols-rounded mr-2 text-xl rounded-full p-0.5 ${!headTask ? 'text-slate-400' : 'bg-white/20 text-white dark:text-slate-900 dark:bg-transparent'}`}>
                                    {isRunning ? 'check' : 'play_arrow'}
                                </span>
                                {isRunning ? 'Complete Task' : 'Begin Task'}
                            </button>

                            {/* Queue Indicator */}
                            <div className="mt-4 flex items-center justify-center text-slate-400 text-[10px] font-bold tracking-wide">
                                <span className="material-symbols-rounded text-sm mr-1.5 opacity-60">layers</span>
                                {queueCount} more in queue
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FlowStateCard;
