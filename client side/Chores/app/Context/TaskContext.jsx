import React, { createContext, useContext, useState, useEffect} from "react";
import { useUserAndHome } from "./UserAndHomeContext";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";


const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);
 

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [tasksFormatted, setTasksFormatted] = useState({
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

const [myTasks, setMyTasks] = useState([]);
const [availableTasksForNextMonth, setAvailableTasksForNextMonth] = useState([]);

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
        fetchAvailableTasksForNextMonth()
        fetchMyTasks()
      }
    }, [home, user]);
    useEffect(() => {
      if (tasks) {
        // פונקציה ליצירת האובייקט הממויין לפי תאריך
        const groupTasksByDate = (tasksArray) =>
          tasksArray.reduce((acc, task) => {
            const date = task.startDate.split("T")[0];
    
            if (!acc[date]) {
              acc[date] = [];
            }
    
            acc[date].push({
              id: task.id,
              title: task.title,
              description: task.description,
              startDate: task.startDate.split("T")[0],
              endDate: task.endDate.split("T")[0],
              startTime: convertTo12HourFormat(task.startTime),
              endTime: convertTo12HourFormat(task.endTime),
              homeId: task.homeId,
              category: task.category,
              color: task.color,
              maxParticipants: task.maxParticipants,
              participants: task.participants.map(p => ({
                id: p.id,
                name: p.name,
              })),
            });
    
            return acc;
          }, {});
    
        // כל המשימות
        const groupedAllTasks = groupTasksByDate(tasks);
    
       
        setTasksFormatted(groupedAllTasks);
    
      }
    }, [home, user,tasks]);
    const fetchTasks = async () => {
      try {
        const response = await fetchWithAuth(`${baseUrl}/Tasks/home/${home.id}`, {
          method: 'GET',
        }, baseUrl);
    
        if (!response || !response.ok) {
          throw new Error("שגיאה בקבלת משימות");
        }
    
        const data = await response.json();

        console.log(data)
    
    
        // פונקציה ליצירת האובייקט הממויין לפי תאריך
        const groupTasksByDate = (tasksArray) =>
          tasksArray.reduce((acc, task) => {
            const date = task.startDate.split("T")[0];
    
            if (!acc[date]) {
              acc[date] = [];
            }
    
            acc[date].push({
              id: task.id,
              title: task.title,
              description: task.description,
              startDate: task.startDate.split("T")[0],
              endDate: task.endDate.split("T")[0],
              startTime: convertTo12HourFormat(task.startTime),
              endTime: convertTo12HourFormat(task.endTime),
              homeId: task.homeId,
              category: task.category,
              color: task.color,
              maxParticipants: task.maxParticipants,
              participants: task.participants.map(p => ({
                id: p.id,
                name: p.name,
              })),
            });
    
            return acc;
          }, {});
    
        // כל המשימות
        const groupedAllTasks = groupTasksByDate(data);
    
        // עדכון הסטייטים
        setTasks(data);
        setTasksFormatted(groupedAllTasks);
    
      } catch (error) {
        console.error("שגיאה בקבלת משימות:", error);
        setErrorMessage("לא ניתן לטעון משימות, אנא נסה שוב מאוחר יותר");
        setErrorVisible(true);
      }
    };
    
    const fetchAvailableTasksForNextMonth = async () => {
      try {
        // קריאה ל-API החדש
        const response = await fetchWithAuth(`${baseUrl}/Tasks/home/${home.id}/tasks/month/available`, {
          method: 'GET',
        }, baseUrl);

    
        if (!response || !response.ok) {
          throw new Error("שגיאה בקבלת משימות לחודש הקרוב");
        }
    
        const data = await response.json();
    
        setAvailableTasksForNextMonth(data);
    
      } catch (error) {
        console.error("שגיאה בקבלת משימות לחודש הקרוב:", error);
        setErrorMessage("לא ניתן לטעון משימות לחודש הקרוב, אנא נסה שוב מאוחר יותר");
        setErrorVisible(true);
      }
    };
    const fetchMyTasks = async () => {
      try {
        const response = await fetchWithAuth(`${baseUrl}/Tasks/home/${home.id}/user/${user.id}/tasks/week`,{
          method: 'GET',
          }, baseUrl);
        if (!response.ok) throw new Error("Failed to fetch tasks");
    
        const data = await response.json();
        console.log(data)
        setMyTasks(data);
      } catch (error) {
        console.error("Error fetching my tasks:", error.message);
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
    

    const markTaskAsCompleted = async (taskId) => {
      try {
        const response = await fetch(`${baseUrl}/Tasks/markAsCompleted/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ TaskId: taskId, UserId: user.id }),
        });
  
        if (!response.ok) {
          throw new Error("שגיאה בסימון משימה כבוצעה");
        }

         fetchTasks()
        const result = await response.json();
        console.log("Task marked as completed successfully:", result);
      } catch (error) {
        console.error("Error marking task as completed:", error);
      }
    };
    

    const markTaskAsNotCompleted = async (taskId) => { 
      try {
        const response = await fetch(`${baseUrl}/Tasks/markAsNotCompleted/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ TaskId: taskId, UserId: user.id }),
        });
    
        if (!response.ok) {
          throw new Error("שגיאה בסימון משימה כלא בוצעה");
        }
        fetchTasks()
        const result = await response.json();
        console.log("Task marked as NOT completed successfully:", result);
      } catch (error) {
        console.error("Error marking task as not completed:", error);
      }
    };
  

    const addTaskForDate = async (task, homeId) => {
      const newTask = { ...task, homeId };
      const tempId = Date.now(); // מזהה זמני
    
      // שמירה על המצב הקודם
      const previousTasks = [...tasks];
      const previousAvailableTasks = [...availableTasksForNextMonth];
    
      const optimisticTask = {
        ...newTask,
        id: tempId,
        participants: [], // אם צריך
      };
    
      // עדכון מיידי במסך
      setTasks((prev) => [...prev, optimisticTask]);
      setAvailableTasksForNextMonth((prev) => [...prev, optimisticTask]);
    
      try {
        const response = await fetch(`${baseUrl}/Tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTask),
        });
    
        if (!response.ok) {
          throw new Error('Failed to add task');
        }
    
        const result = await response.json();
        console.log('Task added successfully:', result);
    
        // החלפת המשימה הזמנית עם זו שחזרה מהשרת
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? result : t))
        );
        setAvailableTasksForNextMonth((prev) =>
          prev.map((t) => (t.id === tempId ? result : t))
        );
    
      } catch (error) {
        console.error('Error adding task:', error);
    
        // החזרת מצב קודם
        setTasks(previousTasks);
        setAvailableTasksForNextMonth(previousAvailableTasks);
    
        // הצגת שגיאה
        setErrorMessage("הייתה בעיה בהוספת המשימה. נסה שוב מאוחר יותר.");
        setErrorVisible(true);
      }
    };
    

  
  const getTasksForDate = (date) => {
    return Object.values(tasksFormatted)
      .flat()
      .filter(
        (task) =>
          new Date(date) >= new Date(task.startDate) &&
          new Date(date) <= new Date(task.endDate)
      );
  };

  const signUpForTask = async (taskId, userId) => {
    try {
      const response = await fetch(`${baseUrl}/Tasks/${taskId}/participants/${userId}`, {
        method: 'POST',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sign up for task: ${errorText}`);
      }
  
      const result = await response.text(); // assuming your backend just returns a message
      console.log('Signed up successfully:', result);
  
      // Optional: refresh tasks or participants
      fetchTasks();
      fetchMyTasks();
    } catch (error) {
      console.error('Error signing up for task:', error.message);
    }
  };
  
 
  

  const signOutOfTask = async (taskId, userId) => {

    console.log("Signing out user:", userId, "from task:", taskId);
    try {
      const response = await fetch(`${baseUrl}/Tasks/${taskId}/participants/${userId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sign out from task: ${errorText}`);
      }
  
      console.log('Signed out successfully');
      
      // Optionally reload the task list
      fetchTasks();
      fetchMyTasks();
    } catch (error) {
      console.error('Error signing out from task:', error.message);
    }
  };
  
  
const removeTaskForDate = async (taskId) => {
  console.log("Removing task", taskId);

  // שמירה על המצב הקודם
  const previousTasks = [...tasks];
  const previousAvailableTasks = [...availableTasksForNextMonth];

  // עדכון מיידי במסך
  setTasks((prev) => prev.filter((t) => t.id !== taskId));
  setAvailableTasksForNextMonth((prev) => prev.filter((t) => t.id !== taskId));

  try {
    const response = await fetch(`${baseUrl}/Tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    console.log(`Task ${taskId} deleted successfully`);
    fetchTasks(); // רענון רשימת משימות מהשרת
  } catch (error) {
    console.error('Error deleting task:', error);

    // שחזור המצב הקודם במקרה של שגיאה
    setTasks(previousTasks);
    setAvailableTasksForNextMonth(previousAvailableTasks);

    // הצגת הודעת שגיאה
    setErrorMessage("הייתה בעיה במחיקת המשימה. נסה שוב מאוחר יותר.");
    setErrorVisible(true);
  }
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

  
  
  
  const editTask = async (taskId, updatedTask) => {
    console.log("Editing task:", taskId, updatedTask);
  
    try {
      const response = await fetch(`${baseUrl}/Tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (!response.ok) {
        throw new Error('Failed to edit task');
      }
  
      console.log(`Task ${taskId} edited successfully`);
  
      // Refresh the task list or UI
      fetchTasks();
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };
  



 






  return (
    <TaskContext.Provider value={{ tasks,tasksFormatted,myTasks,availableTasksForNextMonth,getTask, addTaskForDate, getTasksForDate, removeTaskForDate, editTask,signUpForTask ,signOutOfTask,fetchTasks,fetchMyTasks}}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </TaskContext.Provider>
  );
};
