import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import gradeService from '../../services/grade.service';
import studentService from '../../services/student.service';
import courseService from '../../services/course.service';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch grades
        const gradesResponse = await gradeService.getAllGrades();
        setGrades(gradesResponse.data);
        
        // Fetch students for mapping
        const studentsResponse = await studentService.getAllStudents();
        const studentsMap = {};
        studentsResponse.data.forEach(student => {
          studentsMap[student.id] = `${student.firstName} ${student.lastName}`;
        });
        setStudents(studentsMap);
        
        // Fetch courses for mapping
        const coursesResponse = await courseService.getAllCourses();
        const coursesMap = {};
        coursesResponse.data.forEach(course => {
          coursesMap[course.id] = course.name;
        });
        setCourses(coursesMap);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch grades. Please try again later.');
        setLoading(false);
        console.error('Error fetching grades:', err);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await gradeService.deleteGrade(id);
        setGrades(grades.filter(grade => grade.id !== id));
      } catch (err) {
        setError('Failed to delete grade. Please try again later.');
        console.error('Error deleting grade:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card className="shadow">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Grades</h5>
        <Link to="/grades/new" className="btn btn-light btn-sm">
          Add New Grade
        </Link>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {grades.length === 0 ? (
          <Alert variant="info">No grades found.</Alert>
        ) : (
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Term</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{students[grade.student_id] || 'Unknown'}</td>
                  <td>{courses[grade.course_id] || 'Unknown'}</td>
                  <td>{grade.score}</td>
                  <td>
                    <span className={`badge ${
                      grade.grade.startsWith('A') ? 'bg-success' :
                      grade.grade.startsWith('B') ? 'bg-primary' :
                      grade.grade.startsWith('C') ? 'bg-info' :
                      grade.grade.startsWith('D') ? 'bg-warning' :
                      'bg-danger'
                    }`}>
                      {grade.grade}
                    </span>
                  </td>
                  <td>{grade.term}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/grades/${grade.id}`} className="btn btn-sm btn-info">
                        <FaEye />
                      </Link>
                      <Link to={`/grades/edit/${grade.id}`} className="btn btn-sm btn-warning">
                        <FaEdit />
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(grade.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default GradeList;
