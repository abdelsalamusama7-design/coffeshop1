import { useState, useRef, useEffect } from "react";
import { X, Send, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

// Robot Avatar Component
const RobotAvatar = ({ isAnimating = false, size = "md" }: { isAnimating?: boolean; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      {/* Robot Head */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/80 rounded-xl shadow-lg">
        {/* Antenna */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-primary rounded-full">
          <div className={cn(
            "absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full",
            isAnimating && "animate-pulse"
          )} />
        </div>
        
        {/* Eyes Container */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {/* Left Eye */}
          <div className="relative">
            <div className={cn(
              "w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]",
              isAnimating && "animate-pulse"
            )}>
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/60 rounded-full" />
            </div>
          </div>
          {/* Right Eye */}
          <div className="relative">
            <div className={cn(
              "w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]",
              isAnimating && "animate-pulse"
            )}>
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/60 rounded-full" />
            </div>
          </div>
        </div>

        {/* Mouth/Speaker Grille */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
          <div className={cn(
            "w-4 h-0.5 bg-cyan-400/80 rounded-full",
            isAnimating && "animate-pulse"
          )} />
          <div className={cn(
            "w-3 h-0.5 bg-cyan-400/60 rounded-full mx-auto",
            isAnimating && "animate-pulse"
          )} />
        </div>

        {/* Side Details */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0.5 w-0.5 h-3 bg-cyan-400/40 rounded-full" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0.5 w-0.5 h-3 bg-cyan-400/40 rounded-full" />
      </div>
    </div>
  );
};

// Floating Robot Button
const FloatingRobotButton = ({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      "fixed bottom-6 left-6 z-50 group transition-all duration-300",
      isOpen && "scale-0 pointer-events-none"
    )}
  >
    <div className="relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl group-hover:bg-primary/50 transition-all" />
      
      {/* Robot Container */}
      <div className="relative bg-gradient-to-br from-card to-muted p-3 rounded-2xl shadow-2xl border-2 border-primary/30 group-hover:border-primary/60 transition-all group-hover:scale-105">
        <RobotAvatar size="md" isAnimating />
        
        {/* Speech Bubble */}
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg animate-bounce">
          مرحباً!
        </div>
      </div>
    </div>
  </button>
);

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "مرحباً! أنا المساعد الذكي لنظام المراقب. كيف يمكنني مساعدتك اليوم؟ 🤖",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل في الاتصال بالمساعد الذكي");
    }

    if (!resp.body) throw new Error("لا يوجد استجابة");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      await streamChat(newMessages.slice(1));
    } catch (e) {
      console.error("Chat error:", e);
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Robot Button */}
      <FloatingRobotButton onClick={() => setIsOpen(true)} isOpen={isOpen} />

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 left-6 z-50 w-[400px] h-[550px] rounded-3xl shadow-2xl",
          "bg-gradient-to-b from-card to-background border-2 border-primary/20 flex flex-col overflow-hidden",
          "transition-all duration-300 transform origin-bottom-left",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header with Robot */}
        <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-4">
          {/* Decorative Circuit Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-4 w-20 h-0.5 bg-white" />
            <div className="absolute top-2 left-24 w-2 h-2 border border-white rounded-full" />
            <div className="absolute bottom-2 right-4 w-16 h-0.5 bg-white" />
            <div className="absolute bottom-2 right-20 w-2 h-2 border border-white rounded-full" />
          </div>

          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-4">
              <div className="relative">
                <RobotAvatar size="lg" isAnimating={isLoading} />
                {/* Status Indicator */}
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-primary",
                  isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                )} />
              </div>
              <div className="text-primary-foreground">
                <h3 className="font-bold text-lg">المساعد الذكي</h3>
                <p className="text-sm opacity-80 flex items-center gap-1">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                  )} />
                  {isLoading ? "يفكر..." : "متصل ومستعد"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {message.role === "user" ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center border-2 border-secondary">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  ) : (
                    <RobotAvatar size="sm" isAnimating={isLoading && index === messages.length - 1} />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-md",
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm"
                      : "bg-gradient-to-br from-muted to-muted/80 rounded-tl-sm border border-border"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>p]:leading-relaxed">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <RobotAvatar size="sm" isAnimating />
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 border border-border">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 px-4 py-2 bg-destructive/10 text-destructive text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 rounded-xl border-2 border-border/50 focus:border-primary/50 bg-background"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-xl w-11 h-11 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatbot;
