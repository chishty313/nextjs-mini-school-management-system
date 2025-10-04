// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  sectionCount?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "teacher" | "student";
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Student types
export interface Student {
  id: number;
  name: string;
  age: number;
  classId?: number | null;
  createdAt: string;
  updatedAt: string;
  class?: Class;
}

export interface CreateStudentData {
  name: string;
  age: number;
  classId?: number | null;
}

export interface UpdateStudentData {
  name?: string;
  age?: number;
  classId?: number | null;
}

export interface StudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Class types
export interface Class {
  id: number;
  name: string;
  section: string;
  teacherId?: number | null;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
  students?: Student[];
  teacher?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CreateClassData {
  name: string;
  section: string;
}

export interface UpdateClassData {
  name?: string;
  section?: string;
}

export interface EnrollStudentData {
  studentId: number;
}

export interface AssignTeacherData {
  teacherId: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Query parameters
export interface StudentsQuery {
  page?: number;
  limit?: number;
  classId?: number;
}

// Form validation schemas
export interface FormErrors {
  [key: string]: string | undefined;
}
