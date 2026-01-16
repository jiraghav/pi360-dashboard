"use client";

import { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [notificationPatient, setNotificationPatient] = useState(null);

  return (
    <NotificationContext.Provider
      value={{
        open,
        setOpen,
        notificationPatient,
        setNotificationPatient,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationUI() {
  return useContext(NotificationContext);
}