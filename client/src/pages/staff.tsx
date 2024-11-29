import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const StaffPage = () => {
  const staffMembers = [
    {
      id: 1,
      name: "David Wilson",
      role: "Lead Generator",
      email: "david@example.com",
      phone: "+1 234-567-8905",
      status: "Active",
      performance: "High",
      assignedLeads: 45
    },
    {
      id: 2,
      name: "Sarah Brown",
      role: "Sales Manager",
      email: "sarah@example.com",
      phone: "+1 234-567-8906",
      status: "Active",
      performance: "Medium",
      assignedLeads: 32
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-gray-500">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Leads Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">543</div>
            <p className="text-sm text-gray-500">Active leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Members</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search staff..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Assigned Leads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {staff.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      staff.performance === "High" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {staff.performance}
                    </span>
                  </TableCell>
                  <TableCell>{staff.assignedLeads}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPage;