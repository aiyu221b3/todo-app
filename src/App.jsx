import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import FlowStateCard from './components/FlowStateCard';
import TodoList from './components/TodoList';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Lifted State
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, text: "Check out the new design", completed: true },
      { id: 2, text: "Add my first task", completed: false },
    ];
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || 'User';
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('username', username);
  }, [username]);

  const addTodo = (text, urgent = false) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
    };
    if (urgent) {
      setTodos([newTodo, ...todos]); // Prepend (LIFO / Urgent)
    } else {
      setTodos([...todos, newTodo]); // Append (FIFO / Queue)
    }
  };

  const reorderTodos = (startIndex, endIndex) => {
    const result = Array.from(todos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTodos(result);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completeHeadTask = () => {
    const activeTodos = todos.filter(t => !t.completed);
    if (activeTodos.length > 0) {
      const headId = activeTodos[0].id;
      // User request: Delete task completely when "Complete Task" is clicked
      deleteTodo(headId);
    }
  };


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="bg-slate-200 dark:bg-slate-950 min-h-screen flex items-center justify-center font-sans">
      <Layout>
        <Header toggleTheme={toggleDarkMode} username={username} setUsername={setUsername} />
        <FlowStateCard
          todos={todos}
          addTodo={addTodo}
          completeHeadTask={completeHeadTask}
        />
        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          addTodo={addTodo}
          reorderTodos={reorderTodos}
        />
      </Layout>

      {/* Dark Mode Toggle - Removed as Header Orb now acts as Settings/Toggle */}
    </div>
  );
}

export default App;
