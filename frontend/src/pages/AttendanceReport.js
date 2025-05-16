import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AttendanceReport from '../components/attendance/AttendanceReport';

const AttendanceReportPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Attendance Report</h2>
              <p className="text-muted">View attendance reports for students or courses</p>
            </Card.Body>
          </Card>
          
          <AttendanceReport />
        </Col>
      </Row>
    </Container>
  );
};

export default AttendanceReportPage;
