import React, { createContext, useContext, useState, useEffect} from "react";
import { useUserAndHome } from "./UserAndHomeContext";
import { useApiUrl } from "./ApiUrlProvider";
import ErrorNotification from "../Components/ErrorNotification";
import { fetchWithAuth } from "../Utils/fetchWithAuth";


const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);
 

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [tasksFormatted, setTasksFormatted] = useState({});
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
       
      }
    }, [home, user]);
    useEffect(() => {
      const currentUserId = user?.id; // או מאיפה שאתה שומר את המשתמש הנוכחי
    
      const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // ראשון
startOfWeek.setHours(0, 0, 0, 0);

const endOfWeek = new Date();
endOfWeek.setDate(startOfWeek.getDate() + 6); // שבת
endOfWeek.setHours(23, 59, 59, 999);

const myThisWeek = tasks.filter(task =>
  task.participants?.some(p => p.id === currentUserId) &&
  new Date(task.startDate) >= startOfWeek &&
  new Date(task.startDate) <= endOfWeek
);
    
      const today = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setDate(today.getDate() + 30);
      const available = tasks.filter(task => {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
      
        const isInDateRange =
          (start >= today && start <= oneMonthFromNow) || 
          (end >= today && end <= oneMonthFromNow) ||
          (start <= today && end >= oneMonthFromNow); // מכסה טווח שכולל את כל החודש
      
        const isNotFull = task.participants?.length < task?.maxParticipants || task?.maxParticipants === -1;
        const isNotJoined = !task.participants?.some(p => p.id === user.id);
      
        return isInDateRange && isNotFull && isNotJoined;
      });
      
    
      setMyTasks(myThisWeek);     
       setAvailableTasksForNextMonth(available);
    }, [tasks, user]);

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
              status:task.status,
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

       
        // עדכון הסטייטים
        setTasks([...data]);
    
      } catch (error) {
        console.error("שגיאה בקבלת משימות:", error);
        setErrorMessage("לא ניתן לטעון משימות, אנא נסה שוב מאוחר יותר");
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
    

    const markTaskAsCompleted = async (taskId) => {
      // שמירת מצב קודם
      const previousTasks = [...tasks];
    
      // עדכון מיידי על המסך - שינוי המשימה המתאימה ל־completed
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: true} : task
        )
      );
    
      try {
        const response = await fetchWithAuth(`${baseUrl}/Tasks/markAsCompleted/${taskId}`, {
          method: "PUT",
          body: JSON.stringify({ TaskId: taskId, UserId: user.id }),
        });
    
        if (!response.ok) {
          throw new Error("שגיאה בסימון משימה כבוצעה");
        }
    
        const result = await response.json();
        console.log("Task marked as completed successfully:", result);
    
        fetchTasks(); // רענון מהשרת
    
      } catch (error) {
        console.error("Error marking task as completed:", error);
    
        // שחזור מצב קודם
        setTasks(previousTasks);
    
        setErrorMessage("הייתה בעיה בסימון המשימה כבוצעה. נסה שוב.");
        setErrorVisible(true);
      }
    };

    const markTaskAsNotCompleted = async (taskId) => { 
      try {
        const response = await fetchWithAuth(`${baseUrl}/Tasks/markAsNotCompleted/${taskId}`, {
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
        setErrorMessage("שגיאה בסימון משימה כלא בוצעה");
        setErrorVisible(true);
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
        const response = await fetchWithAuth(`${baseUrl}/Tasks`, {
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
    // שמירת המצב הקודם
    const previousTasks = [...tasks];
    const previousAvailableTasks = { ...availableTasksForNextMonth };
    const previousMyTasks = [...myTasks];
  
    try {
      // מציאת המשימה בעדכון אופטימי
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) throw new Error("Task not found");
  
      const updatedTask = {
        ...taskToUpdate,
        participants: [...taskToUpdate.participants, { id: user.id, name: user.name }],
      };
  
      setTasks(prev =>prev.map(t => (t.id === taskId ? updatedTask : t)));
      setAvailableTasksForNextMonth(prev =>prev.map(t => (t.id === taskId ? updatedTask : t)));
      setMyTasks(prev => {
        const exists = prev.some(t => t.id === taskId);
        if (exists) {
          return prev.map(t => (t.id === taskId ? updatedTask : t));
        } else {
          return [...prev, updatedTask];
        }
      });  
      // קריאה לשרת
      const response = await fetchWithAuth(`${baseUrl}/Tasks/${taskId}/participants/${userId}`, {
        method: 'POST',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sign up for task: ${errorText}`);
      }
  
      const result = await response.text();
      console.log('Signed up successfully:', result);
  
    } catch (error) {
      console.error('Error signing up for task:', error.message);
  
      // החזרת המצב הקודם
      setTasks(previousTasks);
      setAvailableTasksForNextMonth(previousAvailableTasks);
      setMyTasks(previousMyTasks);
  
      setErrorMessage("הייתה בעיה בהרשמה למשימה. נסה שוב מאוחר יותר.");
      setErrorVisible(true);
    }
  };
  
 
  

  const signOutOfTask = async (taskId, userId) => {

    console.log("Signing out user:", userId, "from task:", taskId);
    try {
      const response = await fetchWithAuth(`${baseUrl}/Tasks/${taskId}/participants/${userId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sign out from task: ${errorText}`);
      }
  
      console.log('Signed out successfully');
      
      // Optionally reload the task list
      fetchTasks();
     
    } catch (error) {
      console.error('Error signing out from task:', error.message);
    }
  };
  
  
const removeTaskForDate = async (taskId) => {
  console.log("Removing task", taskId);

  // שמירה על המצב הקודם
  const previousTasks = [...tasks];

  // עדכון מיידי במסך
  setTasks((prev) => prev.filter((t) => t.id !== taskId));

  try {
    const response = await fetchWithAuth(`${baseUrl}/Tasks/${taskId}`, {
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
    const originalTask = tasks.find(task => task.id === taskId);
  
    // עדכון הממשק המקומי באופן אופטימי
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
    );
  
    try {
      const response = await fetchWithAuth(`${baseUrl}/Tasks/${taskId}`, {
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
    } catch (error) {
      // החזרת הממשק המקומי למצבו המקורי במקרה של כישלון
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? originalTask : task
        )
      );
  
      setErrorMessage("שגיאה בעריכת משימה. אנא נסה שוב.");
      setErrorVisible(true);
    }
  };
  
  



 






  return (
    <TaskContext.Provider value={{ tasks,fetchTasks,setTasks,tasksFormatted,myTasks,availableTasksForNextMonth,getTask, addTaskForDate, getTasksForDate, removeTaskForDate, editTask,signUpForTask ,signOutOfTask,fetchTasks,markTaskAsNotCompleted ,markTaskAsCompleted}}>
      {children}
      <ErrorNotification message={errorMessage} visible={errorVisible} onClose={handleCloseError} />
    </TaskContext.Provider>
  );
};
