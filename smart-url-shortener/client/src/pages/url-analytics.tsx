import { AppLayout } from "@/components/layout";
import { useGetUrl, useGetUrlAnalytics } from "@/lib/api";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MousePointerClick, Calendar, Clock, ExternalLink } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function UrlAnalyticsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: url, isLoading: isUrlLoading } = useGetUrl(id!);
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetUrlAnalytics(id!);

  if (isUrlLoading || isAnalyticsLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!url || !analytics) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">URL not found</h2>
          <Link href="/urls">
            <Button variant="link" className="mt-2">
              Back to all URLs
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <Link href="/urls">
            <Button variant="ghost" size="sm" className="mb-4 -ml-3">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to URLs
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row justify-between gap-4 bg-card p-6 rounded-xl border">
            <div>
              <h1 className="text-2xl font-bold truncate max-w-2xl">{url.title || url.shortCode}</h1>
              <div className="flex items-center gap-4 mt-2">
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center font-medium"
                >
                  {url.shortUrl.replace(/^https?:\/\//, "")} <ExternalLink className="ml-1 h-3 w-3" />
                </a>
                <span className="text-muted-foreground text-sm truncate max-w-md">{url.originalUrl}</span>
              </div>
            </div>
            {url.qrCode && (
              <div className="flex-shrink-0 bg-white p-2 rounded-lg border">
                <img src={url.qrCode} alt="QR Code" className="w-20 h-20" />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.totalClicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {analytics.createdAt ? format(new Date(analytics.createdAt), "MMM d, yyyy") : "Unknown"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Clicked</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {analytics.lastVisitedAt ? format(new Date(analytics.lastVisitedAt), "MMM d, yyyy") : "Never"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Click History (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.clicksByDay && analytics.clicksByDay.length > 0 ? (
              <div className="h-[400px]">
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
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg">
                No click data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
