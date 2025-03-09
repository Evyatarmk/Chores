import React, { createContext, useContext, useState } from "react";

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Meeting with team", date: "2025-03-10", completed: false },
    { id: 2, title: "Grocery shopping", date: "2025-03-11", completed: false },
    { id: 3, title: "Gym workout", date: "2025-03-10", completed: false },
  ]);

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => task.date === date);
  };

  const removeTaskForDate = (taskId) => {
    console.log(taskId)
    setTasks(tasks.filter(task => task.id !== taskId)); // Filter out the task with the specified ID
  };

  const editTask = (id, updatedTask) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updatedTask } : task));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, getTasksForDate, removeTaskForDate, editTask }}>
      {children}
    </TaskContext.Provider>
  );
};