import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { useListClientCases, getListClientCasesQueryKey } from "@workspace/api-client-react";
import { useListClientDocuments, getListClientDocumentsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileText, MessageSquare, Upload, LogOut, Home } from "lucide-react";

const statusLabels: Record<string, string> = {
  active: "فعال",
  pending_documents: "در انتظار مدارک",
  in_review: "در حال بررسی",
  approved: "تایید شده",
  completed: "تکمیل شده",
  rejected: "رد شده",
};

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-800",
  pending_documents: "bg-yellow-100 text-yellow-800",
  in_review: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ClientDashboard() {
  const { user, isLoading, logout } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/client/login");
    }
    if (!isLoading && user && user.role === "admin") {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  const { data: cases = [] } = useListClientCases({ query: { queryKey: getListClientCasesQueryKey(), enabled: !!user } });
  const { data: documents = [] } = useListClientDocuments({ query: { queryKey: getListClientDocumentsQueryKey(), enabled: !!user } });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="size-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-xl leading-none">T</span>
              </div>
            </Link>
            <h1 className="font-serif font-bold text-lg">پنل مشتری</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.name}
            </span>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="size-4 ml-1" />
                خانه
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="size-4 ml-1" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold font-serif">سلام، {user.name}</h2>
          <p className="text-muted-foreground">به پنل مشتری خوش آمدید</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>پرونده‌ها</CardDescription>
              <CardTitle className="text-3xl">{cases.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <FolderOpen className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>مدارک آپلود شده</CardDescription>
              <CardTitle className="text-3xl">{documents.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <FileText className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>دسترسی سریع</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href="/client/documents">
                <Button size="sm" variant="outline">
                  <Upload className="size-4 ml-1" />
                  آپلود مدرک
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Cases Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif">پرونده‌های من</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                هنوز پرونده‌ای ثبت نشده است. با ثبت درخواست مشاوره، پرونده شما ایجاد خواهد شد.
              </p>
            ) : (
              <div className="space-y-4">
                {cases.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="font-medium">{c.serviceType}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[c.status] || ""} variant="secondary">
                          {statusLabels[c.status] || c.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          پیشرفت: {c.progressPercent}%
                        </span>
                      </div>
                    </div>
                    <Link href={`/client/cases/${c.id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="size-4 ml-1" />
                        مشاهده
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif">مدارک اخیر</CardTitle>
              <Link href="/client/documents">
                <Button variant="outline" size="sm">مشاهده همه</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                هنوز مدرکی آپلود نشده است.
              </p>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
