import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Navbar.scss';

const Navbar = () => {
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">School Management System</Link>
      </div>
      <div className="navbar-menu">        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/students" className="nav-link">Students</Link>
          </li>
          <li className="nav-item">
            <Link to="/teachers" className="nav-link">Teachers</Link>
          </li>
          <li className="nav-item">
            <Link to="/courses" className="nav-link">Courses</Link>
          </li>
          <li className="nav-item">
            <Link to="/grades" className="nav-link">Grades</Link>
          </li>
          <li className="nav-item">
            <Link to="/attendance" className="nav-link">Attendance</Link>
          </li>
          {isAuthenticated && currentUser && currentUser.role === 'Admin' && (
            <li className="nav-item">
              <Link to="/users" className="nav-link">Users</Link>
            </li>
          )}
        </ul>
      </div>
      <div className="navbar-auth">
        {isAuthenticated ? (
          <>
            <span className="user-info">
              Welcome, {currentUser.first_name} {currentUser.last_name}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
