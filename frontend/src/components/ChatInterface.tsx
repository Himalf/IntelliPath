import { useState, useEffect, useRef, JSX } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format, isSameDay } from "date-fns";
import { useAuth } from "@/features/auth/AuthContext";
import chatbotService, { ChatMessage } from "@/services/chatbotService";
import { FaPaperPlane } from "react-icons/fa";
import { toast } from "sonner";
import {
  Bot,
  User as UserIcon,
  Sparkles,
  MessageSquare,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";

// Suggested questions for quick access
const SUGGESTED_QUESTIONS = [
  "What career should I choose?",
  "How to improve my resume?",
  "What skills do I need for software engineering?",
  "Can you give me job interview tips?",
  "What are the best career paths for someone with my skills?",
  "How do I transition to a new career?",
];

const ChatInterface = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user?._id) return;
      setLoadingHistory(true);
      setError(null);
      try {
        const history = await chatbotService.getChatHistory(user._id);
        setChatHistory(Array.isArray(history) ? history : []);
      } catch (err: any) {
        console.error("Error fetching chat history:", err);
        setError(err?.message || "Failed to load chat history");
        setChatHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [user]);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [chatHistory, loading]);

  const handleSendMessage = async () => {
    if (!question.trim() || !user?._id || loading) return;

    const tempUserMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      userId: user._id,
      question: question.trim(),
      response: null,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, tempUserMessage]);
    const currentQuestion = question.trim();
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const message = await chatbotService.sendMessage(
        user._id,
        currentQuestion
      );

      setChatHistory((prev) =>
        prev.map((msg) => (msg._id === tempUserMessage._id ? message : msg))
      );

      toast.success("Response received");
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error?.message || "Failed to get response. Please try again.");
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg._id === tempUserMessage._id
            ? {
                ...msg,
                response:
                  "Sorry, I couldn't process your request. Please try again later.",
              }
            : msg
        )
      );
      toast.error("Failed to get response from AI");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = async (userId: string) => {
    if (!window.confirm("Are you sure you want to clear all chat history?"))
      return;

    try {
      await chatbotService.deleteChatByUserId(userId);
      setChatHistory([]);
      toast.success("Chat history cleared");

      // Refresh chat history to ensure it's cleared (in case of cache issues)
      setTimeout(async () => {
        try {
          const history = await chatbotService.getChatHistory(userId);
          setChatHistory(Array.isArray(history) ? history : []);
        } catch (err) {
          // If refresh fails, keep the empty state
          console.error("Error refreshing chat history:", err);
        }
      }, 500);
    } catch (error: any) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat history");
    }
  };

  const renderMessagesWithDates = (messages: ChatMessage[]) => {
    const elements: JSX.Element[] = [];
    let lastDate: Date | null = null;

    const safeMessages = Array.isArray(messages) ? messages : [];

    safeMessages.forEach((msg, index) => {
      const createdAt = new Date(msg.createdAt ?? "");
      if (!isNaN(createdAt.getTime())) {
        if (!lastDate || !isSameDay(createdAt, lastDate)) {
          elements.push(
            <div
              key={`date-${index}`}
              className="text-center text-xs text-gray-400 my-4 font-medium bg-gray-100 py-1 rounded-full"
            >
              {format(createdAt, "MMMM dd, yyyy")}
            </div>
          );
          lastDate = createdAt;
        }
      }
      elements.push(
        <div key={msg._id} className="mb-4 flex flex-col gap-3">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="flex items-start gap-3 max-w-[75%]">
              <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-md">
                <div className="text-sm whitespace-pre-wrap">
                  {msg.question}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>

          {/* AI Response */}
          {(msg.response || (loading && index === safeMessages.length - 1)) && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[75%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-md">
                  <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                    {loading && index === safeMessages.length - 1 ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI is thinking...</span>
                      </div>
                    ) : (
                      <ReactMarkdown
                        children={msg.response ?? "*No response yet.*"}
                        remarkPlugins={[remarkGfm]}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });

    return elements;
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading chat history..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">IntelliPath AI Assistant</h1>
            <p className="text-xs text-blue-100">
              Powered by AI • Ask me anything about careers
            </p>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => user?._id && clearChatHistory(user._id)}
            className="text-white hover:bg-white/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 flex-shrink-0">
          <ErrorDisplay
            title="Error"
            message={error}
            onRetry={() => setError(null)}
          />
        </div>
      )}

      {/* Suggested Questions */}
      {chatHistory.length === 0 && !loading && (
        <div className="p-4 bg-gray-50 border-b flex-shrink-0">
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Suggested Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setQuestion(q)}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages - Scrollable Area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0"
        style={{ maxHeight: "calc(100vh - 20rem)" }}
      >
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Ask me anything about careers, resume tips, job interviews, or
              career guidance. I'm here to help you navigate your professional
              journey!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderMessagesWithDates(chatHistory)}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your career-related question... (Press Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[120px] resize-none pr-12 border-2 focus:border-blue-500 rounded-lg"
              disabled={loading}
            />
            {loading && (
              <div className="absolute right-3 bottom-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={loading || !question.trim()}
            size="lg"
            className="h-[60px] px-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FaPaperPlane className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {chatHistory.length}{" "}
          {chatHistory.length === 1 ? "message" : "messages"} in this
          conversation
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
