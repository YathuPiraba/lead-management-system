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
import { Calendar, Loader } from "lucide-react";
import { ExpiredResponse, getExpiredFollowups } from "@/lib/followups.api";
import { PaginationInfo } from "@/lib/call-logs.api";
import Pagination from "@/components/Pagination";
import Link from "next/link";

const MissedFollowup = () => {
  const [filters, setFilters] = useState({
    studentName: "",
    phone: "",
    status: "",
    date: undefined as string | undefined,
  });
  const [openPopover, setOpenPopover] = useState<{ [key: string]: boolean }>({
    studentName: false,
    phone: false,
    date: false,
    status: false,
  });
  const [loading, setLoading] = useState(true);
  const [followups, setFollowups] = useState<ExpiredResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchExpiredFollowups = async (page: number = 1) => {
    try {
      const res = await getExpiredFollowups({
        page,
        limit: pagination.itemsPerPage,
        ...filters,
      });
      if (res) {
        setPagination(res.pagination);
        setFollowups(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiredFollowups(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage]);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Missed Follow-ups</h1>
        <Link href={"/followups"}>
          <Button>Follow-ups</Button>
        </Link>
      </div>
      <Card>
        <CardContent>
          <>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Follow-up OverDue</TableHead>
                    <TableHead>Follow-up Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Assigned Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followups.map((followup) => (
                    <TableRow key={followup.id}>
                      <TableCell className="font-medium">
                        {followup.leadNo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {followup.studentName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {followup.daysOverdue}
                      </TableCell>
                      <TableCell className="text-center">
                        {followup.followupCount}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            followup.status === "open"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {followup.status === "open" ? "Open" : "Closed"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {followup.followups && followup.followups.length > 0 ? (
                          followup.followups.map((followupItem, index) => (
                            <div key={index}>
                              {followupItem.completed ? (
                                <span className="text-green-500">
                                  Completed
                                </span>
                              ) : (
                                <span className="text-yellow-500">Ongoing</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-red-500">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {followup.followups && followup.followups.length > 0
                          ? followup.followups.map((followupItem, index) => (
                              <div key={index}>
                                {followupItem.assignedStaff
                                  ? followupItem.assignedStaff.name
                                  : "N/A"}
                              </div>
                            ))
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MissedFollowup;
