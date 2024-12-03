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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
  const [activeTab, setActiveTab] = useState<"profile" | "followup">("profile");
  const [formData, setFormData] = useState<CallLogFormData>({
    studentName: "",
    studentAddress: "",
    studentPhoneNumber: "",
    department: "",
    callDate: "",
    nextFollowupDate: "",
    notes: "",
    repeatFollowup: true,
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
      if (name === "followupToggle") {
        setFormData((prev) => ({
          ...prev,
          repeatFollowup: target.checked,
          doNotFollowup: !target.checked,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      department: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      setOpen(false);
      setFormData({
        studentName: "",
        studentAddress: "",
        studentPhoneNumber: "",
        department: "",
        callDate: "",
        nextFollowupDate: "",
        notes: "",
        repeatFollowup: true,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              onClick={() => setActiveTab("followup")}
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
                  <Select
                    value={formData.department}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger>
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
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" size="sm">
                      Next 1 hour
                    </Button>
                    <Button type="button" variant="outline" size="sm">
                      Tomorrow same time
                    </Button>
                    <Button type="button" variant="outline" size="sm">
                      Next week same time
                    </Button>
                  </div>
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

                <div className="relative flex flex-wrap gap-2 items-center">
                  <label
                    className="cursor-pointer pl-2  text-slate-500 peer-disabled:cursor-not-allowed peer-disabled:text-slate-400"
                    htmlFor="followupToggle"
                  >
                    {formData.repeatFollowup
                      ? "Repeat Follow-up"
                      : "Do Not Follow-up"}
                  </label>
                  <input
                    className="peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full after:bg-slate-500 after:transition-all checked:bg-emerald-200 checked:after:left-4 checked:after:bg-emerald-500 hover:bg-slate-400 after:hover:bg-slate-600 checked:hover:bg-emerald-300 checked:after:hover:bg-emerald-600 focus:outline-none checked:focus:bg-emerald-400 checked:after:focus:bg-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:after:bg-slate-300"
                    type="checkbox"
                    name="followupToggle"
                    checked={formData.repeatFollowup}
                    onChange={handleInputChange}
                    id="followupToggle"
                  />
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </div>
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
