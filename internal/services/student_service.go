package services

import (
	"context"
	"errors"

	"school-management-api/internal/models"
	"school-management-api/internal/repositories"

	"github.com/google/uuid"
)

// StudentService defines the interface for student service
type StudentService interface {
	CreateStudent(ctx context.Context, student *models.Student) error
	GetStudentByID(ctx context.Context, id uuid.UUID) (*models.StudentResponse, error)
	GetAllStudents(ctx context.Context, page, pageSize int) ([]models.StudentResponse, int64, error)
	UpdateStudent(ctx context.Context, student *models.Student) error
	DeleteStudent(ctx context.Context, id uuid.UUID) error
	EnrollCourse(ctx context.Context, studentID, courseID uuid.UUID) error
	DropCourse(ctx context.Context, studentID, courseID uuid.UUID) error
	GetStudentCourses(ctx context.Context, studentID uuid.UUID) ([]models.Course, error)
}

// StudentServiceImpl implements the StudentService interface
type StudentServiceImpl struct {
	studentRepo repositories.StudentRepository
	courseRepo  repositories.CourseRepository
}

// NewStudentService creates a new instance of StudentServiceImpl
func NewStudentService(studentRepo repositories.StudentRepository, courseRepo repositories.CourseRepository) StudentService {
	return &StudentServiceImpl{
		studentRepo: studentRepo,
		courseRepo:  courseRepo,
	}
}

// CreateStudent creates a new student
func (s *StudentServiceImpl) CreateStudent(ctx context.Context, student *models.Student) error {
	// Check if student with same email already exists
	existingStudent, err := s.studentRepo.FindByEmail(ctx, student.Email)
	if err == nil && existingStudent.ID != uuid.Nil {
		return errors.New("student with this email already exists")
	}

	// Create student
	return s.studentRepo.Create(ctx, student)
}

// GetStudentByID retrieves a student by their ID
func (s *StudentServiceImpl) GetStudentByID(ctx context.Context, id uuid.UUID) (*models.StudentResponse, error) {
	student, err := s.studentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Map to response model
	response := &models.StudentResponse{
		ID:             student.ID,
		FirstName:      student.FirstName,
		LastName:       student.LastName,
		Email:          student.Email,
		DateOfBirth:    student.DateOfBirth,
		Gender:         student.Gender,
		Address:        student.Address,
		Phone:          student.Phone,
		EnrollmentDate: student.EnrollmentDate,
		GradeLevel:     student.GradeLevel,
		Courses:        student.Courses,
	}

	return response, nil
}

// GetAllStudents retrieves all students with pagination
func (s *StudentServiceImpl) GetAllStudents(ctx context.Context, page, pageSize int) ([]models.StudentResponse, int64, error) {
	students, total, err := s.studentRepo.GetAll(ctx, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	// Map to response models
	var responses []models.StudentResponse
	for _, student := range students {
		responses = append(responses, models.StudentResponse{
			ID:             student.ID,
			FirstName:      student.FirstName,
			LastName:       student.LastName,
			Email:          student.Email,
			DateOfBirth:    student.DateOfBirth,
			Gender:         student.Gender,
			Address:        student.Address,
			Phone:          student.Phone,
			EnrollmentDate: student.EnrollmentDate,
			GradeLevel:     student.GradeLevel,
		})
	}

	return responses, total, nil
}

// UpdateStudent updates a student
func (s *StudentServiceImpl) UpdateStudent(ctx context.Context, student *models.Student) error {
	// Check if student exists
	existingStudent, err := s.studentRepo.GetByID(ctx, student.ID)
	if err != nil {
		return err
	}

	// Check if email is already used by another student
	if student.Email != existingStudent.Email {
		anotherStudent, err := s.studentRepo.FindByEmail(ctx, student.Email)
		if err == nil && anotherStudent.ID != uuid.Nil && anotherStudent.ID != student.ID {
			return errors.New("email is already used by another student")
		}
	}

	return s.studentRepo.Update(ctx, student)
}

// DeleteStudent deletes a student
func (s *StudentServiceImpl) DeleteStudent(ctx context.Context, id uuid.UUID) error {
	// Check if student exists
	_, err := s.studentRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.studentRepo.Delete(ctx, id)
}

// EnrollCourse enrolls a student in a course
func (s *StudentServiceImpl) EnrollCourse(ctx context.Context, studentID, courseID uuid.UUID) error {
	// Check if student exists
	_, err := s.studentRepo.GetByID(ctx, studentID)
	if err != nil {
		return err
	}

	// Check if course exists
	_, err = s.courseRepo.GetByID(ctx, courseID)
	if err != nil {
		return err
	}

	return s.studentRepo.AddCourse(ctx, studentID, courseID)
}

// DropCourse removes a student from a course
func (s *StudentServiceImpl) DropCourse(ctx context.Context, studentID, courseID uuid.UUID) error {
	return s.studentRepo.RemoveCourse(ctx, studentID, courseID)
}

// GetStudentCourses gets all courses for a student
func (s *StudentServiceImpl) GetStudentCourses(ctx context.Context, studentID uuid.UUID) ([]models.Course, error) {
	// Check if student exists
	_, err := s.studentRepo.GetByID(ctx, studentID)
	if err != nil {
		return nil, err
	}

	return s.studentRepo.GetCourses(ctx, studentID)
}
