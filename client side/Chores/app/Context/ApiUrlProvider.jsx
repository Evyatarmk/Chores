import { createContext, useState, useContext, useEffect } from "react";

// יצירת Context לשמירה על ה-URL
const ApiUrlContext = createContext();

export const ApiUrlProvider = ({ children }) => {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // קביעת ה-URL לפי הסביבה (לוקאלי או חיצוני)
    const isLocal = true; // שנה לפי הצורך, אם צריך לבדוק אם זו סביבה לוקאלית או לא
    const localUrl = "http://localhost:5000"; // ה-URL של סביבת פיתוח
    const liveUrl = "https://your-live-api.com"; // ה-URL של הסביבה החיה

    if (isLocal) {
      setBaseUrl(localUrl);
    } else {
      setBaseUrl(liveUrl);
    }
  }, []);

  return (
    <ApiUrlContext.Provider value={{ baseUrl }}>
      {children}
    </ApiUrlContext.Provider>
  );
};

export const useApiUrl = () => useContext(ApiUrlContext);
