package controllers

import (
	"net/http"
	"strconv"

	"school-management-api/internal/models"
	"school-management-api/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// StudentController handles student-related HTTP requests
type StudentController struct {
	studentService services.StudentService
}

// NewStudentController creates a new instance of StudentController
func NewStudentController(studentService services.StudentService) *StudentController {
	return &StudentController{
		studentService: studentService,
	}
}

// GetStudents retrieves all students with pagination
func (c *StudentController) GetStudents(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("pageSize", "10"))

	// Get students from service
	students, total, err := c.studentService.GetAllStudents(ctx, page, pageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{
		"data": students,
		"meta": gin.H{
			"page":      page,
			"pageSize":  pageSize,
			"total":     total,
			"totalPage": (total + int64(pageSize) - 1) / int64(pageSize),
		},
	})
}

// GetStudent retrieves a student by ID
func (c *StudentController) GetStudent(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get student from service
	student, err := c.studentService.GetStudentByID(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "student not found"})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, student)
}

// CreateStudent creates a new student
func (c *StudentController) CreateStudent(ctx *gin.Context) {
	// Parse request body
	var student models.Student
	if err := ctx.ShouldBindJSON(&student); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create student
	err := c.studentService.CreateStudent(ctx, &student)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusCreated, gin.H{"message": "student created successfully", "id": student.ID})
}

// UpdateStudent updates a student
func (c *StudentController) UpdateStudent(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Parse request body
	var student models.Student
	if err := ctx.ShouldBindJSON(&student); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set ID
	student.ID = id

	// Update student
	err = c.studentService.UpdateStudent(ctx, &student)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "student updated successfully"})
}

// DeleteStudent deletes a student
func (c *StudentController) DeleteStudent(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Delete student
	err = c.studentService.DeleteStudent(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "student deleted successfully"})
}

// EnrollCourse enrolls a student in a course
func (c *StudentController) EnrollCourse(ctx *gin.Context) {
	// Parse IDs
	studentID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid student ID"})
		return
	}

	// Parse request body
	var req struct {
		CourseID uuid.UUID `json:"course_id" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Enroll student in course
	err = c.studentService.EnrollCourse(ctx, studentID, req.CourseID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "student enrolled in course successfully"})
}

// DropCourse removes a student from a course
func (c *StudentController) DropCourse(ctx *gin.Context) {
	// Parse IDs
	studentID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid student ID"})
		return
	}

	courseID, err := uuid.Parse(ctx.Param("courseId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	// Drop student from course
	err = c.studentService.DropCourse(ctx, studentID, courseID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, gin.H{"message": "student dropped from course successfully"})
}

// GetStudentCourses retrieves all courses for a student
func (c *StudentController) GetStudentCourses(ctx *gin.Context) {
	// Parse ID
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	// Get courses
	courses, err := c.studentService.GetStudentCourses(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Return response
	ctx.JSON(http.StatusOK, courses)
}
