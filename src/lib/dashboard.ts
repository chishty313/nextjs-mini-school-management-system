import api from "./api";

export interface DashboardStats {
  totalStudents: number;
  activeClasses: number;
  totalTeachers: number;
  enrollmentRate: number;
}

export interface Activity {
  id: number;
  action: string;
  details: string;
  time: string;
  type: "enrollment" | "schedule" | "staff" | "transfer" | "class" | "student";
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  activities: Activity[];
}

export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    try {
      // Use admin endpoint for accurate stats
      const statsResponse = await api.get("/admin/stats");
      return statsResponse.data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default values on error
      return {
        totalStudents: 0,
        activeClasses: 0,
        totalTeachers: 0,
        enrollmentRate: 0,
      };
    }
  },

  // Get recent activities
  async getActivities(): Promise<Activity[]> {
    try {
      // Since /activities endpoint doesn't exist, generate from recent data
      return this.generateActivitiesFromData();
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  // Generate activities from recent students and classes data
  async generateActivitiesFromData(): Promise<Activity[]> {
    try {
      const activities: Activity[] = [];

      // Get recent students (API doesn't support sortBy, so we'll get all and sort client-side)
      const studentsResponse = await api.get("/students?page=1&limit=50");
      const allStudents = studentsResponse.data.data?.students || [];
      // Sort by createdAt and take the 5 most recent
      const recentStudents = allStudents
        .sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      // Get recent classes
      const classesResponse = await api.get("/classes");
      const allClasses = classesResponse.data.data?.classes || [];
      // Sort by createdAt and take the 5 most recent
      const recentClasses = allClasses
        .sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      // Generate activities from recent students
      recentStudents.forEach(
        (student: {
          id: number;
          name: string;
          createdAt: string;
          class?: { name: string };
        }) => {
          const timeAgo = this.getTimeAgo(student.createdAt);
          activities.push({
            id: activities.length + 1,
            action: "New student enrolled",
            details: `${student.name} joined the school${
              student.class ? ` in ${student.class.name}` : ""
            }`,
            time: timeAgo,
            type: "enrollment",
            createdAt: student.createdAt,
          });
        }
      );

      // Generate activities from recent classes
      recentClasses.forEach(
        (classItem: {
          id: number;
          name: string;
          section: string;
          createdAt: string;
        }) => {
          const timeAgo = this.getTimeAgo(classItem.createdAt);
          activities.push({
            id: activities.length + 1,
            action: "New class created",
            details: `${classItem.name} - ${classItem.section} was added to the system`,
            time: timeAgo,
            type: "class",
            createdAt: classItem.createdAt,
          });
        }
      );

      // Sort by creation date (most recent first)
      activities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return activities.slice(0, 10);
    } catch (error) {
      console.error("Error generating activities:", error);
      return [];
    }
  },

  // Helper function to calculate time ago
  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  // Get complete dashboard data
  async getDashboardData(): Promise<DashboardData> {
    try {
      const [stats, activities] = await Promise.all([
        this.getStats(),
        this.getActivities(),
      ]);

      return {
        stats,
        activities,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return {
        stats: {
          totalStudents: 0,
          activeClasses: 0,
          totalTeachers: 0,
          enrollmentRate: 0,
        },
        activities: [],
      };
    }
  },
};
