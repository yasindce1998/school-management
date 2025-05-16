import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import AttendanceForm from '../components/attendance/AttendanceForm';

const AttendanceFormPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Attendance Form</h2>
              <p className="text-muted">Add or edit a student attendance record</p>
            </Card.Body>
          </Card>
          
          <AttendanceForm />
        </Col>
      </Row>
    </Container>
  );
};

export default AttendanceFormPage;
