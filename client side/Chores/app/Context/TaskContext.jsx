import React, { createContext, useContext, useState } from "react";
import { useUserAndHome } from "./UserAndHomeContext";

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({
    "2025-03-30": [
      { 
        id: 1, 
        date: "2025-03-30",
        time: "10:00 AM",  // Added time here
        title: "Meeting", 
        description: "Zoom Call", 
        homeId: "home1", 
        category: "אירוע", 
        participants: [
          { id: "t", name: "אביתר" },
          { id: "user2", name: "User Two" }
        ] 
      },
      { 
        id: 2, 
        title: "Workout",
        date: "2025-03-30", 
        time: "7:00 AM",  // Added time here
        description: "Gym", 
        homeId: "home1", 
        category: "משימה", 
        participants: [{ id: "user1", name: "User One" }], 
        maxParticipants: 5
      }
    ],
    "2025-04-01": [
      { 
        id: 3, 
        date: "2025-04-01",
        time: "7:00 AM",  // Added time here
        title: "Workout", 
        description: "Gym", 
        homeId: "home1", 
        category: "אירוע", 
        participants: [
          { id: "user2", name: "User Two" },
          { id: "user3", name: "User Three" }
        ]
      }
    ]
  });
  
  const { user, home } = useUserAndHome();

  

 
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

  const signUpForTask = (date, taskId) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [date]: prevTasks[date].map((task) =>
        task.id === taskId
          ? {
              ...task,
              participants: task.participants.some(participant => participant.id === user.id)
                ? task.participants // אם המשתמש כבר רשום, אל תוסיף אותו שוב
                : [...task.participants, { id: user.id, name: user.name }] // הוסף את המשתמש אם הוא לא נמצא
            }
          : task
      ),
    }));
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

    if (!tasks) {
      console.log("Tasks are not loaded yet.");
      return null;
    }


    // המרת date למחרוזת בפורמט הנכון
    const formattedDate = typeof date === "string" ? date.trim() : new Date(date).toISOString().split("T")[0];

    
    const tasksForDate = tasks[formattedDate];
    console.log("Tasks for this date:", tasksForDate);

    if (!tasksForDate) {
      console.log("No tasks found for this date:", formattedDate);
      return null;
    }

    // הפיכת taskId למספר
    const task = tasksForDate.find((task) => task.id === Number(taskId));
    console.log("Found task:", task);

    if (!task) {
      console.log("No task found with taskId:", taskId);
      return null;
    }

    return task;
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







  return (
    <TaskContext.Provider value={{ tasks,getTask, addTaskForDate, getTasksForDate, removeTaskForDate, editTask,signUpForTask,addTask }}>
      {children}
    </TaskContext.Provider>
  );
};
