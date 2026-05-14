import { AppLayout } from "@/components/layout";
import { useGetDashboardAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { QuickShortenForm } from "@/components/quick-shorten-form";
import { CreateUrlModal } from "@/components/create-url-modal";
import { UrlCard } from "@/components/url-card";
import { BarChart3, Link2, MousePointerClick, Clock, ArrowRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: analytics, isLoading } = useGetDashboardAnalytics();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!analytics) return null;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <CreateUrlModal />
        </div>

        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Shorten</h2>
          <QuickShortenForm />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUrls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalClicks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUrls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Links</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.expiredUrls || 0}</div>
            </CardContent>
          </Card>
        </div>

        {analytics.clicksByDay && analytics.clicksByDay.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.clicksByDay}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Links</h2>
            <Link href="/urls">
              <Button variant="ghost" className="text-sm">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {analytics.topUrls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.topUrls.slice(0, 6).map((url) => (
                <UrlCard key={url.id} url={url} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No URLs created yet.</p>
              <CreateUrlModal />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
