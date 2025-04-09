import React, { createContext, useContext, useState, useEffect} from "react";
import { useUserAndHome } from "./UserAndHomeContext";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";


const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);
 

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState({
    "2025-03-30": [
      { 
        id: '1', 
        startDate: "2025-03-30", // Changed to startDate
        endDate: "2025-03-30",   // Added endDate
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
  

  const { baseUrl } = useApiUrl();


  const [errorMessage, setErrorMessage] = useState('');
    const [errorVisible, setErrorVisible] = useState(false);
 
    const handleCloseError = () => {
      setErrorMessage("")
      setErrorVisible(false)
    };

    useEffect(() => {
      if (home && user) {
        fetchTasks();
      }
    }, [home, user]);

    const fetchTasks = async () => {
      try {
        const response = await fetchWithAuth(`${baseUrl}/Tasks/home/${home.id}`, {
          method: 'GET',
        });
    
        if (!response || !response.ok) {
          throw new Error("שגיאה בקבלת קטגוריות");
        }
    
        const data = await response.json();
    
        // Convert the data into a grouped object by startDate
        const groupedTasks = data.reduce((acc, task) => {
          const date = task.startDate.split("T")[0];; // Assuming task has a 'startDate' field
    
          if (!acc[date]) {
            acc[date] = [];
          }
    
          // Add task to the array for that specific date
          acc[date].push({
            id: task.id,
            title: task.title,
            description: task.description,
            startDate: task.startDate.split("T")[0],
            endDate: task.endDate.split("T")[0],
            startTime:convertTo12HourFormat(task.startTime) ,
            endTime: convertTo12HourFormat(task.endTime),
            category: task.category,
            color: task.color,
            maxParticipants: task.maxParticipants,
            participants: task.participants.map(participant => ({
              id: participant.id,
              name: participant.name,
            })),
          });
    
          return acc;
        }, {});
    
        console.log(groupedTasks); // Check the transformed data
        setTasks(groupedTasks);
    
      } catch (error) {
        console.error("שגיאה בקבלת קטגוריות:", error);
        setErrorMessage("לא ניתן לטעון קטגוריות, אנא נסה שוב מאוחר יותר");
        setErrorVisible(true);
      }
    };

    const convertTo12HourFormat = (timeString) => {
      const [hours, minutes, seconds] = timeString.split(":"); // Split time string into components
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      date.setSeconds(parseInt(seconds, 10));
      
      // Use toLocaleTimeString to format in 12-hour format
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    
    
  
 
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
    console.log("Found Task: gygygygygyg", foundTask);
  
    return foundTask || null;
  };

  
  
  
  
  
 const editTask = (startDate, endDate, id, updatedTask) => {
  setTasks(prevTasks => {
    // Convert start and end dates to Date objects for easier comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Create a new state object for updated tasks
    const updatedTasks = { ...prevTasks };

    // Loop through each day between startDate and endDate
    let currentDate = start;
    while (currentDate <= end) {
      // Convert the current date to a string in YYYY-MM-DD format
      const dateString = currentDate.toISOString().split('T')[0];  // "YYYY-MM-DD"

      // If tasks exist for that date, update them
      if (updatedTasks[dateString]) {
        updatedTasks[dateString] = updatedTasks[dateString].map(task =>
          task.id === id ? { ...task, ...updatedTask } : task
        );
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log(updatedTasks)

    return updatedTasks;
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
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </TaskContext.Provider>
  );
};
