import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LandingLayout } from "@/components/layout";
import { QuickShortenForm } from "@/components/quick-shorten-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Lock, Zap } from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleShortenSuccess = () => {
    if (!isAuthenticated) {
      setLocation("/signup");
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <LandingLayout>
      <div className="relative isolate pt-14">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#10b981] to-[#047857] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
                Command center for your links
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Shorten, track, and manage your URLs with a fast, developer-focused interface. Deep analytics, custom
                aliases, and password protection built-in.
              </p>

              <div className="mt-10 max-w-xl mx-auto bg-card p-4 rounded-xl border shadow-lg">
                <QuickShortenForm onSuccess={handleShortenSuccess} />
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Sign up to track clicks and manage this link later.
                  </p>
                )}
              </div>

              {!isAuthenticated && (
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link href="/signup">
                    <Button size="lg" className="px-8">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="lg">
                      Log In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Deploy faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage URLs
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <BarChart3 className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  Real-time Analytics
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Track clicks over time with high-performance charts. Know exactly when and how often your links are
                    accessed.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Lock className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  Secure & Protected
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Add password protection to sensitive links and set automatic expiration dates to control access
                    windows.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <Zap className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  Developer API
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">
                    Fully typed REST API available for programmatic URL shortening and management inside your own
                    applications.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
