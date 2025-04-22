import apiClient from "./axios";

export type DashboardStats = {
  totalLeads: {
    count: number;
    changePercent: number;
    trending: "up" | "down";
  };
  todayCalls: {
    count: number;
    changePercent: number;
    trending: "up" | "down";
  };
  pendingFollowups: {
    count: number;
    dueThisWeek: number;
  };
  conversionRate: {
    rate: number;
    changePercent: number;
    trending: "up" | "down";
  };
  recentActivity: {
    leadNo: string;
    studentName: string;
    action: string;
    timeAgo: string;
    userId: number;
    userName: string;
  }[];
};

export const getDashboardStats = async (): Promise<{
  data: DashboardStats;
}> => {
  try {
    const response = await apiClient.get("/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
