import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2, BarChart2, ExternalLink, Lock, Clock } from "lucide-react";
import type { ShortUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDeleteUrl, getListUrlsQueryKey, getGetDashboardAnalyticsQueryKey } from "@/lib/api";
import { Link } from "wouter";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function UrlCard({ url }: { url: ShortUrl }) {
  const { toast } = useToast();
  const deleteUrl = useDeleteUrl();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url.shortUrl);
    toast({ title: "Copied to clipboard", description: url.shortUrl });
  };

  const downloadQrCode = () => {
    if (!url.qrCode) return;
    const a = document.createElement("a");
    a.href = url.qrCode;
    a.download = `qrcode-${url.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = () => {
    deleteUrl.mutate(
      { id: url.id },
      {
        onSuccess: () => {
          toast({ title: "URL deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListUrlsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardAnalyticsQueryKey() });
          setDeleteOpen(false);
        },
        onError: (err: any) => {
          toast({
            title: "Failed to delete URL",
            description: err.data?.error || "Unknown error",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Card className="flex flex-col border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 overflow-hidden">
          <CardTitle className="text-lg font-bold truncate pr-4">
            {url.title || url.shortCode}
          </CardTitle>
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center text-sm font-medium text-primary hover:underline"
          >
            {url.shortUrl.replace(/^https?:\/\//, "")}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
          <p className="text-xs text-muted-foreground truncate" title={url.originalUrl}>
            {url.originalUrl}
          </p>
        </div>
        {url.qrCode && (
          <div className="flex-shrink-0 bg-white p-1 rounded border">
            <img src={url.qrCode} alt="QR Code" className="w-16 h-16 object-contain" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="font-mono text-xs">
            <BarChart2 className="mr-1 h-3 w-3" /> {url.clicks} clicks
          </Badge>
          {url.isPasswordProtected && (
            <Badge variant="outline" className="text-xs">
              <Lock className="mr-1 h-3 w-3" /> Protected
            </Badge>
          )}
          {url.isExpired && (
            <Badge variant="destructive" className="text-xs">
              <Clock className="mr-1 h-3 w-3" /> Expired
            </Badge>
          )}
          {!url.isExpired && url.expiresAt && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" /> Exp. {format(new Date(url.expiresAt), "MMM d")}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/20 px-4 py-3 mt-auto">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} title="Copy short URL">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadQrCode} disabled={!url.qrCode} title="Download QR Code">
            <Download className="h-4 w-4" />
          </Button>
          <Link href={`/urls/${url.id}/analytics`}>
            <Button variant="outline" size="sm" title="Analytics">
              <BarChart2 className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the short URL ({url.shortCode}) and all of its analytics data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteUrl.isPending}>
                Delete URL
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
