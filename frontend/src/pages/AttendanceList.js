import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AttendanceList from '../components/attendance/AttendanceList';

const AttendanceListPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Attendance Management</h2>
              <p className="text-muted">View and manage student attendance records</p>
            </Card.Body>
          </Card>
          
          <AttendanceList />
        </Col>
      </Row>
    </Container>
  );
};

export default AttendanceListPage;
