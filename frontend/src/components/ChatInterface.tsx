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

const ChatInterface = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, loading]);

  const handleSendMessage = async () => {
    if (!question.trim() || !user?._id) return;

    setLoading(true);
    try {
      const message = await chatbotService.sendMessage(
        user._id,
        question.trim()
      );
      setChatHistory((prev) => [...prev, message]);
      setQuestion("");
    } catch (error) {
      console.error("Error sending message:", error);
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

  const clearChatHistory = () => {
    setChatHistory([]);
    // Optionally, call an API to clear history on the server
  };

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
              className="text-center text-xs text-gray-400 my-4 font-medium"
            >
              {format(createdAt, "MMMM dd, yyyy")}
            </div>
          );
          lastDate = createdAt;
        }
      }
      elements.push(
        <div key={msg._id} className="mb-4 flex flex-col gap-3 animate-fade-in">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="flex items-start gap-2 max-w-[70%]">
              <div className="bg-blue-600 text-white p-4 rounded-l-2xl rounded-br-2xl shadow-lg transition-transform hover:scale-[1.02]">
                <div className="text-sm whitespace-pre-wrap">
                  {msg.question}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.fullName?.toUpperCase() || "U"}
              </div>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex justify-start">
            <div className="flex items-start gap-2 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xs">
                AI
              </div>
              <div className="bg-white p-4 rounded-r-2xl rounded-bl-2xl shadow-lg border border-gray-100 transition-transform hover:scale-[1.02]">
                <div className="text-sm whitespace-pre-wrap">
                  <ReactMarkdown
                    children={msg.response ?? "*No response yet.*"}
                    remarkPlugins={[remarkGfm]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });

    return elements;
  };

  return (
    <div className=" flex flex-col max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] border rounded-xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          IntelliPath Chatbot
        </h1>
        <Button
          variant="outline"
          onClick={clearChatHistory}
          className="text-sm border-gray-300 hover:bg-gray-200 transition-colors"
        >
          Clear Chat
        </Button>
      </div>

      {/* Chat Messages - set fixed height and scrollable */}
      <ScrollArea
        className="h-[600px]  bg-white rounded-xl shadow-inner p-6 mb-4 overflow-y-auto"
        ref={scrollAreaRef}
      >
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            Ask a career-related question to start the conversation!
          </div>
        ) : (
          renderMessagesWithDates(chatHistory)
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xs">
                AI
              </div>
              <div className="bg-white p-4 rounded-r-2xl rounded-bl-2xl shadow-lg border border-gray-100">
                <div className="text-sm animate-pulse">Typing...</div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="chat-input relative flex items-center gap-3 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your career-related question..."
          className="min-h-[60px] resize-none pr-12 focus:ring-2 focus:ring-white border-none bg-transparent"
          aria-label="Type your question"
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !question.trim()}
          className={`absolute right-6 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors ${
            loading || !question.trim() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Send message"
        >
          <FaPaperPlane className="w-5 h-5 cursor-pointer" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
