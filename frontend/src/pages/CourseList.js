import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseService from '../services/course.service';
import '../assets/scss/courses.scss';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getAll();
      setCourses(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch courses. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await CourseService.delete(id);
        setCourses(courses.filter(course => course.id !== id));
      } catch (err) {
        setError('Failed to delete course. Please try again later.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <h1>Courses</h1>
          <Link to="/courses/new" className="btn btn-primary">
            Add New Course
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.department}</td>
                    <td>{course.credits}</td>
                    <td className="actions">
                      <Link
                        to={`/courses/${course.id}`}
                        className="btn btn-light"
                      >
                        View
                      </Link>
                      <Link
                        to={`/courses/edit/${course.id}`}
                        className="btn btn-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseList;
