import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useListClientDocuments, getListClientDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Trash2, Download, LogOut, Home, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClientDocuments() {
  const { user, isLoading, logout } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/client/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: documents = [] } = useListClientDocuments({ query: { queryKey: getListClientDocumentsQueryKey(), enabled: !!user } });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/client/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      toast({
        title: "موفق",
        description: "فایل با موفقیت آپلود شد.",
      });
      queryClient.invalidateQueries({ queryKey: getListClientDocumentsQueryKey() });
    } catch (err: any) {
      toast({
        title: "خطا در آپلود",
        description: err.message || "مشکلی در آپلود فایل پیش آمد.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (docId: number) => {
    try {
      const res = await fetch(`/api/client/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      toast({ title: "حذف شد", description: "فایل با موفقیت حذف شد." });
      queryClient.invalidateQueries({ queryKey: getListClientDocumentsQueryKey() });
    } catch (err: any) {
      toast({
        title: "خطا در حذف",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="size-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-xl leading-none">T</span>
              </div>
            </Link>
            <h1 className="font-serif font-bold text-lg">مدارک من</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/client/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowRight className="size-4 ml-1" />
                داشبورد
              </Button>
            </Link>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif">آپلود مدرک جدید</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                فایل‌های مجاز: PDF، تصاویر (JPG, PNG)، Word (DOC, DOCX)
              </p>
              <p className="text-sm text-muted-foreground mb-4">حداکثر حجم: ۱۰ مگابایت</p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleUpload}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "در حال آپلود..." : "انتخاب فایل"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">مدارک من ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                هنوز مدرکی آپلود نشده است.
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="size-8 text-primary" />
                      <div>
                        <p className="font-medium">{doc.originalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {(doc.fileSize / 1024).toFixed(1)} KB • {doc.mimeType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="size-4" />
                        </Button>
                      </a>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
