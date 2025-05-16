package repositories

import (
	"school-management-api/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AttendanceRepository defines methods for attendance management
type AttendanceRepository interface {
	Create(attendance *models.Attendance) error
	Update(attendance *models.Attendance) error
	Delete(id uuid.UUID) error
	FindByID(id uuid.UUID) (*models.Attendance, error)
	FindAll() ([]models.Attendance, error)
	FindByStudent(studentID uuid.UUID) ([]models.Attendance, error)
	FindByCourse(courseID uuid.UUID) ([]models.Attendance, error)
	FindByDate(date time.Time) ([]models.Attendance, error)
	FindByDateRange(startDate, endDate time.Time) ([]models.Attendance, error)
	FindByCourseAndDate(courseID uuid.UUID, date time.Time) ([]models.Attendance, error)
	GetStudentAttendanceReport(studentID uuid.UUID) (map[string]int, error)
	GetCourseAttendanceReport(courseID uuid.UUID) (map[string]map[string]int, error)
}

// AttendanceRepositoryImpl implements the AttendanceRepository interface
type AttendanceRepositoryImpl struct {
	DB *gorm.DB
}

// NewAttendanceRepository creates a new AttendanceRepository
func NewAttendanceRepository(db *gorm.DB) AttendanceRepository {
	return &AttendanceRepositoryImpl{DB: db}
}

// Create creates a new attendance record
func (r *AttendanceRepositoryImpl) Create(attendance *models.Attendance) error {
	return r.DB.Create(attendance).Error
}

// Update updates an attendance record
func (r *AttendanceRepositoryImpl) Update(attendance *models.Attendance) error {
	return r.DB.Save(attendance).Error
}

// Delete deletes an attendance record
func (r *AttendanceRepositoryImpl) Delete(id uuid.UUID) error {
	return r.DB.Delete(&models.Attendance{}, id).Error
}

// FindByID finds an attendance record by ID
func (r *AttendanceRepositoryImpl) FindByID(id uuid.UUID) (*models.Attendance, error) {
	var attendance models.Attendance
	err := r.DB.Preload("Student").Preload("Course").First(&attendance, id).Error
	if err != nil {
		return nil, err
	}
	return &attendance, nil
}

// FindAll finds all attendance records
func (r *AttendanceRepositoryImpl) FindAll() ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.DB.Preload("Student").Preload("Course").Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

// FindByStudent finds attendance records by student ID
func (r *AttendanceRepositoryImpl) FindByStudent(studentID uuid.UUID) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.DB.Preload("Course").Where("student_id = ?", studentID).Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

// FindByCourse finds attendance records by course ID
func (r *AttendanceRepositoryImpl) FindByCourse(courseID uuid.UUID) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.DB.Preload("Student").Where("course_id = ?", courseID).Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

// FindByDate finds attendance records by date
func (r *AttendanceRepositoryImpl) FindByDate(date time.Time) ([]models.Attendance, error) {
	var attendances []models.Attendance
	// Format date to match database format
	formattedDate := date.Format("2006-01-02")
	err := r.DB.Preload("Student").Preload("Course").
		Where("DATE(date) = ?", formattedDate).
		Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

// FindByDateRange finds attendance records within a date range
func (r *AttendanceRepositoryImpl) FindByDateRange(startDate, endDate time.Time) ([]models.Attendance, error) {
	var attendances []models.Attendance
	// Format dates to match database format
	formattedStartDate := startDate.Format("2006-01-02")
	formattedEndDate := endDate.Format("2006-01-02")
	err := r.DB.Preload("Student").Preload("Course").
		Where("DATE(date) BETWEEN ? AND ?", formattedStartDate, formattedEndDate).
		Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

// FindByCourseAndDate finds attendance records by course ID and date
func (r *AttendanceRepositoryImpl) FindByCourseAndDate(courseID uuid.UUID, date time.Time) ([]models.Attendance, error) {
	var attendances []models.Attendance
	// Format date to match database format
	formattedDate := date.Format("2006-01-02")
	err := r.DB.Preload("Student").
		Where("course_id = ? AND DATE(date) = ?", courseID, formattedDate).
		Find(&attendances).Error
	if err != nil {
		return nil, err
	}
	return attendances, nil
}

// GetStudentAttendanceReport gets a report of a student's attendance
func (r *AttendanceRepositoryImpl) GetStudentAttendanceReport(studentID uuid.UUID) (map[string]int, error) {
	// Initialize report
	report := map[string]int{
		"present": 0,
		"absent":  0,
		"late":    0,
		"excused": 0,
		"total":   0,
	}

	// Query to count attendance by status
	rows, err := r.DB.Model(&models.Attendance{}).
		Select("status, COUNT(*) as count").
		Where("student_id = ?", studentID).
		Group("status").
		Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Process results
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		report[status] = count
		report["total"] += count
	}

	return report, nil
}

// GetCourseAttendanceReport gets a report of attendance for a course
func (r *AttendanceRepositoryImpl) GetCourseAttendanceReport(courseID uuid.UUID) (map[string]map[string]int, error) {
	// Initialize report
	report := make(map[string]map[string]int)

	// Get all students in this course
	var students []models.Student
	if err := r.DB.Joins("JOIN course_students ON students.id = course_students.student_id").
		Where("course_students.course_id = ?", courseID).
		Find(&students).Error; err != nil {
		return nil, err
	}

	// For each student, get their attendance
	for _, student := range students {
		studentID := student.ID
		studentName := student.FirstName + " " + student.LastName

		// Initialize student report
		report[studentName] = map[string]int{
			"present": 0,
			"absent":  0,
			"late":    0,
			"excused": 0,
			"total":   0,
		}

		// Query to count attendance by status for this student in this course
		rows, err := r.DB.Model(&models.Attendance{}).
			Select("status, COUNT(*) as count").
			Where("student_id = ? AND course_id = ?", studentID, courseID).
			Group("status").
			Rows()
		if err != nil {
			return nil, err
		}

		// Process results
		for rows.Next() {
			var status string
			var count int
			if err := rows.Scan(&status, &count); err != nil {
				rows.Close()
				return nil, err
			}
			report[studentName][status] = count
			report[studentName]["total"] += count
		}
		rows.Close()
	}

	return report, nil
}
