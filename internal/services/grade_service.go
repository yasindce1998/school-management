package services

import (
	"school-management-api/internal/models"
	"school-management-api/internal/repositories"

	"github.com/google/uuid"
)

// GradeService defines methods for grade management
type GradeService interface {
	CreateGrade(grade *models.Grade) error
	UpdateGrade(grade *models.Grade) error
	DeleteGrade(id uuid.UUID) error
	GetGradeByID(id uuid.UUID) (*models.Grade, error)
	GetAllGrades() ([]models.Grade, error)
	GetGradesByStudent(studentID uuid.UUID) ([]models.Grade, error)
	GetGradesByCourse(courseID uuid.UUID) ([]models.Grade, error)
	GetGradesByStudentAndCourse(studentID, courseID uuid.UUID) ([]models.Grade, error)
	GetGradesByTerm(term string) ([]models.Grade, error)
	GetStudentGPA(studentID uuid.UUID) (float64, error)
	GetCourseGradeDistribution(courseID uuid.UUID) (map[string]int, error)
}

// GradeServiceImpl implements the GradeService interface
type GradeServiceImpl struct {
	gradeRepo repositories.GradeRepository
}

// NewGradeService creates a new GradeService
func NewGradeService(gradeRepo repositories.GradeRepository) GradeService {
	return &GradeServiceImpl{gradeRepo: gradeRepo}
}

// CreateGrade creates a new grade
func (s *GradeServiceImpl) CreateGrade(grade *models.Grade) error {
	// Calculate letter grade based on score
	grade.CalculateGrade()
	return s.gradeRepo.Create(grade)
}

// UpdateGrade updates a grade
func (s *GradeServiceImpl) UpdateGrade(grade *models.Grade) error {
	// Calculate letter grade based on updated score
	grade.CalculateGrade()
	return s.gradeRepo.Update(grade)
}

// DeleteGrade deletes a grade
func (s *GradeServiceImpl) DeleteGrade(id uuid.UUID) error {
	return s.gradeRepo.Delete(id)
}

// GetGradeByID gets a grade by ID
func (s *GradeServiceImpl) GetGradeByID(id uuid.UUID) (*models.Grade, error) {
	return s.gradeRepo.FindByID(id)
}

// GetAllGrades gets all grades
func (s *GradeServiceImpl) GetAllGrades() ([]models.Grade, error) {
	return s.gradeRepo.FindAll()
}

// GetGradesByStudent gets grades by student ID
func (s *GradeServiceImpl) GetGradesByStudent(studentID uuid.UUID) ([]models.Grade, error) {
	return s.gradeRepo.FindByStudent(studentID)
}

// GetGradesByCourse gets grades by course ID
func (s *GradeServiceImpl) GetGradesByCourse(courseID uuid.UUID) ([]models.Grade, error) {
	return s.gradeRepo.FindByCourse(courseID)
}

// GetGradesByStudentAndCourse gets grades by student ID and course ID
func (s *GradeServiceImpl) GetGradesByStudentAndCourse(studentID, courseID uuid.UUID) ([]models.Grade, error) {
	return s.gradeRepo.FindByStudentAndCourse(studentID, courseID)
}

// GetGradesByTerm gets grades by term
func (s *GradeServiceImpl) GetGradesByTerm(term string) ([]models.Grade, error) {
	return s.gradeRepo.FindByTerm(term)
}

// GetStudentGPA gets a student's GPA
func (s *GradeServiceImpl) GetStudentGPA(studentID uuid.UUID) (float64, error) {
	return s.gradeRepo.GetStudentGPA(studentID)
}

// GetCourseGradeDistribution gets the distribution of grades for a course
func (s *GradeServiceImpl) GetCourseGradeDistribution(courseID uuid.UUID) (map[string]int, error) {
	return s.gradeRepo.GetCourseGradeDistribution(courseID)
}
