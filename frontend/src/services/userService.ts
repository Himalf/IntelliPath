import axiosInstance from "./axiosInstance";

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
    const response = await axiosInstance.get<User[]>("/users");
    return response.data;
  }

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  }

  // Create a new user
  async createUser(payload: CreateUserDto): Promise<User> {
    const response = await axiosInstance.post<User>("/users", payload);
    return response.data;
  }

  // Update user by ID
  async updateUser(id: string, payload: UpdateUserDto): Promise<User> {
    const response = await axiosInstance.patch<User>(`/users/${id}`, payload);
    return response.data;
  }

  // Delete user by ID
  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`/users/${id}`);
  }
}

export default new UserService();
