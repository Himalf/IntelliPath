import axiosInstance from "./axiosInstance";

export interface ChatMessage {
  _id?: string;
  userId: string;
  question: string;
  response: string | null;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

const ChatbotService = {
  async sendMessage(userId: string, question: string): Promise<ChatMessage> {
    const res = await axiosInstance.post(`/chatbot-queries/${userId}`, {
      question,
    });
    return res.data;
  },

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const res = await axiosInstance.get(`/chatbot-queries/${userId}`);
    return res.data;
  },
};

export default ChatbotService;
