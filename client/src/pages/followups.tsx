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
import { Loader } from "lucide-react";
import {
  CallLogResponse,
  getCallLogsWithFollowups,
  getFollowupStats,
} from "@/lib/followups.api";
import { PaginationInfo } from "@/lib/call-logs.api";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import FilterPopover from "@/components/Table/FilterPopover";
import ActionPopover from "@/components/follow-ups/ActionPopover";

interface FollowupStats {
  dueToday: number;
  completedToday: number;
  upcoming: number;
  missedCallLogs: number;
}

const FollowupsPage = () => {
  const [filters, setFilters] = useState({
    studentName: "",
    phone: "",
    status: "",
    leadNo: "",
    date: undefined as string | undefined,
  });
  const [openPopover, setOpenPopover] = useState<{ [key: string]: boolean }>({
    studentName: false,
    phone: false,
    date: false,
    status: false,
    leadNo: false,
  });
  const [loading, setLoading] = useState(true);
  // const [modalOpen, setModalOpen] = useState(false);
  const [followups, setFollowups] = useState<CallLogResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [followupStats, setFollowupStats] = useState<FollowupStats>({
    dueToday: 0,
    completedToday: 0,
    upcoming: 0,
    missedCallLogs: 0,
  });

  const fetchFollowupStats = async () => {
    try {
      const res = await getFollowupStats();
      if (res?.data) {
        setFollowupStats(res.data as FollowupStats);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFollowupStats();
  }, []);

  const fetchFollowups = async (page: number = 1) => {
    try {
      const res = await getCallLogsWithFollowups({
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
    fetchFollowups(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin" />
      </div>
    );
  }

  const handleStatusChange = (followupId: string, status: string) => {
    setFollowups((prevFollowups) =>
      prevFollowups.map((followup) =>
        followup.id === followupId
          ? { ...followup, studentStatus: status }
          : followup
      )
    );

    // If you need to save to API
    saveStatusToApi(followupId, status);
  };

  // Handler for date change
  const handleDateChange = (followupId: string, date: Date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    setFollowups((prevFollowups) =>
      prevFollowups.map((followup) =>
        followup.id === followupId
          ? { ...followup, followupDate: formattedDate }
          : followup
      )
    );

    // If you need to save to API
    saveDateToApi(followupId, date);
  };

  // Handler for staff assignment
  const handleStaffAssign = () => {
    // followupId: string, staffId: string
    // setFollowups((prevFollowups) =>
    //   prevFollowups.map((followup) => {
    //     if (followup.id === followupId) {
    //       // Create a new followup entry or update the existing one
    //       const updatedFollowups = followup.followups
    //         ? followup.followups.map((f, index) =>
    //             index === followup.followups!.length - 1
    //               ? { ...f, assignedStaff: { id: staffId, name: getStaffName(staffId) } }
    //               : f
    //           )
    //         : [{
    //             id: generateUniqueId(),
    //             completed: false,
    //             assignedStaff: { id: staffId, name: getStaffName(staffId) }
    //           }];
    //       return { ...followup, followups: updatedFollowups };
    //     }
    //     return followup;
    //   })
  };

  // If you need to save to API
  //   saveStaffAssignmentToApi(followupId, staffId);
  // };

  // API functions (replace with your actual API calls)
  const saveStatusToApi = async (followupId: string, status: string) => {
    try {
      // Example API call
      // await api.post(`/followups/${followupId}/status`, { status });
      console.log(`Status ${status} saved for followup ${followupId}`);
    } catch (error) {
      console.error("Error saving status:", error);
    }
  };

  const saveDateToApi = async (followupId: string, date: Date) => {
    try {
      // Example API call
      // await api.post(`/followups/${followupId}/date`, { date: date.toISOString() });
      console.log(
        `Date ${date.toISOString()} saved for followup ${followupId}`
      );
    } catch (error) {
      console.error("Error saving date:", error);
    }
  };

  // const saveStaffAssignmentToApi = async (followupId: string, staffId: string) => {
  //   try {
  //     // Example API call
  //     // await api.post(`/followups/${followupId}/staff`, { staffId });
  //     console.log(`Staff ${staffId} assigned to followup ${followupId}`);
  //   } catch (error) {
  //     console.error("Error assigning staff:", error);
  //   }
  // };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <Link href={"/missed-followup"}>
          <Button>Missed Follow-ups</Button>
        </Link>
      </div>

      {/* Today's Follow-ups */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
        <Card className="p-1 h-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-600">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg mb-1 font-bold">
              {followupStats.dueToday}
            </div>
            <p className="text-sm text-gray-500">Follow-ups remaining</p>
          </CardContent>
        </Card>

        <Card className="p-1 h-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg mb-1  font-bold">
              {followupStats.completedToday}
            </div>
            <p className="text-sm text-gray-500">Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="p-1 h-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-lg mb-1  font-bold">
              {followupStats.upcoming}
            </div>
            <p className="text-sm text-gray-500">Tasks for next week</p>
          </CardContent>
        </Card>

        <Card className="p-1 h-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 text-center">
              Missed Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg mb-1 font-bold">
              {followupStats.missedCallLogs}
            </div>
            <p className="text-sm text-gray-500">Expired follow-ups</p>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { key: "leadNo", label: "Lead No", type: "text" },
                    { key: "studentName", label: "Student Name", type: "text" },
                    { key: "date", label: "Follow-up Date", type: "date" },
                    { key: "followupCount", label: "Follow-up Count" },
                    { key: "status", label: "Status", type: "status" },
                    { key: "completed", label: "Completed" },
                    { key: "assignedStaff", label: "Assigned Staff" },
                    { key: "actions", label: "Actions" },
                  ].map(({ key, label, type }) => (
                    <TableHead key={key} className="whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        {label}
                        {type && (
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
                        )}
                      </div>
                    </TableHead>
                  ))}
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
                      {followup.followupDate}
                    </TableCell>
                    <TableCell className="text-center">
                      {followup.followupCount}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          followup.studentStatus === "hold"
                            ? "bg-yellow-200 text-yellow-800"
                            : followup.studentStatus === "reject"
                            ? "bg-red-200 text-red-800"
                            : followup.status === "open"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {followup.studentStatus === "hold"
                          ? "Hold"
                          : followup.studentStatus === "reject"
                          ? "Rejected"
                          : followup.status === "open"
                          ? "Open"
                          : "Closed"}
                      </span>
                    </TableCell>

                    <TableCell>
                      {followup.followups && followup.followups.length > 0 ? (
                        followup.followups.map((followupItem, index) => (
                          <div key={index}>
                            {followupItem.completed ? (
                              <span className="text-green-500">Completed</span>
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
                      <ActionPopover
                        followup={followup}
                        onStatusChange={(status) =>
                          handleStatusChange(followup.id, status)
                        }
                        onDateChange={(date) =>
                          handleDateChange(followup.id, date)
                        }
                        onStaffAssign={() => handleStaffAssign()}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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

export default FollowupsPage;
