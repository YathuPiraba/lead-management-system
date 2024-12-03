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
import { Loader, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/theme-context";
import { registerStaff } from "@/lib/apiServices";
import { toast } from "react-hot-toast";

interface StaffFormData {
  firstName: string;
  email: string;
  contactNo: string;
  image?: File;
}

const AddStaffDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: "",
    email: "",
    contactNo: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: files[0],
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
    if (!formData.firstName || !formData.email || !formData.contactNo) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (isNaN(Number(formData.contactNo))) {
      setError("Contact number must be a valid number");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("firstName", formData.firstName);
      payload.append("email", formData.email);
      payload.append("contactNo", formData.contactNo);
      if (formData.image) {
        payload.append("image", formData.image);
      }

      const res = await registerStaff(payload);
      const successMessage = res.message || "Staff member added successfully!";
      toast.success(successMessage);
      setOpen(false);
      setFormData({ firstName: "", email: "", contactNo: "" });
    } catch (error) {
      console.error(error);

      setError("Failed to register staff member. Please try again.");
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
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter staff name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNo">
              Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactNo"
              name="contactNo"
              type="text"
              value={formData.contactNo}
              onChange={handleInputChange}
              placeholder="Enter contact number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">
              Profile Image <span className="text-gray-500">(Optional)</span>
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="cursor-pointer"
            />
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
                "Add Staff Member"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffDialog;
