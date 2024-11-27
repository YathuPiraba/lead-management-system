import React from "react";

interface SessionExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpirationModal = ({
  isOpen,
  onClose,
}: SessionExpirationModalProps) => {
  const handleRedirect = () => {
    window.location.href = "/login";
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
