import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Grievance, Announcement, Appointment, Notification } from '../types';

interface AppContextType {
  grievances: Grievance[];
  announcements: Announcement[];
  appointments: Appointment[];
  notifications: Notification[];
  setGrievances: (grievances: Grievance[]) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setNotifications: (notifications: Notification[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  return (
    <AppContext.Provider value={{
      grievances, announcements, appointments, notifications,
      setGrievances, setAnnouncements, setAppointments, setNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;