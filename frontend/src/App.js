import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Student Pages
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import StudentForm from './pages/StudentForm';

// Teacher Pages
import TeacherList from './pages/TeacherList';
import TeacherDetail from './pages/TeacherDetail';
import TeacherForm from './pages/TeacherForm';

// Course Pages
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import CourseForm from './pages/CourseForm';

// User Pages
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';

// Grade Pages
import GradeList from './pages/GradeList';
import GradeDetail from './pages/GradeDetail';
import GradeForm from './pages/GradeForm';

// Attendance Pages
import AttendanceList from './pages/AttendanceList';
import AttendanceDetail from './pages/AttendanceDetail';
import AttendanceForm from './pages/AttendanceForm';
import AttendanceReport from './pages/AttendanceReport';
import BulkAttendanceForm from './pages/BulkAttendanceForm';

// Styles
import './assets/scss/main.scss';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Student Routes */}
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route 
              path="/students/new" 
              element={
                <PrivateRoute>
                  <StudentForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/students/edit/:id" 
              element={
                <PrivateRoute>
                  <StudentForm />
                </PrivateRoute>
              } 
            />
            
            {/* Teacher Routes */}
            <Route path="/teachers" element={<TeacherList />} />
            <Route path="/teachers/:id" element={<TeacherDetail />} />
            <Route 
              path="/teachers/new" 
              element={
                <PrivateRoute>
                  <TeacherForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/teachers/edit/:id" 
              element={
                <PrivateRoute>
                  <TeacherForm />
                </PrivateRoute>
              } 
            />
            
            {/* Course Routes */}
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route 
              path="/courses/new" 
              element={
                <PrivateRoute>
                  <CourseForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/courses/edit/:id" 
              element={
                <PrivateRoute>
                  <CourseForm />
                </PrivateRoute>
              } 
            />
            
            {/* User Routes - Admin Only */}
            <Route 
              path="/users" 
              element={
                <PrivateRoute requiredRole="Admin">
                  <UserList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/users/new" 
              element={
                <PrivateRoute requiredRole="Admin">
                  <UserForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/users/edit/:id" 
              element={
                <PrivateRoute requiredRole="Admin">
                  <UserForm />
                </PrivateRoute>
              } 
            />
            
            {/* Grade Routes */}
            <Route path="/grades" element={<GradeList />} />
            <Route path="/grades/:id" element={<GradeDetail />} />
            <Route 
              path="/grades/new" 
              element={
                <PrivateRoute requiredRole={["Admin", "Teacher"]}>
                  <GradeForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/grades/edit/:id" 
              element={
                <PrivateRoute requiredRole={["Admin", "Teacher"]}>
                  <GradeForm />
                </PrivateRoute>
              } 
            />
            
            {/* Attendance Routes */}
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/attendance/:id" element={<AttendanceDetail />} />
            <Route 
              path="/attendance/new" 
              element={
                <PrivateRoute requiredRole={["Admin", "Teacher"]}>
                  <AttendanceForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/attendance/edit/:id" 
              element={
                <PrivateRoute requiredRole={["Admin", "Teacher"]}>
                  <AttendanceForm />
                </PrivateRoute>
              } 
            />
            <Route path="/attendance/:type/:id/report" element={<AttendanceReport />} />
            <Route 
              path="/attendance/bulk" 
              element={
                <PrivateRoute requiredRole={["Admin", "Teacher"]}>
                  <BulkAttendanceForm />
                </PrivateRoute>
              } 
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
