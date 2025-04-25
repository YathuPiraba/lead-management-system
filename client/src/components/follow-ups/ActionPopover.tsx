import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define interfaces for props and data types
interface StaffMember {
  id: string;
  name: string;
}

interface Followup {
  id: string;
  studentStatus?: string;
}

interface ActionPopoverProps {
  followup: Followup;
  onStatusChange: (status: string) => void;
  onDateChange: (date: Date) => void;
  onStaffAssign: (staffId: string) => void;
}

const ActionPopover: React.FC<ActionPopoverProps> = ({
  followup,
  onStatusChange,
  onDateChange,
  onStaffAssign,
}) => {
  // Format the current date for datetime-local input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [dateTime, setDateTime] = useState<string>(
    formatDateForInput(new Date())
  );
  const [status, setStatus] = useState<string>(
    followup.studentStatus || "open"
  );
  const [staff, setStaff] = useState<string>("");
  const [callDateTime, setCallDateTime] = useState<string>(
    formatDateForInput(new Date())
  );

  // Mock staff list - replace with your actual data
  const staffList: StaffMember[] = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Robert Johnson" },
    { id: "4", name: "Sarah Williams" },
  ];

  const handleSave = () => {
    onStatusChange(status);
    onDateChange(new Date(dateTime));
    onStaffAssign(staff);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="py-3 px-0">
            <CardTitle className="text-lg">Follow-up Actions</CardTitle>
            <CardDescription>
              Update status, schedule follow-up or assign staff
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="call-date">Schedule Call Date</Label>
              <Input
                id="call-date"
                type="datetime-local"
                value={callDateTime}
                onChange={(e) => setCallDateTime(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <RadioGroup
                id="status"
                value={status}
                onValueChange={setStatus}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="open" id="open" />
                  <Label htmlFor="open" className="text-sm font-normal">
                    Open
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hold" id="hold" />
                  <Label htmlFor="hold" className="text-sm font-normal">
                    Hold
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label htmlFor="reject" className="text-sm font-normal">
                    Reject
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {(status === "open" || status === "hold") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="staff">Assign Staff</Label>
                  <Select value={staff} onValueChange={setStaff}>
                    <SelectTrigger id="staff" className="w-full">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((staffMember) => (
                        <SelectItem key={staffMember.id} value={staffMember.id}>
                          {staffMember.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followup-date">Schedule Next Follow-up</Label>
                  <Input
                    id="followup-date"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-0 pt-4 flex justify-end">
            <Button onClick={handleSave} size="sm">
              <Check className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ActionPopover;
