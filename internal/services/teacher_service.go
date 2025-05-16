package services

import (
	"context"
	"errors"

	"school-management-api/internal/models"
	"school-management-api/internal/repositories"

	"github.com/google/uuid"
)

// TeacherService defines the interface for teacher service
type TeacherService interface {
	CreateTeacher(ctx context.Context, teacher *models.Teacher) error
	GetTeacherByID(ctx context.Context, id uuid.UUID) (*models.TeacherResponse, error)
	GetAllTeachers(ctx context.Context, page, pageSize int) ([]models.TeacherResponse, int64, error)
	UpdateTeacher(ctx context.Context, teacher *models.Teacher) error
	DeleteTeacher(ctx context.Context, id uuid.UUID) error
	AssignCourse(ctx context.Context, teacherID, courseID uuid.UUID) error
	RemoveCourse(ctx context.Context, teacherID, courseID uuid.UUID) error
	GetTeacherCourses(ctx context.Context, teacherID uuid.UUID) ([]models.Course, error)
}

// TeacherServiceImpl implements the TeacherService interface
type TeacherServiceImpl struct {
	teacherRepo repositories.TeacherRepository
	courseRepo  repositories.CourseRepository
}

// NewTeacherService creates a new instance of TeacherServiceImpl
func NewTeacherService(
	teacherRepo repositories.TeacherRepository,
	courseRepo repositories.CourseRepository,
) TeacherService {
	return &TeacherServiceImpl{
		teacherRepo: teacherRepo,
		courseRepo:  courseRepo,
	}
}

// CreateTeacher creates a new teacher
func (s *TeacherServiceImpl) CreateTeacher(ctx context.Context, teacher *models.Teacher) error {
	// Check if teacher with same email already exists
	existingTeacher, err := s.teacherRepo.FindByEmail(ctx, teacher.Email)
	if err == nil && existingTeacher.ID != uuid.Nil {
		return errors.New("teacher with this email already exists")
	}

	// Create teacher
	return s.teacherRepo.Create(ctx, teacher)
}

// GetTeacherByID retrieves a teacher by their ID
func (s *TeacherServiceImpl) GetTeacherByID(ctx context.Context, id uuid.UUID) (*models.TeacherResponse, error) {
	teacher, err := s.teacherRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Map to response model
	response := &models.TeacherResponse{
		ID:             teacher.ID,
		FirstName:      teacher.FirstName,
		LastName:       teacher.LastName,
		Email:          teacher.Email,
		Specialization: teacher.Specialization,
		Phone:          teacher.Phone,
		Address:        teacher.Address,
		Courses:        teacher.Courses,
	}

	return response, nil
}

// GetAllTeachers retrieves all teachers with pagination
func (s *TeacherServiceImpl) GetAllTeachers(ctx context.Context, page, pageSize int) ([]models.TeacherResponse, int64, error) {
	teachers, total, err := s.teacherRepo.GetAll(ctx, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	// Map to response models
	var responses []models.TeacherResponse
	for _, teacher := range teachers {
		responses = append(responses, models.TeacherResponse{
			ID:             teacher.ID,
			FirstName:      teacher.FirstName,
			LastName:       teacher.LastName,
			Email:          teacher.Email,
			Specialization: teacher.Specialization,
			Phone:          teacher.Phone,
			Address:        teacher.Address,
		})
	}

	return responses, total, nil
}

// UpdateTeacher updates a teacher
func (s *TeacherServiceImpl) UpdateTeacher(ctx context.Context, teacher *models.Teacher) error {
	// Check if teacher exists
	existingTeacher, err := s.teacherRepo.GetByID(ctx, teacher.ID)
	if err != nil {
		return err
	}

	// Check if email is already used by another teacher
	if teacher.Email != existingTeacher.Email {
		anotherTeacher, err := s.teacherRepo.FindByEmail(ctx, teacher.Email)
		if err == nil && anotherTeacher.ID != uuid.Nil && anotherTeacher.ID != teacher.ID {
			return errors.New("email is already used by another teacher")
		}
	}

	return s.teacherRepo.Update(ctx, teacher)
}

// DeleteTeacher deletes a teacher
func (s *TeacherServiceImpl) DeleteTeacher(ctx context.Context, id uuid.UUID) error {
	// Check if teacher exists
	_, err := s.teacherRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.teacherRepo.Delete(ctx, id)
}

// AssignCourse assigns a course to a teacher
func (s *TeacherServiceImpl) AssignCourse(ctx context.Context, teacherID, courseID uuid.UUID) error {
	// Check if teacher exists
	_, err := s.teacherRepo.GetByID(ctx, teacherID)
	if err != nil {
		return err
	}

	// Check if course exists
	_, err = s.courseRepo.GetByID(ctx, courseID)
	if err != nil {
		return err
	}

	return s.teacherRepo.AddCourse(ctx, teacherID, courseID)
}

// RemoveCourse removes a course from a teacher
func (s *TeacherServiceImpl) RemoveCourse(ctx context.Context, teacherID, courseID uuid.UUID) error {
	return s.teacherRepo.RemoveCourse(ctx, teacherID, courseID)
}

// GetTeacherCourses gets all courses for a teacher
func (s *TeacherServiceImpl) GetTeacherCourses(ctx context.Context, teacherID uuid.UUID) ([]models.Course, error) {
	// Check if teacher exists
	_, err := s.teacherRepo.GetByID(ctx, teacherID)
	if err != nil {
		return nil, err
	}

	return s.teacherRepo.GetCourses(ctx, teacherID)
}
