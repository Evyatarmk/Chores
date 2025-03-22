import jwtDecode from 'jwt-decode';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useUserAndHome } from './Context/UserAndHomeContext';

const AutoLogin = () => {
  const router = useRouter();

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
