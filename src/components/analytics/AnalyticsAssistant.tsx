import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, History, Loader2, MessageSquare, Plus, Send, Sparkles, Trash2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type AnalyticsAssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type SavedConversation = {
  id: string;
  title: string;
  selected_year: number | null;
  selected_month: number | null;
  selected_car_name: string | null;
  created_at: string;
  updated_at: string;
};

type SavedMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

interface AnalyticsAssistantProps {
  selectedYear: number | null;
  selectedMonth: number | null;
  selectedCarId?: string | null;
  selectedCarName?: string | null;
}

const WELCOME_MESSAGE: AnalyticsAssistantMessage = {
  role: "assistant",
  content:
    "Hi, I’m your Teslys AI Analytics Assistant. Ask me about earnings, expenses, utilization, claims, fixed costs, or true net profit. I’ll explain the numbers in plain English.",
};

const SUGGESTED_QUESTIONS = [
  "Explain my analytics in simple terms.",
  "Which car is most profitable?",
  "Why are my Other Expenses high?",
  "What is affecting my true net profit?",
];

const formatConversationDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const getAssistantErrorMessage = async (error: unknown) => {
  const context = (error as { context?: Response })?.context;
  if (context) {
    try {
      const data = await context.clone().json();
      if (typeof data?.error === "string") return data.error;
    } catch {
      // ignore
    }
  }
  return error instanceof Error ? error.message : "The AI assistant could not answer right now.";
};

export function AnalyticsAssistant({
  selectedYear,
  selectedMonth,
  selectedCarId,
  selectedCarName,
}: AnalyticsAssistantProps) {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<AnalyticsAssistantMessage[]>([WELCOME_MESSAGE]);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const db = supabase as any;

  const periodLabel = useMemo(() => {
    if (!selectedYear) return "All time";
    if (selectedMonth) {
      const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("default", { month: "long" });
      return `${monthName} ${selectedYear}`;
    }
    return String(selectedYear);
  }, [selectedYear, selectedMonth]);

  const loadConversations = async () => {
    try {
      const { data, error } = await db
        .from("analytics_assistant_conversations")
        .select("id, title, selected_year, selected_month, selected_car_name, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setConversations((data || []) as SavedConversation[]);
    } catch (error) {
      console.error("Failed to load AI assistant history:", error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setHistoryOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const loadConversation = async (conversationId: string) => {
    try {
      setHistoryLoading(true);
      setHistoryOpen(false);
      const { data, error } = await db
        .from("analytics_assistant_messages")
        .select("role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const savedMessages = ((data || []) as SavedMessage[]).map((message) => ({
        role: message.role,
        content: message.content,
      }));

      setCurrentConversationId(conversationId);
      setMessages(savedMessages.length > 0 ? savedMessages : [WELCOME_MESSAGE]);
    } catch (error) {
      toast({
        title: "Could not open saved chat",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await db
        .from("analytics_assistant_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;
      setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
      if (currentConversationId === conversationId) startNewConversation();
    } catch (error) {
      toast({
        title: "Could not delete saved chat",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (question?: string) => {
    const text = (question ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: AnalyticsAssistantMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationForBackend = nextMessages.filter((message) => message.content.trim().length > 0);
      const { data, error } = await supabase.functions.invoke("analytics-assistant", {
        body: {
          messages: conversationForBackend,
          conversationId: currentConversationId,
          selectedYear,
          selectedMonth,
          selectedCarId: selectedCarId ?? null,
          selectedCarName: selectedCarName ?? null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.conversationId) setCurrentConversationId(data.conversationId);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data?.answer || "I couldn’t answer that yet. Please try asking another way.",
        },
      ]);
      loadConversations();
    } catch (error) {
      const description = await getAssistantErrorMessage(error);
      toast({
        title: "AI assistant unavailable",
        description,
        variant: "destructive",
      });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Sorry, I couldn’t answer right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const HistoryList = (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 p-3 text-xs leading-relaxed text-muted-foreground">
          Your questions and answers will be saved here after you ask the assistant.
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={cn(
              "group rounded-xl border p-2 transition-colors",
              currentConversationId === conversation.id
                ? "border-primary/40 bg-primary/10"
                : "border-border/50 bg-card/60 hover:border-primary/25"
            )}
          >
            <button
              type="button"
              onClick={() => loadConversation(conversation.id)}
              disabled={historyLoading || isLoading}
              className="w-full text-left disabled:opacity-60"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">{conversation.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatConversationDate(conversation.updated_at)}
                    {conversation.selected_car_name ? ` · ${conversation.selected_car_name}` : ""}
                  </p>
                </div>
              </div>
            </button>
            <button
              type="button"
              aria-label="Delete saved chat"
              onClick={() => deleteConversation(conversation.id)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground opacity-70 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );

  const ChatBody = (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="relative shrink-0 overflow-hidden border-b border-border/50 px-4 py-3">
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">AI Analytics Assistant</h3>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {periodLabel}
                {selectedCarName ? ` · ${selectedCarName}` : " · Portfolio"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-2 flex flex-wrap items-center gap-2">
          {isMobile ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setHistoryOpen(true)}
              >
                <History className="mr-1 h-3.5 w-3.5" />
                History ({conversations.length})
              </Button>
              <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                <SheetContent side="right" className="w-[85vw] max-w-sm p-4">
                  <div className="mb-3 mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <History className="h-3.5 w-3.5" />
                    Saved chats
                  </div>
                  <ScrollArea className="h-[calc(100vh-8rem)] pr-2">{HistoryList}</ScrollArea>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <History className="mr-1 h-3.5 w-3.5" />
                  History ({conversations.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  Saved chats
                </div>
                <ScrollArea className="h-72 pr-2">{HistoryList}</ScrollArea>
              </PopoverContent>
            </Popover>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={startNewConversation}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            New chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-3 p-3 sm:p-4">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            return (
              <div
                key={`${message.role}-${index}`}
                className={cn("flex gap-2", isAssistant ? "justify-start" : "justify-end")}
              >
                {isAssistant && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed break-words",
                    isAssistant
                      ? "border border-border/50 bg-background text-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {isAssistant ? (
                    <div className="prose prose-sm max-w-none text-foreground prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-foreground">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                {!isAssistant && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
          {(isLoading || historyLoading) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {historyLoading ? "Opening saved chat…" : "Reviewing your analytics…"}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/50 bg-background/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              disabled={isLoading || historyLoading}
              onClick={() => sendMessage(question)}
              className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about your earnings…"
            className="min-h-[42px] max-h-32 flex-1 min-w-0 resize-none rounded-xl text-sm"
            disabled={isLoading || historyLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-[42px] w-[42px] shrink-0 rounded-xl"
            disabled={isLoading || historyLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          type="button"
          aria-label="Open AI Analytics Assistant"
          onClick={() => setOpen(true)}
          className={cn(
            "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full",
            "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
            "shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] transition-transform hover:scale-105 active:scale-95",
            "bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6"
          )}
        >
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/30 opacity-40" />
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Mobile: bottom sheet */}
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="h-[92vh] rounded-t-2xl p-0 [&>button]:hidden"
          >
            {ChatBody}
          </SheetContent>
        </Sheet>
      ) : (
        // Desktop: floating panel
        open && (
          <div
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur",
              "bottom-4 right-4 sm:bottom-6 sm:right-6",
              "w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)]"
            )}
          >
            {ChatBody}
          </div>
        )
      )}
    </>
  );
}
