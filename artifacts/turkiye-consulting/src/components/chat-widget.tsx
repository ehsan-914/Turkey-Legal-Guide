import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateChatThread, useGetChatThread, useAddChatMessage } from "@workspace/api-client-react";
import { MessageCircle, X, Send, Loader2, ChevronDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetChatThreadQueryKey } from "@workspace/api-client-react";

const STORAGE_KEY = "chat_session";

interface Session { threadId: number; token: string; name: string }

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(s: Session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [step, setStep] = useState<"form" | "chat">(session ? "chat" : "form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const createThread = useCreateChatThread();
  const addMessage = useAddChatMessage();

  const { data: threadData } = useGetChatThread(
    session?.threadId ?? 0,
    session?.token ?? "",
    { query: { enabled: !!session } }
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, threadData?.messages]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !firstMessage) return;
    createThread.mutate(
      { data: { name, email, phone, message: firstMessage } },
      {
        onSuccess: (res) => {
          const sess = { threadId: res.threadId, token: res.token, name };
          setSession(sess);
          saveSession(sess);
          setStep("chat");
        },
      }
    );
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;
    const content = newMessage;
    setNewMessage("");
    addMessage.mutate(
      { id: session.threadId, data: { content, token: session.token } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetChatThreadQueryKey(session.threadId, session.token) });
        },
      }
    );
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setStep("form");
    setName(""); setEmail(""); setPhone(""); setFirstMessage("");
  };

  const messages = threadData?.messages ?? [];
  const isOpen = threadData?.thread?.status === "open" || !threadData;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3" dir="rtl">
      {/* Chat Panel */}
      {open && (
        <div className="w-[340px] sm:w-[380px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: 500 }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                <MessageCircle className="size-5" />
              </div>
              <div>
                <p className="font-bold text-sm">پشتیبانی آنلاین</p>
                <p className="text-[11px] text-primary-foreground/70">معمولاً در چند ساعت پاسخ می‌دهیم</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 size-8" onClick={() => setOpen(false)}>
              <ChevronDown className="size-4" />
            </Button>
          </div>

          {step === "form" ? (
            /* Start Form */
            <form onSubmit={handleStart} className="flex flex-col gap-3 p-4 flex-1 overflow-y-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                سلام! برای شروع گفتگو، اطلاعات خود را وارد کنید.
              </p>
              <Input placeholder="نام و نام خانوادگی *" value={name} onChange={e => setName(e.target.value)} required />
              <Input type="email" placeholder="ایمیل *" dir="ltr" className="text-right" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input placeholder="شماره تماس (اختیاری)" dir="ltr" className="text-right" value={phone} onChange={e => setPhone(e.target.value)} />
              <Textarea
                placeholder="پیام خود را بنویسید... *"
                className="resize-none min-h-[90px]"
                value={firstMessage}
                onChange={e => setFirstMessage(e.target.value)}
                required
              />
              <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={createThread.isPending}>
                {createThread.isPending ? <Loader2 className="size-4 animate-spin" /> : "شروع گفتگو"}
              </Button>
            </form>
          ) : (
            /* Chat View */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-8">گفتگو شروع شد. منتظر پاسخ کارشناسان ما باشید.</p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-[82%] ${msg.senderRole === "client" ? "mr-auto items-start" : "ml-auto items-end"}`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.senderRole === "client"
                        ? "bg-card border text-foreground rounded-tr-sm"
                        : "bg-primary text-primary-foreground rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.senderName}</span>
                  </div>
                ))}
                {!isOpen && (
                  <div className="text-center text-xs text-muted-foreground bg-muted rounded-lg p-2">این گفتگو بسته شده است.</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {isOpen ? (
                <form onSubmit={handleSend} className="p-3 border-t bg-card flex gap-2">
                  <Input
                    placeholder="پیام بنویسید..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 text-sm"
                    disabled={addMessage.isPending}
                  />
                  <Button type="submit" size="icon" className="shrink-0 bg-primary text-primary-foreground" disabled={!newMessage.trim() || addMessage.isPending}>
                    {addMessage.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </form>
              ) : null}

              <div className="px-3 pb-2 border-t pt-2 flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">کد مکالمه: #{session?.threadId}</span>
                <button onClick={handleReset} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">گفتگوی جدید</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setOpen(!open)}
        className="size-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
        size="icon"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </Button>
    </div>
  );
}
