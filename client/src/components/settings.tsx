import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, Building } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="fullName" className="pl-8" placeholder="John Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  className="pl-8"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
                  className="pl-8"
                  placeholder="+1 234-567-8900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Select>
                  <SelectTrigger className="pl-8">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="emailNotif" className="rounded" />
              <Label htmlFor="emailNotif">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="smsNotif" className="rounded" />
              <Label htmlFor="smsNotif">SMS Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="taskReminders" className="rounded" />
              <Label htmlFor="taskReminders">Task Reminders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="leadUpdates" className="rounded" />
              <Label htmlFor="leadUpdates">Lead Updates</Label>
            </div>
          </div>

          <div className="pt-4">
            <Button>Update Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
