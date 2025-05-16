import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import attendanceService from '../../services/attendance.service';
import studentService from '../../services/student.service';
import courseService from '../../services/course.service';

const AttendanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    date: new Date(),
    status: 'present',
    notes: ''
  });
  
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);

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
        
        // If editing, fetch the attendance data
        if (isEditing) {
          const attendanceRes = await attendanceService.getAttendance(id);
          
          // Convert the date string to a Date object
          const attendanceData = {
            ...attendanceRes.data,
            date: new Date(attendanceRes.data.date)
          };
          
          setFormData(attendanceData);
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
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    
    try {
      // Deep copy of formData to prevent modifying the state directly
      const attendanceData = { ...formData };
      
      // Convert string IDs to numbers
      attendanceData.student_id = parseInt(attendanceData.student_id, 10);
      attendanceData.course_id = parseInt(attendanceData.course_id, 10);
      
      if (isEditing) {
        await attendanceService.updateAttendance(id, attendanceData);
      } else {
        await attendanceService.createAttendance(attendanceData);
      }
      
      navigate('/attendance');
    } catch (err) {
      setError('Failed to save attendance record. Please check your input and try again.');
      console.error('Error saving attendance:', err);
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
        <h5 className="mb-0">{isEditing ? 'Edit Attendance Record' : 'Add New Attendance Record'}</h5>
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
                <Form.Label>Date</Form.Label>
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes (optional)"
            />
          </Form.Group>
          
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
                isEditing ? 'Update Attendance' : 'Save Attendance'
              )}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/attendance')}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AttendanceForm;
