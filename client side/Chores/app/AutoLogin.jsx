import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useUserAndHome } from './Context/UserAndHomeContext';
import { useApiUrl } from './Context/ApiUrlProvider';

const AutoLogin = () => {
  const router = useRouter();
  const { setHome, setUser } = useUserAndHome();
  const { baseUrl } = useApiUrl();

  useEffect(() => {
    const checkLogin = async () => {
      console.log("Checking login data...");

      try {
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (!accessToken) {
          console.log("No token found, redirecting to LoginScreen");
          router.push("/LoginScreen");
          return;
        }

        let decodedToken;
        try {
          decodedToken = jwtDecode(accessToken);
        } catch (error) {
          console.error("Error decoding token", error);
          router.push("/LoginScreen");
          return;
        }

        const currentTime = Date.now() / 1000; // זמן נוכחי בשניות
        console.log(decodedToken.exp, currentTime);

        if (decodedToken.exp < currentTime) {
          console.log("Token expired, redirecting to LoginScreen");
          router.push("/LoginScreen");
          return;
        }

        // 📌 שליחת בקשה לשרת כדי לקבל את נתוני המשתמש והבית
        const userId = decodedToken.nameid; // ה-ID של המשתמש מתוך הטוקן
        console.log("Fetching user and home data for ID:", userId);

        const response = await fetch(`${baseUrl}/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user data", response.status);
          router.push("/LoginScreen");
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setHome(data.home);

        console.log("User is logged in, redirecting to HomeScreen");
        router.push("/");
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
