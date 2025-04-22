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
import { Plus, Search, Filter, Loader, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  getStudentDetailsApi,
  getStudentStatsApi,
  Student,
  StudentSearchParams,
} from "@/lib/students.api";
import { PaginationInfo } from "@/lib/call-logs.api";
import Pagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type StatsProps = {
  totalStudents: number;
  activeStudents: number;
  newLeads: number;
  conversionRate: number;
};

type StatusType = "hold" | "active" | "lead" | "reject" | undefined;

const StudentsPage = () => {
  const [stats, setStats] = useState<StatsProps>({
    totalStudents: 0,
    activeStudents: 0,
    newLeads: 0,
    conversionRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusType>(undefined);

  // Status color mapping
  const statusColors = {
    hold: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    lead: "bg-blue-100 text-blue-800",
    reject: "bg-red-100 text-red-800",
  };

  const getStudentStats = async () => {
    setStatsLoading(true);
    try {
      const response = await getStudentStatsApi();
      if (
        response &&
        typeof response.data === "object" &&
        response.data !== null
      ) {
        setStats(response.data as StatsProps);
      }
    } catch (error) {
      console.error("Error fetching student stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchStudents = async (
    page: number = 1,
    search?: string,
    status?: StatusType
  ) => {
    setLoading(true);
    try {
      const params: StudentSearchParams = {
        page,
        limit: pagination.itemsPerPage,
        search: search?.trim() || undefined,
        status,
      };
      const response = await getStudentDetailsApi(params);
      if (response) {
        setStudents(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Reset to page 1 when search or status filter changes
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchStudents(1, debouncedSearch, selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedStatus]);

  useEffect(() => {
    fetchStudents(pagination.currentPage, debouncedSearch, selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]);

  useEffect(() => {
    getStudentStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                stats.totalStudents
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                stats.activeStudents
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                stats.newLeads
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader className="h-6 w-6 animate-spin" />
              ) : (
                `${stats.conversionRate}%`
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Students</CardTitle>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedStatus ? `Status: ${selectedStatus}` : "Filter"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === undefined}
                    onCheckedChange={() => setSelectedStatus(undefined)}
                  >
                    All Statuses
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "active"}
                    onCheckedChange={() => setSelectedStatus("active")}
                  >
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "lead"}
                    onCheckedChange={() => setSelectedStatus("lead")}
                  >
                    Lead
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "hold"}
                    onCheckedChange={() => setSelectedStatus("hold")}
                  >
                    Hold
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatus === "reject"}
                    onCheckedChange={() => setSelectedStatus("reject")}
                  >
                    Reject
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear filters button - only show when filters are active */}
              {(selectedStatus || debouncedSearch) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus(undefined);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-6 text-gray-500"
                      >
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.address}</TableCell>
                        <TableCell>{student.phone_number}</TableCell>
                        <TableCell>{student.department_of_study}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              statusColors[
                                student.status as keyof typeof statusColors
                              ]
                            } font-normal`}
                          >
                            {student.status.charAt(0).toUpperCase() +
                              student.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.lastContact}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsPage;
