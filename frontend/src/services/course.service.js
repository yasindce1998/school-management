import api from './api';

const CourseService = {
  getAll: async () => {
    const response = await api.get('/courses');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  create: async (course) => {
    const response = await api.post('/courses', course);
    return response.data;
  },

  update: async (id, course) => {
    const response = await api.put(`/courses/${id}`, course);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  getCourseStudents: async (id) => {
    const response = await api.get(`/courses/${id}/students`);
    return response.data;
  },

  getCourseTeachers: async (id) => {
    const response = await api.get(`/courses/${id}/teachers`);
    return response.data;
  }
};

export default CourseService;
