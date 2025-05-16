import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherService from '../services/teacher.service';
import '../assets/scss/teachers.scss';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await TeacherService.getAll();
      setTeachers(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch teachers. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await TeacherService.delete(id);
        setTeachers(teachers.filter(teacher => teacher.id !== id));
      } catch (err) {
        setError('Failed to delete teacher. Please try again later.');
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
          <h1>Teachers</h1>
          <Link to="/teachers/new" className="btn btn-primary">
            Add New Teacher
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
                <th>Specialization</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      {teacher.first_name} {teacher.last_name}
                    </td>
                    <td>{teacher.email}</td>
                    <td>{teacher.specialization}</td>
                    <td>{teacher.phone}</td>
                    <td className="actions">
                      <Link
                        to={`/teachers/${teacher.id}`}
                        className="btn btn-light"
                      >
                        View
                      </Link>
                      <Link
                        to={`/teachers/edit/${teacher.id}`}
                        className="btn btn-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(teacher.id)}
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
                    No teachers found.
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

export default TeacherList;
