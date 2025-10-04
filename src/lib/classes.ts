import api from "./api";
import {
  Class,
  CreateClassData,
  UpdateClassData,
  EnrollStudentData,
  AssignTeacherData,
  Student,
} from "@/types";

export const classesService = {
  // Get all classes
  async getClasses(): Promise<{ classes: Class[] }> {
    const response = await api.get("/classes");
    return response.data.data || { classes: [] };
  },

  // Get class by ID
  async getClass(id: number): Promise<Class> {
    const response = await api.get<Class>(`/classes/${id}`);
    return response.data;
  },

  // Get students in a class
  async getClassStudents(id: number): Promise<Student[]> {
    const response = await api.get(`/classes/${id}/students`);
    return response.data.data.students;
  },

  // Create new class
  async createClass(classData: CreateClassData): Promise<Class> {
    const response = await api.post<Class>("/classes", classData);
    return response.data;
  },

  // Update class
  async updateClass(id: number, classData: UpdateClassData): Promise<Class> {
    const response = await api.put<Class>(`/classes/${id}`, classData);
    return response.data;
  },

  // Delete class
  async deleteClass(id: number): Promise<void> {
    await api.delete(`/classes/${id}`);
  },

  // Enroll student in class
  async enrollStudent(
    classId: number,
    enrollData: EnrollStudentData
  ): Promise<void> {
    await api.post(`/classes/${classId}/enroll`, enrollData);
  },

  // Assign teacher to class
  async assignTeacher(
    classId: number,
    assignData: AssignTeacherData
  ): Promise<Class> {
    const response = await api.put(
      `/classes/${classId}/assign-teacher`,
      assignData
    );
    return response.data.data.class;
  },

  // Remove teacher from class
  async removeTeacher(classId: number): Promise<Class> {
    const response = await api.delete(`/classes/${classId}/remove-teacher`);
    return response.data.data.class;
  },
};
