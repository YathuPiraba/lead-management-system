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
import { CallLogType, getCallLogs, PaginationInfo } from "@/lib/call-logs.api";
import AddCallLogsDialog from "@/components/call-logs/AddCallLogs";
import FilterPopover from "@/components/Table/FilterPopover";
import Pagination from "@/components/Pagination";

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
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchCallLogs = async (page: number = 1) => {
    try {
      const res = await getCallLogs({
        page,
        limit: pagination.itemsPerPage,
        ...filters,
      });
      setPagination(res.pagination);
      setCallLogs(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load call logs");
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallLogs(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin" />
      </div>
    );
  }

  const columnWidths = {
    no: "w-16",
    studentName: "w-48",
    phone: "w-44",
    date: "w-52",
    status: "w-28",
    notes: "w-96",
  };

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
            <>
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={`${columnWidths.no} pl-3`}>
                        No
                      </TableHead>
                      {Object.entries({
                        studentName: "Student Name",
                        phone: "Phone Number",
                        date: "Date - Time",
                        status: "Status",
                        notes: "Notes",
                      }).map(([key, label]) => (
                        <TableHead
                          key={key}
                          className={`${
                            columnWidths[key as keyof typeof columnWidths]
                          } whitespace-nowrap`}
                        >
                          <div className="flex items-center justify-between">
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
                              onOpenChange={() => togglePopover(key)}
                            />
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callLogs.map((log, index) => (
                      <TableRow key={log.id}>
                        <TableCell className={columnWidths.no}>
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-800 font-semibold">
                            {(pagination.currentPage - 1) *
                              pagination.itemsPerPage +
                              index +
                              1}
                          </div>
                        </TableCell>
                        <TableCell className={columnWidths.studentName}>
                          {log.studentName}
                        </TableCell>
                        <TableCell className={columnWidths.phone}>
                          {log.phone}
                        </TableCell>
                        <TableCell className={columnWidths.date}>
                          {log.date}
                        </TableCell>
                        <TableCell className={columnWidths.status}>
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
                        <TableCell className={columnWidths.notes}>
                          {log.notes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallLogsPage;
