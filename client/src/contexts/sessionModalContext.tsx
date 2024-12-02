"use client";
// sessionModalContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import SessionExpirationModal from "../components/SessionExpirationModal";
import { SESSION_EXPIRED_EVENT } from "@/lib/axios";

interface SessionModalContextType {
  showSessionModal: () => void;
}

const SessionModalContext = createContext<SessionModalContextType | undefined>(
  undefined
);

export const SessionModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showSessionModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      showSessionModal();
    };

    // Add event listener for session expired
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [showSessionModal]);

  return (
    <SessionModalContext.Provider value={{ showSessionModal }}>
      {children}
      <SessionExpirationModal isOpen={isModalOpen} onClose={handleClose} />
    </SessionModalContext.Provider>
  );
};

export const useSessionModal = () => {
  const context = useContext(SessionModalContext);
  if (!context) {
    throw new Error(
      "useSessionModal must be used within a SessionModalProvider"
    );
  }
  return context;
};
