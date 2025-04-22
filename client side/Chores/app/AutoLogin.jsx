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

      try {
        let accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
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

        const currentTime = Date.now() / 1000;
        const timeLeftInSeconds = decodedToken.exp - currentTime;

  if (timeLeftInSeconds > 0) {
    const minutesLeft = Math.floor(timeLeftInSeconds / 60);
    const secondsLeft = Math.floor(timeLeftInSeconds % 60);
   }
        if (decodedToken.exp < currentTime) {
          // 🔄 מנסה לרענן את הטוקן
          console.log("Access token expired, attempting to refresh...");
          const refreshResponse = await fetch(`${baseUrl}/Users/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            router.push("/LoginScreen");
            return;
          }

          const refreshData = await refreshResponse.json();
          accessToken = refreshData.accessToken;

          await AsyncStorage.setItem('accessToken', refreshData.accessToken);
          await AsyncStorage.setItem('refreshToken', refreshData.refreshToken);
        }

        const userId = jwtDecode(accessToken).nameid;

        const response = await fetch(`${baseUrl}/Users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          router.push("/LoginScreen");
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setHome(data.home);

        router.push("/HomePageScreen");
            } catch (error) {
        console.error("Error checking login data", error);
        router.push("/LoginScreen");
      }
    };

    checkLogin();
  }, []);

  return null;
};

export default AutoLogin;
