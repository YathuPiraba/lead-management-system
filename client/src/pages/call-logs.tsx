import React, { useEffect, useState } from "react";
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
import { Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddCallLogsDialog from "@/components/call-logs/AddCallLogs";
import { CallLogType, getCallLogs } from "@/lib/call-logs.api";

const CallLogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [callLogs, setCallLogs] = React.useState<CallLogType[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCallLogs = async () => {
    try {
      const res = await getCallLogs();
      setCallLogs(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load call logs");
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs();
  }, []);

  if (loading) {
    <div className="flex justify-center items-center h-40">
      <Loader />
    </div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Call Logs</h1>
        <AddCallLogsDialog fetchCallLogs={fetchCallLogs} />
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
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.studentName}
                    </TableCell>
                    <TableCell>{log.phone}</TableCell>
                    <TableCell>{log.date}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallLogsPage;
