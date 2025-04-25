import axiosInstance from "./axiosInstance";

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
    const response = await axiosInstance.post<CareerSuggestion>(
      `/career-suggestions/${userId}`,
      { skills }
    );
    return response.data;
  }

  // Get suggestions for a user
  async getSuggestions(userId: string): Promise<CareerSuggestion[]> {
    const response = await axiosInstance.get<CareerSuggestion[]>(
      `/career-suggestions/${userId}`
    );
    return response.data;
  }

  async getAllSuggestions(): Promise<CareerSuggestion[]> {
    const response = await axiosInstance.get<CareerSuggestion[]>(
      `/career-suggestions`
    );
    return response.data;
  }

  async deleteSuggestion(id: string) {
    const response = await axiosInstance.delete(`/career-suggestions/${id}`);
    return response.data;
  }
}

export default new CareerSuggestionService();
