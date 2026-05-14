import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { useListUrls } from "@/lib/api";
import type { ListUrlsParams } from "@/lib/api";
import { UrlCard } from "@/components/url-card";
import { CreateUrlModal } from "@/components/create-url-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function UrlsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<NonNullable<ListUrlsParams["sortBy"]>>("createdAt");
  const [sortOrder, setSortOrder] = useState<NonNullable<ListUrlsParams["sortOrder"]>>("desc");
  const [filter, setFilter] = useState<NonNullable<ListUrlsParams["filter"]>>("all");

  const { data: urls, isLoading } = useListUrls({
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
    filter: filter === "all" ? undefined : filter,
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Your Links</h1>
          <CreateUrlModal />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, alias, or original URL..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as NonNullable<ListUrlsParams["filter"]>)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="password_protected">Protected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as NonNullable<ListUrlsParams["sortBy"]>)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as NonNullable<ListUrlsParams["sortOrder"]>)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : urls && urls.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {urls.map((url) => (
              <UrlCard key={url.id} url={url} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg bg-card">
            <h3 className="text-lg font-medium">No links found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {search || filter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by creating your first shortened URL."}
            </p>
            {!(search || filter !== "all") && <CreateUrlModal />}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
