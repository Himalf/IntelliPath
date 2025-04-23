import axiosInstance from "./axiosInstance";

export interface ResumeAnalysis {
  _id: string;
  user_id: string;
  resumeText: string;
  strengths: string[];
  weakness: string[];
  recommendation: string[];
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
      formData
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
}

export default new ResumeService();
