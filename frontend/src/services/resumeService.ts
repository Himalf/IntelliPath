import axiosInstance from "./axiosInstance";
export interface JobRecommendation {
  title: string;
  url: string;
}

export interface ResumeAnalysis {
  _id: string;
  user_id: string;
  resumeText: string;
  strengths: string[];
  weakness: string[];
  recommendation: string[];
  jobRecommendations?: JobRecommendation[];
  createdAt?: string;
  updatedAt?: string;
}

class ResumeService {
  // Upload and analyze resume for a user
  async analyzeResume(userId: string, file: File): Promise<ResumeAnalysis> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<ResumeAnalysis>(
      `/resume-analysis/analyze/${userId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  // Get analysis results for a user
  async getResumeAnalysis(userId: string): Promise<ResumeAnalysis[]> {
    const response = await axiosInstance.get<ResumeAnalysis[]>(
      `/resume-analysis/${userId}`
    );
    return response.data;
  }

  // get all
  async getAllAnalyses(): Promise<ResumeAnalysis[]> {
    const response = await axiosInstance.get<ResumeAnalysis[]>(
      `/resume-analysis`
    );
    return response.data;
  }

  async deleteAnalyses(id: string) {
    const response = await axiosInstance.delete(`/resume-analysis/${id}`);
    return response.data;
  }
}

export default new ResumeService();
