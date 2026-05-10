import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link, useParams } from "wouter";
import { useEffect, useState } from "react";
import { useListClientCaseMessages, getListClientCaseMessagesQueryKey } from "@workspace/api-client-react";
import { useListClientCases, getListClientCasesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowRight, LogOut, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function ClientCaseDetail() {
  const { user, isLoading, logout } = useAuth();
  const [_, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const caseId = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/client/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: cases = [] } = useListClientCases({ query: { queryKey: getListClientCasesQueryKey(), enabled: !!user } });
  const currentCase = cases.find((c) => c.id === caseId);

  const { data: messages = [] } = useListClientCaseMessages(caseId, {
    query: { queryKey: getListClientCaseMessagesQueryKey(caseId), enabled: !!user && caseId > 0, refetchInterval: 5000 },
  });

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/client/cases/${caseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }
      setMessage("");
      queryClient.invalidateQueries({ queryKey: getListClientCaseMessagesQueryKey(caseId) });
    } catch (err: any) {
      toast({
        title: "خطا",
        description: err.message || "مشکلی در ارسال پیام پیش آمد.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
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
            <h1 className="font-serif font-bold text-lg">جزئیات پرونده</h1>
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
        {currentCase ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif">{currentCase.serviceType}</CardTitle>
                  <Badge className={statusColors[currentCase.status] || ""} variant="secondary">
                    {statusLabels[currentCase.status] || currentCase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">اولویت:</span>{" "}
                    <span className="font-medium">{currentCase.priority}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">پیشرفت:</span>{" "}
                    <span className="font-medium">{currentCase.progressPercent}%</span>
                  </div>
                  {currentCase.notes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">یادداشت:</span>{" "}
                      <span>{currentCase.notes}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${currentCase.progressPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">پیام‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      هنوز پیامی ارسال نشده است.
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.senderRole === "client"
                            ? "bg-primary/10 mr-0 ml-12"
                            : "bg-muted ml-0 mr-12"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {msg.senderRole === "client" ? "شما" : "مدیر"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1"
                    rows={2}
                  />
                  <Button onClick={handleSend} disabled={sending || !message.trim()}>
                    <Send className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">پرونده یافت نشد.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
