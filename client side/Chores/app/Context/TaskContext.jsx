import React, { createContext, useContext, useState } from "react";

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({
    "2025-03-30": [
      { 
        id: 1, 
        title: "Meeting", 
        description: "10 AM - Zoom Call", 
        homeId: "home1", 
        category: "אירוע", 
        participants: ["user1", "user2"] 
      },
      { 
        id: 2, 
        title: "Workout", 
        description: "7 AM - Gym", 
        homeId: "home1", 
        category: "משימה", 
        participants: ["user1"], 
        maxParticipants: 5  // הגבלה על מספר המשתתפים במשימה
      }
    ],
    "2025-04-01": [
      { 
        id: 3, 
        title: "Workout", 
        description: "7 AM - Gym", 
        homeId: "home1", 
        category: "אירוע", 
        participants: ["user2", "user3"] 
      }
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
  
  const getTask = (date, taskId) => {
    console.log("Fetching task for date:", date, "and taskId:", taskId);
  
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const tasksForDate = tasks[formattedDate];
    
    console.log(formattedDate );
    if (!tasksForDate) {
      return null; // Return null if no tasks exist for the given date
    }
    
    // Find the task with the matching taskId
    const task = tasksForDate.find((task) => task.id === taskId);
    
    if (!task) {
      console.log("No task found with taskId:", taskId);
      return null; // Return null if no task is found with the matching taskId
    }
  
    return task; // Return the task if found
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


 const addTask = ( date, title, description) => {

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
    <TaskContext.Provider value={{ tasks,getTask, addTaskForDate, getTasksForDate, removeTaskForDate, editTask,signUpForTask,addTask }}>
      {children}
    </TaskContext.Provider>
  );
};
