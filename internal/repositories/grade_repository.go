package repositories

import (
	"school-management-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GradeRepository defines methods for grade management
type GradeRepository interface {
	Create(grade *models.Grade) error
	Update(grade *models.Grade) error
	Delete(id uuid.UUID) error
	FindByID(id uuid.UUID) (*models.Grade, error)
	FindAll() ([]models.Grade, error)
	FindByStudent(studentID uuid.UUID) ([]models.Grade, error)
	FindByCourse(courseID uuid.UUID) ([]models.Grade, error)
	FindByStudentAndCourse(studentID, courseID uuid.UUID) ([]models.Grade, error)
	FindByTerm(term string) ([]models.Grade, error)
	GetStudentGPA(studentID uuid.UUID) (float64, error)
	GetCourseGradeDistribution(courseID uuid.UUID) (map[string]int, error)
}

// GradeRepositoryImpl implements the GradeRepository interface
type GradeRepositoryImpl struct {
	DB *gorm.DB
}

// NewGradeRepository creates a new GradeRepository
func NewGradeRepository(db *gorm.DB) GradeRepository {
	return &GradeRepositoryImpl{DB: db}
}

// Create creates a new grade
func (r *GradeRepositoryImpl) Create(grade *models.Grade) error {
	return r.DB.Create(grade).Error
}

// Update updates a grade
func (r *GradeRepositoryImpl) Update(grade *models.Grade) error {
	return r.DB.Save(grade).Error
}

// Delete deletes a grade
func (r *GradeRepositoryImpl) Delete(id uuid.UUID) error {
	return r.DB.Delete(&models.Grade{}, id).Error
}

// FindByID finds a grade by ID
func (r *GradeRepositoryImpl) FindByID(id uuid.UUID) (*models.Grade, error) {
	var grade models.Grade
	err := r.DB.Preload("Student").Preload("Course").First(&grade, id).Error
	if err != nil {
		return nil, err
	}
	return &grade, nil
}

// FindAll finds all grades
func (r *GradeRepositoryImpl) FindAll() ([]models.Grade, error) {
	var grades []models.Grade
	err := r.DB.Preload("Student").Preload("Course").Find(&grades).Error
	if err != nil {
		return nil, err
	}
	return grades, nil
}

// FindByStudent finds grades by student ID
func (r *GradeRepositoryImpl) FindByStudent(studentID uuid.UUID) ([]models.Grade, error) {
	var grades []models.Grade
	err := r.DB.Preload("Course").Where("student_id = ?", studentID).Find(&grades).Error
	if err != nil {
		return nil, err
	}
	return grades, nil
}

// FindByCourse finds grades by course ID
func (r *GradeRepositoryImpl) FindByCourse(courseID uuid.UUID) ([]models.Grade, error) {
	var grades []models.Grade
	err := r.DB.Preload("Student").Where("course_id = ?", courseID).Find(&grades).Error
	if err != nil {
		return nil, err
	}
	return grades, nil
}

// FindByStudentAndCourse finds grades by student ID and course ID
func (r *GradeRepositoryImpl) FindByStudentAndCourse(studentID, courseID uuid.UUID) ([]models.Grade, error) {
	var grades []models.Grade
	err := r.DB.Where("student_id = ? AND course_id = ?", studentID, courseID).Find(&grades).Error
	if err != nil {
		return nil, err
	}
	return grades, nil
}

// FindByTerm finds grades by term
func (r *GradeRepositoryImpl) FindByTerm(term string) ([]models.Grade, error) {
	var grades []models.Grade
	err := r.DB.Preload("Student").Preload("Course").Where("term = ?", term).Find(&grades).Error
	if err != nil {
		return nil, err
	}
	return grades, nil
}

// GetStudentGPA calculates a student's GPA
func (r *GradeRepositoryImpl) GetStudentGPA(studentID uuid.UUID) (float64, error) {
	// Logic to calculate GPA based on letter grades
	type Result struct {
		TotalPoints  float64
		TotalCourses int
	}

	var result Result

	// This is a simplified GPA calculation
	err := r.DB.Raw(`
		SELECT 
			SUM(CASE 
				WHEN grade = 'A+' THEN 4.0
				WHEN grade = 'A' THEN 4.0
				WHEN grade = 'A-' THEN 3.7
				WHEN grade = 'B+' THEN 3.3
				WHEN grade = 'B' THEN 3.0
				WHEN grade = 'B-' THEN 2.7
				WHEN grade = 'C+' THEN 2.3
				WHEN grade = 'C' THEN 2.0
				WHEN grade = 'C-' THEN 1.7
				WHEN grade = 'D+' THEN 1.3
				WHEN grade = 'D' THEN 1.0
				WHEN grade = 'D-' THEN 0.7
				ELSE 0
			END) as total_points,
			COUNT(*) as total_courses
		FROM grades
		WHERE student_id = ? AND deleted_at IS NULL
	`, studentID).Scan(&result).Error

	if err != nil {
		return 0, err
	}

	if result.TotalCourses == 0 {
		return 0, nil
	}

	return result.TotalPoints / float64(result.TotalCourses), nil
}

// GetCourseGradeDistribution returns the distribution of letter grades for a course
func (r *GradeRepositoryImpl) GetCourseGradeDistribution(courseID uuid.UUID) (map[string]int, error) {
	var grades []models.Grade
	err := r.DB.Where("course_id = ?", courseID).Find(&grades).Error
	if err != nil {
		return nil, err
	}

	// Initialize the distribution map with all possible grades
	distribution := map[string]int{
		"A+": 0, "A": 0, "A-": 0,
		"B+": 0, "B": 0, "B-": 0,
		"C+": 0, "C": 0, "C-": 0,
		"D+": 0, "D": 0, "D-": 0,
		"F": 0,
	}

	// Count the occurrences of each grade
	for _, grade := range grades {
		distribution[grade.Grade]++
	}

	return distribution, nil
}
