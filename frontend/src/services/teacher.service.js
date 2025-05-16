import api from './api';

const TeacherService = {
  getAll: async () => {
    const response = await api.get('/teachers');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (teacher) => {
    const response = await api.post('/teachers', teacher);
    return response.data;
  },

  update: async (id, teacher) => {
    const response = await api.put(`/teachers/${id}`, teacher);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  getTeacherCourses: async (id) => {
    const response = await api.get(`/teachers/${id}/courses`);
    return response.data;
  },

  assignCourse: async (teacherId, courseId) => {
    const response = await api.post(`/teachers/${teacherId}/courses`, { course_id: courseId });
    return response.data;
  },

  removeCourse: async (teacherId, courseId) => {
    const response = await api.delete(`/teachers/${teacherId}/courses/${courseId}`);
    return response.data;
  }
};

export default TeacherService;
