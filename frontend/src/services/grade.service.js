import api from './api';

const GRADE_API_URL = '/grades';

class GradeService {
  // Create a new grade
  createGrade(gradeData) {
    return api.post(GRADE_API_URL, gradeData);
  }

  // Update an existing grade
  updateGrade(id, gradeData) {
    return api.put(`${GRADE_API_URL}/${id}`, gradeData);
  }

  // Delete a grade
  deleteGrade(id) {
    return api.delete(`${GRADE_API_URL}/${id}`);
  }

  // Get a grade by ID
  getGrade(id) {
    return api.get(`${GRADE_API_URL}/${id}`);
  }

  // Get all grades
  getAllGrades() {
    return api.get(GRADE_API_URL);
  }

  // Get grades by student ID
  getGradesByStudent(studentId) {
    return api.get(`${GRADE_API_URL}/student/${studentId}`);
  }

  // Get grades by course ID
  getGradesByCourse(courseId) {
    return api.get(`${GRADE_API_URL}/course/${courseId}`);
  }

  // Get student GPA
  getStudentGPA(studentId) {
    return api.get(`${GRADE_API_URL}/student/${studentId}/gpa`);
  }
  
  // Get course grade distribution
  getCourseGradeDistribution(courseId) {
    return api.get(`${GRADE_API_URL}/course/${courseId}/distribution`);
  }
}

export default new GradeService();
