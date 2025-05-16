import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import attendanceService from '../../services/attendance.service';
import courseService from '../../services/course.service';
import studentService from '../../services/student.service';

const BulkAttendanceForm = () => {
  const navigate = useNavigate();
  
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date());
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesResponse = await courseService.getAllCourses();
        setCourses(coursesResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
        console.error('Error loading courses:', err);
      }
    };
    
    fetchCourses();
  }, []);

  // Load students when course changes
  useEffect(() => {
    const fetchStudentsForCourse = async () => {
      if (!courseId) {
        setStudents([]);
        setAttendanceRecords([]);
        return;
      }
      
      try {
        setFetchingStudents(true);
        // This would ideally call an API endpoint that retrieves students enrolled in the course
        // For now, we'll simulate by getting all students
        const studentsResponse = await studentService.getAllStudents();
        
        // In a real app, filter students by course enrollment
        // const enrolledStudents = studentsResponse.data.filter(student => student.courseIds.includes(courseId));
        const enrolledStudents = studentsResponse.data;
        
        setStudents(enrolledStudents);
        
        // Initialize attendance records for all students
        const initialAttendance = enrolledStudents.map(student => ({
          student_id: student.id,
          course_id: parseInt(courseId, 10),
          date: date,
          status: 'present',
          notes: ''
        }));
        
        setAttendanceRecords(initialAttendance);
        setFetchingStudents(false);
      } catch (err) {
        setError('Failed to load students for this course. Please try again later.');
        setFetchingStudents(false);
        console.error('Error loading students:', err);
      }
    };
    
    fetchStudentsForCourse();
  }, [courseId, date]);

  const handleCourseChange = (e) => {
    setCourseId(e.target.value);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleStatusChange = (index, newStatus) => {
    const updatedRecords = [...attendanceRecords];
    updatedRecords[index].status = newStatus;
    setAttendanceRecords(updatedRecords);
  };

  const handleNotesChange = (index, notes) => {
    const updatedRecords = [...attendanceRecords];
    updatedRecords[index].notes = notes;
    setAttendanceRecords(updatedRecords);
  };

  const setAllStatuses = (status) => {
    const updatedRecords = attendanceRecords.map(record => ({
      ...record,
      status
    }));
    setAttendanceRecords(updatedRecords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseId) {
      setError('Please select a course.');
      return;
    }
    
    if (attendanceRecords.length === 0) {
      setError('No students found for this course.');
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // In a real app, this would make a batch API call
      // For now, we'll make individual calls
      const promises = attendanceRecords.map(record => 
        attendanceService.createAttendance(record)
      );
      
      await Promise.all(promises);
      
      setSuccessMessage('Attendance records saved successfully!');
      setSaveLoading(false);
      
      // Clear form after success
      setTimeout(() => {
        navigate('/attendance');
      }, 2000);
    } catch (err) {
      setError('Failed to save attendance records. Please try again later.');
      setSaveLoading(false);
      console.error('Error saving attendance:', err);
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
        <h5 className="mb-0">Bulk Attendance Entry</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Course</Form.Label>
                <Form.Select
                  value={courseId}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="">Select a Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <DatePicker
                  selected={date}
                  onChange={handleDateChange}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          {fetchingStudents ? (
            <div className="text-center my-4">
              <Spinner animation="border" size="sm" role="status" />
              <span className="ms-2">Loading students...</span>
            </div>
          ) : students.length > 0 ? (
            <>
              <div className="mb-3">
                <span className="me-2">Set all to:</span>
                <Button variant="success" size="sm" className="me-2" onClick={() => setAllStatuses('present')}>
                  Present
                </Button>
                <Button variant="danger" size="sm" className="me-2" onClick={() => setAllStatuses('absent')}>
                  Absent
                </Button>
                <Button variant="warning" size="sm" className="me-2" onClick={() => setAllStatuses('late')}>
                  Late
                </Button>
                <Button variant="info" size="sm" onClick={() => setAllStatuses('excused')}>
                  Excused
                </Button>
              </div>
              
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>
                        <Form.Select
                          value={attendanceRecords[index]?.status || 'present'}
                          onChange={(e) => handleStatusChange(index, e.target.value)}
                          required
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          placeholder="Optional notes"
                          value={attendanceRecords[index]?.notes || ''}
                          onChange={(e) => handleNotesChange(index, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : courseId ? (
            <Alert variant="info">No students found for this course.</Alert>
          ) : (
            <Alert variant="info">Select a course to view students.</Alert>
          )}
          
          {students.length > 0 && (
            <div className="d-flex gap-2 mt-4">
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
                  'Save All Attendance Records'
                )}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/attendance')}
              >
                Cancel
              </Button>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BulkAttendanceForm;
