import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link, useParams } from "wouter";
import { useEffect, useState } from "react";
import { useGetClientProfile, getGetClientProfileQueryKey } from "@workspace/api-client-react";
import { useListCaseMessages, getListCaseMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, ArrowLeft, FileText, FolderOpen, MessageSquare, Download, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = {
  active: "Active",
  pending_documents: "Pending Documents",
  in_review: "In Review",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
};

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-800",
  pending_documents: "bg-yellow-100 text-yellow-800",
  in_review: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
};

function CaseMessages({ caseId }: { caseId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: messages = [] } = useListCaseMessages(caseId, {
    query: { queryKey: getListCaseMessagesQueryKey(caseId), refetchInterval: 5000 },
  });

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }
      setMessage("");
      queryClient.invalidateQueries({ queryKey: getListCaseMessagesQueryKey(caseId) });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.senderRole === "admin"
                  ? "bg-primary/10 ml-0 mr-12"
                  : "bg-muted mr-0 ml-12"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {msg.senderRole === "admin" ? "Admin" : msg.senderName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleString()}
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
          placeholder="Type your response..."
          className="flex-1"
          rows={2}
        />
        <Button onClick={handleSend} disabled={sending || !message.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminClientDetail() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const clientId = parseInt(params.id || "0", 10);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin/login");
    }
    if (!isLoading && user && user.role !== "admin") {
      setLocation("/client/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const { data: client, isLoading: clientLoading } = useGetClientProfile(clientId, {
    query: { queryKey: getGetClientProfileQueryKey(clientId), enabled: !!user && user?.role === "admin" && clientId > 0 },
  });

  if (isLoading || !user || clientLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground">Client not found.</p>
            <Link href="/admin/clients">
              <Button className="mt-4">Back to Clients</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="ltr">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <div className="size-8 rounded-sm bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-xl leading-none">T</span>
              </div>
            </Link>
            <h1 className="font-serif font-bold text-lg">Client Folder</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/admin/clients" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4 inline mr-1" />
              Back to Clients
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{client.name}</CardTitle>
                <CardDescription>@{client.username} — Registered {new Date(client.createdAt).toLocaleDateString()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              {client.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <span className="font-medium">{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <FolderOpen className="size-4 text-muted-foreground" />
                <span>{client.cases.length} cases</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="size-4 text-muted-foreground" />
                <span>{client.documents.length} documents</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="cases">
          <TabsList>
            <TabsTrigger value="cases">
              <FolderOpen className="size-4 mr-1" />
              Cases ({client.cases.length})
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="size-4 mr-1" />
              Documents ({client.documents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-4 mt-4">
            {client.cases.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No cases for this client.</p>
                </CardContent>
              </Card>
            ) : (
              client.cases.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{c.serviceType}</CardTitle>
                      <Badge className={statusColors[c.status] || ""} variant="secondary">
                        {statusLabels[c.status] || c.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Priority: {c.priority} — Progress: {c.progressPercent}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${c.progressPercent}%` }}
                      />
                    </div>
                    {c.notes && (
                      <p className="text-sm text-muted-foreground mb-4">{c.notes}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCaseId(selectedCaseId === c.id ? null : c.id)}
                    >
                      <MessageSquare className="size-4 mr-1" />
                      {selectedCaseId === c.id ? "Hide Messages" : "Messages"}
                    </Button>
                    {selectedCaseId === c.id && (
                      <div className="mt-4 border-t pt-4">
                        <CaseMessages caseId={c.id} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            {client.documents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No documents uploaded by this client.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {client.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="size-8 text-primary" />
                          <div>
                            <p className="font-medium">{doc.originalName}</p>
                            <p className="text-sm text-muted-foreground">
                              {(doc.fileSize / 1024).toFixed(1)} KB — {doc.mimeType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {new Date(doc.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm">
                            <Download className="size-4 mr-1" />
                            Download
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
