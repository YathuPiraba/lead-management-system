import React, { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExpiredResponse } from "@/lib/followups.api";

interface RescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followup: ExpiredResponse | null;
  onSuccess: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  open,
  onOpenChange,
  followup,
  onSuccess,
}) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // Reset date when modal is opened/closed
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSelectedDate(new Date());
    }
  };

  const handleConfirmMove = () => {
    onOpenChange(false);
    setConfirmDialogOpen(true);
  };

  const handleFinalConfirm = async () => {
    try {
      // Here you would implement the API call to reschedule the followup
      // Example: await rescheduleFollowup(followup?.id, selectedDate);
      console.log("Moving followup", followup?.id, "to", selectedDate);

      // Call success callback after successful rescheduling
      onSuccess();
    } catch (error) {
      console.error("Error rescheduling followup:", error);
    } finally {
      setConfirmDialogOpen(false);
      setSelectedDate(new Date());
    }
  };

  // Format current datetime for min attribute of datetime-local input
  const formattedNow = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  return (
    <>
      {/* Reschedule Modal */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Follow-up</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              {followup && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Student: {followup.studentName}
                  </p>
                  <p className="text-sm text-gray-500">
                    Lead No: {followup.leadNo}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reschedule-date">
                  Select a new date and time for this follow-up:
                </Label>
                <Input
                  id="reschedule-date"
                  type="datetime-local"
                  min={formattedNow}
                  value={
                    selectedDate
                      ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    setSelectedDate(date);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmMove} disabled={!selectedDate}>
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move this follow-up to{" "}
              {selectedDate && format(selectedDate, "MMM dd, yyyy 'at' h:mm a")}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalConfirm}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RescheduleModal;
