import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, ListGroup, Row, Col, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import attendanceService from '../../services/attendance.service';
import studentService from '../../services/student.service';
import courseService from '../../services/course.service';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';

const AttendanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [attendance, setAttendance] = useState(null);
  const [student, setStudent] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch attendance data
        const attendanceRes = await attendanceService.getAttendance(id);
        setAttendance(attendanceRes.data);
        
        // Fetch related student and course data
        const studentRes = await studentService.getStudent(attendanceRes.data.student_id);
        const courseRes = await courseService.getCourse(attendanceRes.data.course_id);
        
        setStudent(studentRes.data);
        setCourse(courseRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load attendance details. Please try again later.');
        setLoading(false);
        console.error('Error loading attendance details:', err);
      }
    };
    
    fetchData();
  }, [id]);

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

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!attendance) {
    return <Alert variant="warning">Attendance record not found.</Alert>;
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Attendance Details</h5>
        <div className="d-flex gap-2">
          <Link to="/attendance" className="btn btn-light btn-sm">
            <FaArrowLeft className="me-1" /> Back to Attendance
          </Link>
          <Link to={`/attendance/edit/${id}`} className="btn btn-warning btn-sm">
            <FaEdit className="me-1" /> Edit
          </Link>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header className="bg-secondary text-white">
                <h6 className="mb-0">Attendance Information</h6>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Date:</strong>{' '}
                  {new Date(attendance.date).toLocaleDateString()}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Status:</strong>{' '}
                  {getStatusBadge(attendance.status)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Notes:</strong>{' '}
                  {attendance.notes || <em>No notes provided</em>}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Created:</strong>{' '}
                  {new Date(attendance.createdAt).toLocaleDateString()}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Last Updated:</strong>{' '}
                  {new Date(attendance.updatedAt).toLocaleDateString()}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          
          <Col md={6}>
            {student && (
              <Card className="mb-3">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">Student Information</h6>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Name:</strong> {student.firstName} {student.lastName}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Email:</strong> {student.email}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Link to={`/students/${student.id}`} className="btn btn-sm btn-outline-primary">
                      View Student Profile
                    </Link>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            )}
            
            {course && (
              <Card>
                <Card.Header className="bg-success text-white">
                  <h6 className="mb-0">Course Information</h6>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Course Name:</strong> {course.name}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Course Code:</strong> {course.code}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex gap-2">
                      <Link to={`/courses/${course.id}`} className="btn btn-sm btn-outline-success">
                        View Course Details
                      </Link>
                      <Link to={`/attendance/course/${course.id}/report`} className="btn btn-sm btn-outline-info">
                        View Course Attendance Report
                      </Link>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AttendanceDetail;
