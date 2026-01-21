import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const TodoItem = ({ todo, toggleTodo, deleteTodo, index }) => {
    return (
        <Draggable draggableId={todo.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group glow-border-wrapper mb-4 transition-all duration-300 ${todo.completed ? 'opacity-60' : 'opacity-100'} ${snapshot.isDragging ? 'rotate-2 scale-105 z-50' : ''}`}
                    style={provided.draggableProps.style}
                >
                    <div className="glass-card p-4 rounded-[1.75rem] flex items-center justify-between bg-white/60 dark:bg-slate-800/80 backdrop-blur-md">
                        <div className="flex items-center space-x-4 overflow-hidden flex-grow">
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${todo.completed
                                    ? 'bg-orange-500 border-orange-500 dark:bg-slate-500 dark:border-slate-500' // Silver/Slate in Dark Mode
                                    : 'border-slate-400 dark:border-slate-500 hover:border-orange-500 dark:hover:border-slate-300'
                                    }`}
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag on button click
                            >
                                {todo.completed && (
                                    <span className="material-symbols-rounded text-white text-sm font-bold">check</span>
                                )}
                            </button>
                            <span
                                className={`font-medium text-lg text-slate-800 dark:text-slate-100 truncate transition-all ${todo.completed ? 'line-through text-slate-500' : ''
                                    }`}
                            >
                                {todo.text}
                            </span>
                        </div>

                        <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 flex-shrink-0"
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag on delete
                        >
                            <span className="material-symbols-rounded">delete</span>
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TodoItem;
