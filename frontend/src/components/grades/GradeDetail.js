import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, ListGroup, Row, Col, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import gradeService from '../../services/grade.service';
import studentService from '../../services/student.service';
import courseService from '../../services/course.service';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';

const GradeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [grade, setGrade] = useState(null);
  const [student, setStudent] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch grade data
        const gradeRes = await gradeService.getGrade(id);
        setGrade(gradeRes.data);
        
        // Fetch related student and course data
        const studentRes = await studentService.getStudent(gradeRes.data.student_id);
        const courseRes = await courseService.getCourse(gradeRes.data.course_id);
        
        setStudent(studentRes.data);
        setCourse(courseRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load grade details. Please try again later.');
        setLoading(false);
        console.error('Error loading grade details:', err);
      }
    };
    
    fetchData();
  }, [id]);

  const getBadgeColor = (gradeValue) => {
    if (gradeValue.startsWith('A')) return 'success';
    if (gradeValue.startsWith('B')) return 'primary';
    if (gradeValue.startsWith('C')) return 'info';
    if (gradeValue.startsWith('D')) return 'warning';
    return 'danger';
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

  if (!grade) {
    return <Alert variant="warning">Grade not found.</Alert>;
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Grade Details</h5>
        <div className="d-flex gap-2">
          <Link to="/grades" className="btn btn-light btn-sm">
            <FaArrowLeft className="me-1" /> Back to Grades
          </Link>
          <Link to={`/grades/edit/${id}`} className="btn btn-warning btn-sm">
            <FaEdit className="me-1" /> Edit
          </Link>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Header className="bg-secondary text-white">
                <h6 className="mb-0">Grade Information</h6>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Score:</strong> {grade.score}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Letter Grade:</strong>{' '}
                  <Badge bg={getBadgeColor(grade.grade)}>{grade.grade}</Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Term:</strong> {grade.term}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Created:</strong>{' '}
                  {new Date(grade.createdAt).toLocaleDateString()}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Last Updated:</strong>{' '}
                  {new Date(grade.updatedAt).toLocaleDateString()}
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
                    <Link to={`/courses/${course.id}`} className="btn btn-sm btn-outline-success">
                      View Course Details
                    </Link>
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

export default GradeDetail;
