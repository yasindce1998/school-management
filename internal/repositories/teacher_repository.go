package repositories

import (
	"context"

	"school-management-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TeacherRepository defines the interface for teacher repository
type TeacherRepository interface {
	Create(ctx context.Context, teacher *models.Teacher) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Teacher, error)
	GetAll(ctx context.Context, page, pageSize int) ([]models.Teacher, int64, error)
	Update(ctx context.Context, teacher *models.Teacher) error
	Delete(ctx context.Context, id uuid.UUID) error
	FindByEmail(ctx context.Context, email string) (*models.Teacher, error)
	AddCourse(ctx context.Context, teacherID, courseID uuid.UUID) error
	RemoveCourse(ctx context.Context, teacherID, courseID uuid.UUID) error
	GetCourses(ctx context.Context, teacherID uuid.UUID) ([]models.Course, error)
}

// TeacherRepositoryImpl implements the TeacherRepository interface
type TeacherRepositoryImpl struct {
	db *gorm.DB
}

// NewTeacherRepository creates a new instance of TeacherRepositoryImpl
func NewTeacherRepository(db *gorm.DB) TeacherRepository {
	return &TeacherRepositoryImpl{
		db: db,
	}
}

// Create creates a new teacher
func (r *TeacherRepositoryImpl) Create(ctx context.Context, teacher *models.Teacher) error {
	return r.db.WithContext(ctx).Create(teacher).Error
}

// GetByID retrieves a teacher by their ID
func (r *TeacherRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Teacher, error) {
	var teacher models.Teacher
	err := r.db.WithContext(ctx).Preload("Courses").First(&teacher, "id = ?", id).Error
	return &teacher, err
}

// GetAll retrieves all teachers with pagination
func (r *TeacherRepositoryImpl) GetAll(ctx context.Context, page, pageSize int) ([]models.Teacher, int64, error) {
	var teachers []models.Teacher
	var total int64

	offset := (page - 1) * pageSize

	// Count total records
	if err := r.db.WithContext(ctx).Model(&models.Teacher{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fetch records with pagination
	err := r.db.WithContext(ctx).Offset(offset).Limit(pageSize).Find(&teachers).Error
	return teachers, total, err
}

// Update updates a teacher
func (r *TeacherRepositoryImpl) Update(ctx context.Context, teacher *models.Teacher) error {
	return r.db.WithContext(ctx).Save(teacher).Error
}

// Delete deletes a teacher
func (r *TeacherRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Teacher{}, "id = ?", id).Error
}

// FindByEmail finds a teacher by their email
func (r *TeacherRepositoryImpl) FindByEmail(ctx context.Context, email string) (*models.Teacher, error) {
	var teacher models.Teacher
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&teacher).Error
	return &teacher, err
}

// AddCourse adds a course to a teacher
func (r *TeacherRepositoryImpl) AddCourse(ctx context.Context, teacherID, courseID uuid.UUID) error {
	return r.db.WithContext(ctx).Exec("INSERT INTO teacher_courses (teacher_id, course_id) VALUES (?, ?)", teacherID, courseID).Error
}

// RemoveCourse removes a course from a teacher
func (r *TeacherRepositoryImpl) RemoveCourse(ctx context.Context, teacherID, courseID uuid.UUID) error {
	return r.db.WithContext(ctx).Exec("DELETE FROM teacher_courses WHERE teacher_id = ? AND course_id = ?", teacherID, courseID).Error
}

// GetCourses gets all courses for a teacher
func (r *TeacherRepositoryImpl) GetCourses(ctx context.Context, teacherID uuid.UUID) ([]models.Course, error) {
	var courses []models.Course
	err := r.db.WithContext(ctx).Joins("JOIN teacher_courses ON teacher_courses.course_id = courses.id").
		Where("teacher_courses.teacher_id = ?", teacherID).Find(&courses).Error
	return courses, err
}
