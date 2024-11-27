// sessionModalContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import SessionExpirationModal from "../components/SessionExpirationModal";

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
