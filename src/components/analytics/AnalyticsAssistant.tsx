import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, History, Loader2, MessageSquare, Plus, Send, Sparkles, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
      // Keep the SDK message below if the response is not JSON.
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
  const [messages, setMessages] = useState<AnalyticsAssistantMessage[]>([WELCOME_MESSAGE]);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();

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
        .limit(12);

      if (error) throw error;
      setConversations((data || []) as SavedConversation[]);
    } catch (error) {
      console.error("Failed to load AI assistant history:", error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const loadConversation = async (conversationId: string) => {
    try {
      setHistoryLoading(true);
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

  return (
    <section className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="relative overflow-hidden border-b border-border/50 p-4">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Analytics Assistant</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Ask plain-English questions about earnings, expenses, utilization, and profitability.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Context:</span> {periodLabel}
              {selectedCarName ? ` · ${selectedCarName}` : " · Portfolio"}
            </div>
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl text-xs" onClick={startNewConversation}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New chat
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-border/50 bg-background/60 p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Saved chats
          </div>
          <ScrollArea className="h-[320px] pr-2">
            {conversations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 p-3 text-xs leading-relaxed text-muted-foreground">
                Your questions and answers will be saved here after you ask the assistant.
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
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
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        <div className="min-w-0">
          <ScrollArea className="h-[360px] pr-3">
            <div className="space-y-3">
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
                        "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
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
            </div>
          </ScrollArea>

          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                disabled={isLoading || historyLoading}
                onClick={() => sendMessage(question)}
                className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
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
              placeholder="Ask: Why is my true net profit down this month?"
              className="min-h-[44px] resize-none rounded-xl text-sm"
              disabled={isLoading || historyLoading}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={isLoading || historyLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
            Your assistant conversations are saved to your account. AI answers are explanatory only, not tax or investment advice.
          </p>
        </div>
      </div>
    </section>
  );
}
