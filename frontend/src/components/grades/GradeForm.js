import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import gradeService from '../../services/grade.service';
import studentService from '../../services/student.service';
import courseService from '../../services/course.service';

const GradeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    score: '',
    term: ''
  });
  
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate letter grade based on score
  const calculateGrade = (score) => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 63) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students and courses
        const [studentsRes, coursesRes] = await Promise.all([
          studentService.getAllStudents(),
          courseService.getAllCourses()
        ]);
        
        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
        
        // If editing, fetch the grade data
        if (isEditing) {
          const gradeRes = await gradeService.getGrade(id);
          setFormData(gradeRes.data);
        }
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading form data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'score' ? parseFloat(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    
    try {
      // Deep copy of formData to prevent modifying the state directly
      const gradeData = { ...formData };
      
      // Convert string IDs to numbers
      gradeData.student_id = parseInt(gradeData.student_id, 10);
      gradeData.course_id = parseInt(gradeData.course_id, 10);
      
      if (isEditing) {
        await gradeService.updateGrade(id, gradeData);
      } else {
        await gradeService.createGrade(gradeData);
      }
      
      navigate('/grades');
    } catch (err) {
      setError('Failed to save grade. Please check your input and try again.');
      console.error('Error saving grade:', err);
    } finally {
      setSaveLoading(false);
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

  return (
    <Card className="shadow">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">{isEditing ? 'Edit Grade' : 'Add New Grade'}</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Student</Form.Label>
                <Form.Select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Course</Form.Label>
                <Form.Select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Score</Form.Label>
                <Form.Control
                  type="number"
                  name="score"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.score}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Term</Form.Label>
                <Form.Control
                  type="text"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  placeholder="e.g., Spring 2025"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          {formData.score && (
            <Alert variant="info">
              The calculated letter grade is: <strong>{calculateGrade(parseFloat(formData.score))}</strong>
            </Alert>
          )}
          
          <div className="d-flex gap-2 mt-3">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={saveLoading}
            >
              {saveLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                isEditing ? 'Update Grade' : 'Save Grade'
              )}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/grades')}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default GradeForm;
