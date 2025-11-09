import axiosInstance from "./axiosInstance";
import { unwrapResponse, unwrapArrayResponse } from "../utils/apiResponse";

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
    return unwrapResponse<ChatMessage>(res.data);
  },

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    const res = await axiosInstance.get(`/chatbot-queries/${userId}`);
    return unwrapArrayResponse<ChatMessage>(res.data);
  },

  async deleteChatByUserId(userId: string) {
    const res = await axiosInstance.delete(`chatbot-queries/${userId}`);
    return unwrapResponse(res.data);
  },
};

export default ChatbotService;
