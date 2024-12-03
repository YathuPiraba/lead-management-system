import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useAuth } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Separate the modal component outside the hook
const ChangePasswordModalComponent = ({
  isOpen,
  setIsOpen,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  loading: boolean;
  setIsOpen: (value: boolean) => void;
  onSubmit: (data: PasswordChangeForm) => Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordChangeForm>();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen} // Prevent closing on outside click
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing on outside click
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent closing on Escape key
      >
        <DialogHeader>
          <DialogTitle>Change Your Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Current Password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
            />
            {errors.currentPassword && (
              <span className="text-red-500 text-sm">
                {errors.currentPassword.message}
              </span>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="New Password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.newPassword && (
              <span className="text-red-500 text-sm">
                {errors.newPassword.message}
              </span>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Confirm New Password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("newPassword") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full pwd-btn"
            disabled={loading}
          >
            Change Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Custom hook
export const useChangePasswordModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { changePassword } = useAuth();
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: PasswordChangeForm) => {
      setIsLoading(true);
      try {
        await changePassword(data.currentPassword, data.newPassword);
        setIsOpen(false);
        toast.success("Password changed successfully");
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to change password:", error);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [changePassword]
  );

  const ChangePasswordModal = useCallback(
    () => (
      <ChangePasswordModalComponent
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSubmit={handleSubmit}
        loading={isLoading}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, handleSubmit]
  );

  return {
    showModal: useCallback(() => setIsOpen(true), []),
    ChangePasswordModal,
  };
};
