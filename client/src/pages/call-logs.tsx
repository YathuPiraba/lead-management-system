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
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddCallLogsDialog from "@/components/call-logs/AddCallLogs";

const CallLogsPage = () => {
  const callLogs = [
    {
      id: 1,
      studentName: "John Doe",
      phone: "+1 234-567-8901",
      date: "2024-03-28",
      duration: "5:23",
      status: "Completed",
      notes: "Interested in Web Development course",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      phone: "+1 234-567-8902",
      date: "2024-03-28",
      duration: "3:45",
      status: "No Answer",
      notes: "Will try again tomorrow",
    },
    // Add more sample data as needed
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Call Logs</h1>
        <AddCallLogsDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search calls..." className="pl-8" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.studentName}
                  </TableCell>
                  <TableCell>{log.phone}</TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.duration}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        log.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell>{log.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallLogsPage;
