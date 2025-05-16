import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import gradeService from '../../services/grade.service';

// Register Chart.js components
Chart.register(...registerables);

const GradeDistributionChart = ({ courseId, title }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGradeDistribution = async () => {
      try {
        setLoading(true);
        const response = await gradeService.getCourseGradeDistribution(courseId);
        
        // Transform the data for the chart
        const labels = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
        const data = labels.map(grade => response.data[grade] || 0);
        
        // Create color array from green to red
        const colors = [
          'rgba(40, 167, 69, 0.8)', // A+
          'rgba(40, 167, 69, 0.7)', // A
          'rgba(40, 167, 69, 0.6)', // A-
          'rgba(23, 162, 184, 0.8)', // B+
          'rgba(23, 162, 184, 0.7)', // B
          'rgba(23, 162, 184, 0.6)', // B-
          'rgba(255, 193, 7, 0.8)', // C+
          'rgba(255, 193, 7, 0.7)', // C
          'rgba(255, 193, 7, 0.6)', // C-
          'rgba(220, 53, 69, 0.6)', // D+
          'rgba(220, 53, 69, 0.7)', // D
          'rgba(220, 53, 69, 0.8)', // D-
          'rgba(108, 117, 125, 0.8)'  // F
        ];
        
        setChartData({
          labels,
          datasets: [
            {
              label: 'Number of Students',
              data,
              backgroundColor: colors,
              borderColor: colors.map(color => color.replace('0.8', '1').replace('0.7', '1').replace('0.6', '1')),
              borderWidth: 1,
            },
          ],
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load grade distribution data. Please try again later.');
        setLoading(false);
        console.error('Error loading grade distribution:', err);
      }
    };
    
    if (courseId) {
      fetchGradeDistribution();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!chartData) {
    return <Alert variant="info">No grade distribution data available for this course.</Alert>;
  }

  return (
    <Card className="grade-distribution-chart">
      <Card.Body>
        <h5 className="chart-title">{title || 'Grade Distribution'}</h5>
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Students: ${context.raw}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                }
              }
            }
          }}
        />
      </Card.Body>
    </Card>
  );
};

export default GradeDistributionChart;
