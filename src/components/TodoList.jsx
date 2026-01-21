import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import AddTodo from './AddTodo';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

const TodoList = ({ todos, toggleTodo, deleteTodo, addTodo, reorderTodos }) => {
    // State is managed in App.jsx

    const activeCount = todos.filter(t => !t.completed).length;

    return (
        <div className="px-6 pb-24">
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="font-display text-2xl text-slate-900 dark:text-white">Today's Focus</h3>
                <span className="text-xs font-bold text-orange-600 bg-orange-100 dark:text-slate-300 dark:bg-slate-800/50 dark:border dark:border-white/10 px-3 py-1 rounded-full">{activeCount} Pending</span>
            </div>

            <AddTodo addTodo={addTodo} />

            <DragDropContext onDragEnd={(result) => {
                if (!result.destination) return;
                reorderTodos(result.source.index, result.destination.index);
            }}>
                <Droppable droppableId="todos">
                    {(provided) => (
                        <div
                            className="space-y-3 mt-6"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {todos.map((todo, index) => (
                                <TodoItem
                                    key={todo.id}
                                    index={index}
                                    todo={todo}
                                    toggleTodo={toggleTodo}
                                    deleteTodo={deleteTodo}
                                />
                            ))}
                            {provided.placeholder}

                            {todos.length === 0 && (
                                <div className="text-center py-10 opacity-60 text-slate-500 dark:text-slate-300">
                                    <span className="material-symbols-rounded text-4xl mb-2 block">task_alt</span>
                                    <p>All cleared! Enjoy your day.</p>
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default TodoList;
