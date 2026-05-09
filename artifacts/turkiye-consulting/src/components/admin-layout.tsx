import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, LayoutDashboard, Inbox, FileText, Settings, LogOut, Moon, Sun, Menu, MessageCircle, PenLine } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { ReactNode, useEffect } from "react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const NavItems = () => (
    <>
      <Link href="/admin" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === '/admin' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
        <LayoutDashboard className="size-4" />
        <span>Dashboard</span>
      </Link>
      <Link href="/admin/consultations" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/admin/consultations') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
        <Inbox className="size-4" />
        <span>Consultations</span>
      </Link>
      <Link href="/admin/cases" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/admin/cases') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
        <FileText className="size-4" />
        <span>Cases</span>
      </Link>
      <Link href="/admin/services" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/admin/services') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
        <Settings className="size-4" />
        <span>Services</span>
      </Link>
      <Link href="/admin/chat" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/admin/chat') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
        <MessageCircle className="size-4" />
        <span>Customer Chat</span>
      </Link>
      <Link href="/admin/content" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location.startsWith('/admin/content') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
        <PenLine className="size-4" />
        <span>Site Content</span>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex bg-muted/40" dir="ltr">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl leading-none">T</span>
            </div>
            <span className="font-serif font-bold text-lg">Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <NavItems />
        </div>
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium">{user.name}</span>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => logout()}>
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-background">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b">
                <span className="font-serif font-bold text-lg">Admin Panel</span>
              </div>
              <div className="py-6 px-4 space-y-2">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-serif font-bold">Türkiye Danışmanlık</span>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
