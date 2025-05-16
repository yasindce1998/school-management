import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Badge, Form, Button, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import attendanceService from '../../services/attendance.service';

const CourseAttendanceView = ({ courseId }) => {
  const [attendances, setAttendances] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [students, setStudents] = useState({});

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceReport();
  }, [courseId, selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      let response;
      
      if (selectedDate) {
        // Format date as YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        // Need to implement this in the backend
        response = await attendanceService.getAttendancesByCourseAndDate(courseId, formattedDate);
      } else {
        response = await attendanceService.getAttendancesByCourse(courseId);
      }
      
      // Map student IDs to names by extracting from the attendance data
      const studentMap = {};
      response.data.forEach(attendance => {
        if (attendance.student) {
          const student = attendance.student;
          studentMap[student.id] = `${student.first_name} ${student.last_name}`;
        }
      });
      
      setStudents(studentMap);
      setAttendances(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load attendance data. Please try again later.');
      setLoading(false);
      console.error('Error loading attendance data:', err);
    }
  };

  const fetchAttendanceReport = async () => {
    try {
      setReportLoading(true);
      const response = await attendanceService.getCourseAttendanceReport(courseId);
      setReport(response.data);
      setReportLoading(false);
    } catch (err) {
      console.error('Error loading attendance report:', err);
      setReportLoading(false);
    }
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

  const renderAttendanceChart = () => {
    if (!report || reportLoading) {
      return <Spinner animation="border" size="sm" />;
    }

    const chartData = {
      labels: ['Present', 'Absent', 'Late', 'Excused'],
      datasets: [
        {
          data: [
            report.present || 0,
            report.absent || 0,
            report.late || 0,
            report.excused || 0
          ],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',  // green - present
            'rgba(220, 53, 69, 0.8)',  // red - absent
            'rgba(255, 193, 7, 0.8)',  // yellow - late
            'rgba(23, 162, 184, 0.8)'  // blue - excused
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(23, 162, 184, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="chart-container" style={{ maxWidth: "350px", margin: "0 auto" }}>
        <Pie 
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total ? Math.round((value / total) * 100) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }}
        />
      </div>
    );
  };

  return (
    <div className="attendance-view">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Course Attendance</h4>
        <Link to={`/attendance/course/${courseId}/bulk`} className="btn btn-primary btn-sm">
          Bulk Entry
        </Link>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <div className="attendance-summary card">
            <div className="card-body">
              <h5 className="card-title">Attendance Summary</h5>
              {renderAttendanceChart()}
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="attendance-filter card">
            <div className="card-body">
              <h5 className="card-title">Filter by Date</h5>
              <Form.Group>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                  isClearable
                />
              </Form.Group>
              {selectedDate && (
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => setSelectedDate(null)}
                >
                  Clear Date Filter
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <h5>Attendance Records</h5>
      {loading ? (
        <div className="text-center my-3">
          <Spinner animation="border" size="sm" role="status" />
          <span className="ms-2">Loading...</span>
        </div>
      ) : attendances.length === 0 ? (
        <Alert variant="info">No attendance records found for this course.</Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Student</th>
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
                <td>{new Date(attendance.date).toLocaleDateString()}</td>
                <td>{getStatusBadge(attendance.status)}</td>
                <td>{attendance.notes ? 
                    attendance.notes.substring(0, 30) + (attendance.notes.length > 30 ? '...' : '') 
                    : ''}
                </td>
                <td>
                  <Link to={`/attendance/${attendance.id}`} className="btn btn-sm btn-info me-2">
                    View
                  </Link>
                  <Link to={`/attendance/edit/${attendance.id}`} className="btn btn-sm btn-warning">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default CourseAttendanceView;
