import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StudentService from '../services/student.service';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    enrollment_date: '',
    grade_level: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getById(id);
      
      // Format dates for form input
      const formattedData = {
        ...data,
        date_of_birth: formatDateForInput(data.date_of_birth),
        enrollment_date: formatDateForInput(data.enrollment_date)
      };
      
      setFormData(formattedData);
      setError('');
    } catch (err) {
      setError('Failed to fetch student data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      if (isEditMode) {
        await StudentService.update(id, formData);
      } else {
        await StudentService.create(formData);
      }
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student. Please try again.');
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>{isEditMode ? 'Edit Student' : 'Add New Student'}</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="enrollment_date">Enrollment Date</label>
                  <input
                    type="date"
                    id="enrollment_date"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="grade_level">Grade Level</label>
                  <select
                    id="grade_level"
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Grade Level</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                rows="2"
              ></textarea>
            </div>

            <div className="form-group d-flex justify-content-between">
              <Link to="/students" className="btn btn-light">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? 'Saving...' : isEditMode ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
