import React, { createContext, useContext, useState } from "react";
import { useUserAndHome } from "./UserAndHomeContext";

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({
    "2025-03-30": [
      { 
        id: '1', 
        startDate: "2025-03-30", // Changed to startDate
        endDate: "2025-04-30",   // Added endDate
        startTime: "10:00 AM",
        endTime: "10:00 AM",        // Added time here
        title: "Meeting", 
        description: "Zoom Call", 
        homeId: "home1", 
        category: "אירוע", 
        color: '#FF5733',
        maxParticipants: 2,
        participants: [
          { id: "t", name: "אביתר" },
          { id: "user2", name: "User Two" }
        ] 
      },
      { 
        id: '2', 
        title: "Workout",
        startDate: "2025-03-30",  // Changed to startDate
        endDate: "2025-03-30",    // Added endDate
        startTime: "10:00 AM",
        endTime: "10:00 AM",          // Added time here
        description: "Gym", 
        homeId: "home1", 
        category: "משימה", 
        color: 'pink',
        participants: [{ id: "user1", name: "User One" }], 
        maxParticipants: 5
      }
    ],
    "2025-03-13": [
      { 
        id: '3', 
        startDate: "2025-03-13", // Changed to startDate
        endDate: "2025-03-24",   // Added endDate
        startTime: "10:00 AM",
        endTime: "10:00 AM",          // Added time here
        title: "Workout", 
        description: "Gym", 
        homeId: "home1", 
        category: "אירוע", 
        color: 'blue',
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
    return Object.values(tasks)
      .flat()
      .filter(
        (task) =>
          new Date(date) >= new Date(task.startDate) &&
          new Date(date) <= new Date(task.endDate)
      );
  };

  const signUpForTask = (date, taskId) => {
    setTasks(prevTasks => {
      console.log("hi")
      const newTasks = { ...prevTasks };
      console.log(newTasks)
   
      console.log(date)
      if (!newTasks[date]) return prevTasks; // If the date doesn't exist, return unchanged
      
      // Find the specific task
      const taskIndex = newTasks[date].findIndex(task => task.id === taskId);

      console.log(taskIndex)
      if (taskIndex === -1) return prevTasks; // If the task isn't found, return unchanged
  
      const task = newTasks[date][taskIndex];
  
      // Check if the task has a maxParticipants limit
      if (task.maxParticipants && task.participants.length >= task.maxParticipants) {
        alert("Task is full. No more participants can sign up.");
        return prevTasks;
      }
  
      // Check if the user is already signed up
      if (task.participants.some(participant => participant.id === user.id)) {
        alert("You are already signed up for this task.");
        return prevTasks;
      }
  
      // Add the user to the participants list
      const updatedTask = {
        ...task,
        participants: [...task.participants, user]
      };
  
      // Update the tasks array
      newTasks[date] = [
        ...newTasks[date].slice(0, taskIndex),
        updatedTask,
        ...newTasks[date].slice(taskIndex + 1)
      ];
  
      return newTasks;
    });
  };

  const signOutOfTask = (date, taskId) => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [date]: prevTasks[date].map((task) =>
        task.id === taskId
          ? {
              ...task,
              participants: task.participants.filter(participant => participant.id !== user.id) // הסר את המשתמש אם הוא נמצא
            }
          : task
      ),
    }));
  };
  
  
  const removeTaskForDate = (date, taskId) => {
    console.log("Removing task", taskId, "from", date);
  
    setTasks(prevTasks => {
      let updatedTasks = { ...prevTasks };
 
      Object.keys(prevTasks).forEach(dateKey => {
        updatedTasks[dateKey] = prevTasks[dateKey].filter(task => task.id !== taskId);
  
        // Remove date key if no tasks are left on that date
        if (updatedTasks[dateKey].length === 0) {
          delete updatedTasks[dateKey];
        }
      });
  
      return updatedTasks;
    });
  };
  
  const getTask = (date, taskId) => {
    if (!tasks) {
      console.log("Tasks are not loaded yet.");
      return null;
    }
  
    const formattedDate =
      typeof date === "string" ? date.trim() : new Date(date).toISOString().split("T")[0];
  
    const tasksForDate = tasks[formattedDate];
    console.log("Tasks for this date:", tasksForDate);
  
    if (!tasksForDate || tasksForDate.length === 0) {
      console.log("No tasks found for this date:", formattedDate);
      return null;
    }
  console.log(taskId)
    // Find the specific task by taskId
    const foundTask = tasksForDate.find(task => task.id ===  taskId);
    console.log("Found Task:", foundTask);
  
    return foundTask || null;
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
    <TaskContext.Provider value={{ tasks,getTask, addTaskForDate, getTasksForDate, removeTaskForDate, editTask,signUpForTask,addTask ,signOutOfTask}}>
      {children}
    </TaskContext.Provider>
  );
};
