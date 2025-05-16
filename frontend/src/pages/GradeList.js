import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import GradeList from '../components/grades/GradeList';

const GradeListPage = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h2 className="mb-0">Grades Management</h2>
              <p className="text-muted">View and manage student grades</p>
            </Card.Body>
          </Card>
          
          <GradeList />
        </Col>
      </Row>
    </Container>
  );
};

export default GradeListPage;
