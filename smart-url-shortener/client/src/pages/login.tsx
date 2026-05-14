import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link2 } from "lucide-react";
import { LandingLayout } from "@/components/layout";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        queryClient.setQueryData(queryKeys.me(), res.user);
        toast({ title: "Welcome back!" });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          title: "Login failed",
          description: err.data?.error || "Invalid credentials",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <LandingLayout>
      <div className="flex min-h-[calc(100vh-14rem)] flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center text-primary">
            <Link2 className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-card px-6 py-12 shadow sm:rounded-lg sm:px-12 border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold leading-6 text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
