import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  FileText,
  ThumbsUp,
  Lightbulb,
  Briefcase,
  TrendingUp,
  ArrowUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import resumeService, { ResumeAnalysis } from "@/services/resumeService";
import feedbackService, { Feedback } from "@/services/feedbackService";
import careerSuggestionService, {
  CareerSuggestion,
} from "@/services/careerSuggestionService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Enhanced color palette for charts and UI elements
const COLORS = {
  primary: "#4f46e5", // Indigo
  secondary: "#8b5cf6", // Purple
  tertiary: "#ec4899", // Pink
  accent: "#f97316", // Orange
  success: "#10b981", // Green
  warning: "#f59e0b", // Amber
  error: "#ef4444", // Red
  neutral: "#6b7280", // Gray
  chart: ["#4f46e5", "#8b5cf6", "#ec4899", "#d946ef", "#f97316", "#f59e0b"],
  background: {
    light: "#f8fafc", // Slate 50
    card: "#ffffff", // White
    highlight: "#f1f5f9", // Slate 100
  },
};

type ActivityItem = {
  type: "resume" | "feedback" | "suggestion";
  date: string;
  title?: string;
  rating?: number;
  career?: string;
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeAnalysis[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "week" | "month" | "all"
  >("month");

  // Load all dashboard data
  useEffect(() => {
    if (!user?._id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [resumeData, feedbackData, suggestionData] = await Promise.all([
          resumeService.getResumeAnalysis(user._id),
          feedbackService.getUserFeedback(user._id),
          careerSuggestionService.getSuggestions(user._id),
        ]);

        setResumes(resumeData);
        setFeedbacks(feedbackData);
        setSuggestions(suggestionData);

        // Create combined activity timeline
        const activities: ActivityItem[] = [
          ...resumeData.map((r) => ({
            type: "resume" as const,
            date: r.createdAt || new Date().toISOString(),
            title: "Resume Analyzed",
          })),
          ...feedbackData.map((f) => ({
            type: "feedback" as const,
            date: f.createdAt || new Date().toISOString(),
            rating: f.rating,
          })),
          ...suggestionData.map((s) => ({
            type: "suggestion" as const,
            date: s.createdAt || new Date().toISOString(),
            career: s.suggestedCareers.split(",")[0],
          })),
        ]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        setRecentActivity(activities);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?._id]);

  // Process data for charts
  const feedbackData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: rating.toString(),
    value: feedbacks.filter((f) => f.rating === rating).length || 0,
    name: `${rating} Star${rating !== 1 ? "s" : ""}`,
  }));

  const resumeScoreData = resumes
    .slice(0, 5)
    .map((r) => {
      const strengthScore = (r.strengths?.length || 0) * 3;
      const recommendationScore = (r.recommendation?.length || 0) * 5;
      const weaknessPenalty = (r.weakness?.length || 0) * 2;
      const totalScore = Math.min(
        100,
        strengthScore + recommendationScore - weaknessPenalty
      );

      return {
        name: `Analysis ${resumes.length > 1 ? resumes.indexOf(r) + 1 : ""}`,
        score: totalScore,
        date: new Date(r.createdAt || "").toLocaleDateString(),
      };
    })
    .reverse();

  // Get current trend for resume score
  const getScoreTrend = () => {
    if (resumeScoreData.length < 2) return null;
    const latestScore = resumeScoreData[resumeScoreData.length - 1].score;
    const previousScore = resumeScoreData[resumeScoreData.length - 2].score;
    const difference = latestScore - previousScore;
    return {
      value: difference,
      isPositive: difference >= 0,
    };
  };

  const scoreTrend = getScoreTrend();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Resume Score"
          value={resumes[0] ? `${calculateResumeScore(resumes[0])}/100` : "N/A"}
          icon={<FileText className="h-5 w-5" />}
          description="Based on latest analysis"
          trend={scoreTrend}
          color={COLORS.primary}
        />
        <StatsCard
          title="Avg. Feedback"
          value={
            feedbacks.length
              ? `${(
                  feedbacks.reduce((acc, f) => acc + f.rating, 0) /
                  feedbacks.length
                ).toFixed(1)}/5`
              : "N/A"
          }
          icon={<ThumbsUp className="h-5 w-5" />}
          description={`${feedbacks.length} ratings`}
          color={COLORS.secondary}
        />
        <StatsCard
          title="Career Paths"
          value={suggestions.length}
          icon={<Briefcase className="h-5 w-5" />}
          description="Suggested for you"
          color={COLORS.accent}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resume Analysis Chart */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  <span>Resume Score History</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <TimeRangeSelector
                    selectedRange={selectedTimeRange}
                    onChange={setSelectedTimeRange}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64">
                {resumes.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resumeScoreData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}`, "Score"]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderColor: COLORS.primary,
                          borderRadius: "6px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Bar
                        name="Resume Score"
                        dataKey="score"
                        fill={COLORS.primary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    message="No resume analysis available"
                    icon={<FileText className="h-12 w-12 text-slate-300" />}
                  />
                )}
              </div>
            </CardContent>
            {resumes.length > 0 && (
              <CardFooter className="border-t border-slate-100 bg-slate-50 rounded-b-lg text-sm text-slate-500 py-3">
                Last updated:{" "}
                {new Date(resumes[0].createdAt || "").toLocaleString()}
              </CardFooter>
            )}
          </Card>
          {/* Feedback Chart */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ThumbsUp className="h-5 w-5 text-purple-500" />
                <span>Feedback Ratings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-64">
                {feedbacks.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feedbackData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {feedbackData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS.chart[index % COLORS.chart.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} ratings`]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderColor: COLORS.secondary,
                          borderRadius: "6px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    message="No feedback received yet"
                    icon={<ThumbsUp className="h-12 w-12 text-slate-300" />}
                  />
                )}
              </div>
            </CardContent>
            {feedbacks.length > 0 && (
              <CardFooter className="border-t border-slate-100 bg-slate-50 rounded-b-lg text-sm text-slate-500 py-3">
                Total feedback: {feedbacks.length} ratings
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right Column - Activity and Recommendations */}
        <div className="space-y-6">
          {/* Recent Activity - Fixed to be properly scrollable */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-slate-500" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-64 overflow-y-auto">
                <div className="divide-y divide-slate-100">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className="mt-1 rounded-full p-2 bg-opacity-10"
                          style={{
                            backgroundColor:
                              activity.type === "resume"
                                ? `${COLORS.primary}20`
                                : activity.type === "feedback"
                                ? `${COLORS.secondary}20`
                                : `${COLORS.warning}20`,
                          }}
                        >
                          {activity.type === "resume" && (
                            <FileText
                              className="h-4 w-4"
                              style={{ color: COLORS.primary }}
                            />
                          )}
                          {activity.type === "feedback" && (
                            <ThumbsUp
                              className="h-4 w-4"
                              style={{ color: COLORS.secondary }}
                            />
                          )}
                          {activity.type === "suggestion" && (
                            <Lightbulb
                              className="h-4 w-4"
                              style={{ color: COLORS.warning }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.type === "resume" && activity.title}
                            {activity.type === "feedback" && (
                              <>
                                Feedback:{" "}
                                <Badge
                                  variant="outline"
                                  className="ml-1 bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  {activity.rating}★
                                </Badge>
                              </>
                            )}
                            {activity.type === "suggestion" &&
                              `Suggested: ${activity.career}`}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatTimeAgo(new Date(activity.date))}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      message="No recent activity"
                      icon={<Clock className="h-12 w-12 text-slate-300" />}
                      className="py-8"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Recommendations */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <span> Top Career Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {suggestions.length > 0 ? (
                  suggestions[0].suggestedCareers
                    .split(",")
                    .slice(0, 3)
                    .map((career, idx) => (
                      <div
                        key={idx}
                        className="flex items-center p-3 rounded-lg transition-all hover:translate-x-1 hover:shadow-sm"
                        style={{ backgroundColor: `${COLORS.chart[idx]}10` }}
                      >
                        <div
                          className="p-2 rounded-full mr-3"
                          style={{ backgroundColor: `${COLORS.chart[idx]}20` }}
                        >
                          <Briefcase
                            className="h-4 w-4"
                            style={{ color: COLORS.chart[idx] }}
                          />
                        </div>
                        <span className="font-medium">{career.trim()}</span>
                      </div>
                    ))
                ) : (
                  <EmptyState
                    message="No career suggestions yet"
                    icon={<Briefcase className="h-12 w-12 text-slate-300" />}
                    className="py-8"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips Card */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader className="border-b border-indigo-100/30">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-indigo-700">
                <AlertCircle className="h-5 w-5 text-indigo-500" />
                <span>Top Career Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-1 text-indigo-500">•</div>
                  <span>Update your resume every 3-6 months</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 text-indigo-500">•</div>
                  <span>Add quantifiable achievements to showcase impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 text-indigo-500">•</div>
                  <span>
                    Network with professionals in your target industry
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate resume score
function calculateResumeScore(resume: ResumeAnalysis): number {
  const strengthScore = (resume.strengths?.length || 0) * 3;
  const recommendationScore = (resume.recommendation?.length || 0) * 5;
  const weaknessPenalty = (resume.weakness?.length || 0) * 2;
  return Math.min(100, strengthScore + recommendationScore - weaknessPenalty);
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}

// Enhanced Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: { value: number; isPositive: boolean } | null;
  color: string;
}) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        <div className="h-5 w-5" style={{ color }}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold">{value}</div>

          {trend && (
            <div
              className={`ml-2 flex items-center text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowUp className="h-3 w-3 mr-1 transform rotate-180" />
              )}
              {Math.abs(trend.value)}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// Time Range Selector Component
function TimeRangeSelector({
  selectedRange,
  onChange,
}: {
  selectedRange: "week" | "month" | "all";
  onChange: (range: "week" | "month" | "all") => void;
}) {
  return (
    <div className="flex items-center border border-slate-200 rounded-md overflow-hidden text-xs">
      <button
        className={`px-3 py-1 ${
          selectedRange === "week"
            ? "bg-indigo-500 text-white"
            : "hover:bg-slate-100"
        }`}
        onClick={() => onChange("week")}
      >
        Week
      </button>
      <button
        className={`px-3 py-1 ${
          selectedRange === "month"
            ? "bg-indigo-500 text-white"
            : "hover:bg-slate-100"
        }`}
        onClick={() => onChange("month")}
      >
        Month
      </button>
      <button
        className={`px-3 py-1 ${
          selectedRange === "all"
            ? "bg-indigo-500 text-white"
            : "hover:bg-slate-100"
        }`}
        onClick={() => onChange("all")}
      >
        All
      </button>
    </div>
  );
}

// Empty State Component
function EmptyState({
  message,
  icon,
  className = "",
}: {
  message: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-slate-400 h-full ${className}`}
    >
      {icon}
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="bg-slate-50 min-h-screen p-8">
      {/* Header Skeleton */}
      <div className="mb-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl p-6 animate-pulse">
        <Skeleton className="h-8 w-64 mb-2 bg-white/50" />
        <Skeleton className="h-4 w-80 bg-white/50" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full bg-white/50" />
          <Skeleton className="h-6 w-24 rounded-full bg-white/50" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-none shadow animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-slate-200" />
              <Skeleton className="h-5 w-5 rounded-full bg-slate-200" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-2 bg-slate-200" />
              <Skeleton className="h-3 w-32 bg-slate-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow animate-pulse">
            <CardHeader className="border-b border-slate-100">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-48 bg-slate-200" />
                <Skeleton className="h-5 w-32 bg-slate-200" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-slate-200" />
            </CardContent>
          </Card>

          <Card className="border-none shadow animate-pulse">
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-slate-200" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-slate-200" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow animate-pulse">
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-slate-200" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full bg-slate-200" />
                      <Skeleton className="h-3 w-24 bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow animate-pulse">
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-slate-200" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <Skeleton
                    key={j}
                    className="h-12 w-full rounded-lg bg-slate-200"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
