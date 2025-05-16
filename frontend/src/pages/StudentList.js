import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentService from '../services/student.service';
import '../assets/scss/students.scss';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getAll();
      setStudents(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch students. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await StudentService.delete(id);
        setStudents(students.filter(student => student.id !== id));
      } catch (err) {
        setError('Failed to delete student. Please try again later.');
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
          <h1>Students</h1>
          <Link to="/students/new" className="btn btn-primary">
            Add New Student
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Grade Level</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      {student.first_name} {student.last_name}
                    </td>
                    <td>{student.email}</td>
                    <td>{student.grade_level}</td>
                    <td>{student.phone}</td>
                    <td className="actions">
                      <Link
                        to={`/students/${student.id}`}
                        className="btn btn-light"
                      >
                        View
                      </Link>
                      <Link
                        to={`/students/edit/${student.id}`}
                        className="btn btn-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id)}
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
                    No students found.
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

export default StudentList;
