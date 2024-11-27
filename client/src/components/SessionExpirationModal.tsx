"use client";

import React from "react";
import { useAuth } from "@/stores/auth-store"; // Assuming Zustand store
import { useRouter } from "next/navigation";
interface SessionExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpirationModal = ({
  isOpen,
  onClose,
}: SessionExpirationModalProps) => {
  const { logout } = useAuth(); // Access logout from Zustand store
  const router = useRouter();

  const handleRedirect = async () => {
    try {
      // Log the user out
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    // Use Next.js router to redirect to login page
    router.push("/");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-semibold mb-4">Session Expired</h2>
        <p className="mb-6">
          Your session has expired. Please log in again to continue.
        </p>
        <button
          onClick={handleRedirect}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default SessionExpirationModal;
