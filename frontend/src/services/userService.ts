import axiosInstance from "./axiosInstance";
import { unwrapResponse, unwrapArrayResponse } from "../utils/apiResponse";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  education?: string;
  skills?: string;
  resume_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
  education?: string;
  skills?: string;
  resume_url?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  education?: string;
  skills?: string;
  resume_url?: string;
}

class UserService {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const response = await axiosInstance.get("/users");
    return unwrapArrayResponse<User>(response.data);
  }

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    const response = await axiosInstance.get(`/users/${id}`);
    return unwrapResponse<User>(response.data);
  }

  // Create a new user
  async createUser(payload: CreateUserDto): Promise<User> {
    const response = await axiosInstance.post("/users", payload);
    return unwrapResponse<User>(response.data);
  }

  // Update user by ID
  async updateUser(id: string, payload: UpdateUserDto): Promise<User> {
    const response = await axiosInstance.patch(`/users/${id}`, payload);
    return unwrapResponse<User>(response.data);
  }

  // Delete user by ID
  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`/users/${id}`);
  }
}

export default new UserService();
