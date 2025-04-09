import { createContext, useState, useContext } from "react";

// יצירת Context לשמירה על ה-URL
const ApiUrlContext = createContext();

export const ApiUrlProvider = ({ children }) => {
  const isLocal = true; // שנה לפי הצורך אם זו סביבה לוקאלית או לא
  const localUrl = "https://localhost:7214/api"; // ה-URL של סביבת פיתוח
  const liveUrl = "https://proj.ruppin.ac.il/cgroup83/test2/tar7/api"; // ה-URL של הסביבה החיה

  const baseUrl = isLocal ? localUrl : liveUrl;

  return (
    <ApiUrlContext.Provider value={{ baseUrl }}>
      {children}
    </ApiUrlContext.Provider>
  );
};

export const useApiUrl = () => useContext(ApiUrlContext);
