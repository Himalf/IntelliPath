import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  FileText,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import ChartCard from "@/components/analytics/ChartCard";
import userService, { User } from "@/services/userService";
import resumeService, { ResumeAnalysis } from "@/services/resumeService";
import FeedbackService, { Feedback } from "@/services/feedbackService";
import careerSuggestionService, {
  CareerSuggestion,
} from "@/services/careerSuggestionService";

interface Metrics {
  totalUsers: number;
  totalResumes: number;
  totalFeedback: number;
  totalSuggestions: number;
  userGrowth: number;
  resumeGrowth: number;
}

interface ActivityItem {
  type: string;
  action: string;
  time: string;
  timestamp: Date;
  user?: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    totalResumes: 0,
    totalFeedback: 0,
    totalSuggestions: 0,
    userGrowth: 0,
    resumeGrowth: 0,
  });
  const [roleData, setRoleData] = useState<{ name: string; value: number }[]>(
    []
  );
  const [monthlySignups, setMonthlySignups] = useState<
    { month: string; count: number }[]
  >([]);
  const [feedbackRating, setFeedbackRating] = useState<
    { rating: number; count: number }[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Classic, light color palette
  const COLORS = ["#4682B4", "#87CEFA", "#20B2AA", "#90EE90", "#F0E68C"];
  const CHART_COLORS = {
    primary: "#4682B4", // Steel Blue
    secondary: "#20B2AA", // Light Sea Green
    tertiary: "#87CEFA", // Light Sky Blue
    success: "#90EE90", // Light Green
    warning: "#F0E68C", // Khaki
    danger: "#F08080", // Light Coral
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch data from all services
        const users: User[] = await userService.getAllUsers();
        const resumes: ResumeAnalysis[] = await resumeService.getAllAnalyses();
        const feedbacks: Feedback[] = await FeedbackService.getAllFeedback();
        const suggestions: CareerSuggestion[] =
          await careerSuggestionService.getAllSuggestions();

        // Calculate growth rates
        const previousMonthUsers = users.filter((u) => {
          const date = new Date(u.createdAt || "");
          const now = new Date();
          return (
            date >= new Date(now.setMonth(now.getMonth() - 2)) &&
            date <= new Date(now.setMonth(now.getMonth() - 1))
          );
        }).length;

        const currentMonthUsers = users.filter((u) => {
          const date = new Date(u.createdAt || "");
          const now = new Date();
          return date >= new Date(now.setMonth(now.getMonth() - 1));
        }).length;

        const userGrowth = previousMonthUsers
          ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) *
            100
          : 100;

        // Similar calculation for resumes
        const previousMonthResumes = resumes.filter((r) => {
          const date = new Date(r.createdAt || "");
          const now = new Date();
          return (
            date >= new Date(now.setMonth(now.getMonth() - 2)) &&
            date <= new Date(now.setMonth(now.getMonth() - 1))
          );
        }).length;

        const currentMonthResumes = resumes.filter((r) => {
          const date = new Date(r.createdAt || "");
          const now = new Date();
          return date >= new Date(now.setMonth(now.getMonth() - 1));
        }).length;

        const resumeGrowth = previousMonthResumes
          ? ((currentMonthResumes - previousMonthResumes) /
              previousMonthResumes) *
            100
          : 100;

        setMetrics({
          totalUsers: users.length,
          totalResumes: resumes.length,
          totalFeedback: feedbacks.length,
          totalSuggestions: suggestions.length,
          userGrowth: Math.round(userGrowth),
          resumeGrowth: Math.round(resumeGrowth),
        });

        // Role distribution
        const counts: Record<string, number> = {};
        users.forEach((u) => (counts[u.role] = (counts[u.role] || 0) + 1));
        setRoleData(
          Object.entries(counts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
          }))
        );

        // Monthly Signups
        const m: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = d.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          m[key] = 0;
        }
        users.forEach((u) => {
          if (u.createdAt) {
            const date = new Date(u.createdAt);
            // Only count users from the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            if (date >= sixMonthsAgo) {
              const key = date.toLocaleString("default", {
                month: "short",
                year: "numeric",
              });
              if (m[key] !== undefined) m[key]++;
            }
          }
        });
        setMonthlySignups(
          Object.entries(m).map(([month, count]) => ({ month, count }))
        );

        // Feedback Ratings
        const ratings: Record<number, number> = {};
        feedbacks.forEach((f) => {
          ratings[f.rating] = (ratings[f.rating] || 0) + 1;
        });
        setFeedbackRating(
          Object.entries(ratings)
            .map(([rating, count]) => ({
              rating: Number(rating),
              count,
            }))
            .sort((a, b) => a.rating - b.rating)
        );

        // Generate Recent Activity from actual API data
        const activity: ActivityItem[] = [];

        // Add recent users
        users.slice(0, 10).forEach((user) => {
          if (user.createdAt) {
            activity.push({
              type: "User",
              action: `${user.fullName} joined the platform`,
              time: formatTimeAgo(new Date(user.createdAt)),
              timestamp: new Date(user.createdAt),
              user: user.fullName,
            });
          }
        });

        // Add recent resume analyses
        resumes.slice(0, 10).forEach((resume) => {
          if (resume.createdAt) {
            const user = users.find((u) => u._id === resume.user_id);
            activity.push({
              type: "Resume",
              action: `${
                user?.fullName || "A user"
              } submitted a resume for analysis`,
              time: formatTimeAgo(new Date(resume.createdAt)),
              timestamp: new Date(resume.createdAt),
              user: user?.fullName,
            });
          }
        });

        // Add recent feedback
        feedbacks.slice(0, 10).forEach((feedback) => {
          if (feedback.createdAt) {
            const user = users.find((u) => u._id === feedback.userId);
            activity.push({
              type: "Feedback",
              action: `${user?.fullName || "A user"} provided ${
                feedback.rating
              }-star feedback`,
              time: formatTimeAgo(new Date(feedback.createdAt)),
              timestamp: new Date(feedback.createdAt),
              user: user?.fullName,
            });
          }
        });

        // Add recent career suggestions
        suggestions.slice(0, 10).forEach((suggestion) => {
          if (suggestion.createdAt) {
            const user = users.find((u) => u._id === suggestion.user_id);
            activity.push({
              type: "Suggestion",
              action: `Career path suggestion generated for ${
                user?.fullName || "a user"
              }`,
              time: formatTimeAgo(new Date(suggestion.createdAt)),
              timestamp: new Date(suggestion.createdAt),
              user: user?.fullName,
            });
          }
        });

        // Sort by timestamp, most recent first
        activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Take the 10 most recent activities
        setRecentActivity(activity.slice(0, 10));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Helper function to format timestamps
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Function to determine growth indicator color
  const getGrowthColor = (growth: number) => {
    if (growth > 10) return "text-green-600";
    if (growth >= 0) return "text-blue-600";
    return "text-red-500";
  };

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-500">{`${Math.round(
            (payload[0].value / metrics.totalUsers) * 100
          )}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-400 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Quick Stats */}
      <div className="px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-400 flex items-center">
            <div className="p-3 bg-blue-50 rounded-full mr-4">
              <Users size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Users</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                <span
                  className={`ml-2 text-sm ${getGrowthColor(
                    metrics.userGrowth
                  )}`}
                >
                  {metrics.userGrowth > 0 ? "+" : ""}
                  {metrics.userGrowth}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-400 flex items-center">
            <div className="p-3 bg-teal-50 rounded-full mr-4">
              <FileText size={24} className="text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Resumes Analyzed
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold">{metrics.totalResumes}</p>
                <span
                  className={`ml-2 text-sm ${getGrowthColor(
                    metrics.resumeGrowth
                  )}`}
                >
                  {metrics.resumeGrowth > 0 ? "+" : ""}
                  {metrics.resumeGrowth}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-sky-400 flex items-center">
            <div className="p-3 bg-sky-50 rounded-full mr-4">
              <MessageSquare size={24} className="text-sky-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Feedback Received
              </p>
              <p className="text-2xl font-bold">{metrics.totalFeedback}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-400 flex items-center">
            <div className="p-3 bg-green-50 rounded-full mr-4">
              <Lightbulb size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Career Suggestions
              </p>
              <p className="text-2xl font-bold">{metrics.totalSuggestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="px-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Monthly Sign-ups Line Chart */}
        <ChartCard
          title="User Growth Trend"
          icon={<TrendingUp size={20} className="text-blue-500" />}
          className="xl:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySignups}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <ReTooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="New Users"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{
                    stroke: CHART_COLORS.primary,
                    strokeWidth: 2,
                    r: 4,
                    fill: "white",
                  }}
                  activeDot={{
                    r: 6,
                    stroke: CHART_COLORS.primary,
                    strokeWidth: 2,
                    fill: "white",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Role Distribution Pie Chart */}
        <ChartCard
          title="User Roles Distribution"
          icon={<PieChartIcon size={20} className="text-teal-500" />}
        >
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {roleData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ReTooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Feedback Ratings Bar Chart */}
        <ChartCard
          title="Feedback Ratings"
          icon={<BarChartIcon size={20} className="text-sky-500" />}
          className="xl:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={feedbackRating}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="rating"
                  tick={{ fill: "#6b7280" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  label={{
                    value: "Rating (1-5)",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#6b7280",
                  }}
                />
                <YAxis
                  tick={{ fill: "#6b7280" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  label={{
                    value: "Number of Reviews",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#6b7280",
                  }}
                />
                <ReTooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                  formatter={(value, name) => [
                    `${value} reviews`,
                    `Rating ${name}`,
                  ]}
                />
                <Bar dataKey="count" name="Rating" radius={[4, 4, 0, 0]}>
                  {feedbackRating.map((entry, index) => {
                    // Color bars according to rating with lighter colors
                    let color;
                    if (entry.rating <= 2) color = CHART_COLORS.danger;
                    else if (entry.rating === 3) color = CHART_COLORS.warning;
                    else color = CHART_COLORS.success;

                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Activity Timeline with Real Data */}
        <ChartCard
          title="Recent Activity"
          icon={<Activity size={20} className="text-green-500" />}
        >
          <div className="divide-y divide-gray-100 max-h-80 overflow-auto pr-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <div key={i} className="py-3 flex items-start">
                  <div
                    className={`
                      p-2 rounded-full mr-3 ${
                        item.type === "User"
                          ? "bg-blue-50 text-blue-500"
                          : item.type === "Resume"
                          ? "bg-teal-50 text-teal-500"
                          : item.type === "Feedback"
                          ? "bg-sky-50 text-sky-500"
                          : "bg-green-50 text-green-500"
                      }`}
                  >
                    {item.type === "User" && <Users size={16} />}
                    {item.type === "Resume" && <FileText size={16} />}
                    {item.type === "Feedback" && <MessageSquare size={16} />}
                    {item.type === "Suggestion" && <Lightbulb size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.action}
                    </p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                No recent activity found
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
