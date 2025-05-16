import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import GradeForm from '../components/grades/GradeForm';

const GradeFormPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Grade Form</h2>
              <p className="text-muted">Add or edit a student grade</p>
            </Card.Body>
          </Card>
          
          <GradeForm />
        </Col>
      </Row>
    </Container>
  );
};

export default GradeFormPage;
