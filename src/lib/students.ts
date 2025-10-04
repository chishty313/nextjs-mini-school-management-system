import api from "./api";
import {
  Student,
  CreateStudentData,
  UpdateStudentData,
  StudentsResponse,
  StudentsQuery,
} from "@/types";

export const studentsService = {
  // Get all students with pagination
  async getStudents(query: StudentsQuery = {}): Promise<StudentsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.classId) params.append("classId", query.classId.toString());

    const response = await api.get(`/students?${params.toString()}`);
    // Backend returns { message: '...', data: { students: [...], pagination: {...} } }
    return response.data.data;
  },

  // Get student by ID
  async getStudent(id: number): Promise<Student> {
    const response = await api.get(`/students/${id}`);
    return response.data.data.student;
  },

  // Create new student
  async createStudent(studentData: CreateStudentData): Promise<Student> {
    const response = await api.post("/students", studentData);
    return response.data.data.student;
  },

  // Update student
  async updateStudent(
    id: number,
    studentData: UpdateStudentData
  ): Promise<Student> {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data.data.student;
  },

  // Delete student
  async deleteStudent(id: number): Promise<void> {
    await api.delete(`/students/${id}`);
  },

  // Unenroll student from class (set classId to null)
  async unenrollStudent(id: number): Promise<Student> {
    const response = await api.put(`/students/${id}`, { classId: null });
    return response.data.data.student;
  },

  // Get current student's classes
  async getMyClasses(): Promise<
    Array<{
      id: number;
      name: string;
      section: string;
      createdAt: string;
      updatedAt: string;
      teacher?: {
        id: number;
        name: string;
        email: string;
      } | null;
      studentCount: number;
    }>
  > {
    const response = await api.get("/students/me/classes");
    return response.data.data.classes;
  },
};
