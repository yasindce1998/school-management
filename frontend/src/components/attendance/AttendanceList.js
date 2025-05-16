import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert, Form, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import attendanceService from '../../services/attendance.service';
import studentService from '../../services/student.service';
import courseService from '../../services/course.service';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const AttendanceList = () => {
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let attendanceData;
      
      // Apply filters
      if (selectedDate) {
        // Format date as YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const response = await attendanceService.getAttendancesByDate(formattedDate);
        attendanceData = response.data;
      } else if (selectedStudentId) {
        const response = await attendanceService.getAttendancesByStudent(selectedStudentId);
        attendanceData = response.data;
      } else if (selectedCourseId) {
        const response = await attendanceService.getAttendancesByCourse(selectedCourseId);
        attendanceData = response.data;
      } else {
        // No filters, get all
        const response = await attendanceService.getAllAttendances();
        attendanceData = response.data;
      }
      
      setAttendances(attendanceData);
      
      // Fetch students for mapping if not already loaded
      if (Object.keys(students).length === 0) {
        const studentsResponse = await studentService.getAllStudents();
        const studentsMap = {};
        setStudentsList(studentsResponse.data);
        studentsResponse.data.forEach(student => {
          studentsMap[student.id] = `${student.firstName} ${student.lastName}`;
        });
        setStudents(studentsMap);
      }
      
      // Fetch courses for mapping if not already loaded
      if (Object.keys(courses).length === 0) {
        const coursesResponse = await courseService.getAllCourses();
        const coursesMap = {};
        setCoursesList(coursesResponse.data);
        coursesResponse.data.forEach(course => {
          coursesMap[course.id] = course.name;
        });
        setCourses(coursesMap);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch attendance data. Please try again later.');
      setLoading(false);
      console.error('Error fetching attendance data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedStudentId, selectedCourseId]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceService.deleteAttendance(id);
        setAttendances(attendances.filter(attendance => attendance.id !== id));
      } catch (err) {
        setError('Failed to delete attendance record. Please try again later.');
        console.error('Error deleting attendance record:', err);
      }
    }
  };

  const handleClearFilters = () => {
    setSelectedDate(null);
    setSelectedStudentId('');
    setSelectedCourseId('');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present':
        return <Badge bg="success">Present</Badge>;
      case 'absent':
        return <Badge bg="danger">Absent</Badge>;
      case 'late':
        return <Badge bg="warning">Late</Badge>;
      case 'excused':
        return <Badge bg="info">Excused</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading && attendances.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card className="shadow">      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Attendance Records</h5>
        <div>
          <Link to="/attendance/bulk" className="btn btn-light btn-sm me-2">
            Bulk Entry
          </Link>
          <Link to="/attendance/new" className="btn btn-light btn-sm">
            Add Attendance Record
          </Link>
        </div>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Filter Controls */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Filter Attendance Records</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setSelectedStudentId('');
                      setSelectedCourseId('');
                    }}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                    isClearable
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Student</Form.Label>
                  <Form.Select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setSelectedDate(null);
                      setSelectedCourseId('');
                    }}
                  >
                    <option value="">All Students</option>
                    {studentsList.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedDate(null);
                      setSelectedStudentId('');
                    }}
                  >
                    <option value="">All Courses</option>
                    {coursesList.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        {/* Attendance Records Table */}
        {loading ? (
          <div className="text-center my-3">
            <Spinner animation="border" size="sm" role="status" />
            <span className="ms-2">Loading...</span>
          </div>
        ) : attendances.length === 0 ? (
          <Alert variant="info">No attendance records found for the selected filters.</Alert>
        ) : (
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((attendance) => (
                <tr key={attendance.id}>
                  <td>{students[attendance.student_id] || 'Unknown'}</td>
                  <td>{courses[attendance.course_id] || 'Unknown'}</td>
                  <td>{new Date(attendance.date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(attendance.status)}</td>
                  <td>{attendance.notes ? attendance.notes.substring(0, 30) + (attendance.notes.length > 30 ? '...' : '') : ''}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/attendance/${attendance.id}`} className="btn btn-sm btn-info">
                        <FaEye />
                      </Link>
                      <Link to={`/attendance/edit/${attendance.id}`} className="btn btn-sm btn-warning">
                        <FaEdit />
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(attendance.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttendanceList;
