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
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddStaffDialog from "@/components/staff/AddStaff";
import {
  getStaffMembers,
  getStaffStats,
  StaffResponse,
} from "@/lib/staffs.api";
import type { PaginationInfo } from "@/lib/call-logs.api";
import Pagination from "@/components/Pagination";

interface StaffStats {
  totalStaff: number;
  averagePerformance: number;
  totalLeads: number;
}

interface StatsResponse {
  data: StaffStats;
  message: string;
  status: number;
  code: string;
}

const StaffPage = () => {
  const [staffMembers, setStaffMembers] = useState<StaffResponse[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStats>({
    totalStaff: 0,
    averagePerformance: 0,
    totalLeads: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchStaffList = async (page: number = 1, search?: string) => {
    try {
      const response = await getStaffMembers({
        page,
        limit: pagination.itemsPerPage,
        search: search?.trim() || undefined,
      });

      if (response) {
        setStaffMembers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching staff members:", error);
    }
  };

  const fetchStaffStats = async () => {
    try {
      const response = await getStaffStats();
      const statsResponse = response as StatsResponse;
      if (statsResponse) {
        setStaffStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching staff stats:", error);
    }
  };

  useEffect(() => {
    fetchStaffList(pagination.currentPage, searchQuery);
  }, [pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    fetchStaffStats();
  }, []);

  const getPerformanceStyles = (performance: StaffResponse["performance"]) => {
    switch (performance) {
      case "High":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusStyles = (status: StaffResponse["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }));

    // Debounce search requests
    const timeoutId = setTimeout(() => {
      fetchStaffList(1, query);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <AddStaffDialog
          fetchStaff={fetchStaffList}
          fetchStat={fetchStaffStats}
        />
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.totalStaff}</div>
            <p className="text-sm text-gray-500">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffStats.averagePerformance}%
            </div>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Leads Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffStats.totalLeads}</div>
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
              <Input
                placeholder="Search staff..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
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
                  <TableCell className="font-medium">
                    {staff.user.name}
                  </TableCell>
                  <TableCell>{staff.user.email}</TableCell>
                  <TableCell>{staff.user.phone}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusStyles(
                        staff.status
                      )}`}
                    >
                      {staff.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPerformanceStyles(
                        staff.performance
                      )}`}
                    >
                      {staff.performance}
                    </span>
                  </TableCell>
                  <TableCell>{staff.assignedLeads}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffPage;
