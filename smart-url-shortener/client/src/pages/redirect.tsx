import { useParams } from "wouter";
import { useResolveUrl, useVerifyUrlPassword } from "@/lib/api";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RedirectPage() {
  const { code } = useParams<{ code: string }>();
  const { data: resolved, isLoading, error } = useResolveUrl(code!);
  const verifyPassword = useVerifyUrlPassword();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (resolved && !resolved.isExpired && !resolved.isPasswordProtected && resolved.originalUrl) {
      window.location.href = resolved.originalUrl;
    }
  }, [resolved]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Resolving link...</p>
        </div>
      </div>
    );
  }

  if (error || !resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Link Not Found</CardTitle>
            <CardDescription>This link might be invalid or has been deleted.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (resolved.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>This link has reached its expiration date and is no longer active.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (resolved.isPasswordProtected) {
    const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setVerifying(true);

      verifyPassword.mutate(
        { data: { password }, code: code! },
        {
          onSuccess: (res) => {
            window.location.href = res.originalUrl;
          },
          onError: () => {
            setVerifying(false);
            toast({ title: "Access Denied", description: "Incorrect password", variant: "destructive" });
            setPassword("");
          },
        }
      );
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Protected Link</CardTitle>
            <CardDescription>This link requires a password to access.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={verifying || !password}>
                {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Unlock Link
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
