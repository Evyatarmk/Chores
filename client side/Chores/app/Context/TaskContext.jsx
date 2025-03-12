import React, { createContext, useContext, useState } from "react";

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({
    "2025-03-12": [{ id: 1, title: "Meeting", description: "10 AM - Zoom Call" },{ id: 2, title: "Workout", description: "7 AM - Gym" }],
    "2025-03-13": [{ id: 2, title: "Workout", description: "7 AM - Gym" }],
    
  });

 
  const addTaskForDate = (date, task) => {
    setTasks(prevTasks => {
      // Check if tasks already exist for the given date
      const existingTasks = prevTasks[date] || [];
  
      // Add the new task to the existing tasks array
      const updatedTasks = [...existingTasks, task];
  
      return {
        ...prevTasks,
        [date]: updatedTasks
      };
    });
  };

  
  const getTasksForDate = (date) => {
    return tasks[date] || [];
  };

  
  const removeTaskForDate = (date, taskId) => {
    console.log('hi')
    setTasks(prevTasks => {
      if (!prevTasks[date]) return prevTasks;
      const updatedTasks = prevTasks[date].filter(task => task.id !== taskId);
      if (updatedTasks.length === 0) {
        const { [date]: _, ...rest } = prevTasks; 
        return rest;
      }
      return {
        ...prevTasks,
        [date]: updatedTasks
      };
    });
  };
  

  const editTask = (date, id, updatedTask) => {
    setTasks(prevTasks => {
      if (!prevTasks[date]) return prevTasks; // If date doesn't exist, return unchanged
  
      const updatedTasks = prevTasks[date].map(task =>
        task.id === id ? { ...task, ...updatedTask } : task
      );
  
      return {
        ...prevTasks,
        [date]: updatedTasks
      };
    });
  };
  return (
    <TaskContext.Provider value={{ tasks, addTaskForDate, getTasksForDate, removeTaskForDate, editTask }}>
      {children}
    </TaskContext.Provider>
  );
};
