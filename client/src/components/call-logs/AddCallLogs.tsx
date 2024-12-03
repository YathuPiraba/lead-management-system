import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, PhoneCall } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/theme-context";
// import { addCallLog } from "@/lib/apiServices";
// import { toast } from "react-hot-toast";

interface CallLogFormData {
  studentName: string;
  studentAddress: string;
  studentPhoneNumber: string;
  department: string;
  callDate: string;
  nextFollowupDate?: string;
  notes: string;
  repeatFollowup: boolean;
  doNotFollowup: boolean;
}

const AddCallLogsDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CallLogFormData>({
    studentName: "",
    studentAddress: "",
    studentPhoneNumber: "",
    department: "",
    callDate: "",
    nextFollowupDate: "",
    notes: "",
    repeatFollowup: false,
    doNotFollowup: false,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (
      !formData.studentName ||
      !formData.studentAddress ||
      !formData.studentPhoneNumber ||
      !formData.department ||
      !formData.callDate
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (isNaN(Number(formData.studentPhoneNumber))) {
      setError("Phone number must be a valid number");
      setLoading(false);
      return;
    }

    try {
      //   const res = await addCallLog(formData); // Call API service
      //   const successMessage = res.message || "Call log added successfully!";
      //   toast.success(successMessage);
      setOpen(false);
      setFormData({
        studentName: "",
        studentAddress: "",
        studentPhoneNumber: "",
        department: "",
        callDate: "",
        nextFollowupDate: "",
        notes: "",
        repeatFollowup: false,
        doNotFollowup: false,
      });
    } catch (error) {
      console.error(error);
      setError("Failed to add call log. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { isDarkMode } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`${
            isDarkMode ? "bg-gray-200 text-black hover:bg-gray-300" : "bg-black"
          }`}
        >
          <PhoneCall className="mr-2 h-4 w-4" />
          Add Call Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Call Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">
              Student Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentAddress">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="studentAddress"
              name="studentAddress"
              value={formData.studentAddress}
              onChange={handleInputChange}
              placeholder="Enter student address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentPhoneNumber">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="studentPhoneNumber"
              name="studentPhoneNumber"
              value={formData.studentPhoneNumber}
              onChange={handleInputChange}
              placeholder="Enter student phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">
              Department <span className="text-red-500">*</span>
            </Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Enter department of study"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callDate">
              Call Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="callDate"
              name="callDate"
              type="date"
              value={formData.callDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextFollowupDate">Next Follow-Up Date</Label>
            <Input
              id="nextFollowupDate"
              name="nextFollowupDate"
              type="date"
              value={formData.nextFollowupDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter any notes about the call"
            />
          </div>

          <div className="space-y-2">
            <Label>
              <Input
                type="checkbox"
                name="repeatFollowup"
                checked={formData.repeatFollowup}
                onChange={handleInputChange}
              />
              Repeat Follow-Up
            </Label>
            <Label>
              <Input
                type="checkbox"
                name="doNotFollowup"
                checked={formData.doNotFollowup}
                onChange={handleInputChange}
              />
              Do Not Follow-Up
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <div className="flex items-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </div>
              ) : (
                "Add Call Log"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCallLogsDialog;
