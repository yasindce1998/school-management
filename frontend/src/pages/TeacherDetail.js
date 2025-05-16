import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TeacherService from '../services/teacher.service';
import CourseService from '../services/course.service';

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeacherAndCourses();
  }, [id]);

  const fetchTeacherAndCourses = async () => {
    try {
      setLoading(true);
      const teacherData = await TeacherService.getById(id);
      setTeacher(teacherData);

      const teacherCourses = await TeacherService.getTeacherCourses(id);
      setCourses(teacherCourses);

      const allCourses = await CourseService.getAll();
      // Filter out courses the teacher is already assigned to
      const coursesNotAssigned = allCourses.filter(
        course => !teacherCourses.some(tc => tc.id === course.id)
      );
      setAvailableCourses(coursesNotAssigned);
      
      setError('');
    } catch (err) {
      setError('Failed to fetch teacher data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await TeacherService.assignCourse(id, selectedCourse);
      // Refresh courses after assignment
      fetchTeacherAndCourses();
      setSelectedCourse('');
    } catch (err) {
      setError('Failed to assign course. Please try again later.');
      console.error(err);
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to remove this course assignment?')) {
      try {
        await TeacherService.removeCourse(id, courseId);
        // Refresh courses after removal
        fetchTeacherAndCourses();
      } catch (err) {
        setError('Failed to remove course assignment. Please try again later.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!teacher) {
    return (
      <div className="container">
        <div className="alert alert-danger">Teacher not found.</div>
        <Link to="/teachers" className="btn btn-primary">
          Back to Teachers
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <h1>
            {teacher.first_name} {teacher.last_name}
          </h1>
          <div>
            <Link to="/teachers" className="btn btn-light mr-2">
              Back to List
            </Link>
            <Link to={`/teachers/edit/${id}`} className="btn btn-primary">
              Edit Teacher
            </Link>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h2>Teacher Information</h2>
            </div>
            <div className="card-body">
              <div className="teacher-info">
                <p>
                  <strong>Email:</strong> {teacher.email}
                </p>
                <p>
                  <strong>Specialization:</strong> {teacher.specialization}
                </p>
                <p>
                  <strong>Phone:</strong> {teacher.phone}
                </p>
                <p>
                  <strong>Address:</strong> {teacher.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h2>Assigned Courses</h2>
            </div>
            <div className="card-body">
              {courses.length > 0 ? (
                <ul className="course-list">
                  {courses.map((course) => (
                    <li key={course.id} className="course-item">
                      <div className="course-info">
                        <h3>{course.name}</h3>
                        <p>
                          <strong>Code:</strong> {course.code}
                        </p>
                        <p>
                          <strong>Department:</strong> {course.department}
                        </p>
                        <p>
                          <strong>Credits:</strong> {course.credits}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
                        className="btn btn-danger"
                      >
                        Remove Assignment
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center">Not assigned to any courses yet.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Assign to a Course</h2>
            </div>
            <div className="card-body">
              {availableCourses.length > 0 ? (
                <form onSubmit={handleAssignCourse}>
                  <div className="form-group">
                    <label htmlFor="course">Select Course</label>
                    <select
                      id="course"
                      className="form-control"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      required
                    >
                      <option value="">Select a course...</option>
                      {availableCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-success">
                    Assign Course
                  </button>
                </form>
              ) : (
                <p className="text-center">No available courses to assign.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
