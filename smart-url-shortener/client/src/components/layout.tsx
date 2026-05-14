import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Link2, LayoutDashboard, List, BarChart3, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const [location] = useLocation();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const NavLinks = () => (
    <>
      <Link href="/dashboard">
        <Button variant={location === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start md:w-auto">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link href="/urls">
        <Button variant={location.startsWith("/urls") ? "secondary" : "ghost"} className="w-full justify-start md:w-auto">
          <List className="mr-2 h-4 w-4" />
          URLs
        </Button>
      </Link>
      <Link href="/analytics">
        <Button variant={location === "/analytics" ? "secondary" : "ghost"} className="w-full justify-start md:w-auto">
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics
        </Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 font-bold text-primary cursor-pointer">
              <Link2 className="h-6 w-6" />
              <span className="hidden md:inline-block">Nexus URL</span>
            </div>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-2 ml-4">
              <NavLinks />
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline-block mr-2">{user?.email}</span>
              <Button variant="ghost" size="icon" onClick={logout} title="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row text-sm text-muted-foreground">
          <p>Built for developers. Fast, reliable, precise.</p>
          <p>Nexus URL &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated && !location.startsWith("/r/")) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
