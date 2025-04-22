import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const fetchWithAuth = async (url, options = {}, baseUrl) => {
  try {
    let accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && refreshToken) {
      const refreshResponse = await fetch(`${baseUrl}/Users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const tokens = await refreshResponse.json();
        await AsyncStorage.setItem("accessToken", tokens.accessToken);
        await AsyncStorage.setItem("refreshToken", tokens.refreshToken);

        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${tokens.accessToken}`,
        };

        response = await fetch(url, { ...options, headers: retryHeaders });
      } else {
        await AsyncStorage.clear();
        router.push("/LoginScreen");
        return;
      }
    }

    return response;
  } catch (error) {
    console.error("שגיאה ב-fetchWithAuth", error);
    await AsyncStorage.clear();
    router.push("/LoginScreen");
  }
};
