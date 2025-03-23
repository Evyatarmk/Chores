import React, { createContext, useContext, useState } from "react";

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({
    
      "2025-03-12": [
        { id: 1, title: "Meeting", description: "10 AM - Zoom Call", homeId: "home1" },
        { id: 2, title: "Workout", description: "7 AM - Gym", homeId: "home2" }
      ],
      "2025-03-13": [
        { id: 3, title: "Workout", description: "7 AM - Gym", homeId: "home1" }
      ]
    
    
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


 // Function to add a task (Only Admin can add)
 const addTask = (adminId, date, title, description) => {
  const isAdmin = mockHome.members.some(
    (member) => member.id === adminId && member.role === "admin"
  );

  if (!isAdmin) {
    console.log("Only the admin can add tasks.");
    return;
  }

  const newTask = {
    id: Date.now(), // Unique ID
    title,
    description,
    assignedTo: null,
  };

  setTasks((prevTasks) => ({
    ...prevTasks,
    [date]: prevTasks[date] ? [...prevTasks[date], newTask] : [newTask],
  }));
};

// Function to sign up for a task
const signUpForTask = (username, date, taskId) => {
  setTasks((prevTasks) => ({
    ...prevTasks,
    [date]: prevTasks[date].map((task) =>
      task.id === taskId ? { ...task, assignedTo: username } : task
    ),
  }));
};





  return (
    <TaskContext.Provider value={{ tasks, addTaskForDate, getTasksForDate, removeTaskForDate, editTask,signUpForTask,addTask }}>
      {children}
    </TaskContext.Provider>
  );
};
