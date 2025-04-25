import axiosInstance from "./axiosInstance";

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
    return res.data;
  },
  async getById(id: string) {
    const res = await axiosInstance.get(`/courses/${id}`);
    return res.data;
  },
  async create(course: Partial<Course>) {
    const res = await axiosInstance.post("/courses", course);
    return res.data;
  },
  async update(id: string, course: Partial<Course>) {
    const res = await axiosInstance.patch(`/courses/${id}`, course);
    return res.data;
  },
  async delete(id: string) {
    const res = await axiosInstance.delete(`/courses/${id}`);
    return res.data;
  },
};

export default courseService;
