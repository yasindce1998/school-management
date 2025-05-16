package controllers

import (
	"net/http"
	"school-management-api/internal/models"
	"school-management-api/internal/services"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AttendanceController handles attendance-related HTTP requests
type AttendanceController struct {
	attendanceService services.AttendanceService
}

// NewAttendanceController creates a new AttendanceController
func NewAttendanceController(attendanceService services.AttendanceService) *AttendanceController {
	return &AttendanceController{attendanceService: attendanceService}
}

// CreateAttendance creates a new attendance record
func (c *AttendanceController) CreateAttendance(ctx *gin.Context) {
	var attendance models.Attendance
	if err := ctx.ShouldBindJSON(&attendance); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("userID")
	if exists {
		attendance.CreatedBy = userID.(uuid.UUID)
	}

	if err := c.attendanceService.CreateAttendance(&attendance); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, attendance)
}

// UpdateAttendance updates an attendance record
func (c *AttendanceController) UpdateAttendance(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Check if attendance exists
	existingAttendance, err := c.attendanceService.GetAttendanceByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Attendance record not found"})
		return
	}

	var attendance models.Attendance
	if err := ctx.ShouldBindJSON(&attendance); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set ID from URL parameter
	attendance.ID = id

	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("userID")
	if exists {
		attendance.UpdatedBy = userID.(uuid.UUID)
	}

	// Preserve fields that shouldn't be updated from client
	attendance.CreatedBy = existingAttendance.CreatedBy
	attendance.CreatedAt = existingAttendance.CreatedAt

	if err := c.attendanceService.UpdateAttendance(&attendance); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, attendance)
}

// DeleteAttendance deletes an attendance record
func (c *AttendanceController) DeleteAttendance(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := c.attendanceService.DeleteAttendance(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Attendance record deleted successfully"})
}

// GetAttendance gets an attendance record by ID
func (c *AttendanceController) GetAttendance(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	attendance, err := c.attendanceService.GetAttendanceByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Attendance record not found"})
		return
	}

	ctx.JSON(http.StatusOK, attendance)
}

// GetAllAttendances gets all attendance records
func (c *AttendanceController) GetAllAttendances(ctx *gin.Context) {
	attendances, err := c.attendanceService.GetAllAttendances()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, attendances)
}

// GetAttendancesByStudent gets attendance records by student ID
func (c *AttendanceController) GetAttendancesByStudent(ctx *gin.Context) {
	studentIDStr := ctx.Param("studentId")
	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	attendances, err := c.attendanceService.GetAttendancesByStudent(studentID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, attendances)
}

// GetAttendancesByCourse gets attendance records by course ID
func (c *AttendanceController) GetAttendancesByCourse(ctx *gin.Context) {
	courseIDStr := ctx.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	attendances, err := c.attendanceService.GetAttendancesByCourse(courseID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, attendances)
}

// GetAttendancesByDate gets attendance records by date
func (c *AttendanceController) GetAttendancesByDate(ctx *gin.Context) {
	dateStr := ctx.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	attendances, err := c.attendanceService.GetAttendancesByDate(date)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, attendances)
}

// GetStudentAttendanceReport gets a report of a student's attendance
func (c *AttendanceController) GetStudentAttendanceReport(ctx *gin.Context) {
	studentIDStr := ctx.Param("studentId")
	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	report, err := c.attendanceService.GetStudentAttendanceReport(studentID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, report)
}

// GetCourseAttendanceReport gets a report of attendance for a course
func (c *AttendanceController) GetCourseAttendanceReport(ctx *gin.Context) {
	courseIDStr := ctx.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	report, err := c.attendanceService.GetCourseAttendanceReport(courseID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, report)
}

// GetAttendancesByCourseAndDate gets attendance records by course ID and date
func (c *AttendanceController) GetAttendancesByCourseAndDate(ctx *gin.Context) {
	courseIDStr := ctx.Param("courseId")
	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	dateStr := ctx.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	attendances, err := c.attendanceService.GetAttendancesByCourseAndDate(courseID, date)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, attendances)
}
