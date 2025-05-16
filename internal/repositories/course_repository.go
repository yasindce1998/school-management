package repositories

import (
	"context"

	"school-management-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CourseRepository defines the interface for course repository
type CourseRepository interface {
	Create(ctx context.Context, course *models.Course) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error)
	GetAll(ctx context.Context, page, pageSize int) ([]models.Course, int64, error)
	Update(ctx context.Context, course *models.Course) error
	Delete(ctx context.Context, id uuid.UUID) error
	FindByCode(ctx context.Context, code string) (*models.Course, error)
	GetStudents(ctx context.Context, courseID uuid.UUID) ([]models.Student, error)
	GetTeachers(ctx context.Context, courseID uuid.UUID) ([]models.Teacher, error)
}

// CourseRepositoryImpl implements the CourseRepository interface
type CourseRepositoryImpl struct {
	db *gorm.DB
}

// NewCourseRepository creates a new instance of CourseRepositoryImpl
func NewCourseRepository(db *gorm.DB) CourseRepository {
	return &CourseRepositoryImpl{
		db: db,
	}
}

// Create creates a new course
func (r *CourseRepositoryImpl) Create(ctx context.Context, course *models.Course) error {
	return r.db.WithContext(ctx).Create(course).Error
}

// GetByID retrieves a course by its ID
func (r *CourseRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Course, error) {
	var course models.Course
	err := r.db.WithContext(ctx).First(&course, "id = ?", id).Error
	return &course, err
}

// GetAll retrieves all courses with pagination
func (r *CourseRepositoryImpl) GetAll(ctx context.Context, page, pageSize int) ([]models.Course, int64, error) {
	var courses []models.Course
	var total int64

	offset := (page - 1) * pageSize

	// Count total records
	if err := r.db.WithContext(ctx).Model(&models.Course{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fetch records with pagination
	err := r.db.WithContext(ctx).Offset(offset).Limit(pageSize).Find(&courses).Error
	return courses, total, err
}

// Update updates a course
func (r *CourseRepositoryImpl) Update(ctx context.Context, course *models.Course) error {
	return r.db.WithContext(ctx).Save(course).Error
}

// Delete deletes a course
func (r *CourseRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Course{}, "id = ?", id).Error
}

// FindByCode finds a course by its code
func (r *CourseRepositoryImpl) FindByCode(ctx context.Context, code string) (*models.Course, error) {
	var course models.Course
	err := r.db.WithContext(ctx).Where("code = ?", code).First(&course).Error
	return &course, err
}

// GetStudents gets all students for a course
func (r *CourseRepositoryImpl) GetStudents(ctx context.Context, courseID uuid.UUID) ([]models.Student, error) {
	var students []models.Student
	err := r.db.WithContext(ctx).Joins("JOIN student_courses ON student_courses.student_id = students.id").
		Where("student_courses.course_id = ?", courseID).Find(&students).Error
	return students, err
}

// GetTeachers gets all teachers for a course
func (r *CourseRepositoryImpl) GetTeachers(ctx context.Context, courseID uuid.UUID) ([]models.Teacher, error) {
	var teachers []models.Teacher
	err := r.db.WithContext(ctx).Joins("JOIN teacher_courses ON teacher_courses.teacher_id = teachers.id").
		Where("teacher_courses.course_id = ?", courseID).Find(&teachers).Error
	return teachers, err
}
