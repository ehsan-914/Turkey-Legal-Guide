import { useState, useRef, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import {
  useListAdminChatThreads,
  useGetAdminChatThread,
  useAdminReplyChatThread,
  useUpdateAdminChatThreadStatus,
  getGetAdminChatThreadQueryKey,
  getListAdminChatThreadsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Send, Loader2, MessageCircle, User, UserCheck, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ChatThread } from "@workspace/api-client-react";

export default function AdminChat() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { data: threads, isLoading } = useListAdminChatThreads();

  const filtered = threads?.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Customer Chat</h1>
          <p className="text-muted-foreground mt-1">Respond to customer messages from the public site.</p>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Thread List */}
          <Card className="w-72 shrink-0 flex flex-col">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو..."
                  className="pr-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  dir="rtl"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-12">No chats yet.</div>
              ) : (
                filtered.map(thread => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isSelected={selectedId === thread.id}
                    onClick={() => setSelectedId(thread.id)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Panel */}
          <div className="flex-1 min-w-0">
            {selectedId ? (
              <ChatPanel threadId={selectedId} />
            ) : (
              <Card className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="size-12 mx-auto mb-3 opacity-30" />
                  <p>Select a conversation to start replying</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ThreadItem({ thread, isSelected, onClick }: { thread: ChatThread; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-right px-4 py-3 border-b hover:bg-muted/50 transition-colors flex flex-col gap-1 ${isSelected ? "bg-muted" : ""}`}
    >
      <div className="flex items-center justify-between">
        <Badge variant={thread.status === "open" ? "default" : "secondary"} className="text-[10px] h-4">
          {thread.status === "open" ? "Open" : "Closed"}
        </Badge>
        <span className="font-medium text-sm">{thread.name}</span>
      </div>
      <span className="text-xs text-muted-foreground text-right">{thread.email}</span>
      <span className="text-[10px] text-muted-foreground">
        {format(new Date(thread.createdAt), "MMM d, h:mm a")}
      </span>
    </button>
  );
}

function ChatPanel({ threadId }: { threadId: number }) {
  const { data, isLoading } = useGetAdminChatThread(threadId);
  const replyMutation = useAdminReplyChatThread();
  const statusMutation = useUpdateAdminChatThreadStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const content = message;
    setMessage("");
    replyMutation.mutate(
      { id: threadId, data: { content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminChatThreadQueryKey(threadId) });
          queryClient.invalidateQueries({ queryKey: getListAdminChatThreadsQueryKey() });
        },
        onError: () => toast({ title: "Failed to send reply", variant: "destructive" }),
      }
    );
  };

  const toggleStatus = () => {
    const next = data?.thread?.status === "open" ? "closed" : "open";
    statusMutation.mutate(
      { id: threadId, status: next },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminChatThreadQueryKey(threadId) });
          queryClient.invalidateQueries({ queryKey: getListAdminChatThreadsQueryKey() });
          toast({ title: `Thread ${next}` });
        },
      }
    );
  };

  if (isLoading) return <Card className="h-full flex items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></Card>;

  const { thread, messages } = data ?? { thread: undefined, messages: [] };
  const isOpen = thread?.status === "open";

  return (
    <Card className="h-full flex flex-col shadow-md">
      {/* Header */}
      <CardHeader className="border-b pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStatus}
              disabled={statusMutation.isPending}
              className={isOpen ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}
            >
              {isOpen ? "Close Chat" : "Reopen Chat"}
            </Button>
          </div>
          <div className="text-right">
            <CardTitle className="text-base">{thread?.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{thread?.email} · {thread?.phone}</p>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.senderRole === "admin" ? "ml-auto items-end" : "mr-auto items-start"}`}>
            <div className="flex items-center gap-1.5 mb-1 px-1">
              {msg.senderRole === "admin"
                ? <UserCheck className="size-3 text-primary" />
                : <User className="size-3 text-muted-foreground" />
              }
              <span className="text-[10px] text-muted-foreground">{msg.senderName}</span>
              <span className="text-[10px] text-muted-foreground/60">{format(new Date(msg.createdAt), "HH:mm")}</span>
            </div>
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.senderRole === "admin"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-card border text-foreground rounded-tl-sm"
            }`} dir="rtl">
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No messages yet.</div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Reply box */}
      {isOpen ? (
        <div className="p-4 border-t bg-card shrink-0">
          <form onSubmit={handleReply} className="flex gap-2">
            <Input
              placeholder="Type your reply..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="flex-1"
              disabled={replyMutation.isPending}
            />
            <Button type="submit" size="icon" disabled={!message.trim() || replyMutation.isPending}>
              {replyMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>
      ) : (
        <div className="p-3 border-t text-center text-xs text-muted-foreground bg-muted/30">This chat is closed.</div>
      )}
    </Card>
  );
}
