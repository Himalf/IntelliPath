import axiosInstance from "./axiosInstance";
export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  education?: string;
  skills?: string;
  resume_url?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  education?: string;
  skills?: string;
  resume_url?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
interface RegisterResponse {
  access_token: string;
  user: User;
}

interface User {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
}
interface LoginResponse {
  access_token: string;
  user: User;
}
class AuthService {
  // Login
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      payload
    );
    return response.data;
  }

  // Register
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await axiosInstance.post<RegisterResponse>(
      "/users",
      payload
    );
    return response.data;
  }

  //   Logout
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
export default new AuthService();
