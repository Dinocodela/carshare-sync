import { FormEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Loader2, Send, Sparkles, UserRound } from "lucide-react";
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

interface AnalyticsAssistantProps {
  selectedYear: number | null;
  selectedMonth: number | null;
  selectedCarId?: string | null;
  selectedCarName?: string | null;
}

const SUGGESTED_QUESTIONS = [
  "Explain my analytics in simple terms.",
  "Which car is most profitable?",
  "Why are my Other Expenses high?",
  "What is affecting my true net profit?",
];

export function AnalyticsAssistant({
  selectedYear,
  selectedMonth,
  selectedCarId,
  selectedCarName,
}: AnalyticsAssistantProps) {
  const [messages, setMessages] = useState<AnalyticsAssistantMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m your Teslys AI Analytics Assistant. Ask me about earnings, expenses, utilization, claims, fixed costs, or true net profit. I’ll explain the numbers in plain English.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();

  const periodLabel = useMemo(() => {
    if (!selectedYear) return "All time";
    if (selectedMonth) {
      const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("default", { month: "long" });
      return `${monthName} ${selectedYear}`;
    }
    return String(selectedYear);
  }, [selectedYear, selectedMonth]);

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
          selectedYear,
          selectedMonth,
          selectedCarId: selectedCarId ?? null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data?.answer || "I couldn’t answer that yet. Please try asking another way.",
        },
      ]);
    } catch (error) {
      const description = error instanceof Error ? error.message : "The AI assistant could not answer right now.";
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
          <div className="rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Context:</span> {periodLabel}
            {selectedCarName ? ` · ${selectedCarName}` : " · Portfolio"}
          </div>
        </div>
      </div>

      <div className="p-4">
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
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Reviewing your analytics…
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              disabled={isLoading}
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
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
          AI answers are based on the analytics data available in Teslys and are for explanation only, not tax or investment advice.
        </p>
      </div>
    </section>
  );
}
