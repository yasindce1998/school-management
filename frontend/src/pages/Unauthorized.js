import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container text-center">
      <div className="unauthorized-page">
        <h1>Access Denied</h1>
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p className="mt-3">
          You don't have permission to access this page.
        </p>
        <Link to="/" className="btn btn-primary mt-3">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
