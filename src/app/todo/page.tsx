'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/app/components/PageHeader';
import { Roboto_Mono } from "next/font/google";
import Link from 'next/link';
import { toast } from 'react-toastify';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// ClientOnly component to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
}

export default function TodoPage() {
  // State management
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isClient, setIsClient] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load todos from localStorage on component mount
  useEffect(() => {
    setIsClient(true);
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isClient]);

  // Check if a task is urgent (high priority and due within a week)
  const isUrgentTask = (todo: TodoItem) => {
    if (todo.completed || !todo.dueDate || todo.priority !== 'high') {
      return false;
    }
    
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    return dueDate >= today && dueDate <= oneWeekFromNow;
  };

  // Check for approaching due dates (tomorrow) and show notifications
  useEffect(() => {
    if (!isClient) return;

    // Set up a function to check for tasks due tomorrow
    const checkApproachingDueDates = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Format tomorrow as YYYY-MM-DD for comparison
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      todos.forEach(todo => {
        // Skip if completed or no due date
        if (todo.completed || !todo.dueDate) return;
        
        // Format due date for comparison
        const dueDateStr = new Date(todo.dueDate).toISOString().split('T')[0];
        
        // If due tomorrow, show a notification
        if (dueDateStr === tomorrowStr) {
          toast.warn(`Task due tomorrow: ${todo.text}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      });
    };
    
    // Check when component mounts
    checkApproachingDueDates();
    
    // Set up interval to check daily (but for demo purposes, check more frequently)
    const intervalId = setInterval(checkApproachingDueDates, 3600000); // Check every hour
    
    return () => clearInterval(intervalId);
  }, [todos, isClient]);

  // Add new todo
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newTodoText.trim() === '') return;
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false,
      dueDate: newTodoDueDate || null,
      priority: newTodoPriority,
    };
    
    // Check if this is an urgent task (high priority due within a week)
    if (newTodoPriority === 'high' && newTodoDueDate) {
      const dueDate = new Date(newTodoDueDate);
      const today = new Date();
      const oneWeekFromNow = new Date(today);
      oneWeekFromNow.setDate(today.getDate() + 7);
      
      if (dueDate <= oneWeekFromNow) {
        // Show an urgent notification
        toast.error(`URGENT TASK: ${newTodoText} is due ${formatDate(newTodoDueDate)}`, {
          position: "top-right",
          autoClose: false, // Don't auto close for urgent tasks
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
    
    setTodos([...todos, newTodo]);
    setNewTodoText('');
    setNewTodoDueDate('');
    setNewTodoPriority('medium');
  };

  // Toggle todo completion status
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) => {
        // If this is the todo we're toggling
        if (todo.id === id) {
          // Check if we're completing an urgent task
          if (!todo.completed && isUrgentTask(todo)) {
            // Show a completion toast
            toast.success(`Completed urgent task: ${todo.text}`, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
          
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      })
    );
  };

  // Delete todo
  const deleteTodo = (id: string) => {
    // Find the todo we're about to delete
    const todoToDelete = todos.find(todo => todo.id === id);
    
    // If it's an urgent task, confirm deletion
    if (todoToDelete && isUrgentTask(todoToDelete)) {
      if (confirm(`Are you sure you want to delete the urgent task: ${todoToDelete.text}?`)) {
        setTodos(todos.filter((todo) => todo.id !== id));
        
        toast.info(`Deleted urgent task: ${todoToDelete.text}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } else {
      // For non-urgent tasks, just delete
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  // Filter todos based on current filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Sort todos: first by not completed, then by priority (high to low), then by due date
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // First sort by completion status
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Then sort by priority
    const priorityValue = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityValue[b.priority] - priorityValue[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by due date (if both have due dates)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Items with due dates come before those without
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    return 0;
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get priority class for styling
  const getPriorityClass = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Count todos by status
  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;
  const urgentTodosCount = todos.filter(todo => isUrgentTask(todo)).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header */}
      <PageHeader 
        title="TO-DO" 
        fullWidth={true}
        withAction={
          <Link 
            href="/dashboard" 
            className="flex items-center rounded-md bg-gray-700 px-3 py-2 text-gray-200 hover:bg-gray-600"
          >
            <span className="material-icons mr-1">dashboard</span>
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        }
      />

      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-2 flex-grow">
        <ClientOnly>
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">TOTAL TASKS</h3>
              <p className={`${robotoMono.className} text-3xl font-bold text-gray-900`}>{todos.length}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">ACTIVE TASKS</h3>
              <p className={`${robotoMono.className} text-3xl font-bold text-gray-900`}>{activeTodosCount}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">COMPLETED TASKS</h3>
              <p className={`${robotoMono.className} text-3xl font-bold text-gray-900`}>{completedTodosCount}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-600 mb-2">URGENT TASKS</h3>
              <p className={`${robotoMono.className} text-3xl font-bold ${urgentTodosCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{urgentTodosCount}</p>
            </div>
          </div>

          {/* Add Todo Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Task</h3>
            
            <form onSubmit={addTodo} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label htmlFor="todoText" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Description
                  </label>
                  <input
                    id="todoText"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black dark:text-black !text-black font-medium"
                    placeholder="What needs to be done?"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="todoDueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    id="todoDueDate"
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black dark:text-black !text-black font-medium"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="todoPriority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="todoPriority"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black dark:text-black !text-black font-medium"
                    value={newTodoPriority}
                    onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
                  >
                    <option value="low" className="text-black">Low</option>
                    <option value="medium" className="text-black">Medium</option>
                    <option value="high" className="text-black">High</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 flex items-center"
                  >
                    <span className="material-icons mr-1">add_task</span>
                    Add Task
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Todo List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Task List</h3>
              
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${filter === 'active' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${filter === 'completed' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>
            
            {sortedTodos.length > 0 ? (
              <ul className="space-y-3">
                {sortedTodos.map((todo) => {
                  const urgent = isUrgentTask(todo);
                  return (
                  <li 
                    key={todo.id} 
                    className={`p-4 border rounded-lg flex items-start ${todo.completed ? 'bg-gray-50 border-gray-200' : urgent ? 'bg-red-50 border-red-200' : 'bg-white border-gray-300'}`}
                  >
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-gray-600 rounded focus:ring-gray-500"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className={`text-gray-900 font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                            {todo.text}
                          </p>
                          {urgent && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 animate-pulse">
                              Urgent
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center mt-1 space-x-2">
                        {todo.dueDate && (
                          <span className={`flex items-center text-xs ${urgent ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                            <span className="material-icons text-sm mr-1">event</span>
                            {formatDate(todo.dueDate)}
                          </span>
                        )}
                        
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityClass(todo.priority)}`}>
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8">
                <span className="material-icons text-4xl text-gray-300 mb-2">task_alt</span>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'No tasks yet. Add your first task above!' 
                    : filter === 'active' 
                      ? 'No active tasks. Great job!' 
                      : 'No completed tasks yet.'}
                </p>
              </div>
            )}
          </div>
        </ClientOnly>
      </div>
    </div>
  );
} 