import { AppLayout } from "@/components/layout";
import { useGetDashboardAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { UrlCard } from "@/components/url-card";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useGetDashboardAnalytics();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!analytics) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Analytics</h1>
          <p className="text-muted-foreground mt-2">Aggregate performance across all your shortened links.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Total Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.clicksByDay && analytics.clicksByDay.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.clicksByDay}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      }
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                No activity data available
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Top Performing Links</h2>
          {analytics.topUrls && analytics.topUrls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.topUrls.map((url) => (
                <UrlCard key={url.id} url={url} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg bg-card">
              <p className="text-muted-foreground">No links to display yet.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
