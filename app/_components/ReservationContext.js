"use client"
import { createContext, useState } from 'react';

const ReservationContext = createContext();

function ReservationProvider({ children }) {
  const [range, setRange] = useState({ from: null, to: null });
  return <ReservationContext.Provider value={{ range, setRange }} >
    {children}
  </ReservationContext.Provider>
}
function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}
export { ReservationProvider, useReservation };