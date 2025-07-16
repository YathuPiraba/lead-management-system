import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store/appStore";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before expiry

export const useSessionTimeout = ({ enabled = true } = {}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"timeout" | "token_expired">(
    "timeout"
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, logout } = useAppStore();

  const resetTimer = useCallback(() => {
    if (!enabled || !isAuthenticated) return;

    clearTimeout(timeoutRef.current!);
    clearTimeout(warningTimeoutRef.current!);
    setShowModal(false);

    warningTimeoutRef.current = setTimeout(() => {
      setModalType("timeout");
      setShowModal(true);
    }, SESSION_TIMEOUT - WARNING_TIME);

    timeoutRef.current = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  }, [enabled, isAuthenticated, logout]);

  const extendSession = () => {
    setShowModal(false);
    resetTimer();
  };

  const showTokenExpiredModal = () => {
    setModalType("token_expired");
    setShowModal(true);
  };

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    resetTimer();

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) =>
      document.addEventListener(event, resetTimer, true)
    );

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, resetTimer, true)
      );
      clearTimeout(timeoutRef.current!);
      clearTimeout(warningTimeoutRef.current!);
    };
  }, [enabled, isAuthenticated, resetTimer]);

  return { showModal, extendSession, modalType, showTokenExpiredModal };
};
