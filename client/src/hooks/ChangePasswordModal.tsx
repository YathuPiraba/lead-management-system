import React, { useState } from "react";
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

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useChangePasswordModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordChangeForm>();

  const onSubmit = async (data: PasswordChangeForm) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to change password:", error);
    }
  };

  const ChangePasswordModal = () => (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
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

          <Button type="submit" className="w-full">
            Change Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return {
    showModal: () => setIsOpen(true),
    ChangePasswordModal,
  };
};
