import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserService from '../services/user.service';
import '../assets/scss/users.scss';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getAll();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await UserService.delete(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError('Failed to delete user. Please try again later.');
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
          <h1>System Users</h1>
          <Link to="/users/new" className="btn btn-primary">
            Add New User
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      {user.first_name} {user.last_name}
                    </td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td className="actions">
                      <Link
                        to={`/users/edit/${user.id}`}
                        className="btn btn-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-danger"
                        disabled={user.username === 'admin'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No users found.
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

export default UserList;
