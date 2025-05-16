import api from './api';

const ATTENDANCE_API_URL = '/attendance';

class AttendanceService {
  // Create a new attendance record
  createAttendance(attendanceData) {
    return api.post(ATTENDANCE_API_URL, attendanceData);
  }

  // Update an existing attendance record
  updateAttendance(id, attendanceData) {
    return api.put(`${ATTENDANCE_API_URL}/${id}`, attendanceData);
  }

  // Delete an attendance record
  deleteAttendance(id) {
    return api.delete(`${ATTENDANCE_API_URL}/${id}`);
  }

  // Get an attendance record by ID
  getAttendance(id) {
    return api.get(`${ATTENDANCE_API_URL}/${id}`);
  }

  // Get all attendance records
  getAllAttendances() {
    return api.get(ATTENDANCE_API_URL);
  }

  // Get attendance records by student ID
  getAttendancesByStudent(studentId) {
    return api.get(`${ATTENDANCE_API_URL}/student/${studentId}`);
  }

  // Get attendance records by course ID
  getAttendancesByCourse(courseId) {
    return api.get(`${ATTENDANCE_API_URL}/course/${courseId}`);
  }

  // Get attendance records by date
  getAttendancesByDate(date) {
    return api.get(`${ATTENDANCE_API_URL}/date/${date}`);
  }
  
  // Get attendance records by course ID and date
  getAttendancesByCourseAndDate(courseId, date) {
    return api.get(`${ATTENDANCE_API_URL}/course/${courseId}/date/${date}`);
  }

  // Get student attendance report
  getStudentAttendanceReport(studentId) {
    return api.get(`${ATTENDANCE_API_URL}/student/${studentId}/report`);
  }

  // Get course attendance report
  getCourseAttendanceReport(courseId) {
    return api.get(`${ATTENDANCE_API_URL}/course/${courseId}/report`);
  }
}

export default new AttendanceService();