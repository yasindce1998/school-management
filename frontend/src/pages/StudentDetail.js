import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Tab, Nav, ListGroup, Badge, Button, Alert, Table, Form } from 'react-bootstrap';
import StudentService from '../services/student.service';
import CourseService from '../services/course.service';
import GradeService from '../services/grade.service';
import StudentGPA from '../components/grades/StudentGPA';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    fetchStudentAndCourses();
  }, [id]);

  const fetchStudentAndCourses = async () => {
    try {
      setLoading(true);
      const studentData = await StudentService.getById(id);
      setStudent(studentData);

      const studentCourses = await StudentService.getStudentCourses(id);
      setCourses(studentCourses);

      const allCourses = await CourseService.getAll();
      // Filter out courses the student is already enrolled in
      const coursesNotEnrolled = allCourses.filter(
        course => !studentCourses.some(sc => sc.id === course.id)
      );
      setAvailableCourses(coursesNotEnrolled);
      
      // Fetch student grades
      const gradesData = await GradeService.getGradesByStudent(id);
      setGrades(gradesData.data || []);
      
      setError('');
    } catch (err) {
      setError('Failed to fetch student data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollCourse = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await StudentService.enrollCourse(id, selectedCourse);
      // Refresh courses after enrollment
      fetchStudentAndCourses();
      setSelectedCourse('');
    } catch (err) {
      setError('Failed to enroll in course. Please try again later.');
      console.error(err);
    }
  };

  const handleDropCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to drop this course?')) {
      try {
        await StudentService.dropCourse(id, courseId);
        // Refresh courses after dropping
        fetchStudentAndCourses();
      } catch (err) {
        setError('Failed to drop course. Please try again later.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!student) {
    return (
      <div className="container">
        <div className="alert alert-danger">Student not found.</div>
        <Link to="/students" className="btn btn-primary">
          Back to Students
        </Link>
      </div>
    );
  }
  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              {student.first_name} {student.last_name}
            </h2>
            <div>
              <Link to="/students" className="btn btn-secondary me-2">
                Back to List
              </Link>
              <Link to={`/students/edit/${id}`} className="btn btn-primary">
                Edit Student
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow">
        <Card.Header>
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav.Item>
              <Nav.Link eventKey="info">Student Information</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="courses">Courses</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="grades">Grades & GPA</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="attendance">Attendance</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          <Tab.Content>
            <Tab.Pane active={activeTab === 'info'}>
              <Row>
                <Col md={6}>
                  <Card.Subtitle className="mb-3">Personal Information</Card.Subtitle>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Email:</strong> {student.email}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Date of Birth:</strong>{' '}
                      {new Date(student.date_of_birth).toLocaleDateString()}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Gender:</strong> {student.gender}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Phone:</strong> {student.phone}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <Card.Subtitle className="mb-3">Academic Information</Card.Subtitle>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Grade Level:</strong> {student.grade_level}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Address:</strong> {student.address}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Enrollment Date:</strong>{' '}
                      {new Date(student.enrollment_date).toLocaleDateString()}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Status:</strong>{' '}
                      <Badge bg="success">Active</Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Tab.Pane>
            
            <Tab.Pane active={activeTab === 'courses'}>
              <Row>
                <Col md={7}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">Enrolled Courses</h5>
                    </Card.Header>
                    <Card.Body>
                      {courses.length > 0 ? (
                        <Table hover responsive>
                          <thead>
                            <tr>
                              <th>Course</th>
                              <th>Code</th>
                              <th>Credits</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courses.map((course) => (
                              <tr key={course.id}>
                                <td>{course.name}</td>
                                <td>{course.code}</td>
                                <td>{course.credits}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Link to={`/courses/${course.id}`} className="btn btn-sm btn-info">View</Link>
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      onClick={() => handleDropCourse(course.id)}
                                    >
                                      Drop
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">Not enrolled in any courses yet.</Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={5}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Enroll in a Course</h5>
                    </Card.Header>
                    <Card.Body>
                      {availableCourses.length > 0 ? (
                        <Form onSubmit={handleEnrollCourse}>
                          <Form.Group className="mb-3">
                            <Form.Label>Select Course</Form.Label>
                            <Form.Select
                              value={selectedCourse}
                              onChange={(e) => setSelectedCourse(e.target.value)}
                              required
                            >
                              <option value="">Select a course...</option>
                              {availableCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                  {course.name} ({course.code})
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          <Button variant="success" type="submit">
                            Enroll
                          </Button>
                        </Form>
                      ) : (
                        <Alert variant="info">No available courses to enroll in.</Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>
            
            <Tab.Pane active={activeTab === 'grades'}>
              <Row>
                <Col md={4}>
                  <StudentGPA studentId={id} />
                </Col>
                <Col md={8}>
                  <Card>
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Grade History</h5>
                        <Link to={`/grades/new?student=${id}`} className="btn btn-sm btn-primary">
                          Add Grade
                        </Link>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      {grades.length > 0 ? (
                        <Table hover responsive>
                          <thead>
                            <tr>
                              <th>Course</th>
                              <th>Term</th>
                              <th>Score</th>
                              <th>Grade</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grades.map((grade) => (
                              <tr key={grade.id}>
                                <td>{grade.course_name || 'Unknown Course'}</td>
                                <td>{grade.term}</td>
                                <td>{grade.score}</td>
                                <td>
                                  <Badge 
                                    bg={
                                      grade.grade.startsWith('A') ? 'success' :
                                      grade.grade.startsWith('B') ? 'primary' :
                                      grade.grade.startsWith('C') ? 'info' :
                                      grade.grade.startsWith('D') ? 'warning' : 'danger'
                                    }
                                  >
                                    {grade.grade}
                                  </Badge>
                                </td>
                                <td>
                                  <Link to={`/grades/${grade.id}`} className="btn btn-sm btn-info">View</Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">No grades recorded yet.</Alert>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>
            
            <Tab.Pane active={activeTab === 'attendance'}>
              <Row>
                <Col>
                  <Card>
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Attendance Records</h5>
                        <div>
                          <Link to={`/attendance/student/${id}/report`} className="btn btn-sm btn-info me-2">
                            View Report
                          </Link>
                          <Link to={`/attendance/new?student=${id}`} className="btn btn-sm btn-primary">
                            Add Record
                          </Link>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Alert variant="info">
                        Attendance records will be displayed here. Coming soon!
                      </Alert>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StudentDetail;
