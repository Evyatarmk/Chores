import jwtDecode from 'jwt-decode';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useUserAndHome } from './Context/UserAndHomeContext';

const AutoLogin = () => {
  const router = useRouter();
  const {setHome,setUser}=useUserAndHome()
  useEffect(() => {
    const checkLogin = async () => {
      console.log("Checking login data...");

      try {
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (accessToken) {
          try {
            // פענוח ה-Token בעזרת jwt-decode
            const decodedToken = JSON.parse(accessToken);
            const currentTime = Date.now() / 1000;  // זמן נוכחי בשניות
            const mockUser = {
              id: "t",
              name: "אביתר",
              email: "t",
              password: "1",
              homeId: "home1",
              role: "admin",
              profilePicture: "https://www.coaching-center.co.il/wp-content/uploads/2014/12/%D7%90%D7%99%D7%A9_%D7%9E%D7%9B%D7%99%D7%A8%D7%95%D7%AA_coaching_center.jpg",
              tasksStats: {
                completedTasksByMonth: {
                  1: 10, 
                  2: 8,   
                  3: 12,
                },
                totalCompletedTasks: 30,
              },
            };
            const mockHome = {
              id: "123",
                name: "הבית של אביתר",
                code: "12345678",
                members: [
                  { id: "1", name: "אביתר", role: "admin",publicId:1 }, // אביתר הוא המנהל
                  { id: "2", name: "דני", role: "user",publicId:2 }, // דני הוא חבר רגיל
                ]
            };
            data={user:mockUser,home:mockHome}
            setUser(data.user);
            setHome(data.home);
            console.log(decodedToken.exp , currentTime)
            // אם הזמן הנוכחי גדול מה- "exp" אז הטוקן פג תוקף
            if (decodedToken.exp < currentTime) {
              console.log("Token expired, redirecting to LoginScreen");
              router.push("/LoginScreen");
            } else {
              console.log("User is logged in, redirecting to HomeScreen");
              router.push("/");
            }
          } catch (error) {
            console.error("Error decoding token", error);
            router.push("/LoginScreen");
          }
        } else {
          console.log("No token found, redirecting to LoginScreen");
          router.push("/LoginScreen");
        }
      } catch (error) {
        console.error("Error checking login data", error);
        router.push("/LoginScreen");
      }
    };

    checkLogin();
  }, []);

  return null; // לא מחזירים UI כי זה נטען מאחורי הקלעים
};

export default AutoLogin;
