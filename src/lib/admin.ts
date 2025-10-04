import api from "./api";

export interface TeacherDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  classes: Array<{
    id: number;
    name: string;
    section: string;
    studentCount: number;
    students: Array<{
      id: number;
      name: string;
      age: number;
    }>;
  }>;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminStats {
  totalStudents: number;
  activeClasses: number;
  totalTeachers: number;
  enrollmentRate: number;
}

export const adminService = {
  // Get dashboard statistics
  async getStats(): Promise<AdminStats> {
    const response = await api.get("/admin/stats");
    return response.data.data;
  },

  // Get all teachers with their classes and students
  async getTeachersWithDetails(): Promise<TeacherDetails[]> {
    const response = await api.get("/admin/teachers");
    return response.data.data.teachers;
  },

  // Get all users
  async getAllUsers(): Promise<UserDetails[]> {
    const response = await api.get("/admin/users");
    return response.data.data.users;
  },

  // Get available teachers (not assigned to any class)
  async getAvailableTeachers(): Promise<UserDetails[]> {
    const response = await api.get("/admin/teachers/available");
    return response.data.data.teachers;
  },
};
