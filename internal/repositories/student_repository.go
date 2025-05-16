package repositories

import (
	"context"

	"school-management-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// StudentRepository defines the interface for student repository
type StudentRepository interface {
	Create(ctx context.Context, student *models.Student) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Student, error)
	GetAll(ctx context.Context, page, pageSize int) ([]models.Student, int64, error)
	Update(ctx context.Context, student *models.Student) error
	Delete(ctx context.Context, id uuid.UUID) error
	FindByEmail(ctx context.Context, email string) (*models.Student, error)
	AddCourse(ctx context.Context, studentID, courseID uuid.UUID) error
	RemoveCourse(ctx context.Context, studentID, courseID uuid.UUID) error
	GetCourses(ctx context.Context, studentID uuid.UUID) ([]models.Course, error)
}

// StudentRepositoryImpl implements the StudentRepository interface
type StudentRepositoryImpl struct {
	db *gorm.DB
}

// NewStudentRepository creates a new instance of StudentRepositoryImpl
func NewStudentRepository(db *gorm.DB) StudentRepository {
	return &StudentRepositoryImpl{
		db: db,
	}
}

// Create creates a new student
func (r *StudentRepositoryImpl) Create(ctx context.Context, student *models.Student) error {
	return r.db.WithContext(ctx).Create(student).Error
}

// GetByID retrieves a student by their ID
func (r *StudentRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Student, error) {
	var student models.Student
	err := r.db.WithContext(ctx).Preload("Courses").First(&student, "id = ?", id).Error
	return &student, err
}

// GetAll retrieves all students with pagination
func (r *StudentRepositoryImpl) GetAll(ctx context.Context, page, pageSize int) ([]models.Student, int64, error) {
	var students []models.Student
	var total int64

	offset := (page - 1) * pageSize

	// Count total records
	if err := r.db.WithContext(ctx).Model(&models.Student{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Fetch records with pagination
	err := r.db.WithContext(ctx).Offset(offset).Limit(pageSize).Find(&students).Error
	return students, total, err
}

// Update updates a student
func (r *StudentRepositoryImpl) Update(ctx context.Context, student *models.Student) error {
	return r.db.WithContext(ctx).Save(student).Error
}

// Delete deletes a student
func (r *StudentRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Student{}, "id = ?", id).Error
}

// FindByEmail finds a student by their email
func (r *StudentRepositoryImpl) FindByEmail(ctx context.Context, email string) (*models.Student, error) {
	var student models.Student
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&student).Error
	return &student, err
}

// AddCourse adds a course to a student
func (r *StudentRepositoryImpl) AddCourse(ctx context.Context, studentID, courseID uuid.UUID) error {
	return r.db.WithContext(ctx).Exec("INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)", studentID, courseID).Error
}

// RemoveCourse removes a course from a student
func (r *StudentRepositoryImpl) RemoveCourse(ctx context.Context, studentID, courseID uuid.UUID) error {
	return r.db.WithContext(ctx).Exec("DELETE FROM student_courses WHERE student_id = ? AND course_id = ?", studentID, courseID).Error
}

// GetCourses gets all courses for a student
func (r *StudentRepositoryImpl) GetCourses(ctx context.Context, studentID uuid.UUID) ([]models.Course, error) {
	var courses []models.Course
	err := r.db.WithContext(ctx).Joins("JOIN student_courses ON student_courses.course_id = courses.id").
		Where("student_courses.student_id = ?", studentID).Find(&courses).Error
	return courses, err
}
