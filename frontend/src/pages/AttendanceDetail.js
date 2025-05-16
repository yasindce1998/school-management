import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AttendanceDetail from '../components/attendance/AttendanceDetail';

const AttendanceDetailPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Attendance Details</h2>
              <p className="text-muted">View detailed information about a student attendance record</p>
            </Card.Body>
          </Card>
          
          <AttendanceDetail />
        </Col>
      </Row>
    </Container>
  );
};

export default AttendanceDetailPage;
