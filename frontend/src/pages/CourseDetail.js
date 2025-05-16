import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Tab, Nav, ListGroup, Badge, Button, Alert } from 'react-bootstrap';
import CourseService from '../services/course.service';
import GradeDistributionChart from '../components/grades/GradeDistributionChart';
import CourseAttendanceView from '../components/attendance/CourseAttendanceView';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const courseData = await CourseService.getById(id);
      setCourse(courseData);

      const studentsData = await CourseService.getCourseStudents(id);
      setStudents(studentsData);

      const teachersData = await CourseService.getCourseTeachers(id);
      setTeachers(teachersData);
      
      setError('');
    } catch (err) {
      setError('Failed to fetch course data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!course) {
    return (
      <div className="container">
        <div className="alert alert-danger">Course not found.</div>
        <Link to="/courses" className="btn btn-primary">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <h1>{course.name}</h1>
          <div>
            <Link to="/courses" className="btn btn-light mr-2">
              Back to List
            </Link>
            <Link to={`/courses/edit/${id}`} className="btn btn-primary">
              Edit Course
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Course Information
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                Enrolled Students ({students.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'teachers' ? 'active' : ''}`}
                onClick={() => setActiveTab('teachers')}
              >
                Assigned Teachers ({teachers.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'grades' ? 'active' : ''}`}
                onClick={() => setActiveTab('grades')}
              >
                Grades
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                Attendance
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'info' && (
            <div className="course-info">
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Course Code:</strong> {course.code}
                  </p>
                  <p>
                    <strong>Credits:</strong> {course.credits}
                  </p>
                  <p>
                    <strong>Department:</strong> {course.department}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Description:</strong>
                  </p>
                  <p className="course-description">{course.description}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="enrolled-students">
              {students.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>
                            {student.first_name} {student.last_name}
                          </td>
                          <td>{student.email}</td>
                          <td>
                            <Link
                              to={`/students/${student.id}`}
                              className="btn btn-light"
                            >
                              View Profile
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">No students enrolled in this course.</p>
              )}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="assigned-teachers">
              {teachers.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Specialization</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr key={teacher.id}>
                          <td>
                            {teacher.first_name} {teacher.last_name}
                          </td>
                          <td>{teacher.email}</td>
                          <td>{teacher.specialization}</td>
                          <td>
                            <Link
                              to={`/teachers/${teacher.id}`}
                              className="btn btn-light"
                            >
                              View Profile
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center">No teachers assigned to this course.</p>
              )}
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="grades-section">
              <h3>Grade Distribution</h3>
              <GradeDistributionChart courseId={id} />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="attendance-section">
              <CourseAttendanceView courseId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;