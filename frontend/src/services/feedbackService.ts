import axiosInstance from "./axiosInstance";

export interface Feedback {
  _id: string;
  userId: string;
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
    const res = await axiosInstance.get<Feedback[]>(`/feedback/user/${userId}`);
    return res.data;
  }

  async createFeedback(data: CreateFeedbackDto): Promise<Feedback> {
    const res = await axiosInstance.post<Feedback>("/feedback", data);
    return res.data;
  }

  async updateFeedback(id: string, data: UpdateFeedbackDto): Promise<Feedback> {
    const res = await axiosInstance.patch<Feedback>(`/feedback/${id}`, data);
    return res.data;
  }

  async deleteFeedback(id: string): Promise<void> {
    await axiosInstance.delete(`/feedback/${id}`);
  }
}

export default new FeedbackService();
