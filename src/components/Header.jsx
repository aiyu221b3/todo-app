import React from 'react';

const Header = ({ toggleTheme, username, setUsername }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempName, setTempName] = React.useState(username);

    const handleNameClick = () => {
        setTempName(username);
        setIsEditing(true);
    };

    const handleNameChange = (e) => {
        // Enforce max 4 chars
        const val = e.target.value.slice(0, 4);
        setTempName(val);
    };

    const handleNameSave = () => {
        if (tempName.trim()) {
            setUsername(tempName.trim());
        } else {
            setUsername('User'); // Fallback
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleNameSave();
    };

    return (
        <div className="px-10 pt-6 pb-4 flex justify-between items-end">
            <div className="max-w-[70%]">
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide text-xs uppercase mb-1">
                    <span className="dark:hidden">My Tasks</span>
                    <span className="hidden dark:inline">Session Hub</span>
                </p>
                <div className="font-display text-4xl text-slate-900 dark:text-white leading-tight whitespace-nowrap flex items-center">
                    Hello
                    {isEditing ? (
                        <input
                            autoFocus
                            type="text"
                            value={tempName}
                            onChange={handleNameChange}
                            onBlur={handleNameSave}
                            onKeyDown={handleKeyDown}
                            className="ml-2 w-[120px] bg-transparent border-b-2 border-orange-500 dark:border-slate-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                        />
                    ) : (
                        <span
                            onClick={handleNameClick}
                            className="ml-2 cursor-pointer hover:opacity-70 transition-opacity border-b-2 border-transparent hover:border-slate-300"
                            title="Click to edit codename"
                        >
                            {username}
                        </span>
                    )}
                </div>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <button
                    onClick={toggleTheme}
                    className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95
                    ${/* Light Mode: Sunset Ring */ ''}
                    dark:moon-indicator
                    ${/* Light Mode Fallback */ ''}
                    bg-transparent
                `}>
                    {/* Light Mode Container - Empty as per request */}
                    <div className="w-full h-full rounded-full sunset-progress flex items-center justify-center p-[3px] dark:hidden">
                        <div className="w-full h-full rounded-full bg-gradient-to-t from-red-600/20 to-transparent flex items-center justify-center">
                            {/* Icon removed */}
                        </div>
                    </div>

                    {/* Dark Mode Content - Empty as per request */}
                    <span className="hidden dark:block"></span>
                </button>
            </div>
        </div>
    );
};

export default Header;
