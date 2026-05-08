import { AdminLayout } from "@/components/admin-layout";
import { useGetAdminStats, useGetRecentActivity, useGetCasesByService } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, CheckCircle, Activity, MessageSquare, AlertCircle } from "lucide-react";
type ActivityItemType = "new_consultation" | "case_updated" | "message_sent" | "case_created";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell } from "recharts";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: activities, isLoading: activitiesLoading } = useGetRecentActivity();
  const { data: chartData, isLoading: chartLoading } = useGetCasesByService();

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your firm's activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Consultations"
            value={stats?.totalConsultations}
            loading={statsLoading}
            icon={<Users className="size-4 text-muted-foreground" />}
            trend={`${stats?.consultationsThisMonth || 0} this month`}
          />
          <StatCard
            title="Pending Requests"
            value={stats?.pendingConsultations}
            loading={statsLoading}
            icon={<AlertCircle className="size-4 text-secondary" />}
            trend="Needs review"
            highlight={!!stats?.pendingConsultations && stats.pendingConsultations > 0}
          />
          <StatCard
            title="Active Cases"
            value={stats?.activeCases}
            loading={statsLoading}
            icon={<Activity className="size-4 text-primary" />}
            trend={`${stats?.casesThisMonth || 0} new this month`}
          />
          <StatCard
            title="Completed Cases"
            value={stats?.completedCases}
            loading={statsLoading}
            icon={<CheckCircle className="size-4 text-green-600" />}
            trend="All time"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Cases by Service Type</CardTitle>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {(chartData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No recent activity</div>
              ) : (
                <div className="space-y-6">
                  {activities?.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="shrink-0 mt-0.5">
                        <ActivityIcon type={activity.type} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, loading, icon, trend, highlight = false }: any) {
  return (
    <Card className={highlight ? "border-secondary shadow-sm" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20 mb-1" />
        ) : (
          <div className="text-3xl font-bold font-serif">{value || 0}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case ActivityItemType.new_consultation:
      return <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Users className="size-4" /></div>;
    case ActivityItemType.case_updated:
      return <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center"><Activity className="size-4" /></div>;
    case ActivityItemType.message_sent:
      return <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><MessageSquare className="size-4" /></div>;
    case ActivityItemType.case_created:
      return <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><FileText className="size-4" /></div>;
    default:
      return <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center"><AlertCircle className="size-4" /></div>;
  }
}
