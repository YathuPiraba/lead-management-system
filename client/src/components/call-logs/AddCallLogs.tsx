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
import { Loader, PhoneCall, User, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/theme-context";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import toast from "react-hot-toast";

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

interface ValidationErrors {
  studentName?: string;
  studentAddress?: string;
  studentPhoneNumber?: string;
  department?: string;
  callDate?: string;
}

// Helper function to format date-time for input
const formatDateTimeForInput = (date: Date): string => {
  // Get local date time components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Format as YYYY-MM-DDThh:mm
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to get current system date-time
// const getCurrentDateTime = (): string => {
//   return formatDateTimeForInput(new Date());
// };

const initialFormData: CallLogFormData = {
  studentName: "",
  studentAddress: "",
  studentPhoneNumber: "",
  department: "",
  callDate: "",
  nextFollowupDate: "",
  notes: "",
  repeatFollowup: false,
  doNotFollowup: true,
};

const AddCallLogsDialog = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "followup">("profile");
  const [formData, setFormData] = useState<CallLogFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const handleQuickDateSelect = (type: "hour" | "tomorrow" | "week") => {
    const now = new Date();
    const nextDate = new Date();

    switch (type) {
      case "hour":
        nextDate.setHours(now.getHours() + 1);
        break;
      case "tomorrow":
        nextDate.setDate(now.getDate() + 1);
        break;
      case "week":
        nextDate.setDate(now.getDate() + 7);
        break;
    }

    setFormData((prev) => ({
      ...prev,
      nextFollowupDate: formatDateTimeForInput(nextDate),
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setValidationErrors({});
    setActiveTab("profile");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Only handle modal closing, not opening
      const shouldClose = window.confirm(
        "Are you sure you want to close? All unsaved changes will be lost."
      );
      if (shouldClose) {
        resetForm();
        setOpen(false);
      }
    } else {
      setOpen(true);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      department: value,
    }));
  };

  const validateProfile = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!formData.studentName.trim()) {
      errors.studentName = "Student name is required";
      isValid = false;
    }

    if (!formData.studentAddress.trim()) {
      errors.studentAddress = "Address is required";
      isValid = false;
    }

    if (!formData.studentPhoneNumber.trim()) {
      errors.studentPhoneNumber = "Phone number is required";
      isValid = false;
    } else if (
      isNaN(Number(formData.studentPhoneNumber)) ||
      formData.studentPhoneNumber.length < 9
    ) {
      errors.studentPhoneNumber =
        "Phone number must be at least 9 digits and valid";
      isValid = false;
    }

    if (!formData.department) {
      errors.department = "Department is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const validateFollowup = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!formData.callDate) {
      errors.callDate = "Call date is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (validateProfile()) {
      setActiveTab("followup");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isProfileValid = validateProfile();
    const isFollowupValid = validateFollowup();

    if (!isProfileValid || !isFollowupValid) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        student: {
          name: formData.studentName,
          address: formData.studentAddress,
          phone_number: formData.studentPhoneNumber,
          department_of_study: formData.department,
        },
        callLog: {
          call_date: formData.callDate,
          next_followup_date: formData.doNotFollowup
            ? ""
            : formData.nextFollowupDate,
          notes: formData.notes,
          repeat_followup: formData.repeatFollowup,
          do_not_followup: formData.doNotFollowup,
        },
      };

      // Call API with payload
      console.log("Submitting data:", payload);
      toast.success("Call Log Added Successfully");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error(error);
      setValidationErrors((prev) => ({
        ...prev,
        submit: "Failed to add call log. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (fieldName: keyof ValidationErrors) => {
    if (validationErrors[fieldName]) {
      return (
        <span className="text-red-500 text-sm mt-1">
          {validationErrors[fieldName]}
        </span>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add a New Lead or Customer</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-32 space-y-4">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full p-4 text-center rounded-lg flex flex-col items-center gap-2 transition-colors ${
                activeTab === "profile" ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <User className="h-6 w-6" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => activeTab === "profile" && handleNext()}
              className={`w-full p-4 text-center rounded-lg flex flex-col items-center gap-2 transition-colors ${
                activeTab === "followup" ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <Clock className="h-6 w-6" />
              <span>Follow-up</span>
            </button>
          </div>

          {/* Main Content */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-4">
            {activeTab === "profile" ? (
              <>
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
                    className={
                      validationErrors.studentName ? "border-red-500" : ""
                    }
                  />
                  {renderFieldError("studentName")}
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
                    className={
                      validationErrors.studentAddress ? "border-red-500" : ""
                    }
                  />
                  {renderFieldError("studentAddress")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentPhoneNumber">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="w-full">
                    <PhoneInput
                      defaultCountry="lk"
                      name="studentPhoneNumber"
                      value={formData.studentPhoneNumber}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          studentPhoneNumber: value || "",
                        }));
                      }}
                      placeholder="Enter phone number"
                      className={`w-full ${
                        validationErrors.studentPhoneNumber
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {renderFieldError("studentPhoneNumber")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger
                      className={
                        validationErrors.department ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PTE">PTE</SelectItem>
                      <SelectItem value="IELTS">IELTS</SelectItem>
                      <SelectItem value="Study Abroad">Study Abroad</SelectItem>
                      <SelectItem value="Visit Visa">Visit Visa</SelectItem>
                      <SelectItem value="Bank Balance">Bank Balance</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                      <SelectItem value="Wrong call">Wrong call</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderFieldError("department")}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="callDate">
                    Call Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="callDate"
                    name="callDate"
                    type="datetime-local"
                    value={formData.callDate}
                    onChange={handleInputChange}
                    className={
                      validationErrors.callDate ? "border-red-500" : ""
                    }
                  />
                  {renderFieldError("callDate")}
                </div>

                <div className="relative flex flex-wrap gap-2 items-center">
                  <label
                    className="cursor-pointer text-slate-500 peer-disabled:cursor-not-allowed peer-disabled:text-slate-400"
                    htmlFor="repeatFollowup"
                  >
                    {formData.repeatFollowup
                      ? "Repeat Follow-up"
                      : "Do Not Follow-up"}
                  </label>
                  <input
                    className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full after:bg-slate-500 after:transition-all checked:bg-emerald-200 checked:after:left-4 checked:after:bg-emerald-500 hover:bg-slate-400 after:hover:bg-slate-600 checked:hover:bg-emerald-300 checked:after:hover:bg-emerald-600 focus:outline-none checked:focus:bg-emerald-400 checked:after:focus:bg-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:after:bg-slate-300"
                    type="checkbox"
                    id="repeatFollowup"
                    name="repeatFollowup"
                    checked={formData.repeatFollowup}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        repeatFollowup: e.target.checked,
                        doNotFollowup: !e.target.checked,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextFollowupDate">Next Follow-Up Date</Label>
                  <Input
                    id="nextFollowupDate"
                    name="nextFollowupDate"
                    type="datetime-local"
                    value={formData.nextFollowupDate}
                    onChange={handleInputChange}
                    disabled={formData.doNotFollowup}
                  />
                  {formData.repeatFollowup && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickDateSelect("hour")}
                      >
                        Next 1 hour
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickDateSelect("tomorrow")}
                      >
                        Tomorrow same time
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickDateSelect("week")}
                      >
                        Next week same time
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Follow-up Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="What to do on next follow-up?"
                  />
                </div>
              </>
            )}

            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div>Please fix the following errors:</div>
                  <ul className="list-disc pl-4 mt-2">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTab === "followup") {
                    setActiveTab("profile");
                  } else {
                    const shouldClose = window.confirm(
                      "Are you sure you want to close? All unsaved changes will be lost."
                    );
                    if (shouldClose) {
                      resetForm();
                      setOpen(false);
                    }
                  }
                }}
              >
                {activeTab === "followup" ? "Back" : "Cancel"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (activeTab === "profile") {
                    handleNext();
                  } else {
                    handleSubmit(
                      new Event("submit") as unknown as React.FormEvent
                    );
                  }
                }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    {activeTab === "profile" ? "Moving..." : "Adding..."}
                  </div>
                ) : activeTab === "profile" ? (
                  "Next"
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCallLogsDialog;
