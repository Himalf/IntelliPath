import axiosInstance from "./axiosInstance";
import { unwrapResponse, unwrapArrayResponse } from "../utils/apiResponse";

export interface Course {
  _id: string;
  title: string;
  description: string;
  tags?: string[];
  url?: string;
  link?: string;
  careerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  url: string;
  tags: { value: string }[];
}

const courseService = {
  async getAll(): Promise<Course[]> {
    const res = await axiosInstance.get("/courses");
    return unwrapArrayResponse<Course>(res.data);
  },
  async getById(id: string) {
    const res = await axiosInstance.get(`/courses/${id}`);
    return unwrapResponse(res.data);
  },
  async create(course: Partial<Course>) {
    const res = await axiosInstance.post("/courses", course);
    return unwrapResponse(res.data);
  },
  async update(id: string, course: Partial<Course>) {
    const res = await axiosInstance.patch(`/courses/${id}`, course);
    return unwrapResponse(res.data);
  },
  async delete(id: string) {
    const res = await axiosInstance.delete(`/courses/${id}`);
    return unwrapResponse(res.data);
  },
};

export default courseService;
