import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  UserPlus,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Loader,
} from "lucide-react";
import { getDashboardStats, DashboardStats } from "@/lib/dashboard.api";

const DashboardPage = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStats();
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.totalLeads.count.toLocaleString()}
            </div>
            <p
              className={`text-xs flex items-center ${
                dashboardStats?.totalLeads.trending === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {dashboardStats?.totalLeads.trending === "up" ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(dashboardStats?.totalLeads.changePercent || 0)}% from
              last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Calls
            </CardTitle>
            <Phone className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.todayCalls.count}
            </div>
            <p
              className={`text-xs flex items-center ${
                dashboardStats?.todayCalls.trending === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {dashboardStats?.todayCalls.trending === "up" ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(dashboardStats?.todayCalls.changePercent || 0)}% from
              yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Follow-ups
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.pendingFollowups.count}
            </div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.conversionRate.rate}%
            </div>
            <p
              className={`text-xs flex items-center ${
                dashboardStats?.conversionRate.trending === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {dashboardStats?.conversionRate.trending === "up" ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {Math.abs(dashboardStats?.conversionRate.changePercent || 0)}%
              increase
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardStats?.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium">
                    {activity.leadNo} - {activity.studentName}
                  </p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {activity.timeAgo}
                </span>
              </div>
            ))}
            {dashboardStats?.recentActivity.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No recent activity to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
