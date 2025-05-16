package services

import (
	"school-management-api/internal/models"
	"school-management-api/internal/repositories"
	"time"

	"github.com/google/uuid"
)

// AttendanceService defines methods for attendance management
type AttendanceService interface {
	CreateAttendance(attendance *models.Attendance) error
	UpdateAttendance(attendance *models.Attendance) error
	DeleteAttendance(id uuid.UUID) error
	GetAttendanceByID(id uuid.UUID) (*models.Attendance, error)
	GetAllAttendances() ([]models.Attendance, error)
	GetAttendancesByStudent(studentID uuid.UUID) ([]models.Attendance, error)
	GetAttendancesByCourse(courseID uuid.UUID) ([]models.Attendance, error)
	GetAttendancesByDate(date time.Time) ([]models.Attendance, error)
	GetAttendancesByDateRange(startDate, endDate time.Time) ([]models.Attendance, error)
	GetAttendancesByCourseAndDate(courseID uuid.UUID, date time.Time) ([]models.Attendance, error)
	GetStudentAttendanceReport(studentID uuid.UUID) (map[string]int, error)
	GetCourseAttendanceReport(courseID uuid.UUID) (map[string]map[string]int, error)
}

// AttendanceServiceImpl implements the AttendanceService interface
type AttendanceServiceImpl struct {
	attendanceRepo repositories.AttendanceRepository
}

// NewAttendanceService creates a new AttendanceService
func NewAttendanceService(attendanceRepo repositories.AttendanceRepository) AttendanceService {
	return &AttendanceServiceImpl{attendanceRepo: attendanceRepo}
}

// CreateAttendance creates a new attendance record
func (s *AttendanceServiceImpl) CreateAttendance(attendance *models.Attendance) error {
	return s.attendanceRepo.Create(attendance)
}

// UpdateAttendance updates an attendance record
func (s *AttendanceServiceImpl) UpdateAttendance(attendance *models.Attendance) error {
	return s.attendanceRepo.Update(attendance)
}

// DeleteAttendance deletes an attendance record
func (s *AttendanceServiceImpl) DeleteAttendance(id uuid.UUID) error {
	return s.attendanceRepo.Delete(id)
}

// GetAttendanceByID gets an attendance record by ID
func (s *AttendanceServiceImpl) GetAttendanceByID(id uuid.UUID) (*models.Attendance, error) {
	return s.attendanceRepo.FindByID(id)
}

// GetAllAttendances gets all attendance records
func (s *AttendanceServiceImpl) GetAllAttendances() ([]models.Attendance, error) {
	return s.attendanceRepo.FindAll()
}

// GetAttendancesByStudent gets attendance records by student ID
func (s *AttendanceServiceImpl) GetAttendancesByStudent(studentID uuid.UUID) ([]models.Attendance, error) {
	return s.attendanceRepo.FindByStudent(studentID)
}

// GetAttendancesByCourse gets attendance records by course ID
func (s *AttendanceServiceImpl) GetAttendancesByCourse(courseID uuid.UUID) ([]models.Attendance, error) {
	return s.attendanceRepo.FindByCourse(courseID)
}

// GetAttendancesByDate gets attendance records by date
func (s *AttendanceServiceImpl) GetAttendancesByDate(date time.Time) ([]models.Attendance, error) {
	return s.attendanceRepo.FindByDate(date)
}

// GetAttendancesByDateRange gets attendance records within a date range
func (s *AttendanceServiceImpl) GetAttendancesByDateRange(startDate, endDate time.Time) ([]models.Attendance, error) {
	return s.attendanceRepo.FindByDateRange(startDate, endDate)
}

// GetAttendancesByCourseAndDate gets attendance records by course ID and date
func (s *AttendanceServiceImpl) GetAttendancesByCourseAndDate(courseID uuid.UUID, date time.Time) ([]models.Attendance, error) {
	return s.attendanceRepo.FindByCourseAndDate(courseID, date)
}

// GetStudentAttendanceReport gets a report of a student's attendance
func (s *AttendanceServiceImpl) GetStudentAttendanceReport(studentID uuid.UUID) (map[string]int, error) {
	return s.attendanceRepo.GetStudentAttendanceReport(studentID)
}

// GetCourseAttendanceReport gets a report of attendance for a course
func (s *AttendanceServiceImpl) GetCourseAttendanceReport(courseID uuid.UUID) (map[string]map[string]int, error) {
	return s.attendanceRepo.GetCourseAttendanceReport(courseID)
}
