'use client';

import React, { useState, useEffect } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
}

export default function UpcomingTasksBadge() {
  const [urgentTasksCount, setUrgentTasksCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Get tasks from localStorage
      const checkForUrgentTasks = () => {
        const savedTodos = localStorage.getItem('todos');
        if (!savedTodos) return;
        
        try {
          const todos: TodoItem[] = JSON.parse(savedTodos);
          
          // Current date
          const now = new Date();
          
          // Date one week from now
          const oneWeekFromNow = new Date();
          oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
          
          // Filter for high priority tasks due within a week that are not completed
          const urgentTasks = todos.filter(todo => {
            // Skip completed tasks
            if (todo.completed) return false;
            
            // Skip tasks without due dates
            if (!todo.dueDate) return false;
            
            // Skip non-high priority tasks
            if (todo.priority !== 'high') return false;
            
            // Check if due date is within a week
            const dueDate = new Date(todo.dueDate);
            return dueDate >= now && dueDate <= oneWeekFromNow;
          });
          
          setUrgentTasksCount(urgentTasks.length);
        } catch (error) {
          console.error("Error checking for urgent tasks:", error);
          setUrgentTasksCount(0);
        }
      };
      
      // Check immediately
      checkForUrgentTasks();
      
      // Set up interval to check regularly (every minute)
      const intervalId = setInterval(checkForUrgentTasks, 60000);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) return null;
  
  // Don't show anything if there are no urgent tasks
  if (urgentTasksCount === 0) return null;
  
  return (
    <div className="relative ml-1">
      <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
        {urgentTasksCount}
      </div>
    </div>
  );
} 