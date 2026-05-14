import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateUrl, getListUrlsQueryKey, getGetDashboardAnalyticsQueryKey } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const quickShortenSchema = z.object({
  originalUrl: z.string().url({ message: "Please enter a valid URL." }),
});

type QuickShortenFormValues = z.infer<typeof quickShortenSchema>;

export function QuickShortenForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createUrl = useCreateUrl();

  const form = useForm<QuickShortenFormValues>({
    resolver: zodResolver(quickShortenSchema),
    defaultValues: { originalUrl: "" },
  });

  const onSubmit = (data: QuickShortenFormValues) => {
    createUrl.mutate(
      { data: { originalUrl: data.originalUrl } },
      {
        onSuccess: (newUrl) => {
          toast({
            title: "URL Shortened",
            description: `Successfully created ${newUrl.shortCode}`,
          });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListUrlsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardAnalyticsQueryKey() });
          if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.data?.error || "Failed to shorten URL",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="originalUrl"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="https://example.com/very-long-url-to-shorten"
                  className="h-12 bg-background border-muted"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createUrl.isPending} className="h-12 px-6">
          {createUrl.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Shorten <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </form>
    </Form>
  );
}
