import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateUrl, getListUrlsQueryKey, getGetDashboardAnalyticsQueryKey } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { addDays } from "date-fns";

const createUrlSchema = z.object({
  originalUrl: z.string().url("Must be a valid URL"),
  title: z.string().optional(),
  customAlias: z.string().regex(/^[a-zA-Z0-9-_]*$/, "Alphanumeric and dashes only").optional(),
  password: z.string().optional(),
  expirationType: z.enum(["never", "1day", "7days"]),
});

type CreateUrlValues = z.infer<typeof createUrlSchema>;

export function CreateUrlModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createUrl = useCreateUrl();

  const form = useForm<CreateUrlValues>({
    resolver: zodResolver(createUrlSchema),
    defaultValues: {
      originalUrl: "",
      title: "",
      customAlias: "",
      password: "",
      expirationType: "never",
    },
  });

  const onSubmit = (data: CreateUrlValues) => {
    let expiresAt: string | undefined;
    if (data.expirationType === "1day") expiresAt = addDays(new Date(), 1).toISOString();
    else if (data.expirationType === "7days") expiresAt = addDays(new Date(), 7).toISOString();

    createUrl.mutate(
      {
        data: {
          originalUrl: data.originalUrl,
          title: data.title || undefined,
          customAlias: data.customAlias || undefined,
          password: data.password || undefined,
          expiresAt,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "URL Created Successfully" });
          queryClient.invalidateQueries({ queryKey: getListUrlsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardAnalyticsQueryKey() });
          setOpen(false);
          form.reset();
        },
        onError: (error: any) => {
          toast({
            title: "Failed to create URL",
            description: error.data?.error || "Unknown error",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Link</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="originalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/long-url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="My Campaign Link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customAlias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Alias (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="my-custom-link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave empty for public" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expirationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Never expires</SelectItem>
                      <SelectItem value="1day">24 Hours</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mr-2">
                Cancel
              </Button>
              <Button type="submit" disabled={createUrl.isPending}>
                {createUrl.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
