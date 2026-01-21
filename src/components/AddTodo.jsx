import React, { useState } from 'react';

const AddTodo = ({ addTodo }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        addTodo(text);
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 mb-8 relative z-20">
            <div className="glow-border-wrapper">
                <div className="glass-card p-1 rounded-[1.75rem] flex items-center pl-4 bg-white/30 dark:bg-slate-800/30">
                    <span className="material-symbols-rounded text-slate-400">add</span>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add a new task..."
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium py-4 px-3"
                    />
                    <button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl m-1 shadow-lg shadow-orange-500/30 transition-all font-bold dark:silver-btn dark:shadow-none dark:text-slate-900"
                    >
                        <span className="material-symbols-rounded">arrow_upward</span>
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AddTodo;
