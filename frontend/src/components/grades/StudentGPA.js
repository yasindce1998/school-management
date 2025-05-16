import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import gradeService from '../../services/grade.service';

const StudentGPA = ({ studentId }) => {
  const [gpaData, setGpaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGPA = async () => {
      try {
        setLoading(true);
        const response = await gradeService.getStudentGPA(studentId);
        setGpaData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load GPA data. Please try again later.');
        setLoading(false);
        console.error('Error loading GPA:', err);
      }
    };
    
    if (studentId) {
      fetchGPA();
    }
  }, [studentId]);

  // Get color based on GPA value
  const getGPAColor = (gpa) => {
    if (gpa >= 3.7) return 'success';
    if (gpa >= 3.0) return 'info';
    if (gpa >= 2.0) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" size="sm" role="status" />
        <span className="ms-2">Loading GPA...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!gpaData || !gpaData.gpa) {
    return <Alert variant="info">No GPA data available for this student.</Alert>;
  }

  return (
    <Card className="mb-4">
      <Card.Body className="student-grades-report">
        <div className="gpa-display">
          <div className="gpa-label">Current GPA</div>
          <div className="gpa-value">{gpaData.gpa.toFixed(2)}</div>
          <div className="gpa-scale">Scale: 0.0 - 4.0</div>
        </div>
        
        <div className="mb-4">
          <h6>GPA Performance</h6>
          <ProgressBar 
            now={gpaData.gpa * 25} // Convert 4.0 scale to percentage (4.0 = 100%)
            variant={getGPAColor(gpaData.gpa)}
            style={{ height: '20px' }}
          />
        </div>
        
        {gpaData.termBreakdown && Object.keys(gpaData.termBreakdown).length > 0 && (
          <div>
            <h6>GPA by Term</h6>
            {Object.entries(gpaData.termBreakdown).map(([term, termGpa]) => (
              <div key={term} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>{term}</span>
                  <span className={`text-${getGPAColor(termGpa)}`}>{termGpa.toFixed(2)}</span>
                </div>
                <ProgressBar 
                  now={termGpa * 25} 
                  variant={getGPAColor(termGpa)} 
                  style={{ height: '10px' }}
                />
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StudentGPA;
