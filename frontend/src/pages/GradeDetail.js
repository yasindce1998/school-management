import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import GradeDetail from '../components/grades/GradeDetail';

const GradeDetailPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Grade Details</h2>
              <p className="text-muted">View detailed information about a student grade</p>
            </Card.Body>
          </Card>
          
          <GradeDetail />
        </Col>
      </Row>
    </Container>
  );
};

export default GradeDetailPage;
