import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before expiry

export const useSessionTimeout = () => {
  const [showModal, setShowModal] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, logout } = useAuthStore();

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    setShowModal(false);

    if (isAuthenticated) {
      // Set warning timer
      warningTimeoutRef.current = setTimeout(() => {
        setShowModal(true);
      }, SESSION_TIMEOUT - WARNING_TIME);

      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT);
    }
  }, [isAuthenticated, logout]);

  const extendSession = () => {
    setShowModal(false);
    resetTimer();
  };

  useEffect(() => {
    if (isAuthenticated) {
      resetTimer();

      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
      ];

      events.forEach((event) => {
        document.addEventListener(event, resetTimer, true);
      });

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, resetTimer, true);
        });

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
      };
    }
  }, [isAuthenticated, resetTimer]);

  return { showModal, extendSession };
};
