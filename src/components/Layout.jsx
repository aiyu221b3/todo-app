import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="w-full min-h-screen mesh-gradient flex flex-col transition-colors duration-300 relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="floating-shape top-[5%] -left-[10%] w-56 h-56 bg-pink-200/40 dark:bg-pink-900/10 rounded-full"></div>
            <div className="floating-shape top-[35%] -right-[15%] w-72 h-72 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full"></div>
            <div className="floating-shape bottom-[15%] left-[10%] w-48 h-48 bg-violet-200/40 dark:bg-violet-900/10 rounded-full"></div>

            {/* Status Bar / Settings removed */}
            <div className="pt-4"></div>

            {/* Content Area */}
            <div className="relative z-20 flex-grow overflow-y-auto overflow-x-hidden no-scrollbar">
                {children}
            </div>

            {/* Bottom Nav / Tab Bar Indicator - Removed */}
        </div>
    );
};

export default Layout;
