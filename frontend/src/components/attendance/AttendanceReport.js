import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Alert, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import attendanceService from '../../services/attendance.service';
import courseService from '../../services/course.service';
import studentService from '../../services/student.service';

// Register ChartJS components
Chart.register(...registerables);

const AttendanceReport = () => {
  const { id, type } = useParams(); // type can be 'student' or 'course'
  
  const [reportData, setReportData] = useState(null);
  const [entityInfo, setEntityInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let report;
        // Fetch report data based on type
        if (type === 'student') {
          report = await attendanceService.getStudentAttendanceReport(id);
          const studentInfo = await studentService.getStudent(id);
          setEntityInfo(studentInfo.data);
        } else { // course
          report = await attendanceService.getCourseAttendanceReport(id);
          const courseInfo = await courseService.getCourse(id);
          setEntityInfo(courseInfo.data);
        }
        
        setReportData(report.data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load ${type} attendance report. Please try again later.`);
        setLoading(false);
        console.error(`Error loading ${type} attendance report:`, err);
      }
    };
    
    fetchData();
  }, [id, type]);

  const prepareChartData = (data) => {
    if (type === 'student') {
      // For student reports
      return {
        labels: ['Present', 'Absent', 'Late', 'Excused'],
        datasets: [
          {
            label: 'Attendance Count',
            data: [data.present || 0, data.absent || 0, data.late || 0, data.excused || 0],
            backgroundColor: [
              'rgba(40, 167, 69, 0.7)', // green for present
              'rgba(220, 53, 69, 0.7)', // red for absent
              'rgba(255, 193, 7, 0.7)', // yellow for late
              'rgba(23, 162, 184, 0.7)', // cyan for excused
            ],
            borderColor: [
              'rgba(40, 167, 69, 1)',
              'rgba(220, 53, 69, 1)',
              'rgba(255, 193, 7, 1)',
              'rgba(23, 162, 184, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    } else {
      // For course reports
      const labels = Object.keys(data);
      const presentData = [];
      const absentData = [];
      const lateData = [];
      const excusedData = [];
      
      labels.forEach(student => {
        presentData.push(data[student].present || 0);
        absentData.push(data[student].absent || 0);
        lateData.push(data[student].late || 0);
        excusedData.push(data[student].excused || 0);
      });
      
      return {
        labels,
        datasets: [
          {
            label: 'Present',
            data: presentData,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1,
          },
          {
            label: 'Absent',
            data: absentData,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1,
          },
          {
            label: 'Late',
            data: lateData,
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1,
          },
          {
            label: 'Excused',
            data: excusedData,
            backgroundColor: 'rgba(23, 162, 184, 0.7)',
            borderColor: 'rgba(23, 162, 184, 1)',
            borderWidth: 1,
          },
        ],
      };
    }
  };

  const calculateAttendanceRate = (data) => {
    const total = data.total || (data.present + data.absent + data.late + data.excused);
    if (total === 0) return 0;
    
    // Present and excused are considered as "attended"
    const attended = (data.present || 0) + (data.excused || 0);
    return (attended / total) * 100;
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

  if (!reportData) {
    return <Alert variant="warning">No attendance data found.</Alert>;
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          {type === 'student' ? 'Student' : 'Course'} Attendance Report
        </h5>
        <Link to={type === 'student' ? '/students' : '/courses'} className="btn btn-light btn-sm">
          <FaArrowLeft className="me-1" /> Back to {type === 'student' ? 'Students' : 'Courses'}
        </Link>
      </Card.Header>
      <Card.Body>
        {entityInfo && (
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                {type === 'student' 
                  ? `${entityInfo.firstName} ${entityInfo.lastName}'s Attendance`
                  : `${entityInfo.name} (${entityInfo.code}) Attendance`
                }
              </h6>
            </Card.Header>
            <Card.Body>
              {type === 'student' && (
                <div>
                  <div className="mb-3">
                    <h6>Attendance Rate:</h6>
                    <ProgressBar 
                      now={calculateAttendanceRate(reportData)}
                      label={`${calculateAttendanceRate(reportData).toFixed(1)}%`}
                      variant={
                        calculateAttendanceRate(reportData) >= 90 ? 'success' :
                        calculateAttendanceRate(reportData) >= 80 ? 'info' :
                        calculateAttendanceRate(reportData) >= 70 ? 'warning' : 'danger'
                      }
                      style={{ height: '25px' }}
                    />
                  </div>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <div style={{ height: '300px' }}>
                        <h6 className="text-center">Attendance Summary</h6>
                        <Pie 
                          data={prepareChartData(reportData)}
                          options={{ 
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Attendance Breakdown</h6>
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>Count</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><Badge bg="success">Present</Badge></td>
                            <td>{reportData.present || 0}</td>
                            <td>
                              {reportData.total === 0 ? '0%' : 
                                `${(((reportData.present || 0) / reportData.total) * 100).toFixed(1)}%`}
                            </td>
                          </tr>
                          <tr>
                            <td><Badge bg="danger">Absent</Badge></td>
                            <td>{reportData.absent || 0}</td>
                            <td>
                              {reportData.total === 0 ? '0%' : 
                                `${(((reportData.absent || 0) / reportData.total) * 100).toFixed(1)}%`}
                            </td>
                          </tr>
                          <tr>
                            <td><Badge bg="warning">Late</Badge></td>
                            <td>{reportData.late || 0}</td>
                            <td>
                              {reportData.total === 0 ? '0%' : 
                                `${(((reportData.late || 0) / reportData.total) * 100).toFixed(1)}%`}
                            </td>
                          </tr>
                          <tr>
                            <td><Badge bg="info">Excused</Badge></td>
                            <td>{reportData.excused || 0}</td>
                            <td>
                              {reportData.total === 0 ? '0%' : 
                                `${(((reportData.excused || 0) / reportData.total) * 100).toFixed(1)}%`}
                            </td>
                          </tr>
                          <tr className="table-active">
                            <td><strong>Total</strong></td>
                            <td><strong>{reportData.total || 0}</strong></td>
                            <td><strong>100%</strong></td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </div>
              )}
              
              {type === 'course' && (
                <div>
                  <div style={{ height: '400px' }} className="mb-4">
                    <h6 className="text-center">Student Attendance Comparison</h6>
                    <Bar 
                      data={prepareChartData(reportData)}
                      options={{ 
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { stacked: true },
                          y: { stacked: true }
                        }
                      }}
                    />
                  </div>
                  
                  <h6>Detailed Attendance by Student</h6>
                  <Table responsive striped bordered hover>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Excused</th>
                        <th>Total</th>
                        <th>Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(reportData).map((studentName) => {
                        const studentData = reportData[studentName];
                        const attendanceRate = calculateAttendanceRate(studentData);
                        return (
                          <tr key={studentName}>
                            <td>{studentName}</td>
                            <td>{studentData.present || 0}</td>
                            <td>{studentData.absent || 0}</td>
                            <td>{studentData.late || 0}</td>
                            <td>{studentData.excused || 0}</td>
                            <td>{studentData.total || 0}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2" style={{ width: '60px' }}>
                                  {attendanceRate.toFixed(1)}%
                                </div>
                                <ProgressBar 
                                  now={attendanceRate}
                                  variant={
                                    attendanceRate >= 90 ? 'success' :
                                    attendanceRate >= 80 ? 'info' :
                                    attendanceRate >= 70 ? 'warning' : 'danger'
                                  }
                                  style={{ height: '10px', width: '100%' }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </Card.Body>
    </Card>
  );
};

export default AttendanceReport;
