import axiosInstance from "./axiosInstance";
import { unwrapResponse, unwrapArrayResponse } from "../utils/apiResponse";

export interface Course {
  _id: string;
  title: string;
  description: string;
  url: string;
}

export interface CareerSuggestion {
  _id: string;
  user_id: string;
  suggestedCareers: string;
  skillGapAnalysis: string;
  recommended_courses: Course[];
  createdAt?: string;
  updatedAt?: string;
}

class CareerSuggestionService {
  // Generate new career suggestion
  async generateSuggestion(
    userId: string,
    skills: string
  ): Promise<CareerSuggestion> {
    const response = await axiosInstance.post(
      `/career-suggestions/${userId}`,
      { skills }
    );
    return unwrapResponse<CareerSuggestion>(response.data);
  }

  // Get suggestions for a user
  async getSuggestions(userId: string): Promise<CareerSuggestion[]> {
    const response = await axiosInstance.get(`/career-suggestions/${userId}`);
    return unwrapArrayResponse<CareerSuggestion>(response.data);
  }

  async getAllSuggestions(): Promise<CareerSuggestion[]> {
    const response = await axiosInstance.get(`/career-suggestions`);
    return unwrapArrayResponse<CareerSuggestion>(response.data);
  }

  async deleteSuggestion(id: string) {
    const response = await axiosInstance.delete(`/career-suggestions/${id}`);
    return unwrapResponse(response.data);
  }
}

export default new CareerSuggestionService();
