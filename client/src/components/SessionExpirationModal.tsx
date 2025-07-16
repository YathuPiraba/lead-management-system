import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";

interface SessionExpirationModalProps {
  isOpen: boolean;
  onExtendSession: () => void;
  modalType: "timeout" | "token_expired";
}

const SessionExpirationModal: React.FC<SessionExpirationModalProps> = ({
  isOpen,
  onExtendSession,
  modalType,
}) => {
  const [countdown, setCountdown] = useState(60);
  const { logout } = useAppStore();

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, logout]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(modalType === "token_expired" ? 10 : 60);
    }
  }, [isOpen, modalType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {modalType === "token_expired"
            ? "Session Expired"
            : "Session Expiring"}
        </h2>
        <p className="text-gray-600 mb-4">
          {modalType === "token_expired"
            ? `Your session has expired and you will be logged out in ${countdown} seconds.`
            : `Your session is about to expire due to inactivity. You will be logged out in ${countdown} seconds.`}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Logout
          </button>
          {modalType === "timeout" && (
            <button
              onClick={onExtendSession}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Extend Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionExpirationModal;
