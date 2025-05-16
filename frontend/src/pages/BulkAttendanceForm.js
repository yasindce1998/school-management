import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import BulkAttendanceForm from '../components/attendance/BulkAttendanceForm';

const BulkAttendanceFormPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Bulk Attendance Entry</h2>
              <p className="text-muted">Take attendance for an entire class at once</p>
            </Card.Body>
          </Card>
          
          <BulkAttendanceForm />
        </Col>
      </Row>
    </Container>
  );
};

export default BulkAttendanceFormPage;
