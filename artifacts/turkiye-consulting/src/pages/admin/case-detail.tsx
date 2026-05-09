import { useParams, Link } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { 
  useGetCase, 
  useUpdateCase, 
  useListCaseMessages, 
  useCreateCaseMessage,
  getGetCaseQueryKey,
  getListCaseMessagesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Send, Save, Loader2, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminCaseDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caseData, isLoading } = useGetCase(id, { query: { enabled: !!id } });
  const { data: messages, isLoading: messagesLoading } = useListCaseMessages(id, { query: { enabled: !!id } });
  
  const updateMutation = useUpdateCase();
  const messageMutation = useCreateCaseMessage();

  // Local state for edits
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state when data loads
  const initializedId = useRef<number | null>(null);
  useEffect(() => {
    if (caseData && initializedId.current !== caseData.id) {
      setStatus(caseData.status);
      setPriority(caseData.priority);
      setProgress(caseData.progressPercent);
      setNotes(caseData.notes || "");
      initializedId.current = caseData.id;
    }
  }, [caseData]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpdateCase = () => {
    updateMutation.mutate(
      { 
        id, 
        data: { 
          status: status as any, 
          priority: priority as any, 
          progressPercent: progress, 
          notes 
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
          toast({ title: "Case updated successfully" });
        }
      }
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    messageMutation.mutate(
      { data: { content: newMessage, caseId: id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCaseMessagesQueryKey(id) });
          setNewMessage("");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] lg:col-span-2" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!caseData) {
    return (
      <AdminLayout>
        <div className="text-center py-20">Case not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/cases">
            <Button variant="outline" size="icon">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">Case #{caseData.id}</h1>
            <p className="text-sm text-muted-foreground">{caseData.clientName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Details & Edit Panel */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending_documents">Pending Docs</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Progress</label>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={progress} className="h-2 flex-1" />
                    <Input 
                      type="number" 
                      min="0" max="100" 
                      className="w-20 h-8 text-sm" 
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal Notes</label>
                  <Textarea 
                    className="min-h-[150px] resize-y" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Document case details, internal updates..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateCase} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                    Save Case Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Full Name</dt>
                    <dd className="font-medium mt-1">{caseData.clientName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium mt-1">{caseData.clientEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium mt-1">{caseData.clientPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Service Type</dt>
                    <dd className="font-medium mt-1 capitalize">{caseData.serviceType}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium mt-1">{format(new Date(caseData.createdAt), "PPP")}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Messages Panel */}
          <div className="xl:col-span-1 flex flex-col h-[calc(100vh-8rem)] min-h-[500px]">
            <Card className="flex flex-col flex-1 shadow-md border-primary/10">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="size-5" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-16 w-3/4 ml-auto" />
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[85%] ${msg.senderRole === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {format(new Date(msg.createdAt), "HH:mm")}
                        </span>
                      </div>
                      <div 
                        className={`p-3 rounded-2xl text-sm ${
                          msg.senderRole === 'admin' 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                            : 'bg-muted text-foreground rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={messageMutation.isPending || !newMessage.trim()}>
                    {messageMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

