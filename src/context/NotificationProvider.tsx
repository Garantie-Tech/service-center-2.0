"use client";

import React, { createContext, useContext, ReactNode } from "react";
import toast from "react-hot-toast";

// Notification Context Interface
interface NotificationContextType {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notifyInfo: (message: string) => void;
}

// Create Context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Hook to Use Notification Context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Notification Provider Component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notifySuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
    });
  };

  const notifyError = (message: string) => {
    toast.error(message, {
      duration: 3000,
      position: "top-right",
    });
  };

  const notifyInfo = (message: string) => {
    toast(message, {
      duration: 3000,
      position: "top-right",
    });
  };

  return (
    <NotificationContext.Provider
      value={{ notifySuccess, notifyError, notifyInfo }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
