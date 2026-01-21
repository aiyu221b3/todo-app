/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Terminal,
    BookOpen,
    Code,
    CheckCircle,
    Circle,
    AlertTriangle,
    Zap,
    Layers,
    Calendar,
    Monitor,
    Target,
    PenTool,
    Database,
    FileText,
    ChevronDown,
    ChevronRight,
    Cpu,
    Globe,
    Heart,
    ShieldAlert,
    Cloud,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- FIREBASE SETUP (Dual-Environment Support) ---
// This allows the code to run in Canvas AND in your Vercel deployment without changes.

const getFirebaseConfig = () => {
    if (typeof window.__firebase_config !== 'undefined') {
        return JSON.parse(window.__firebase_config);
    }
    // Fallback for Vercel / Local Environment (CRA/Standard)
    // Note: If using Vite, you may need to switch process.env to import.meta.env manually
    return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
};

// Initialize Firebase only if config is present (prevents crash during setup)
let app, auth, db;
try {
    const config = getFirebaseConfig();
    if (config.apiKey) {
        app = initializeApp(config);
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (e) {
    console.error("Firebase init error:", e);
}

const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'polymath-engine';

// --- INITIAL DATA (Fallbacks) ---

const INITIAL_MASTERY = [
    {
        id: 'python',
        name: 'Python (The Engine)',
        priority: 'Must Have',
        deadline: 'End 2026',
        iconName: 'Terminal',
        topics: [
            { id: 'py1', text: 'Core Syntax & Data Structures (Lists, Dicts, Sets)', done: false },
            { id: 'py2', text: 'OOP (Classes, Inheritance)', done: false },
            { id: 'py3', text: 'NumPy (Arrays, LinAlg, Broadcasting)', done: false },
            { id: 'py4', text: 'Pandas (Data Manipulation)', done: false },
            { id: 'py5', text: 'PyTorch (Tensors, Autograd, NNs) - CRITICAL', done: false },
            { id: 'py6', text: 'Matplotlib/Seaborn (Visualization)', done: false },
            { id: 'py7', text: 'Standard Libs (itertools, collections)', done: false },
            { id: 'py8', text: 'PROJECT: Implement RL Algos from scratch in PyTorch', done: false }
        ]
    },
    {
        id: 'cpp',
        name: 'C++ (The Metal)',
        priority: 'Must Have',
        deadline: 'Mid 2027',
        iconName: 'Cpu',
        topics: [
            { id: 'cpp1', text: 'Core Syntax, Memory (Pointers, Refs)', done: false },
            { id: 'cpp2', text: 'STL (Vectors, Maps, Algos)', done: false },
            { id: 'cpp3', text: 'OOP (Classes, Inheritance, Polymorphism)', done: false },
            { id: 'cpp4', text: 'CS106L Course Completion', done: false },
            { id: 'cpp5', text: 'Implement Linked List', done: false },
            { id: 'cpp6', text: 'Implement Tree Structures', done: false },
            { id: 'cpp7', text: 'Implement Graph Structures', done: false }
        ]
    },
    {
        id: 'sql',
        name: 'SQL (Data)',
        priority: 'Nice to Have',
        deadline: 'When Needed',
        iconName: 'Database',
        topics: [
            { id: 'sql1', text: 'SELECT Queries', done: false },
            { id: 'sql2', text: 'JOIN Operations', done: false },
            { id: 'sql3', text: 'GROUP BY Aggregations', done: false },
            { id: 'sql4', text: 'SQLBolt Tutorial (10-15 hrs)', done: false }
        ]
    },
    {
        id: 'js',
        name: 'JavaScript (Web)',
        priority: 'Optional',
        deadline: 'If Needed',
        iconName: 'Globe',
        topics: [
            { id: 'js1', text: 'Basic Syntax', done: false },
            { id: 'js2', text: 'DOM Manipulation', done: false },
            { id: 'js3', text: 'React Basics (For Demos)', done: false }
        ]
    }
];

const INITIAL_COURSES = [
    { id: 'cs106l', name: 'CS106L (Stanford C++)', priority: 'Must Do', timeline: 'Current', hours: 'Ongoing', status: 'in-progress' },
    { id: 'silver_rl', name: 'David Silver RL (YouTube)', priority: 'Must Do', timeline: 'Now-Early 2026', hours: '6-8 weeks', status: 'in-progress' },
    { id: 'ml_ng', name: 'Andrew Ng ML (Coursera)', priority: 'Must Do', timeline: 'Early 2026', hours: '6-8 weeks', status: 'todo' },
    { id: 'dl_1', name: 'DL Specialization - C1 (NNs)', priority: 'Must Do', timeline: 'Mid 2026', hours: '~3 weeks', status: 'todo' },
    { id: 'dl_2', name: 'DL Specialization - C2 (Tuning)', priority: 'Must Do', timeline: 'Mid 2026', hours: '~3 weeks', status: 'todo' },
    { id: 'dl_4', name: 'DL Specialization - C4 (CNNs)', priority: 'Must Do', timeline: 'Mid 2026', hours: '~3 weeks', status: 'todo' },
    { id: 'spinning', name: 'Spinning Up in Deep RL', priority: 'Must Do', timeline: 'Mid 2026', hours: '4-6 weeks', status: 'todo' },
    { id: '3b1b_la', name: '3B1B: Essence of Linear Algebra', priority: 'Must Do', timeline: '2026', hours: '15 videos', status: 'todo' },
    { id: '3b1b_calc', name: '3B1B: Essence of Calculus', priority: 'Must Do', timeline: '2026', hours: 'Series', status: 'todo' },
    { id: 'fastai', name: 'Fast.ai Practical DL', priority: 'Nice to Have', timeline: 'Alt to Ng', hours: '7-8 weeks', status: 'todo' },
    { id: 'strang', name: 'Gilbert Strang LinAlg (1-10)', priority: 'Nice to Have', timeline: '2026', hours: 'Deep Dive', status: 'todo' },
    { id: 'cs224n', name: 'CS224N: NLP with DL', priority: 'Nice to Have', timeline: '2027', hours: '10 weeks', status: 'todo' },
    { id: 'cs231n', name: 'CS231N: Visual Recognition', priority: 'Skip', timeline: 'If needed', hours: '10 weeks', status: 'todo' },
];

const INITIAL_BOOKS = [
    { id: 'sutton', title: 'RL: An Introduction (Sutton & Barto)', author: 'The Bible', category: 'Must Read', target: 'Ch 1-9 Deeply', status: 'reading' },
    { id: 'math_ml', title: 'Mathematics for ML', author: 'Deisenroth', category: 'Must Read', target: 'Ch 2, 5, 6, 7', status: 'todo' },
    { id: 'dl_goodfellow', title: 'Deep Learning', author: 'Goodfellow et al', category: 'Must Read', target: 'Ch 1-6, 8-9', status: 'todo' },
    { id: 'pytorch_tut', title: 'Deep Learning with PyTorch', author: 'Official Docs', category: 'Must Read', target: 'Tutorials', status: 'todo' },
    { id: 'designing', title: 'Designing Data-Intensive Apps', author: 'Kleppmann', category: 'Should Read', target: 'Part 1 Min', status: 'todo' },
    { id: 'burkov', title: '100-Page ML Book', author: 'Burkov', category: 'Should Read', target: 'Full Book', status: 'todo' },
    { id: 'think_stats', title: 'Think Stats', author: 'Downey', category: 'Should Read', target: 'Practical', status: 'todo' },
    { id: 'marl_book', title: 'Multi-Agent RL', author: 'Survey/Book', category: 'Should Read', target: 'Foundations', status: 'todo' },
    { id: 'king', title: 'On Writing', author: 'Stephen King', category: 'Growth', target: 'Full Book', status: 'todo' },
    { id: 'bird', title: 'Bird by Bird', author: 'Anne Lamott', category: 'Growth', target: 'Full Book', status: 'todo' },
    { id: 'weapons', title: 'Weapons of Math Destruction', author: 'O\'Neil', category: 'Ethics', target: 'Full Book', status: 'todo' },
    { id: 'alignment', title: 'The Alignment Problem', author: 'Christian', category: 'Ethics', target: 'Full Book', status: 'todo' },
    { id: 'sys_design', title: 'System Design Interview', author: 'Alex Xu', category: 'Prep (2029)', target: 'Key Chaps', status: 'todo' },
    { id: 'ml_interview', title: 'Intro to ML Interviews', author: 'Chip Huyen', category: 'Prep (2029)', target: 'Full Book', status: 'todo' },
];

const INITIAL_PAPERS = [
    { id: 'p_marl', name: 'Multi-Agent RL: A Selective Overview', category: 'Foundational', status: 'todo' },
    { id: 'p_qmix', name: 'QMIX: Monotonic Value Function Factorisation', category: 'Foundational', status: 'todo' },
    { id: 'p_mappo', name: 'MAPPO: Surprising Effectiveness of PPO', category: 'Foundational', status: 'todo' },
    { id: 'p_commnet', name: 'CommNet: Learning Multiagent Communication', category: 'Foundational', status: 'todo' },
    { id: 'p_dqn', name: 'DQN: Playing Atari with Deep RL', category: 'Deep RL Classics', status: 'todo' },
    { id: 'p_a3c', name: 'A3C: Asynchronous Advantage Actor-Critic', category: 'Deep RL Classics', status: 'todo' },
    { id: 'p_ppo', name: 'PPO: Proximal Policy Optimization', category: 'Deep RL Classics', status: 'todo' },
    { id: 'p_sac', name: 'SAC: Soft Actor-Critic', category: 'Deep RL Classics', status: 'todo' },
    { id: 'p_div1', name: 'Agent Diversity in MARL - Paper 1', category: 'Research Focus', status: 'todo' },
    { id: 'p_div2', name: 'Agent Diversity in MARL - Paper 2', category: 'Research Focus', status: 'todo' },
    { id: 'p_emerge', name: 'Emergent Communication in Multi-Agent Systems', category: 'Research Focus', status: 'todo' },
    { id: 'p_robot', name: 'Multi-Robot Coordination', category: 'Applications', status: 'todo' },
    { id: 'p_swarm', name: 'Swarm Robotics', category: 'Applications', status: 'todo' },
    { id: 'p_eth1', name: 'AI Ethics: Fairness', category: 'Ethics (UNESCO)', status: 'todo' },
    { id: 'p_eth2', name: 'AI Ethics: Accountability', category: 'Ethics (UNESCO)', status: 'todo' },
];

const ZERO_IQ_TASKS = [
    "Drink a glass of water.",
    "Put on your headphones.",
    "Open VS Code (don't type, just open it).",
    "Read ONE paragraph of Sutton & Barto.",
    "Do 5 minutes of 'Garbage Code'.",
    "Stand up and stretch.",
    "Watch 5 mins of a 3B1B video."
];

// --- COMPONENTS ---

const TrackerGrid = ({ log, onToggle }) => {
    const days = Array.from({ length: 365 }, (_, i) => {
        const date = new Date(2026, 0, 1);
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Calendar size={20} className="text-cyan-400" />
                    Sprint Log (2026)
                </h3>
                <div className="flex gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                        <span className="text-slate-400">Deep Work</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-slate-700"></div>
                        <span className="text-slate-400">Null</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1 pb-2 overflow-x-auto">
                {days.map(dateStr => {
                    const status = log[dateStr] || 'none';
                    let bgColor = 'bg-slate-800/50';
                    if (status === 'good') bgColor = 'bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.4)]';

                    return (
                        <div
                            key={dateStr}
                            onClick={() => onToggle(dateStr)}
                            title={dateStr}
                            className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 hover:z-10 ${bgColor}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

const ProgressBar = ({ percent, color = 'cyan' }) => (
    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
        <div
            className={`h-1.5 rounded-full transition-all duration-500 ${color === 'cyan' ? 'bg-cyan-500' :
                color === 'purple' ? 'bg-purple-500' :
                    color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
            style={{ width: `${percent}%` }}
        ></div>
    </div>
);

const getIcon = (name) => {
    switch (name) {
        case 'Terminal': return <Terminal size={18} className="text-yellow-400" />;
        case 'Cpu': return <Cpu size={18} className="text-blue-400" />;
        case 'Database': return <Database size={18} className="text-purple-400" />;
        case 'Globe': return <Globe size={18} className="text-emerald-400" />;
        default: return <Code size={18} />;
    }
};

export default function AyushiCommandCenter() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [codeRed, setCodeRed] = useState(false);
    const [zeroIqTask, setZeroIqTask] = useState("");
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced

    // State for all data sections
    const [mastery, setMastery] = useState(INITIAL_MASTERY);
    const [courses, setCourses] = useState(INITIAL_COURSES);
    const [books, setBooks] = useState(INITIAL_BOOKS);
    const [papers, setPapers] = useState(INITIAL_PAPERS);
    const [notes, setNotes] = useState("");
    const [trackerLog, setTrackerLog] = useState({});
    const [expandedLang, setExpandedLang] = useState('python');

    // --- FIREBASE LOGIC ---

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const initAuth = async () => {
            // Check if we are in Canvas or Vercel
            if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
                await signInWithCustomToken(auth, window.__initial_auth_token);
            } else {
                // In Vercel, use anonymous auth for simplicity or add Google Sign In later
                await signInAnonymously(auth);
            }
        };
        initAuth();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user || !db) return;

        // Listeners for each collection/doc
        const masteryRef = doc(db, 'artifacts', appId, 'users', user.uid, 'mastery', 'main');
        const coursesRef = doc(db, 'artifacts', appId, 'users', user.uid, 'courses', 'main');
        const booksRef = doc(db, 'artifacts', appId, 'users', user.uid, 'books', 'main');
        const papersRef = doc(db, 'artifacts', appId, 'users', user.uid, 'papers', 'main');
        const notesRef = doc(db, 'artifacts', appId, 'users', user.uid, 'notes', 'main');
        const trackerRef = doc(db, 'artifacts', appId, 'users', user.uid, 'tracker', 'main');

        const unsubs = [];

        const handleSnapshot = (snap, setFn, initialData) => {
            if (snap.exists()) {
                setFn(snap.data().data);
            } else {
                setDoc(snap.ref, { data: initialData });
                setFn(initialData);
            }
        };

        unsubs.push(onSnapshot(masteryRef, (s) => handleSnapshot(s, setMastery, INITIAL_MASTERY)));
        unsubs.push(onSnapshot(coursesRef, (s) => handleSnapshot(s, setCourses, INITIAL_COURSES)));
        unsubs.push(onSnapshot(booksRef, (s) => handleSnapshot(s, setBooks, INITIAL_BOOKS)));
        unsubs.push(onSnapshot(papersRef, (s) => handleSnapshot(s, setPapers, INITIAL_PAPERS)));
        unsubs.push(onSnapshot(notesRef, (s) => {
            if (s.exists()) setNotes(s.data().content || "");
            else setDoc(s.ref, { content: "" });
        }));
        unsubs.push(onSnapshot(trackerRef, (s) => handleSnapshot(s, setTrackerLog, {})));

        setTimeout(() => setLoading(false), 500);

        return () => unsubs.forEach(u => u());
    }, [user]);

    // Helper to flash sync status
    const flashSync = () => {
        setSyncStatus('syncing');
        setTimeout(() => setSyncStatus('synced'), 500);
        setTimeout(() => setSyncStatus('idle'), 2000);
    }

    const saveMastery = async (newData) => {
        if (!user) return;
        setMastery(newData);
        flashSync();
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'mastery', 'main'), { data: newData });
    };

    const saveCourses = async (newData) => {
        if (!user) return;
        setCourses(newData);
        flashSync();
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'courses', 'main'), { data: newData });
    };

    const saveBooks = async (newData) => {
        if (!user) return;
        setBooks(newData);
        flashSync();
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'books', 'main'), { data: newData });
    };

    const savePapers = async (newData) => {
        if (!user) return;
        setPapers(newData);
        flashSync();
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'papers', 'main'), { data: newData });
    };

    const saveTracker = async (newData) => {
        if (!user) return;
        setTrackerLog(newData);
        flashSync();
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tracker', 'main'), { data: newData });
    };

    useEffect(() => {
        if (!user) return;
        const timeoutId = setTimeout(() => {
            setSyncStatus('syncing');
            setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'notes', 'main'), { content: notes })
                .then(() => {
                    setSyncStatus('synced');
                    setTimeout(() => setSyncStatus('idle'), 2000);
                });
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [notes, user]);

    // --- INTERACTION LOGIC ---

    const handleCodeRed = () => {
        setCodeRed(true);
        setZeroIqTask(ZERO_IQ_TASKS[Math.floor(Math.random() * ZERO_IQ_TASKS.length)]);
    };

    const toggleTopic = (langId, topicId) => {
        const newData = mastery.map(lang => {
            if (lang.id === langId) {
                return {
                    ...lang,
                    topics: lang.topics.map(t => t.id === topicId ? { ...t, done: !t.done } : t)
                };
            }
            return lang;
        });
        saveMastery(newData);
    };

    const cycleStatus = (id, list, saveFn) => {
        const newData = list.map(item => {
            if (item.id === id) {
                const next = item.status === 'todo' ? 'in-progress' : item.status === 'in-progress' ? 'done' : 'todo';
                return { ...item, status: next };
            }
            return item;
        });
        saveFn(newData);
    };

    const toggleTrackerDay = (dateStr) => {
        const next = trackerLog[dateStr] === 'good' ? undefined : 'good';
        const newLog = { ...trackerLog };
        if (next) newLog[dateStr] = next;
        else delete newLog[dateStr];
        saveTracker(newLog);
    };

    const calcProgress = (items) => {
        if (!items.length) return 0;
        const done = items.filter(i => i.status === 'done').length;
        const inProg = items.filter(i => i.status === 'in-progress').length * 0.5;
        return Math.round(((done + inProg) / items.length) * 100);
    };

    const calcMasteryProgress = () => {
        let total = 0, done = 0;
        mastery.forEach(l => {
            l.topics.forEach(t => {
                total++;
                if (t.done) done++;
            });
        });
        return Math.round((done / total) * 100);
    };

    const overallProgress = Math.round(
        (calcMasteryProgress() + calcProgress(courses) + calcProgress(books) + calcProgress(papers)) / 4
    );

    const StatusBadge = ({ status }) => {
        if (status === 'done') return <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">DONE</span>;
        if (status === 'in-progress') return <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">ACTIVE</span>;
        return <span className="text-[10px] font-bold bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-700">TODO</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono">
                <Loader2 size={32} className="animate-spin mb-4 text-cyan-500" />
                <p>Connecting to PolyMath Cloud...</p>
            </div>
        );
    }

    // VIEW: CODE RED
    if (codeRed) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-red-900/10 z-0 animate-pulse"></div>
                <div className="max-w-md w-full bg-slate-900 border border-red-500/50 p-8 rounded-xl shadow-2xl shadow-red-900/40 z-10">
                    <div className="flex justify-center mb-6"><AlertTriangle size={64} className="text-red-500" /></div>
                    <h1 className="text-3xl font-bold text-center text-white mb-2">PROTOCOL: OMEGA</h1>
                    <p className="text-center text-red-300 mb-8">System Overheat. Manual Override Engaged.</p>
                    <div className="bg-slate-800 p-6 rounded-lg mb-8 border-l-4 border-red-500">
                        <h3 className="text-xs uppercase tracking-widest text-red-400 mb-2">Current Objective</h3>
                        <p className="text-xl font-bold text-white">{zeroIqTask}</p>
                    </div>
                    <button onClick={() => setCodeRed(false)} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors tracking-wider">
                        REBOOT SYSTEM
                    </button>
                </div>
            </div>
        );
    }

    // VIEW: MAIN
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">

            {/* HEADER */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                            <Terminal size={24} className="text-cyan-500" />
                            PolyMath-Engine
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                            <span className={`flex items-center gap-1 transition-colors duration-300 ${syncStatus === 'syncing' ? 'text-amber-400' :
                                syncStatus === 'synced' ? 'text-emerald-400' : 'text-slate-400'
                                }`}>
                                {syncStatus === 'syncing' ? <RefreshCw size={10} className="animate-spin" /> : <Cloud size={10} />}
                                {syncStatus === 'syncing' ? 'SYNCING...' : syncStatus === 'synced' ? 'SAVED' : 'ONLINE'}
                            </span>
                            <span className="text-slate-600">|</span>
                            <span>TARGET: DEEPMIND</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block w-48">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>System Integrity</span>
                                <span className="text-cyan-400">{overallProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
                            </div>
                        </div>
                        <button
                            onClick={handleCodeRed}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors text-xs font-bold tracking-wider"
                        >
                            <AlertTriangle size={14} />
                            CODE RED
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* SIDEBAR NAV */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: Layers },
                        { id: 'mastery', label: 'Tech Stack', icon: Code },
                        { id: 'courses', label: 'Coursework', icon: Monitor },
                        { id: 'library', label: 'Library', icon: BookOpen },
                        { id: 'papers', label: 'Research Lab', icon: FileText },
                        { id: 'notes', label: 'Field Notes', icon: PenTool },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}

                    <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Priority Queue</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                PyTorch Tensors
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Sutton Ch. 4
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                QMIX Paper
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="lg:col-span-9 space-y-6">

                    {/* DASHBOARD VIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <Code className="text-blue-400" size={24} />
                                        <span className="text-xs font-mono text-slate-500">STACK</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{calcMasteryProgress()}%</div>
                                        <ProgressBar percent={calcMasteryProgress()} color="blue" />
                                    </div>
                                </div>
                                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <Monitor className="text-emerald-400" size={24} />
                                        <span className="text-xs font-mono text-slate-500">COURSES</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{calcProgress(courses)}%</div>
                                        <ProgressBar percent={calcProgress(courses)} color="emerald" />
                                    </div>
                                </div>
                                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <FileText className="text-purple-400" size={24} />
                                        <span className="text-xs font-mono text-slate-500">RESEARCH</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{calcProgress(papers)}%</div>
                                        <ProgressBar percent={calcProgress(papers)} color="purple" />
                                    </div>
                                </div>
                                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <Target className="text-red-400" size={24} />
                                        <span className="text-xs font-mono text-slate-500">LEETCODE</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">0<span className="text-sm text-slate-500">/300</span></div>
                                        <ProgressBar percent={0} color="red" />
                                    </div>
                                </div>
                            </div>

                            <TrackerGrid log={trackerLog} onToggle={toggleTrackerDay} />

                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Calendar size={18} className="text-slate-400" />
                                    Timeline Overview
                                </h3>
                                <div className="space-y-4 font-mono text-sm">
                                    <div className="flex gap-4">
                                        <div className="text-emerald-400 font-bold w-12">2026</div>
                                        <div className="text-slate-300">RL Foundations • ML Fundamentals • Research Papers</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-blue-400 font-bold w-12">2027</div>
                                        <div className="text-slate-400">Internships • C++ Systems • LeetCode Start</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-purple-400 font-bold w-12">2028</div>
                                        <div className="text-slate-500">Grad School Apps • Interviews • Capstone</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MASTERY VIEW */}
                    {activeTab === 'mastery' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {mastery.map(lang => {
                                const isExpanded = expandedLang === lang.id;
                                const completedTopics = lang.topics.filter(t => t.done).length;
                                const progress = Math.round((completedTopics / lang.topics.length) * 100);

                                return (
                                    <div key={lang.id} className={`bg-slate-900 rounded-xl border transition-all duration-300 ${isExpanded ? 'border-cyan-500/30 shadow-lg shadow-cyan-900/10' : 'border-slate-800'}`}>
                                        <div
                                            onClick={() => setExpandedLang(isExpanded ? null : lang.id)}
                                            className="p-5 flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg bg-slate-800 ${isExpanded ? 'text-cyan-400' : 'text-slate-400'}`}>
                                                    {getIcon(lang.iconName)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-lg">{lang.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs font-mono text-slate-500">{lang.priority}</span>
                                                        <span className="text-slate-700 text-[10px]">•</span>
                                                        <span className="text-xs font-mono text-slate-500">{lang.deadline}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 hidden sm:block">
                                                    <ProgressBar percent={progress} color="cyan" />
                                                </div>
                                                {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-5 pb-5 pt-0 border-t border-slate-800/50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                    {lang.topics.map(topic => (
                                                        <div
                                                            key={topic.id}
                                                            onClick={() => toggleTopic(lang.id, topic.id)}
                                                            className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${topic.done
                                                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                                                                : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${topic.done ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                                                                }`}>
                                                                {topic.done && <CheckCircle size={14} className="text-white" />}
                                                            </div>
                                                            <span className="text-sm font-medium">{topic.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* COURSES VIEW */}
                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {courses.map(course => (
                                <div
                                    key={course.id}
                                    onClick={() => cycleStatus(course.id, courses, saveCourses)}
                                    className={`bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-600 transition-all cursor-pointer group ${course.priority === 'Skip' ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <StatusBadge status={course.status} />
                                        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                            {course.hours}
                                        </span>
                                    </div>
                                    <h3 className={`font-bold text-lg mb-2 ${course.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                        {course.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${course.priority === 'Must Do' ? 'text-red-400 border-red-900 bg-red-900/10' : 'text-slate-500 border-slate-700'
                                            }`}>
                                            {course.priority}
                                        </span>
                                        <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                                            {course.timeline}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* RESEARCH LAB (PAPERS) */}
                    {activeTab === 'papers' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {['Foundational', 'Deep RL Classics', 'Research Focus', 'Applications', 'Ethics (UNESCO)'].map(cat => (
                                <div key={cat}>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 border-b border-slate-800 pb-2">{cat}</h3>
                                    <div className="space-y-3">
                                        {papers.filter(p => p.category === cat).map(paper => (
                                            <div
                                                key={paper.id}
                                                onClick={() => cycleStatus(paper.id, papers, savePapers)}
                                                className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                                            >
                                                <div className={`mt-0.5 ${paper.status === 'done' ? 'text-purple-400' : 'text-slate-600'}`}>
                                                    {paper.status === 'done' ? <CheckCircle size={20} /> : <Circle size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-medium ${paper.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                        {paper.name}
                                                    </h4>
                                                </div>
                                                <StatusBadge status={paper.status} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-sm text-center text-slate-400">
                                Goal: Read 1-2 papers per week during research phase (2026-2027)
                            </div>
                        </div>
                    )}

                    {/* LIBRARY VIEW */}
                    {activeTab === 'library' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {['Must Read', 'Should Read', 'Prep (2029)', 'Growth', 'Ethics'].map(cat => (
                                <div key={cat}>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                                        {cat === 'Growth' ? <Heart size={14} /> : cat === 'Ethics' ? <ShieldAlert size={14} /> : <BookOpen size={14} />}
                                        {cat}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {books.filter(b => b.category === cat).map(book => (
                                            <div
                                                key={book.id}
                                                onClick={() => cycleStatus(book.id, books, saveBooks)}
                                                className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-600 transition-all cursor-pointer flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-mono text-cyan-500">{book.author}</span>
                                                        <StatusBadge status={book.status} />
                                                    </div>
                                                    <h3 className={`font-bold text-lg mb-1 ${book.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                        {book.title}
                                                    </h3>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
                                                    Target: {book.target}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* NOTES VIEW */}
                    {activeTab === 'notes' && (
                        <div className="h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                                <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center gap-2">
                                    <PenTool size={16} className="text-slate-500" />
                                    <span className="text-xs font-mono text-slate-500 uppercase">
                                        Field Notes //
                                        <span className={syncStatus === 'syncing' ? 'text-amber-500' : 'text-slate-500'}>
                                            {syncStatus === 'syncing' ? ' Saving...' : ' Ready'}
                                        </span>
                                    </span>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Record breakthroughs, error logs, or manic ideas here..."
                                    className="flex-1 bg-slate-900 p-6 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:bg-slate-800/50 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
