package services

import (
	"context"
	"errors"

	"school-management-api/internal/models"
	"school-management-api/internal/repositories"

	"github.com/google/uuid"
)

// CourseService defines the interface for course service
type CourseService interface {
	CreateCourse(ctx context.Context, course *models.Course) error
	GetCourseByID(ctx context.Context, id uuid.UUID) (*models.CourseResponse, error)
	GetAllCourses(ctx context.Context, page, pageSize int) ([]models.CourseResponse, int64, error)
	UpdateCourse(ctx context.Context, course *models.Course) error
	DeleteCourse(ctx context.Context, id uuid.UUID) error
	GetCourseStudents(ctx context.Context, courseID uuid.UUID) ([]models.StudentSummary, error)
	GetCourseTeachers(ctx context.Context, courseID uuid.UUID) ([]models.TeacherSummary, error)
}

// CourseServiceImpl implements the CourseService interface
type CourseServiceImpl struct {
	courseRepo repositories.CourseRepository
}

// NewCourseService creates a new instance of CourseServiceImpl
func NewCourseService(courseRepo repositories.CourseRepository) CourseService {
	return &CourseServiceImpl{
		courseRepo: courseRepo,
	}
}

// CreateCourse creates a new course
func (s *CourseServiceImpl) CreateCourse(ctx context.Context, course *models.Course) error {
	// Check if course with same code already exists
	existingCourse, err := s.courseRepo.FindByCode(ctx, course.Code)
	if err == nil && existingCourse.ID != uuid.Nil {
		return errors.New("course with this code already exists")
	}

	// Create course
	return s.courseRepo.Create(ctx, course)
}

// GetCourseByID retrieves a course by its ID
func (s *CourseServiceImpl) GetCourseByID(ctx context.Context, id uuid.UUID) (*models.CourseResponse, error) {
	course, err := s.courseRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Get students and teachers
	students, err := s.courseRepo.GetStudents(ctx, id)
	if err != nil {
		return nil, err
	}

	teachers, err := s.courseRepo.GetTeachers(ctx, id)
	if err != nil {
		return nil, err
	}

	// Map students to student summaries
	var studentSummaries []models.StudentSummary
	for _, student := range students {
		studentSummaries = append(studentSummaries, models.StudentSummary{
			ID:        student.ID,
			FirstName: student.FirstName,
			LastName:  student.LastName,
			Email:     student.Email,
		})
	}

	// Map teachers to teacher summaries
	var teacherSummaries []models.TeacherSummary
	for _, teacher := range teachers {
		teacherSummaries = append(teacherSummaries, models.TeacherSummary{
			ID:        teacher.ID,
			FirstName: teacher.FirstName,
			LastName:  teacher.LastName,
			Email:     teacher.Email,
		})
	}

	// Map to response model
	response := &models.CourseResponse{
		ID:          course.ID,
		Code:        course.Code,
		Name:        course.Name,
		Description: course.Description,
		Credits:     course.Credits,
		Department:  course.Department,
		Students:    studentSummaries,
		Teachers:    teacherSummaries,
	}

	return response, nil
}

// GetAllCourses retrieves all courses with pagination
func (s *CourseServiceImpl) GetAllCourses(ctx context.Context, page, pageSize int) ([]models.CourseResponse, int64, error) {
	courses, total, err := s.courseRepo.GetAll(ctx, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	// Map to response models
	var responses []models.CourseResponse
	for _, course := range courses {
		responses = append(responses, models.CourseResponse{
			ID:          course.ID,
			Code:        course.Code,
			Name:        course.Name,
			Description: course.Description,
			Credits:     course.Credits,
			Department:  course.Department,
		})
	}

	return responses, total, nil
}

// UpdateCourse updates a course
func (s *CourseServiceImpl) UpdateCourse(ctx context.Context, course *models.Course) error {
	// Check if course exists
	existingCourse, err := s.courseRepo.GetByID(ctx, course.ID)
	if err != nil {
		return err
	}

	// Check if code is already used by another course
	if course.Code != existingCourse.Code {
		anotherCourse, err := s.courseRepo.FindByCode(ctx, course.Code)
		if err == nil && anotherCourse.ID != uuid.Nil && anotherCourse.ID != course.ID {
			return errors.New("code is already used by another course")
		}
	}

	return s.courseRepo.Update(ctx, course)
}

// DeleteCourse deletes a course
func (s *CourseServiceImpl) DeleteCourse(ctx context.Context, id uuid.UUID) error {
	// Check if course exists
	_, err := s.courseRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return s.courseRepo.Delete(ctx, id)
}

// GetCourseStudents gets all students for a course
func (s *CourseServiceImpl) GetCourseStudents(ctx context.Context, courseID uuid.UUID) ([]models.StudentSummary, error) {
	// Check if course exists
	_, err := s.courseRepo.GetByID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	students, err := s.courseRepo.GetStudents(ctx, courseID)
	if err != nil {
		return nil, err
	}

	// Map to student summaries
	var studentSummaries []models.StudentSummary
	for _, student := range students {
		studentSummaries = append(studentSummaries, models.StudentSummary{
			ID:        student.ID,
			FirstName: student.FirstName,
			LastName:  student.LastName,
			Email:     student.Email,
		})
	}

	return studentSummaries, nil
}

// GetCourseTeachers gets all teachers for a course
func (s *CourseServiceImpl) GetCourseTeachers(ctx context.Context, courseID uuid.UUID) ([]models.TeacherSummary, error) {
	// Check if course exists
	_, err := s.courseRepo.GetByID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	teachers, err := s.courseRepo.GetTeachers(ctx, courseID)
	if err != nil {
		return nil, err
	}

	// Map to teacher summaries
	var teacherSummaries []models.TeacherSummary
	for _, teacher := range teachers {
		teacherSummaries = append(teacherSummaries, models.TeacherSummary{
			ID:        teacher.ID,
			FirstName: teacher.FirstName,
			LastName:  teacher.LastName,
			Email:     teacher.Email,
		})
	}

	return teacherSummaries, nil
}
