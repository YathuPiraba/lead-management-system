import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader } from "lucide-react";
import { CallLogType, getCallLogs } from "@/lib/call-logs.api";
import AddCallLogsDialog from "@/components/call-logs/AddCallLogs";
import FilterPopover from "@/components/Table/FilterPopover";

const CallLogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [callLogs, setCallLogs] = useState<CallLogType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    studentName: "",
    phone: "",
    status: "",
    notes: "",
    date: undefined as string | undefined,
  });
  const [openPopover, setOpenPopover] = useState<{ [key: string]: boolean }>({
    studentName: false,
    phone: false,
    date: false,
    status: false,
    notes: false,
  });

  const fetchCallLogs = async () => {
    try {
      const res = await getCallLogs({
        page: 1,
        limit: 10,
        ...filters,
      });
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
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const togglePopover = (column: string) => {
    setOpenPopover((prev) => {
      const newState = Object.keys(prev).reduce(
        (acc, key) => ({
          ...acc,
          [key]: false,
        }),
        prev
      );

      return {
        ...newState,
        [column]: !prev[column as keyof typeof prev],
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Call Logs</h1>
        <AddCallLogsDialog fetchCallLogs={fetchCallLogs} />
      </div>
      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="text-red-500 p-4">{error}</p>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.entries({
                      studentName: "Student Name",
                      phone: "Phone Number",
                      date: "Date",
                      status: "Status",
                      notes: "Notes",
                    }).map(([key, label]) => (
                      <TableHead key={key} className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {label}
                          <FilterPopover
                            column={key}
                            type={
                              key === "date"
                                ? "date"
                                : key === "status"
                                ? "status"
                                : "text"
                            }
                            value={filters[key as keyof typeof filters]}
                            onValueChange={(value) =>
                              handleFilterChange(key, value)
                            }
                            open={openPopover[key]}
                            onOpenChange={(open) => togglePopover(key)}
                          />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.studentName}</TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallLogsPage;
