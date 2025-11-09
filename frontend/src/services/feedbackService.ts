import axiosInstance from "./axiosInstance";
import { unwrapResponse, unwrapArrayResponse } from "../utils/apiResponse";

export interface Feedback {
  _id: string;
  userId: string;
  user?: {
    _id: string;
    fullName: string;
  };
  message: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeedbackDto {
  userId: string;
  message: string;
  rating: number;
}

export interface UpdateFeedbackDto {
  message?: string;
  rating?: number;
}

class FeedbackService {
  async getUserFeedback(userId: string): Promise<Feedback[]> {
    const res = await axiosInstance.get(`/feedback/user/${userId}`);
    return unwrapArrayResponse<Feedback>(res.data);
  }

  async createFeedback(data: CreateFeedbackDto): Promise<Feedback> {
    const res = await axiosInstance.post("/feedback", data);
    return unwrapResponse<Feedback>(res.data);
  }

  async updateFeedback(id: string, data: UpdateFeedbackDto): Promise<Feedback> {
    const res = await axiosInstance.patch(`/feedback/${id}`, data);
    return unwrapResponse<Feedback>(res.data);
  }

  async deleteFeedback(id: string): Promise<void> {
    await axiosInstance.delete(`/feedback/${id}`);
  }

  async getAllFeedback(): Promise<Feedback[]> {
    const res = await axiosInstance.get(`/feedback`);
    return unwrapArrayResponse<Feedback>(res.data);
  }
}

export default new FeedbackService();
