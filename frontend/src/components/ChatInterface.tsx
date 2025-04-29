import { useState, useEffect, useRef, useCallback, JSX } from "react";
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

const ChatInterface = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [typingResponse, setTypingResponse] = useState<string>(""); // For typing effect
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user?._id) return;
      try {
        const history = await chatbotService.getChatHistory(user._id);
        setChatHistory(history);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [user]);

  // Auto-scroll when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, typingResponse]);

  const handleSendMessage = async () => {
    if (!question.trim() || !user?._id) return;

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

    try {
      const message = await chatbotService.sendMessage(
        user._id,
        currentQuestion
      );

      setChatHistory((prev) =>
        prev.map((msg) => (msg._id === tempUserMessage._id ? message : msg))
      );

      // Start typing animation
      if (message.response) {
        simulateTyping(message.response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg._id === tempUserMessage._id
            ? {
                ...msg,
                response:
                  "Sorry, I couldn't process your request. Please try again.",
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
    const confirmation = window.confirm(
      "Are you sure you want to delete all chats? This action cannot be undone."
    );

    if (confirmation) {
      try {
        await chatbotService.deleteChatByUserId(userId);
        setChatHistory([]);
        toast.success("Chat history cleared successfully!");
      } catch (error) {
        toast.error("Failed to delete chat history.");
      }
    } else {
      toast.info("Chat history deletion canceled.");
    }
  };

  const simulateTyping = useCallback((fullText: string) => {
    setTypingResponse(""); // Reset previous typing
    let index = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      setTypingResponse((prev) => prev + fullText.charAt(index));
      index++;

      if (index >= fullText.length && typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    }, 90); // Typing speed (ms per character)
  }, []);

  const renderMessagesWithDates = (messages: ChatMessage[]) => {
    const elements: JSX.Element[] = [];
    let lastDate: Date | null = null;

    messages.forEach((msg, index) => {
      const createdAt = new Date(msg.createdAt ?? "");
      if (!isNaN(createdAt.getTime())) {
        if (!lastDate || !isSameDay(createdAt, lastDate)) {
          elements.push(
            <div
              key={`date-${index}`}
              className="text-center text-xs text-gray-400 my-3 font-medium"
            >
              {format(createdAt, "MMMM dd, yyyy")}
            </div>
          );
          lastDate = createdAt;
        }
      }
      elements.push(
        <div key={msg._id} className="mb-3 flex flex-col gap-2">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="flex items-start gap-2 max-w-[70%]">
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <div className="text-sm whitespace-pre-wrap">
                  {msg.question}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>

          {/* AI Response */}
          {(msg.response || (loading && index === messages.length - 1)) && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[70%]">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xs">
                  AI
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="text-sm whitespace-pre-wrap">
                    {loading && index === messages.length - 1 ? (
                      "Typing..."
                    ) : index === messages.length - 1 && typingResponse ? (
                      <ReactMarkdown
                        children={typingResponse}
                        remarkPlugins={[remarkGfm]}
                      />
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

  return (
    <div className="flex flex-col mx-auto bg-white p-4 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] border border-gray-400 rounded-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800">
          IntelliPath Chatbot
        </h1>
        <Button
          variant="outline"
          onClick={() => user?._id && clearChatHistory(user._id)}
          className="text-sm border-gray-300"
        >
          Clear Chat
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea
        className="h-full  bg-gray-50 rounded-lg p-4 mb-3"
        ref={scrollAreaRef}
      >
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Ask a career-related question to start the conversation!
          </div>
        ) : (
          renderMessagesWithDates(chatHistory)
        )}
      </ScrollArea>

      {/* Input */}
      <div className="relative flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your career-related question..."
          className="min-h-12 resize-none pr-10 border-none bg-transparent focus:ring-1 focus:ring-blue-500"
          aria-label="Type your question"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !question.trim()}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 ${
            loading || !question.trim() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Send message"
        >
          <FaPaperPlane className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
