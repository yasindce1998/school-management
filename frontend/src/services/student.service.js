import api from './api';


const StudentService = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (student) => {
    const response = await api.post('/students', student);
    return response.data;
  },

  update: async (id, student) => {
    const response = await api.put(`/students/${id}`, student);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  getStudentCourses: async (id) => {
    const response = await api.get(`/students/${id}/courses`);
    return response.data;
  },

  enrollCourse: async (studentId, courseId) => {
    const response = await api.post(`/students/${studentId}/courses`, { course_id: courseId });
    return response.data;
  },

  dropCourse: async (studentId, courseId) => {
    const response = await api.delete(`/students/${studentId}/courses/${courseId}`);
    return response.data;
  }
};

export default StudentService;
