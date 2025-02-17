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
import { Calendar, Plus } from "lucide-react";
import { CallLogResponse, getCallLogsWithFollowups } from "@/lib/followups.api";
import { PaginationInfo } from "@/lib/call-logs.api";

const FollowupsPage = () => {
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
  const [loading, setLoading] = useState(true);
  const [followups, setFollowups] = useState<CallLogResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchFollowups = async (page: number = 1) => {
    try {
      const res = await getCallLogsWithFollowups({
        page,
        limit: pagination.itemsPerPage,
        ...filters,
      });
      console.log(res, "res");

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
    fetchFollowups(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.currentPage]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Follow-up
        </Button>
      </div>

      {/* Today's Follow-ups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-gray-500">Follow-ups remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-gray-500">Tasks finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-sm text-gray-500">Tasks for next week</p>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Follow-up Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Staff</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followups.map((followup) => (
                <TableRow key={followup.id}>
                  <TableCell className="font-medium">
                    {followup.studentName}
                  </TableCell>
                  <TableCell>{followup.followupCount}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        followup.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {followup.status}
                    </span>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowupsPage;
