import React from 'react';

const Home = () => {
  return (
    <div className="container">
      <div className="page-header">
        <h1>School Management System</h1>
      </div>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h2>Students</h2>
            </div>
            <div className="card-body">
              <p>Manage student profiles, enrollments, and academic records.</p>
            </div>
            <div className="card-footer">
              <a href="/students" className="btn btn-primary">View Students</a>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h2>Teachers</h2>
            </div>
            <div className="card-body">
              <p>Manage teacher profiles, assignments, and course allocations.</p>
            </div>
            <div className="card-footer">
              <a href="/teachers" className="btn btn-primary">View Teachers</a>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h2>Courses</h2>
            </div>
            <div className="card-body">
              <p>Manage courses, schedules, and student enrollments.</p>
            </div>
            <div className="card-footer">
              <a href="/courses" className="btn btn-primary">View Courses</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-5">
        <div className="card">
          <div className="card-header">
            <h2>System Overview</h2>
          </div>
          <div className="card-body">
            <p>
              Welcome to the School Management System! This platform provides comprehensive tools for managing your educational institution. From student enrollment to teacher assignments and course management, our system streamlines administrative tasks and enhances the educational experience.
            </p>
            <p>
              Use the navigation above to access different sections of the system, or click on the cards to go directly to specific management areas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
